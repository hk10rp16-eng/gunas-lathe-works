const express = require('express');
const router = express.Router();
const { db, snapToArray, docToObj, now } = require('../firebaseConfig');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// GET /api/products — list with filters, search, pagination
router.get('/', async (req, res) => {
    try {
        const { category, material, minPrice, maxPrice, sort, search, page = 1, limit = 12 } = req.query;
        let query = db.collection('products').where('isActive', '==', true);

        if (category) query = query.where('category', '==', category);
        if (material) query = query.where('material', '==', material);

        let snap = await query.get();
        let products = snapToArray(snap);

        // Filter by price range
        if (minPrice) products = products.filter(p => p.price >= Number(minPrice));
        if (maxPrice) products = products.filter(p => p.price <= Number(maxPrice));

        // Search by name/description/category
        if (search) {
            const s = search.toLowerCase();
            products = products.filter(p =>
                (p.name || '').toLowerCase().includes(s) ||
                (p.description || '').toLowerCase().includes(s) ||
                (p.category || '').toLowerCase().includes(s) ||
                (p.material || '').toLowerCase().includes(s) ||
                (p.tags || []).some(t => t.toLowerCase().includes(s))
            );
        }

        // Sorting
        if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
        else if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
        else if (sort === 'rating') products.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
        else products.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

        const total = products.length;
        const startIdx = (Number(page) - 1) * Number(limit);
        const paged = products.slice(startIdx, startIdx + Number(limit));

        res.json({ products: paged, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) } });
    } catch (err) {
        console.error('Products error:', err.message);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
    try {
        const snap = await db.collection('products').where('isActive', '==', true).where('isFeatured', '==', true).limit(8).get();
        res.json({ products: snapToArray(snap) });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching featured products' });
    }
});

// GET /api/products/search
router.get('/search', async (req, res) => {
    try {
        const { q, page = 1, limit = 12 } = req.query;
        if (!q) return res.status(400).json({ message: 'Search query required' });

        const snap = await db.collection('products').where('isActive', '==', true).get();
        const s = q.toLowerCase();
        let products = snapToArray(snap).filter(p =>
            (p.name || '').toLowerCase().includes(s) ||
            (p.description || '').toLowerCase().includes(s) ||
            (p.category || '').toLowerCase().includes(s) ||
            (p.material || '').toLowerCase().includes(s) ||
            (p.tags || []).some(t => t.toLowerCase().includes(s))
        );

        const total = products.length;
        const startIdx = (Number(page) - 1) * Number(limit);
        const paged = products.slice(startIdx, startIdx + Number(limit));
        res.json({ products: paged, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
    } catch (err) {
        res.status(500).json({ message: 'Error searching products' });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const doc = await db.collection('products').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ message: 'Product not found' });
        const product = docToObj(doc);
        // Get related products same category
        const relSnap = await db.collection('products')
            .where('isActive', '==', true)
            .where('category', '==', product.category)
            .limit(5).get();
        const related = snapToArray(relSnap).filter(p => p.id !== product.id).slice(0, 4);
        res.json({ product, related });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product' });
    }
});

// POST /api/products — admin create
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, description, price, category, material, images, stock, specifications, isFeatured, tags, shortDescription, originalPrice } = req.body;
        if (!name || !description || !price) return res.status(400).json({ message: 'Name, description and price are required' });

        const productRef = db.collection('products').doc();
        await productRef.set({
            name, description, shortDescription: shortDescription || '',
            price: Number(price), originalPrice: originalPrice ? Number(originalPrice) : null,
            category: category || 'Other', material: material || '',
            images: images || [], stock: stock || 100,
            specifications: specifications || [], tags: tags || [],
            isFeatured: isFeatured || false, isActive: true,
            ratings: { average: 0, count: 0 }, createdAt: now()
        });
        res.status(201).json({ message: 'Product created', id: productRef.id });
    } catch (err) {
        res.status(500).json({ message: 'Error creating product' });
    }
});

// PUT /api/products/:id — admin update
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const ref = db.collection('products').doc(req.params.id);
        const doc = await ref.get();
        if (!doc.exists) return res.status(404).json({ message: 'Product not found' });
        const { name, description, price, category, material, images, stock, specifications, isFeatured, isActive, tags, shortDescription, originalPrice } = req.body;
        await ref.update({
            ...(name && { name }), ...(description && { description }),
            ...(shortDescription !== undefined && { shortDescription }),
            ...(price && { price: Number(price) }),
            ...(originalPrice !== undefined && { originalPrice: originalPrice ? Number(originalPrice) : null }),
            ...(category && { category }), ...(material !== undefined && { material }),
            ...(images && { images }), ...(stock !== undefined && { stock }),
            ...(specifications && { specifications }), ...(tags && { tags }),
            ...(isFeatured !== undefined && { isFeatured }),
            ...(isActive !== undefined && { isActive }),
            updatedAt: now()
        });
        res.json({ message: 'Product updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

// DELETE /api/products/:id — admin soft delete
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const ref = db.collection('products').doc(req.params.id);
        const doc = await ref.get();
        if (!doc.exists) return res.status(404).json({ message: 'Product not found' });
        await ref.update({ isActive: false, updatedAt: now() });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

module.exports = router;
