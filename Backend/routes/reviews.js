const express = require('express');
const router = express.Router();
const { db, snapToArray, now } = require('../firebaseConfig');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// POST /api/reviews — add review
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { productId, rating, title, text } = req.body;
        if (!productId || !rating) return res.status(400).json({ message: 'Product ID and rating required' });
        if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1–5' });

        // Check if already reviewed
        const existing = await db.collection('reviews')
            .where('productId', '==', productId)
            .where('userId', '==', req.user.id).limit(1).get();
        if (!existing.empty) return res.status(409).json({ message: 'You already reviewed this product' });

        const reviewRef = db.collection('reviews').doc();
        await reviewRef.set({
            productId, userId: req.user.id, userName: req.user.name || '',
            rating: Number(rating), title: title || '', text: text || '',
            isApproved: false, verifiedPurchase: false, createdAt: now()
        });

        // Update product rating average
        const revSnap = await db.collection('reviews').where('productId', '==', productId).where('isApproved', '==', true).get();
        const reviews = revSnap.docs.map(d => d.data());
        const count = reviews.length + 1;
        const allRatings = [...reviews.map(r => r.rating), Number(rating)];
        const average = Math.round((allRatings.reduce((s, r) => s + r, 0) / allRatings.length) * 10) / 10;

        await db.collection('products').doc(productId).update({ ratings: { average, count } });
        res.status(201).json({ message: 'Review submitted for moderation', id: reviewRef.id });
    } catch (err) {
        console.error('Review error:', err.message);
        res.status(500).json({ message: 'Error submitting review' });
    }
});

// GET /api/reviews/product/:productId — approved reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const snap = await db.collection('reviews')
            .where('productId', '==', req.params.productId)
            .where('isApproved', '==', true).get();
        const reviews = snapToArray(snap).sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        res.json({ reviews });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

// GET /api/reviews/admin/all — admin: all reviews
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
    try {
        const snap = await db.collection('reviews').get();
        const reviews = snapToArray(snap).map(r => ({ ...r, _id: r.id }))
            .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        res.json({ reviews });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

// PUT /api/reviews/admin/:id/toggle — approve / unapprove
router.put('/admin/:id/toggle', authenticateToken, isAdmin, async (req, res) => {
    try {
        const ref = db.collection('reviews').doc(req.params.id);
        const doc = await ref.get();
        if (!doc.exists) return res.status(404).json({ message: 'Review not found' });
        const current = doc.data().isApproved;
        await ref.update({ isApproved: !current });
        res.json({ message: `Review ${!current ? 'approved' : 'unapproved'}` });
    } catch (err) {
        res.status(500).json({ message: 'Error updating review' });
    }
});

// DELETE /api/reviews/admin/:id
router.delete('/admin/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.collection('reviews').doc(req.params.id).delete();
        res.json({ message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting review' });
    }
});

module.exports = router;
