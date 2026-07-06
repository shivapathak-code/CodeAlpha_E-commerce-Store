const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");

const router = express.Router();
const fallbackUsers = [];

const normalizeUsername = (value) => {
    const base = (value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
    return base || `user${Math.floor(1000 + Math.random() * 9000)}`;
};

const findUserByEmail = async (email) => {
    if (mongoose.connection.readyState === 1) {
        return User.findOne({ email });
    }

    return fallbackUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

const saveUser = async (userData) => {
    if (mongoose.connection.readyState === 1) {
        const user = new User(userData);
        await user.save();
        return user;
    }

    const savedUser = {
        ...userData,
        _id: `${Date.now()}`
    };
    fallbackUsers.push(savedUser);
    return savedUser;
};

router.post("/register", async (req, res) => {
    try {
        const { fullName, username, email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const finalFullName = fullName || name || "User";
        const finalUsername = normalizeUsername(username || fullName || name || "user");

        const user = await saveUser({
            fullName: finalFullName,
            username: finalUsername,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User Registered",
            user: {
                id: user._id,
                fullName: user.fullName || finalFullName,
                username: user.username || finalUsername,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({
            token,
            user: {
                id: user._id,
                fullName: user.fullName || user.name || "User",
                username: user.username || normalizeUsername(user.fullName || user.name || "user"),
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login failed", error: error.message });
    }
});

module.exports = router;