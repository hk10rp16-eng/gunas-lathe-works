const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    category: {
        type: String,
        enum: ['Lathe Components', 'Welding', 'Fabrication', 'CNC Parts', 'Custom', 'Other'],
        required: true
    },
    material: { type: String },
    images: [{ type: String }],
    stock: { type: Number, default: 100, min: 0 },
    specifications: [{
        key: String,
        value: String
    }],
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [String],
    createdAt: { type: Date, default: Date.now }
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text', material: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
