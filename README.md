# 🥛 Uma Dairy

https://github.com/user-attachments/assets/9b437ae1-f951-4de9-96fd-7ce5c331cb9d

> A production-ready MERN Stack e-commerce platform built to digitize a real local dairy business.

📹 **If the embedded video doesn't load, you can watch it here:**  
[▶️ Watch Demo](demo/uma-dairy-demo.mp4)

---

# 🚀 Live Demo

🌐 **Frontend**  
https://dairyfrontend.onrender.com

⚙️ **Backend API**  
https://uma-dairy.onrender.com

---

# 💡 Why I Built This

Uma Dairy is inspired by my mother's local dairy business.

Although customers trusted the quality of products like ghee, paneer, milk, and buttermilk, the business had no online presence.

Instead of building another generic e-commerce website, I wanted to solve a real-world problem by digitizing a small business and helping it reach more customers through technology.

This project gave me hands-on experience with authentication, payments, order management, shipping integration, customer support, and building production-ready full-stack applications.

---

# ✨ Features

## 👤 Customer

- JWT Authentication
- Browse Products
- Product Search
- Product Details
- Shopping Cart
- Address Management
- Razorpay Payment Gateway
- Cash on Delivery (COD)
- Order History
- AI-powered Uma Assistant
- Automatic Support Ticket Creation
- Responsive UI

---

## 🛠 Admin

- Admin Dashboard
- Product Management
- Order Management
- Protected Admin Routes

---

# 🛠 Tech Stack

## Frontend

- React.js
- React Router
- Tailwind CSS
- Axios

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Razorpay Payment Gateway
- Shiprocket API

## Deployment

- Render
- Docker

---

# 📂 Project Structure

```text
Uma-Dairy
│
├── frontend
├── backend
├── demo
├── screenshots
├── docker-compose.yml
└── README.md
```

---

# 🔄 Application Flow

```text
Browse Products
        │
        ▼
Add to Cart
        │
        ▼
Login / Register
        │
        ▼
Checkout
        │
        ▼
Choose Payment

     ┌───────────────┐
     │               │
     ▼               ▼

 Razorpay         Cash on Delivery

     │               │
     └───────┬───────┘
             ▼

     Payment Verification
             │
             ▼

     Order Confirmation
             │
             ▼

     Shiprocket Order
             │
             ▼

         My Orders
```

---

# 🤖 AI Support Assistant

Uma Dairy includes an AI-powered customer support assistant.

Users can simply type queries such as:

- "My payment failed."
- "Order not delivered."
- "I have an issue with my order."

The assistant automatically creates support tickets, making customer support faster and more convenient.

---

# 💳 Payments

The platform currently supports:

- 💳 Razorpay Online Payments
- 🚚 Cash on Delivery (COD)

The Razorpay integration includes:

- Secure Order Creation
- HMAC Signature Verification
- Payment Verification
- Order Status Synchronization

---

# 🚚 Shipping

After successful payment (or COD confirmation), the order is automatically sent to **Shiprocket** for shipment creation.

> **Note**
>
> Shiprocket integration has been implemented successfully.
> Shipment creation requires an active Shiprocket seller account.

---

# 🧩 Biggest Technical Challenge

The most challenging part of this project was implementing a secure payment workflow.

Initially, I integrated the Cashfree Payment Gateway but faced webhook signature mismatch issues while verifying payment callbacks.

To gain a better understanding of production payment systems, I migrated the application to Razorpay and implemented:

- Razorpay Order Creation
- Secure HMAC Signature Verification
- Payment Verification API
- Order Status Synchronization
- End-to-End Payment Flow

This experience significantly improved my backend debugging skills and my understanding of production-grade payment systems.

---

# 📸 Screenshots

## 🏠 Home

![Home](screenshots/Home.png)

---

## 🔐 Login

![Login](screenshots/Login.png)

---

## 🛍 Products

![Products](screenshots/Products.png)

---

## 📄 Product Details

![Product Details](screenshots/ProductDetail.png)

---

## 🛒 Shopping Cart

![Cart](screenshots/Cart.png)

---

## 📦 Checkout

![Checkout](screenshots/Checkout.png)

---

## 💳 Razorpay Payment

![Razorpay Payment](screenshots/RazorpayPopup.png)

---

## ✅ Payment Successful

![Payment Successful](screenshots/PaymentSuccessfull.png)

---

## 🎉 Order Confirmation

![Order Confirmation](screenshots/OrderConfirmed.png)

---

## 📜 My Orders

![My Orders](screenshots/MyOrders.png)

---

## ⚙️ Admin Dashboard

![Admin Dashboard](screenshots/AdminDashboard.png)

---

# 🚀 Future Improvements

- ⭐ Product Reviews & Ratings
- ❤️ Wishlist
- 📧 Email Notifications
- 📊 Inventory Analytics
- 📈 Sales Dashboard
- 📱 Mobile Application
- 📍 Live Order Tracking

---

# 👩‍💻 Author

**Kajal Verma**

B.Tech Computer Engineering  
National Institute of Advanced Manufacturing Technology (NIAMT), Ranchi

### GitHub

https://github.com/kajal19803

### LinkedIn

https://www.linkedin.com/in/kajal-verma-09a344241

---

⭐ If you found this project interesting, feel free to give it a **Star**!