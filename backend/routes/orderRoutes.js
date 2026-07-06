const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

const fallbackOrders = [];

async function saveOrder(orderData) {
    if (mongoose.connection.readyState === 1) {
        const order = new Order(orderData);
        await order.save();
        return order;
    }

    const order = {
        ...orderData,
        _id: Date.now().toString(),
        createdAt: new Date()
    };

    fallbackOrders.push(order);
    return order;
}

// =======================
// CREATE ORDER
// =======================

router.post("/", auth, async (req, res) => {
    try {
        console.log("========== NEW ORDER REQUEST ==========");
        console.log("User ID:", req.user.id);
        console.log("Request Body:", req.body);

        // Validate products array
        if (!req.body.products || !Array.isArray(req.body.products)) {
            return res.status(400).json({ message: "Products array is required" });
        }

        const order = await saveOrder({
            userId: req.user.id,
            products: req.body.products.map(item => ({
                productId: new mongoose.Types.ObjectId(item.productId),
                quantity: item.quantity
            })),
            totalAmount: req.body.totalAmount
        });

        console.log("Order Created:", order);
        res.status(201).json(order);

    } catch (err) {
        console.log("Error creating order:", err);
        res.status(500).json({
            message: err.message
        });
    }
});

// =======================
// GET ORDERS
// =======================

router.get("/", auth, async (req, res) => {
    try {
        console.log("========== GET ORDERS REQUEST ==========");
        console.log("User ID:", req.user.id);

        let orders;

        if (mongoose.connection.readyState === 1) {
            orders = await Order.find({
                userId: req.user.id
            }).populate("products.productId");

            console.log("Orders from DB:", orders);

        } else {
            orders = fallbackOrders.filter(
                order => order.userId == req.user.id
            );
        }

        const formattedOrders = orders.map(order => ({
            id: order._id,
            date: new Date(order.createdAt).toLocaleDateString(),
            items: order.products.map(item => ({
                name: item.productId?.name || "Unknown Product",
                qty: item.quantity,
                price: item.productId?.price || 0
            })),
            total: order.totalAmount
        }));

        console.log("Formatted Orders:", formattedOrders);
        res.json(formattedOrders);

    } catch (err) {
        console.log("Error fetching orders:", err);
        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;