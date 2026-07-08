# 🛒 AETHERIS E-Commerce Store

A full-stack **E-Commerce Store** built with **HTML, CSS, JavaScript, Node.js, Express.js, MongoDB, and JWT Authentication**. This project provides a modern shopping experience with user authentication, cart management, checkout, and order tracking.


🌐 Live Demo
Live Application: (https://codealpha-e-commerce-store-xt8m.onrender.com/)

📂 GitHub Repository
Repository: https://github.com/shivapathak-code/CodeAlpha_E-commerce-Store
## 🚀 Features

* 🔐 User Registration & Login (JWT Authentication)
* 🛍️ Product Catalog (Loaded from MongoDB)
* 🔍 Product Search & Category Filter
* 🛒 Shopping Cart
* ➕ Add / Remove / Update Cart Items
* 💳 Checkout System
* 📦 Order History
* ⭐ Product Ratings & Reviews
* 📱 Responsive UI
* 🎨 Modern Cyberpunk Inspired Design

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JSON Web Token (JWT)

---

## 📂 Project Structure

```text
E-commerce Store/
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── seed.js
│   └── package.json
│
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/shivapathak-code/CodeAlpha_E-commerce-Store.git
```

```bash
cd CodeAlpha_E-commerce-Store
```

---

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

### 3. Create Environment File

Create a **.env** file inside the **backend** folder.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

---

### 4. Seed Database

```bash
node seed.js
```

---

### 5. Start Backend Server

```bash
npm start
```

Server runs at:

```
http://localhost:5000
```

---

### 6. Run Frontend

Open

```
frontend/index.html
```

in your browser.

---

## 📌 API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Products

```
GET /api/products
GET /api/products/:id
```

### Orders

```
POST /api/orders
GET /api/orders
```

---

## ✨ Project Highlights

* MongoDB Integrated Product Catalog
* JWT Based Authentication
* REST API Architecture
* Dynamic Product Loading
* Persistent Order History
* Responsive User Interface
* Secure Backend APIs

---

## 📈 Future Improvements

* Online Payment Gateway
* Wishlist
* Product Reviews
* Admin Dashboard
* Inventory Management
* Email Notifications
* Product Images Upload
* Search Suggestions

---

## 👨‍💻 Author

**Shiva Pathak**

GitHub:
https://github.com/shivapathak-code

---

## 📄 License

This project is developed for educational and learning purposes.
