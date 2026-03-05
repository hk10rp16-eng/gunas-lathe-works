const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase first
try {
    require('./firebaseConfig');
    console.log('✅ Firebase Admin SDK initialized');
} catch (err) {
    console.error('❌ Firebase init error:', err.message);
    console.log('⚠️  Check your FIREBASE_* environment variables in .env');
}

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { message: 'Too many requests' } }));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Frontend static files
const frontendPath = path.join(__dirname, '../Frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', server: "Guna's Lathe Works API", database: 'Firebase Firestore', time: new Date().toISOString() });
});

// SPA Fallback
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'Route not found' });
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`🌐 Frontend:   http://localhost:${PORT}/index.html`);
        console.log(`📊 Health:     http://localhost:${PORT}/api/health`);
        console.log(`🔑 Admin:      http://localhost:${PORT}/admin/index.html\n`);
    });
}

// Export for Vercel serverless function
module.exports = app;