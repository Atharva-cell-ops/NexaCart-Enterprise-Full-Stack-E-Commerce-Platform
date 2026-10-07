import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import apiRoutes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();

  // Security HTTP headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);

        // Allow localhost development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }

        // Allow configured CLIENT_URL
        if (env.CLIENT_URL && origin.replace(/\/$/, '') === env.CLIENT_URL.replace(/\/$/, '')) {
          return callback(null, true);
        }

        // Allow all Vercel deployment and preview domains
        if (origin.endsWith('.vercel.app') || origin.includes('vercel.app')) {
          return callback(null, true);
        }

        // Fallback allow for public portfolio API consumers
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Rate Limiting on Authentication Endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: {
      success: false,
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Apply Auth rate limiter
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Root API Information Route
  app.get('/', (req, res) => {
    res.json({
      service: 'NexaCart Enterprise REST API',
      status: 'online',
      version: '1.0.0',
      documentation: 'https://github.com/Atharva-cell-ops/NexaCart-Enterprise-Full-Stack-E-Commerce-Platform',
      health: '/api/health',
      endpoints: {
        products: '/api/products',
        categories: '/api/categories',
        auth: '/api/auth',
        cart: '/api/cart',
        orders: '/api/orders',
      },
    });
  });

  // Mount API Endpoints
  app.use('/api', apiRoutes);

  // 404 & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
