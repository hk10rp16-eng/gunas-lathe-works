const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, snapToArray, docToObj, now } = require('../firebaseConfig');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: 'Name, email and password are required' });

        // Check existing user
        const existing = await db.collection('users').where('email', '==', email).limit(1).get();
        if (!existing.empty)
            return res.status(409).json({ message: 'Email already registered' });

        const passwordHash = await bcrypt.hash(password, 10);
        const userRef = db.collection('users').doc();
        const userData = {
            name, email, phone: phone || '', passwordHash,
            role: 'customer', isActive: true, createdAt: now()
        };
        await userRef.set(userData);

        const user = { id: userRef.id, name, email, role: 'customer' };
        const token = jwt.sign({ id: user.id, email, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: 'Account created successfully', token, user });
    } catch (err) {
        console.error('Signup error:', err.message);
        res.status(500).json({ message: 'Signup failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });

        const snap = await db.collection('users').where('email', '==', email).limit(1).get();
        if (snap.empty)
            return res.status(401).json({ message: 'Invalid email or password' });

        const doc = snap.docs[0];
        const userData = doc.data();
        const valid = await bcrypt.compare(password, userData.passwordHash);
        if (!valid)
            return res.status(401).json({ message: 'Invalid email or password' });

        const user = { id: doc.id, name: userData.name, email: userData.email, role: userData.role };
        const token = jwt.sign({ id: doc.id, email: userData.email, role: userData.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Login successful', token, user });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Login failed' });
    }
});

// GET /api/auth/verify
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const doc = await db.collection('users').doc(decoded.id).get();
        if (!doc.exists) return res.status(404).json({ message: 'User not found' });
        const u = doc.data();
        res.json({ user: { id: doc.id, name: u.name, email: u.email, role: u.role } });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
