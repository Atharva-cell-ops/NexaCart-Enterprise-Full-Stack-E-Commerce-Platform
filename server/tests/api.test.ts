import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/utils/prisma';

const app = createApp();

describe('NexaCart API Integration Test Suite', () => {
  let customerToken = '';
  let adminToken = '';
  let testProductId = '';

  beforeAll(async () => {
    // Ensure DB connection
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health should return ok status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('NexaCart API');
    });
  });

  describe('2. Authentication Flow & Security', () => {
    it('POST /api/auth/login - should authenticate seeded customer and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer@nexacart.com',
          password: 'Customer@123456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('customer@nexacart.com');
      expect(res.body.data.user.role).toBe('CUSTOMER');
      customerToken = res.body.data.token;
    });

    it('POST /api/auth/login - should authenticate seeded admin', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@nexacart.com',
          password: 'Admin@123456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('ADMIN');
      adminToken = res.body.data.token;
    });

    it('POST /api/auth/login - should reject invalid credentials with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer@nexacart.com',
          password: 'WrongPassword999',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me - should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('customer@nexacart.com');
      expect(res.body.data.addresses).toBeDefined();
    });

    it('GET /api/auth/me - should reject request without token with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('3. Products & Catalog API', () => {
    it('GET /api/categories - should return list of categories with product counts', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].slug).toBeDefined();
    });

    it('GET /api/products - should return paginated products with metadata', async () => {
      const res = await request(app).get('/api/products?page=1&limit=6');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(6);
      expect(res.body.meta.total).toBeGreaterThan(0);

      testProductId = res.body.data[0].id;
    });

    it('GET /api/products - search filtering should return matched results', async () => {
      const res = await request(app).get('/api/products?search=Headphones');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name.toLowerCase()).toContain('headphones');
    });

    it('GET /api/products/:slug - should return full product details with related items', async () => {
      const res = await request(app).get('/api/products/aether-pro-spatial-wireless-headphones');
      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe('aether-pro-spatial-wireless-headphones');
      expect(res.body.data.relatedProducts).toBeDefined();
      expect(Array.isArray(res.body.data.images)).toBe(true);
    });
  });

  describe('4. Cart & Calculations API', () => {
    it('GET /api/cart - should retrieve user cart', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary).toBeDefined();
    });

    it('POST /api/cart/items - should add product to cart', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProductId,
          quantity: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('POST /api/cart/validate-coupon - should validate active coupon and calculate savings', async () => {
      const res = await request(app)
        .post('/api/cart/validate-coupon')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          code: 'WELCOME10',
          subtotal: 100,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.valid).toBe(true);
      expect(res.body.data.discountPercent).toBe(10);
      expect(res.body.data.discountAmount).toBe(10);
    });
  });

  describe('5. Role-Based Authorization & Admin Safeguards', () => {
    it('GET /api/admin/metrics - customer token should be forbidden (403)', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });

    it('GET /api/admin/metrics - admin token should successfully access metrics', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.metrics.totalRevenue).toBeDefined();
    });
  });
});
