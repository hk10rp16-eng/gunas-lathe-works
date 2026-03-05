const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db, snapToArray, now } = require('../firebaseConfig');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// =============================================
// POST /api/admin/login — Fixed Admin Login
// Credentials: ID=Gunaadmin001 | Password=Gunaadmin001
// =============================================
router.post('/login', (req, res) => {
    try {
        const { adminId, password } = req.body;
        const ADMIN_ID = process.env.ADMIN_ID || 'Gunaadmin001';
        const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'Gunaadmin001';

        if (adminId !== ADMIN_ID || password !== ADMIN_PASS) {
            return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        }

        const token = jwt.sign(
            { id: 'admin-fixed', email: 'admin@gunalathe.com', role: 'admin', name: "Guna's Admin" },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            success: true,
            role: 'admin',
            token,
            user: { id: 'admin-fixed', name: "Guna's Lathe Admin", email: 'admin@gunalathe.com', role: 'admin' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Admin login failed' });
    }
});

// GET /api/admin/dashboard
router.get('/dashboard', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [ordersSnap, usersSnap, productsSnap, reviewsSnap] = await Promise.all([
            db.collection('orders').get(),
            db.collection('users').get(),
            db.collection('products').where('isActive', '==', true).get(),
            db.collection('reviews').where('isApproved', '==', false).get()
        ]);

        const orders = snapToArray(ordersSnap);
        const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const recentOrders = orders
            .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
            .slice(0, 10)
            .map(o => ({ ...o, _id: o.id, user: { name: o.userName || 'N/A', email: o.userEmail || '' } }));

        // Top products by order frequency
        const productCount = {};
        const productRevenue = {};
        orders.forEach(o => {
            (o.items || []).forEach(item => {
                productCount[item.name] = (productCount[item.name] || 0) + (item.quantity || 1);
                productRevenue[item.name] = (productRevenue[item.name] || 0) + item.price * (item.quantity || 1);
            });
        });
        const popularProducts = Object.keys(productCount)
            .map(name => ({ _id: name, count: productCount[name], revenue: productRevenue[name] }))
            .sort((a, b) => b.count - a.count).slice(0, 5);

        res.json({
            stats: {
                totalOrders: orders.length,
                revenue,
                totalUsers: usersSnap.size,
                totalProducts: productsSnap.size,
                pendingReviews: reviewsSnap.size,
                pendingOrders: orders.filter(o => o.orderStatus === 'Pending').length,
                processingOrders: orders.filter(o => o.orderStatus === 'Processing').length
            },
            recentOrders,
            popularProducts
        });
    } catch (err) {
        console.error('Dashboard error:', err.message);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
});

// GET /api/admin/users
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const snap = await db.collection('users').get();
        const users = snapToArray(snap).map(u => ({
            ...u, _id: u.id, isActive: u.isActive !== false, passwordHash: undefined
        })).sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        res.json({ users });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// GET /api/admin/products — all products including inactive
router.get('/products', authenticateToken, isAdmin, async (req, res) => {
    try {
        const snap = await db.collection('products').get();
        const products = snapToArray(snap).map(p => ({ ...p, _id: p.id }))
            .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        res.json({ products });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// GET /api/admin/reviews
router.get('/reviews', authenticateToken, isAdmin, async (req, res) => {
    try {
        const snap = await db.collection('reviews').get();
        const reviews = snapToArray(snap).map(r => ({ ...r, _id: r.id }))
            .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        res.json({ reviews });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

// GET /api/admin/contacts
router.get('/contacts', authenticateToken, isAdmin, async (req, res) => {
    try {
        const snap = await db.collection('contacts').get();
        const contacts = snapToArray(snap).map(c => ({ ...c, _id: c.id }))
            .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        res.json({ contacts });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching contacts' });
    }
});

module.exports = router;
