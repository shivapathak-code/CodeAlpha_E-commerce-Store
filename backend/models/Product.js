const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["Electronics", "Books", "Clothes", "Other"]
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null
    },
    badge: {
        type: String,
        default: null
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
    },
    reviewsCount: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 100
    },
    specs: {
        type: Map,
        of: String,
        default: {}
    },
    placeholder: {
        type: Object,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Product", productSchema);