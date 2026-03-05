const express = require('express');
const router = express.Router();
const { db, snapToArray, docToObj, generateInvoiceNumber, now } = require('../firebaseConfig');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { generateInvoicePDF } = require('../utils/invoice');
const { sendOrderConfirmation } = require('../utils/mailer');

// POST /api/orders — place order
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;
        if (!items || items.length === 0)
            return res.status(400).json({ message: 'Cart is empty' });

        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const gst = Math.round(subtotal * 0.18);
        const shippingCost = subtotal >= 5000 ? 0 : 150;
        const totalAmount = subtotal + gst + shippingCost;
        const invoiceNumber = generateInvoiceNumber();

        const orderRef = db.collection('orders').doc();
        const orderData = {
            userId: req.user.id,
            userEmail: req.user.email,
            userName: req.user.name || '',
            items, shippingAddress,
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: 'Pending',
            orderStatus: 'Pending',
            subtotal, gst, shippingCost, totalAmount,
            invoiceNumber, notes: '',
            createdAt: now(), updatedAt: now()
        };
        await orderRef.set(orderData);

        // Non-blocking email
        sendOrderConfirmation(req.user.email, req.user.name, { ...orderData, _id: orderRef.id, invoiceNumber })
            .catch(err => console.error('Email error:', err.message));

        res.status(201).json({
            message: 'Order placed successfully',
            order: { _id: orderRef.id, invoiceNumber, totalAmount, orderStatus: 'Pending', paymentMethod: paymentMethod || 'COD' }
        });
    } catch (err) {
        console.error('Order error:', err.message);
        res.status(500).json({ message: 'Error placing order' });
    }
});

// GET /api/orders/my — user's orders
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const snap = await db.collection('orders').where('userId', '==', req.user.id).get();
        const orders = snapToArray(snap).map(o => ({ ...o, _id: o.id }))
            .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// GET /api/orders/admin/all — admin list all
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let snap = await db.collection('orders').get();
        let orders = snapToArray(snap).map(o => ({ ...o, _id: o.id }))
            .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

        if (status) orders = orders.filter(o => o.orderStatus === status);

        const total = orders.length;
        const startIdx = (Number(page) - 1) * Number(limit);
        const paged = orders.slice(startIdx, startIdx + Number(limit));

        // Attach user info
        const enriched = await Promise.all(paged.map(async o => {
            try {
                const uSnap = await db.collection('users').doc(o.userId).get();
                const u = uSnap.exists ? uSnap.data() : {};
                return { ...o, user: { name: u.name || o.userName || 'N/A', email: u.email || o.userEmail || '' } };
            } catch { return { ...o, user: { name: o.userName || 'N/A', email: o.userEmail || '' } }; }
        }));
        res.json({ orders: enriched, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// PUT /api/orders/admin/:id/status — update order status
router.put('/admin/:id/status', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const ref = db.collection('orders').doc(req.params.id);
        const update = { updatedAt: now() };
        if (orderStatus) update.orderStatus = orderStatus;
        if (paymentStatus) update.paymentStatus = paymentStatus;
        await ref.update(update);
        res.json({ message: 'Order updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating order' });
    }
});

// GET /api/orders/:id — single order
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const doc = await db.collection('orders').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ message: 'Order not found' });
        const order = docToObj(doc);
        if (order.userId !== req.user.id && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });
        res.json({ order: { ...order, _id: doc.id } });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching order' });
    }
});

// GET /api/orders/:id/invoice — download PDF
router.get('/:id/invoice', authenticateToken, async (req, res) => {
    try {
        const doc = await db.collection('orders').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ message: 'Order not found' });
        const order = { ...docToObj(doc), _id: doc.id };
        if (order.userId !== req.user.id && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });
        generateInvoicePDF(order, res);
    } catch (err) {
        res.status(500).json({ message: 'Error generating invoice' });
    }
});

// PUT /api/orders/:id/cancel
router.put('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const ref = db.collection('orders').doc(req.params.id);
        const doc = await ref.get();
        if (!doc.exists) return res.status(404).json({ message: 'Order not found' });
        const order = doc.data();
        if (order.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
        if (!['Pending', 'Processing'].includes(order.orderStatus))
            return res.status(400).json({ message: 'Cannot cancel at this stage' });
        await ref.update({ orderStatus: 'Cancelled', updatedAt: now() });
        res.json({ message: 'Order cancelled successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error cancelling order' });
    }
});

module.exports = router;
