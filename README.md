# NexaCart — Enterprise-Grade Full-Stack E-Commerce Platform

> **A portfolio-ready, production-quality modern e-commerce application designed for high-performance hardware, acoustics, and workspace tech.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://nextcart-k68n.vercel.app/)
[![API Status](https://img.shields.io/badge/API_Status-Live-46E3B7?style=for-the-badge&logo=render)](https://nexacart-enterprise-full-stack-e.onrender.com/api/health)

---

### 🌐 Live Production Links
- 🛒 **Storefront Website:** [https://nextcart-k68n.vercel.app/](https://nextcart-k68n.vercel.app/)
- 📡 **REST API Server:** [https://nexacart-enterprise-full-stack-e.onrender.com](https://nexacart-enterprise-full-stack-e.onrender.com)
- 🏥 **API Health Check:** [https://nexacart-enterprise-full-stack-e.onrender.com/api/health](https://nexacart-enterprise-full-stack-e.onrender.com/api/health)

## 🌟 Quick Start & Demo Credentials

### 1-Click Fast Track Accounts (Pre-Seeded)
| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| 👑 **Administrator** | `admin@nexacart.com` | `Admin@123456` | Full Admin Dashboard, Product CRUD, Order Status Updates, User Directory |
| 🛍️ **Customer** | `customer@nexacart.com` | `Customer@123456` | Storefront, Persistent Cart, Multi-Step Checkout, Saved Addresses, Order History |

*Tip: You can also use the **1-Click Demo Account Buttons** directly on the `/login` screen!*

---

## 🚀 Key Features

### 🛒 Customer Storefront
- **Dynamic Landing Page:** Hero showcase with live featured items, curated category collections, best-seller tags, value proposition guarantees, and newsletter subscription.
- **Product Catalog & Live Filtering:** Search by keywords, category filter, price slider, minimum star rating filter, in-stock toggle, sorting (newest, price asc/desc, top-rated, popular), and grid/list view toggles.
- **Product Details & Gallery:** High-resolution multi-angle image gallery, live stock indicators, discount savings calculator, interactive quantity stepper, "Add to Cart", instant "Buy Now", technical specifications tab, and verified customer reviews.
- **Interactive Reviews:** Verified 5-star customer ratings with modal submission form and instant average rating recalculation.
- **Persistent Shopping Cart:** Server-synchronized cart for authenticated users, LocalStorage fallback for guests, line item quantity controls, free shipping progress bar ($100 threshold), and active promo coupon validator (`WELCOME10`, `NEXA20`, `SUMMER30`).
- **Multi-Step Checkout:** Address book selector / new address form, delivery speed picker (Standard vs Express), simulated interactive Credit Card preview / Cash on Delivery, and instant order placement with atomic inventory decrementing.
- **Order Confirmation & Tracking:** Detailed order confirmation receipt with unique reference code (`NC-YYYYMMDD-XXXX`), courier tracking code, timeline visualizer, and itemized invoice.
- **Customer Account Portal:** Personal info management, password updater, saved shipping addresses CRUD with default address toggling, and complete past order history.

### ⚡ Admin Operations Portal (`/admin`)
- **Executive Analytics Dashboard:** Real-time metrics for Total Revenue, Total Orders, Active SKUs, Customer Count, Low Stock Warnings, and Order Status breakdown.
- **Product Inventory Manager:** Add, edit, and delete products with SKU, categories, prices, discounts, stock levels, and high-resolution image URLs.
- **Order Operations Center:** View all customer orders with status filter tabs (`ALL`, `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), order detail inspector, and live fulfillment status / tracking code updater.
- **Customer Directory:** Overview of all registered customers with lifetime order counts and registration timestamps.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Icons** | Tailwind CSS, Lucide React |
| **State & Cache** | TanStack Query v5, Context API |
| **Forms & Validation** | React Hook Form, Zod |
| **Backend API** | Node.js, Express.js, TypeScript |
| **ORM & Database** | Prisma ORM, SQLite (local development zero-config) / PostgreSQL |
| **Security & Auth** | JWT, bcryptjs, Helmet, CORS, express-rate-limit |
| **Testing** | Vitest, Supertest |

---

## 📦 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/nexacart.git
cd nexacart

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
# In server/.env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=super_secret_jwt_key_nexacart_2026_portfolio_prod_grade_998877
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Initialize Database & Seed Data
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Start Development Servers (Concurrent)
```bash
npm run dev
```
- **Storefront Client:** [http://localhost:5173](http://localhost:5173)
- **REST API Server:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing & Verification

Run the automated integration and unit test suite:
```bash
# Run server test suite
npm run test:server
```

**Test Verification Results:**
```text
 ✓ tests/api.test.ts (15 tests)
   ✓ 1. Health Check Endpoint (GET /api/health)
   ✓ 2. Authentication Flow (Customer & Admin Login, Profile Context, 401 Rejections)
   ✓ 3. Products & Catalog API (Categories, Paginated Products, Search, Slug Details)
   ✓ 4. Cart & Calculations (Add Item, Quantity Stepper, Coupon Validation)
   ✓ 5. Role-Based Authorization & Admin Safeguards (403 Forbidden checks, Admin Metrics)

 Test Files  1 passed (1)
      Tests  15 passed (15)
```

---

## 📁 Scalable Directory Architecture

```text
E-Commerce Platform/
├── client/                     # Frontend Application (React + TS + Vite + Tailwind)
│   ├── src/
│   │   ├── api/                # Axios instance & typed endpoint queries
│   │   ├── components/         # Reusable UI kit (Buttons, Modals, Badges, Skeletons)
│   │   ├── context/            # AuthContext, CartContext, ToastContext
│   │   ├── pages/              # Storefront, Checkout, Profile, and Admin routes
│   │   ├── types/              # Comprehensive TypeScript interfaces
│   │   ├── App.tsx             # Route declarations & route guards
│   │   └── main.tsx            # Entry point
│   └── vite.config.ts
│
├── server/                     # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/             # Zod environment loader
│   │   ├── controllers/        # Express request/response handlers
│   │   ├── middleware/         # Auth guard, RBAC, Zod validation, ErrorHandler
│   │   ├── routes/             # RESTful route declarations
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Business logic & Prisma transactions
│   │   ├── utils/              # AppError, JWT, Password hasher, Response helper
│   │   └── app.ts              # Express configuration & middlewares
│   ├── prisma/                 # Prisma database schema & seeder
│   └── tests/                  # Vitest API integration tests
│
├── docs/                       # Technical Specifications
│   ├── API.md                  # RESTful API specifications
│   └── ARCHITECTURE.md         # Data models & system design
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔒 Security Architecture Highlights

1. **Stateless JWT Authentication:** Verified on every private route; token payload contains user ID and role.
2. **Strict Server-Side RBAC:** Admin routes (`/api/admin/*`, product creation/deletion) require verified `ADMIN` database roles.
3. **Bcrypt Password Hashing:** 10 rounds of salt generation; passwords never stored in plaintext.
4. **Zod Input Validation:** Every incoming payload is validated against type-safe Zod schemas.
5. **Atomic Database Transactions:** Multi-item checkouts and stock deductions run in a transactional boundary (`prisma.$transaction`).
6. **HTTP Hardening:** Protected with `helmet`, configured `cors` origin whitelisting, and `express-rate-limit` against brute-force login attacks.

---

## 📄 License
MIT License. Built for portfolio demonstration and technical evaluation.
