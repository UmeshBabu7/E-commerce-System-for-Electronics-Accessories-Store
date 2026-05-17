# 🛒 Electronics Accessories Store — E-commerce System

A full-stack e-commerce system for an electronics accessories store, built with **Django REST Framework** on the backend and **Next.js** on the frontend.

---

## 📌 Overview

This project is a complete web application for managing and shopping at an electronics accessories store. Admins and staff can manage products, inventory, and orders, while customers can browse products, add items to their cart, and place orders.

---

## 🏗️ Project Structure

```
E-commerce-System/
├── backend/          # Django REST API
│   ├── accounts/     # User authentication & profiles
│   ├── products/     # Products & categories
│   ├── inventory/    # Stock management
│   ├── cart/         # Shopping cart
│   ├── orders/       # Order management
│   ├── analytics/    # Dashboard & reports
│   └── config/       # Django settings & URLs
│
└── frontend/         # Next.js Application
    ├── app/          # Pages (App Router)
    │   ├── auth/     # Login, Register
    │   ├── shop/     # Products, Cart, Orders
    │   ├── dashboard/# Admin dashboard
    │   └── profile/  # User profile
    ├── components/   # Reusable UI components
    ├── hooks/        # Custom React hooks
    └── lib/          # API client & utilities
```

---

## ⚙️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Django | 6.0.5 | Web framework |
| Django REST Framework | 3.17.1 | REST API |
| SimpleJWT | 5.5.1 | JWT Authentication |
| django-cors-headers | 4.9.0 | CORS handling |
| Pillow | 12.2.0 | Image uploads |
| python-decouple | 3.8 | Environment variables |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.6 | React framework |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type safety |
| TanStack Query | ^5 | Server state management |
| React Hook Form + Zod | latest | Form validation |
| Tailwind CSS | ^4 | Styling |
| Recharts | ^3 | Analytics charts |
| Axios | ^1 | HTTP client |

---

## 🔑 Features

### 👤 User System
- **3 roles:** `customer`, `staff`, `admin`
- Email-based login with JWT tokens
- Profile management (phone, address)
- Token blacklisting on logout

### 🛍️ Products
- SKU-based product management
- Multiple categories per product (ManyToMany)
- Separate cost price and selling price
- Product variations (e.g. color, size)
- Product image uploads
- Low stock alerts via reorder point

### 📦 Inventory
- Full stock adjustment history (receive, sale, return, damage, manual)
- Tracks previous and new stock levels per adjustment
- Records which user performed each adjustment

### 🛒 Cart
- Per-user shopping cart
- Add, update, and remove cart items

### 📋 Orders
- Order status lifecycle: `pending → confirmed → processing → shipped → delivered → cancelled`
- Stores shipping address, phone, and notes
- Order items snapshot price at time of purchase

### 📊 Analytics (Admin only)
- Dashboard overview
- Profit reports
- Sales analytics
- CSV export

---

## 🚀 Getting Started

### Backend Setup

```bash
# Clone the repository
git clone <repo-url>
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file with the following:
# SECRET_KEY=your-secret-key
# DEBUG=True
# ALLOWED_HOSTS=127.0.0.1,localhost
# DATABASE_URL=sqlite:///db.sqlite3

# Run migrations
python manage.py migrate

# Create a superuser
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Create a .env.local file with:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the development server
pnpm dev
```

Frontend runs at: `http://localhost:3000`  
Backend API runs at: `http://localhost:8000`

---

## 🔐 API Endpoints

### Authentication
```
POST   /api/auth/register/       → Register a new user
POST   /api/auth/login/          → Login and receive JWT tokens
POST   /api/auth/logout/         → Logout (blacklist token)
POST   /api/auth/token/refresh/  → Refresh access token
```

### Products
```
GET    /api/products/            → List all products
POST   /api/products/            → Create a product (staff/admin)
GET    /api/products/<id>/       → Get a single product
PUT    /api/products/<id>/       → Update a product
DELETE /api/products/<id>/       → Delete a product
```

### Orders
```
GET    /api/orders/              → List user's orders
POST   /api/orders/              → Place a new order
PATCH  /api/orders/<id>/status/  → Update order status (staff/admin)
```

### Cart
```
GET    /api/cart/                → View cart
POST   /api/cart/items/          → Add item to cart
DELETE /api/cart/items/<id>/     → Remove item from cart
```

### Analytics (Admin only)
```
GET    /api/analytics/dashboard/ → Dashboard summary
GET    /api/analytics/profit/    → Profit report
GET    /api/analytics/reports/   → CSV export
```

---

## 🗃️ Data Model Overview

```
User ──────────────────── Order ─── OrderItem ─── Product
  │                                                  │
  └── Cart ── CartItem                    StockAdjustment
                                                     │
                              Category ──────────────┘
                              ProductVariation
```

---

## 📁 Frontend Pages

| Page | Path | Access |
|------|------|--------|
| Home | `/` | Public |
| Login | `/auth/login` | Public |
| Register | `/auth/register` | Public |
| Browse Products | `/shop/products` | Customer |
| Cart | `/shop/cart` | Customer |
| My Orders | `/shop/orders` | Customer |
| Profile | `/profile` | Logged in |
| Admin Dashboard | `/dashboard` | Staff/Admin |
| Analytics | `/dashboard/analytics` | Admin |
| Inventory | `/dashboard/inventory` | Staff/Admin |
| Manage Products | `/dashboard/products` | Staff/Admin |
| Manage Orders | `/dashboard/orders` | Staff/Admin |
| Manage Users | `/dashboard/users` | Admin |

---

## 🛠️ Developer Notes

- Backend and frontend are fully decoupled and run independently
- JWT tokens are stored in cookies via `js-cookie`
- Axios interceptors automatically attach tokens to every API request
- Forms are validated with `react-hook-form` and `zod`
- Server state is managed with `TanStack Query`
- UI components are built with shadcn/ui and Radix UI primitives
