// Firestore Seed Script
// Run: node seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db, now } = require('./firebaseConfig');

const products = [
    {
        name: 'Chicken Cage',
        description: 'High-quality poultry cages manufactured with precision lathe work. Durable galvanized steel construction, easy to clean, and designed for optimal ventilation and bird comfort. Available in multiple sizes for small to large-scale poultry farming.',
        shortDescription: 'Premium galvanized steel poultry cage with precision fittings.',
        price: 1200, originalPrice: 1500,
        category: 'Fabrication', material: 'Galvanized Steel',
        images: ['Assets/cage1.jpg'], stock: 50, isFeatured: true, isActive: true,
        specifications: [
            { key: 'Material', value: 'Galvanized Steel' }, { key: 'Dimensions', value: '60cm x 40cm x 45cm' },
            { key: 'Capacity', value: '4-6 birds' }, { key: 'Finish', value: 'Hot-dip galvanized' }
        ],
        tags: ['cage', 'poultry', 'galvanized', 'farming'],
        ratings: { average: 4.5, count: 12 }
    },
    {
        name: 'Precision Shafts',
        description: 'Custom-machined shafts with tight tolerances for industrial machinery, automotive, and mechanical applications. Ground and polished for superior surface finish.',
        shortDescription: 'CNC-turned precision shafts with tight tolerances.',
        price: 850, originalPrice: 1000,
        category: 'Lathe Components', material: 'Mild Steel / EN8 Steel',
        images: ['Assets/shaft.jpg'], stock: 75, isFeatured: true, isActive: true,
        specifications: [
            { key: 'Material', value: 'EN8 Steel' }, { key: 'Diameter Range', value: '10mm - 100mm' },
            { key: 'Tolerance', value: '±0.01mm' }, { key: 'Surface Finish', value: 'Ground & Polished' }
        ],
        tags: ['shaft', 'lathe', 'precision', 'CNC', 'machining'],
        ratings: { average: 4.7, count: 23 }
    },
    {
        name: 'Bushings & Sleeves',
        description: 'High-precision bushings and sleeves manufactured from various materials to meet your specific requirements. Used in bearings, gearboxes, and structural assemblies.',
        shortDescription: 'Precision-machined bushings for bearings and mechanical assemblies.',
        price: 450, originalPrice: 600,
        category: 'Lathe Components', material: 'Bronze / Brass / Steel',
        images: ['Assets/ring.png'], stock: 100, isFeatured: true, isActive: true,
        specifications: [
            { key: 'Material', value: 'Bronze / Brass / Steel' }, { key: 'Inner Diameter', value: '5mm - 80mm' },
            { key: 'Tolerance', value: 'H7/h6' }, { key: 'Finish', value: 'Turned & Bored' }
        ],
        tags: ['bushing', 'sleeve', 'bearing', 'lathe'],
        ratings: { average: 4.3, count: 18 }
    },
    {
        name: 'Flanges & Couplings',
        description: 'Custom flanges and couplings for piping systems and mechanical connections, built to industry standards.',
        shortDescription: 'Industrial-grade flanges for piping and mechanical connections.',
        price: 2100, originalPrice: 2500,
        category: 'Fabrication', material: 'Carbon Steel / SS',
        images: ['Assets/coupling.png'], stock: 40, isFeatured: true, isActive: true,
        specifications: [
            { key: 'Material', value: 'Carbon Steel / Stainless Steel' }, { key: 'Standard', value: 'IS:6392 / ANSI B16.5' },
            { key: 'Pressure Rating', value: 'PN 10 to PN 40' }, { key: 'Size Range', value: '1/2" to 12"' }
        ],
        tags: ['flange', 'coupling', 'pipe', 'industrial'],
        ratings: { average: 4.6, count: 9 }
    },
    {
        name: 'Lathe Machine Work',
        description: 'Professional CNC and manual lathe machining service for custom turning, facing, threading, grooving, and boring.',
        shortDescription: 'Custom lathe machining service with CNC precision.',
        price: 500,
        category: 'Lathe Components', material: 'As per requirement',
        images: ['Assets/lathemachine.jpg'], stock: 999, isFeatured: false, isActive: true,
        specifications: [
            { key: 'Machine Type', value: 'CNC & Manual Lathe' }, { key: 'Max Diameter', value: '300mm' },
            { key: 'Max Length', value: '1500mm' }, { key: 'Operations', value: 'Turning, Facing, Threading, Boring' }
        ],
        tags: ['lathe', 'CNC', 'machining', 'custom', 'service'],
        ratings: { average: 4.8, count: 31 }
    },
    {
        name: 'Welding Services',
        description: 'Professional welding services including MIG, TIG, and arc welding for structural steel, fabrication projects, pipe welding, and metal repairs.',
        shortDescription: 'MIG, TIG and Arc welding services for all metal types.',
        price: 300,
        category: 'Welding', material: 'Steel / SS / Aluminium',
        images: ['Assets/welding.jpeg'], stock: 999, isFeatured: false, isActive: true,
        specifications: [
            { key: 'Welding Types', value: 'MIG, TIG, Arc' }, { key: 'Materials', value: 'MS, SS, Aluminium, CI' },
            { key: 'Thickness Range', value: '1mm - 50mm' }, { key: 'Testing', value: 'Visual & PT Inspection' }
        ],
        tags: ['welding', 'MIG', 'TIG', 'fabrication', 'service'],
        ratings: { average: 4.5, count: 15 }
    },
    {
        name: 'Custom Threaded Rods',
        description: 'High-tensile custom threaded rods manufactured to exact specifications. Suitable for heavy industrial machinery and structural applications.',
        shortDescription: 'High-tensile threaded rods.',
        price: 600,
        category: 'Lathe Components', material: 'Alloy Steel',
        images: ['Assets/lathemachine.jpg'], stock: 200, isFeatured: false, isActive: true,
        specifications: [
            { key: 'Material', value: 'Alloy Steel' }, { key: 'Thread Type', value: 'Metric / Imperial' }
        ],
        tags: ['threaded rod', 'fastener', 'lathe'],
        ratings: { average: 4.9, count: 42 }
    },
    {
        name: 'Precision Gears',
        description: 'Custom-cut industrial gears for heavy machinery. We can manufacture spur, helical, and bevel gears with high precision.',
        shortDescription: 'Custom-cut industrial gears.',
        price: 1500,
        category: 'CNC Parts', material: 'Hardened Steel',
        images: ['Assets/lathemachine.jpg'], stock: 50, isFeatured: false, isActive: true,
        specifications: [
            { key: 'Material', value: 'Hardened Steel' }, { key: 'Type', value: 'Spur / Helical' }
        ],
        tags: ['gear', 'cnc', 'transmission'],
        ratings: { average: 4.8, count: 14 }
    },
    {
        name: 'Machine Pulleys',
        description: 'Heavy-duty drive pulleys for industrial belts. Balanced and machined for high-speed operation.',
        shortDescription: 'Heavy-duty drive pulleys.',
        price: 800,
        category: 'Lathe Components', material: 'Cast Iron / Steel',
        images: ['Assets/lathemachine.jpg'], stock: 80, isFeatured: false, isActive: true,
        specifications: [
            { key: 'Material', value: 'Cast Iron' }, { key: 'Groove Type', value: 'V-Belt / Timing' }
        ],
        tags: ['pulley', 'drive', 'lathe'],
        ratings: { average: 4.6, count: 27 }
    },
    {
        name: 'Metal Spacers',
        description: 'Precision metal spacers and standoffs in various materials and sizes for machinery assembly.',
        shortDescription: 'Precision metal spacers.',
        price: 250,
        category: 'Custom', material: 'Brass / Steel / Aluminium',
        images: ['Assets/lathemachine.jpg'], stock: 500, isFeatured: false, isActive: true,
        specifications: [
            { key: 'Material', value: 'Various' }, { key: 'Tolerance', value: '±0.05mm' }
        ],
        tags: ['spacer', 'standoff', 'custom'],
        ratings: { average: 4.7, count: 53 }
    },
    {
        name: 'Machine Belts',
        description: 'Industrial-grade rubber belts for transmission systems.',
        shortDescription: 'Industrial-grade rubber belts.',
        price: 400,
        category: 'Lathe Components', material: 'Rubber',
        images: ['Assets/lathemachine.jpg'], stock: 150, isFeatured: false, isActive: true,
        specifications: [{ key: 'Material', value: 'Rubber' }, { key: 'Type', value: 'V-Belt' }],
        tags: ['belt', 'drive'], ratings: { average: 4.5, count: 33 }
    },
    {
        name: 'Custom Engine Valves',
        description: 'High-performance custom engine valves machined for durability.',
        shortDescription: 'High-performance engine valves.',
        price: 1800,
        category: 'CNC Parts', material: 'Titanium / Steel',
        images: ['Assets/lathemachine.jpg'], stock: 30, isFeatured: false, isActive: true,
        specifications: [{ key: 'Material', value: 'Titanium' }],
        tags: ['valve', 'engine', 'cnc'], ratings: { average: 4.9, count: 19 }
    },
    {
        name: 'Stainless Washers',
        description: 'Precision cut stainless steel washers in all standard sizes.',
        shortDescription: 'Precision cut stainless washers.',
        price: 150,
        category: 'Lathe Components', material: 'Stainless Steel',
        images: ['Assets/lathemachine.jpg'], stock: 1000, isFeatured: false, isActive: true,
        specifications: [{ key: 'Material', value: '304/316 SS' }],
        tags: ['washer', 'fastener'], ratings: { average: 4.4, count: 85 }
    },
    {
        name: 'Aluminium Brackets',
        description: 'Lightweight and durable mounting brackets for structural frames.',
        shortDescription: 'Lightweight mounting brackets.',
        price: 350,
        category: 'Fabrication', material: 'Aluminium',
        images: ['Assets/lathemachine.jpg'], stock: 120, isFeatured: false, isActive: true,
        specifications: [{ key: 'Material', value: 'Aluminium' }],
        tags: ['bracket', 'mounting'], ratings: { average: 4.6, count: 41 }
    },
    {
        name: 'Steel Handrails',
        description: 'Custom welded steel handrails for industrial safety and walkways.',
        shortDescription: 'Custom welded steel handrails.',
        price: 3200,
        category: 'Welding', material: 'Steel',
        images: ['Assets/welding.jpeg'], stock: 10, isFeatured: false, isActive: true,
        specifications: [{ key: 'Length', value: 'Custom' }],
        tags: ['handrail', 'welding', 'safety'], ratings: { average: 4.8, count: 11 }
    },
    {
        name: 'Bronze Bearings',
        description: 'Durable sintered bronze bearings for low-friction applications.',
        shortDescription: 'Durable sintered bronze bearings.',
        price: 950,
        category: 'Lathe Components', material: 'Bronze',
        images: ['Assets/ring.png'], stock: 80, isFeatured: false, isActive: true,
        specifications: [{ key: 'Material', value: 'Sintered Bronze' }],
        tags: ['bearing', 'bronze'], ratings: { average: 4.7, count: 29 }
    },
    {
        name: 'Metal Pipe Fittings',
        description: 'Custom threaded metal pipe fittings for high-pressure systems.',
        shortDescription: 'Custom threaded pipe fittings.',
        price: 450,
        category: 'Lathe Components', material: 'Brass / Steel',
        images: ['Assets/coupling.png'], stock: 250, isFeatured: false, isActive: true,
        specifications: [{ key: 'Type', value: 'Threaded / Welded' }],
        tags: ['fitting', 'pipe'], ratings: { average: 4.5, count: 62 }
    },
    {
        name: 'Heavy Duty Hinges',
        description: 'Industrial load-bearing hinges fabricated for heavy doors and gates.',
        shortDescription: 'Industrial load-bearing hinges.',
        price: 750,
        category: 'Fabrication', material: 'Steel',
        images: ['Assets/lathemachine.jpg'], stock: 65, isFeatured: false, isActive: true,
        specifications: [{ key: 'Load Capacity', value: 'Up to 500kg' }],
        tags: ['hinge', 'hardware'], ratings: { average: 4.7, count: 38 }
    },
    {
        name: 'CNC Milled Enclosures',
        description: 'Custom aluminum electronic enclosures milled to exact specifications.',
        shortDescription: 'Custom aluminum electronic enclosures.',
        price: 2800,
        category: 'CNC Parts', material: 'Aluminium',
        images: ['Assets/lathemachine.jpg'], stock: 25, isFeatured: false, isActive: true,
        specifications: [{ key: 'Material', value: '6061 Aluminium' }],
        tags: ['enclosure', 'milling', 'cnc'], ratings: { average: 4.9, count: 8 }
    },
    {
        name: 'Grinding Services',
        description: 'Precision surface grinding services to achieve exceptional flatness and finish.',
        shortDescription: 'Precision surface grinding.',
        price: 400,
        category: 'Custom', material: 'Any metal',
        images: ['Assets/lathemachine.jpg'], stock: 999, isFeatured: false, isActive: true,
        specifications: [{ key: 'Tolerance', value: 'Micro-inch' }],
        tags: ['grinding', 'surface finish', 'service'], ratings: { average: 4.6, count: 22 }
    }
];

async function seed() {
    try {
        console.log('🔥 Connecting to Firestore...');

        // Seed customer user (signup method)
        const usersSnap = await db.collection('users').where('email', '==', 'customer@test.com').get();
        if (usersSnap.empty) {
            const hash = await bcrypt.hash('Test@1234', 10);
            await db.collection('users').add({
                name: 'Test Customer', email: 'customer@test.com',
                passwordHash: hash, phone: '+91 9000000000',
                role: 'customer', isActive: true, createdAt: now()
            });
            console.log('✅ Test customer: customer@test.com / Test@1234');
        } else {
            console.log('ℹ️  Test customer already exists');
        }

        // Seed products
        const prodSnap = await db.collection('products').limit(1).get();
        if (prodSnap.empty) {
            const batch = db.batch();
            products.forEach(p => {
                const ref = db.collection('products').doc();
                batch.set(ref, { ...p, createdAt: now() });
            });
            await batch.commit();
            console.log(`✅ ${products.length} products seeded to Firestore`);
        } else {
            console.log('ℹ️  Products already exist, skipping');
        }

        console.log('\n🎉 Firestore seed complete!');
        console.log('   Admin Login  → ID: Gunaadmin001 | Password: Gunaadmin001');
        console.log('   Customer     → customer@test.com / Test@1234');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        console.error('\n→ Make sure FIREBASE_* credentials are set in .env');
        process.exit(1);
    }
}

seed();
