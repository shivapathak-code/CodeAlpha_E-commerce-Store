const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());

app.use(compression());

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));
mongoose
.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is running",
        timestamp: new Date()
    });
});

app.use((req, res) => {
    if (req.path.startsWith("/api")) {
        return res.status(404).json({
            message: "API route not found"
        });
    }

    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(process.env.PORT, () => {
    console.log(`Server Running on ${process.env.PORT}`);
});