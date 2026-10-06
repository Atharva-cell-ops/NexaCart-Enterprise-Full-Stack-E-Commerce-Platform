# NexaCart — System Architecture & Engineering Blueprint

## 1. High-Level Architecture

NexaCart implements a modern, decoupled Single-Page Application (SPA) + REST API architecture.

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 18/19 + TypeScript + Vite)"]
        UI["Tailwind CSS + Lucide Icons UI Kit"]
        RTR["React Router (Public, Customer & Admin Route Guards)"]
        TQ["TanStack Query (Server State Cache & Auto Invalidation)"]
        RHF["React Hook Form + Zod (Type-Safe Client Validation)"]
        Store["AuthContext & CartContext (JWT Session & Local Storage Sync)"]
    end

    subgraph API["Backend API (Node.js + Express + TypeScript)"]
        Sec["Security Layer (Helmet, CORS Whitelist, Rate Limiter)"]
        AuthMW["Auth Guard (JWT Verification & RBAC: CUSTOMER / ADMIN)"]
        ValMW["Request Validation (Zod Schemas)"]
        Controllers["Controllers (RESTful Endpoints)"]
        Services["Services Layer (Business Logic & Transactions)"]
    end

    subgraph Database["Database Layer (Prisma ORM + PostgreSQL / SQLite)"]
        Prisma["Prisma Client (Type-Safe Query Builder)"]
        DB[(PostgreSQL / SQLite Database)]
    end

    UI --> RTR
    RTR --> TQ
    TQ --> Store
    TQ -->|HTTP JSON with JWT Bearer| Sec
    Sec --> AuthMW
    AuthMW --> ValMW
    ValMW --> Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma --> DB
```

---

## 2. Relational Database Schema & Data Modeling

```mermaid
erDiagram
    USER ||--o{ ADDRESS : "has many"
    USER ||--o{ ORDER : "places"
    USER ||--o{ REVIEW : "writes"
    USER ||--o| CART : "owns"

    CATEGORY ||--o{ PRODUCT : "contains"
    PRODUCT ||--o{ REVIEW : "receives"
    PRODUCT ||--o{ CART_ITEM : "in"
    PRODUCT ||--o{ ORDER_ITEM : "in"

    CART ||--o{ CART_ITEM : "contains"
    ORDER ||--o{ ORDER_ITEM : "contains"
    ADDRESS ||--o{ ORDER : "delivered to"

    USER {
        string id PK
        string email UK
        string passwordHash
        string firstName
        string lastName
        string phoneNumber
        string role
        datetime createdAt
    }

    ADDRESS {
        string id PK
        string userId FK
        string street
        string city
        string state
        string postalCode
        string country
        boolean isDefault
    }

    CATEGORY {
        string id PK
        string name UK
        string slug UK
        string description
        string imageUrl
    }

    PRODUCT {
        string id PK
        string name
        string slug UK
        string description
        float price
        float discountPercent
        int stock
        string sku UK
        string images
        boolean featured
        float rating
        int reviewCount
        string categoryId FK
    }

    ORDER {
        string id PK
        string orderNumber UK
        string userId FK
        string addressId FK
        string status
        string paymentMethod
        string paymentStatus
        float subtotal
        float taxAmount
        float shippingFee
        float discountAmount
        float totalAmount
        string trackingNumber
        datetime createdAt
    }

    ORDER_ITEM {
        string id PK
        string orderId FK
        string productId FK
        string productName
        string productImage
        float price
        int quantity
    }

    CART {
        string id PK
        string userId FK
    }

    CART_ITEM {
        string id PK
        string cartId FK
        string productId FK
        int quantity
    }

    REVIEW {
        string id PK
        string userId FK
        string productId FK
        int rating
        string comment
        datetime createdAt
    }

    COUPON {
        string id PK
        string code UK
        float discountPercent
        float minOrderAmount
        float maxDiscount
        boolean isActive
    }
```

---

## 3. Security & Reliability Model

1. **Password Hashing:** `bcryptjs` with 10 salt rounds. Plaintext credentials are never saved or returned.
2. **Stateless JWT Authorization:** Signed with a 256-bit secret key. Authenticated sessions are validated server-side on every private route.
3. **Role-Based Access Control (RBAC):** All administrative endpoints (`/api/admin/*`, product mutations) enforce strict `requireAdmin` validation.
4. **Zod Validation Pipeline:** All incoming query parameters, request bodies, and route parameters are parsed and validated against strict schemas before executing controller logic.
5. **Database Transaction Isolation:** Order creation and inventory decrements execute inside `prisma.$transaction`, ensuring atomic consistency and zero race conditions under concurrent checkouts.
6. **Rate Limiting & Security Headers:** `express-rate-limit` prevents brute-force login attempts (100 requests per 15-minute window), while `helmet` enforces strict HTTP headers.
