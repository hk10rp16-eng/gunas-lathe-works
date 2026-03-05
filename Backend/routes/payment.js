const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db, now } = require('../firebaseConfig');
const { authenticateToken } = require('../middleware/auth');

let Razorpay;
try {
    Razorpay = require('razorpay');
} catch (e) {
    console.warn('Razorpay not installed, payment routes limited');
}

// POST /api/payment/create-order — create Razorpay payment order
router.post('/create-order', authenticateToken, async (req, res) => {
    try {
        if (!Razorpay) return res.status(500).json({ message: 'Razorpay not configured' });
        const { amount, orderId } = req.body;
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET_KEY
        });
        const razorpayOrder = await instance.orders.create({
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: orderId || `rcpt_${Date.now()}`
        });
        res.json({ orderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, key: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        console.error('Razorpay error:', err.message);
        res.status(500).json({ message: 'Payment initialization failed' });
    }
});

// POST /api/payment/verify — verify Razorpay signature and update Firestore order
router.post('/verify', authenticateToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY).update(body).digest('hex');

        if (expectedSignature !== razorpay_signature)
            return res.status(400).json({ message: 'Payment verification failed - invalid signature' });

        // Update order in Firestore
        if (orderId) {
            await db.collection('orders').doc(orderId).update({
                paymentStatus: 'Paid',
                paymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                paidAt: now(), updatedAt: now()
            });
        }
        res.json({ message: 'Payment verified successfully', paymentId: razorpay_payment_id });
    } catch (err) {
        console.error('Payment verify error:', err.message);
        res.status(500).json({ message: 'Payment verification error' });
    }
});

module.exports = router;
