# Maratha Mall - MLM Platform

A complete, full-stack MLM platform built with **Node.js, Express, PostgreSQL** (Backend) and **React, TailwindCSS** (Frontend).

## 🚀 Features

### **1. Core System**
-   **Secure Authentication**: Register with referral code validation, Login (JWT), and Password Hashing (Bcrypt).
-   **Referral Network**: Efficient hierarchical tree structure using **Closure Table** pattern.
-   **Role-Based Access**: Distinguishes between **Super Admin** and **Member** roles.

### **2. Member Features**
-   **Dashboard**:
    -   Visualize network tree (downline).
    -   View real-time stats (Total Downline, Direct Referrals).
    -   Track Earnings.
-   **Shop**: Browse products, view details, and place orders.
-   **Order History**: Track past purchases.
-   **Commissions**: Earn automated commissions from downline purchases (5 Levels: 10%, 5%, 3%, 2%, 1%).

### **3. Admin Features**
-   **Dashboard**: System-wide overview (Total Users, Active Members).
-   **User Management**: View all users, Suspend/Activate accounts.
-   **Product Management**: Add, Update, and Delete products.

## 🛠️ Prerequisites

-   **Node.js** (v14 or higher)
-   **PostgreSQL** Database

## 📦 Installation & Setup

### 1. Database Setup
Create a PostgreSQL database named `mlm_db`:
```sql
CREATE DATABASE mlm_db;
```

### 2. Backend Setup
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` root:
    ```env
    PORT=5000
    DB_NAME=mlm_db
    DB_USER=your_postgres_username
    DB_PASSWORD=your_postgres_password
    DB_HOST=localhost
    JWT_SECRET=your_super_secret_key_here
    ```
4.  Start the server:
    ```bash
    npm start
    ```
    *The server will run on http://localhost:5000 and automatically sync the database schema.*

### 3. Frontend Setup
1.  Navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *Access the app at http://localhost:5173 (or as shown in terminal).*

## 🧪 Testing the System

### Initial Admin Setup
1.  Register a new user through the app (e.g., `admin@example.com`).
2.  Manually update references in database to make this user an Admin:
    ```sql
    UPDATE "Users" SET role = 'admin' WHERE email = 'admin@example.com';
    ```
3.  Login to access the Admin Dashboard.

### Testing Commissions
1.  Reigster User A.
2.  Register User B using User A's referral code.
3.  Login as User B and buy a product from the "Products" page.
4.  Login as User A and check the Dashboard to see the commission earned!

## 📜 License
This project is for educational purposes.
