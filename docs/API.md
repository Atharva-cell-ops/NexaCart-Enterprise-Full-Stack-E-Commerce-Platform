# NexaCart REST API Specification

## Overview
- **Base URL:** `http://localhost:5000/api`
- **Response Format:** Standard JSON envelope `{ success: boolean, message?: string, data?: any, meta?: object, errors?: any }`
- **Authentication:** Bearer JWT in `Authorization` header (`Authorization: Bearer <token>`)

---

## 1. System Health
### `GET /api/health`
Returns service uptime and health status.
**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-10-06T18:00:00.000Z",
  "service": "NexaCart API",
  "uptime": 142.5
}
```

---

## 2. Authentication & User Profile
### `POST /api/auth/register`
Creates a new customer account and returns a signed JWT token.
- **Rate Limited:** Max 100 requests per 15 minutes.
- **Request Body:**
```json
{
  "email": "sarah@example.com",
  "password": "Password@123",
  "firstName": "Sarah",
  "lastName": "Jenkins",
  "phoneNumber": "+1 (555) 439-8812"
}
```

### `POST /api/auth/login`
Authenticates credentials and returns a signed JWT token.
- **Request Body:**
```json
{
  "email": "customer@nexacart.com",
  "password": "Customer@123456"
}
```

### `GET /api/auth/me` *(Protected)*
Fetches authenticated user context and saved addresses.

### `PUT /api/auth/profile` *(Protected)*
Updates customer name, phone number, and optional password changes.

### `GET /api/auth/addresses` *(Protected)*
Lists saved delivery addresses for the user.

### `POST /api/auth/addresses` *(Protected)*
Saves a new delivery address.

---

## 3. Products & Catalog
### `GET /api/categories`
Lists all available categories with active product count.

### `GET /api/products`
Paginated catalog query with filtering and sorting.
- **Query Parameters:**
  - `search`: string keyword search across name and description
  - `category`: category slug (e.g. `audio-acoustics`)
  - `minPrice`, `maxPrice`: numeric price bounds
  - `minRating`: numeric minimum star rating (1-5)
  - `inStock`: boolean (`true` / `false`)
  - `sort`: `newest` | `price_asc` | `price_desc` | `rating` | `popular`
  - `page`: integer page number (default `1`)
  - `limit`: integer page size (default `12`, max `50`)

### `GET /api/products/featured`
Returns featured products flagged for flagship homepage carousel.

### `GET /api/products/:slug`
Retrieves full product details, image gallery, stock level, customer reviews, and related items.

### `POST /api/reviews/:productId` *(Protected)*
Submits a verified customer rating (1-5 stars) and review comment.

---

## 4. Shopping Cart
### `GET /api/cart` *(Protected)*
Fetches persistent shopping cart items and calculated subtotal, tax, and shipping fee.

### `POST /api/cart/items` *(Protected)*
Adds an item or increments quantity in the cart.
```json
{
  "productId": "UUID",
  "quantity": 1
}
```

### `PUT /api/cart/items/:id` *(Protected)*
Updates line item quantity.

### `DELETE /api/cart/items/:id` *(Protected)*
Removes single line item from the cart.

### `DELETE /api/cart` *(Protected)*
Clears all items in the user's cart.

### `POST /api/cart/validate-coupon` *(Protected)*
Validates active discount codes (`WELCOME10`, `NEXA20`, `SUMMER30`) and calculates savings.

---

## 5. Orders & Fulfillment
### `POST /api/orders` *(Protected)*
Places a new order inside an atomic database transaction. Decrements product inventory, records shipping address, generates order reference number (`NC-YYYYMMDD-XXXX`), and clears cart.
```json
{
  "addressId": "UUID",
  "paymentMethod": "CREDIT_CARD",
  "shippingOption": "STANDARD",
  "couponCode": "NEXA20"
}
```

### `GET /api/orders` *(Protected)*
Lists authenticated user's order history with fulfillment status badges.

### `GET /api/orders/:id` *(Protected)*
Retrieves detailed receipt with tracking code and itemized invoice.

---

## 6. Admin Portal *(Protected: `requireAdmin`)*
### `GET /api/admin/metrics`
Dashboard statistics: Total Revenue, Total Orders, Active SKUs, Registered Users, Low Stock Warnings, and Status Counts.

### `POST /api/products`
Creates new product listing with image URLs and inventory count.

### `PUT /api/products/:id`
Updates product pricing, discount, stock, or category.

### `DELETE /api/products/:id`
Permanently deletes product from catalog.

### `GET /api/admin/orders`
Paginated view of all store orders with status filtering.

### `PATCH /api/admin/orders/:id/status`
Updates order status (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED` -> `CANCELLED`) and courier tracking number.

### `GET /api/admin/users`
Directory of all registered customer accounts and order volumes.
