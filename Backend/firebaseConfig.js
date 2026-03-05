// Firebase Admin SDK Configuration
const admin = require('firebase-admin');

let db = null;
let firebaseInitialized = false;

try {
    if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey || projectId === 'your-project-id') {
            console.warn('⚠️  Firebase credentials not set in .env — database features disabled.');
            console.warn('   Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
        } else {
            admin.initializeApp({
                credential: admin.credential.cert({
                    type: 'service_account',
                    project_id: projectId,
                    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                    private_key: privateKey.replace(/\\n/g, '\n'),
                    client_email: clientEmail,
                    client_id: process.env.FIREBASE_CLIENT_ID,
                    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
                    token_uri: 'https://oauth2.googleapis.com/token'
                }),
                projectId
            });
            db = admin.firestore();
            firebaseInitialized = true;
            console.log('✅ Firebase Firestore connected');
        }
    } else {
        db = admin.firestore();
        firebaseInitialized = true;
    }
} catch (err) {
    console.error('❌ Firebase init failed:', err.message);
    console.warn('   Server will run with limited functionality (no database).');
}

// Stub db that returns empty results instead of crashing
const stubCollection = () => ({
    where: () => stubCollection(),
    orderBy: () => stubCollection(),
    limit: () => stubCollection(),
    get: async () => ({ empty: true, size: 0, docs: [] }),
    add: async () => ({ id: 'offline' }),
    doc: (id) => stubDoc(id)
});
const stubDoc = (id = 'offline') => ({
    get: async () => ({ exists: false, id, data: () => null }),
    set: async () => { },
    update: async () => { },
    delete: async () => { }
});

const safeDb = db || {
    collection: () => stubCollection(),
    batch: () => ({ set: () => { }, commit: async () => { } })
};

// Helper: convert Firestore doc to plain object
function docToObj(doc) {
    if (!doc || !doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

// Helper: convert query snapshot to array
function snapToArray(snap) {
    if (!snap || !snap.docs) return [];
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Helper: generate unique invoice number
function generateInvoiceNumber() {
    return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Firestore server timestamp (or Date if offline)
function now() {
    if (firebaseInitialized) return admin.firestore.FieldValue.serverTimestamp();
    return new Date();
}

module.exports = { db: safeDb, admin, docToObj, snapToArray, generateInvoiceNumber, now, firebaseInitialized };
