// index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quizzes.js';
import resultRoutes from './routes/results.js';
// ADMIN FEATURE START
import adminRoutes from './routes/admin.js';
// ADMIN FEATURE END
// ===== TEACHER COMPONENT START =====
import teacherRoutes from './routes/teacher.js';
// ===== TEACHER COMPONENT END =====

dotenv.config();

const app = express();

// Security & performance middlewares
app.use(helmet());
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json({ limit: '10kb' })); // limit to avoid huge payloads

// Rate limiter (basic)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // max requests per window per IP
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// CORS configuration - allow frontend to connect
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://interactive-quiz-app-1-x1v5.onrender.com',
  'https://interactive-quiz-application-zupt.onrender.com' // added from your logs
]);

// Add production frontend URL from environment
if (process.env.CORS_ORIGIN) {
  allowedOrigins.add(process.env.CORS_ORIGIN);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // In production, enforce whitelist
      if (process.env.NODE_ENV === 'production') {
        if (allowedOrigins.has(origin)) {
          return callback(null, true);
        } else {
          console.warn('⚠️ CORS blocked origin:', origin);
          return callback(new Error('Not allowed by CORS'));
        }
      }

      // In non-production, allow origins in the whitelist or allow all (for debugging)
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      } else {
        // Log a warning but allow — this mirrors your previous intent to be permissive in dev.
        console.warn('⚠️ CORS origin not in whitelist (dev):', origin);
        return callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Simple health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);
// ADMIN FEATURE START
app.use('/api/admin', adminRoutes);
// ADMIN FEATURE END
// ===== TEACHER COMPONENT START =====
app.use('/api/teacher', teacherRoutes);
// ===== TEACHER COMPONENT END =====

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  res.status(status).json({
    message: (err && err.message) || 'Internal Server Error'
  });
});

// Start server only when not in test
const PORT = Number(process.env.PORT) || 5000;
let server;

if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      server = http.createServer(app);

      // Increase server timeouts to avoid short client-side timeouts causing aborted connections.
      // Many client libraries time out at 10s by default; raising server timeout prevents premature disconnects.
      server.setTimeout(120000); // 120s
      server.keepAliveTimeout = 65000; // 65s (Node default is 5s in some versions)

      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to DB', err);
      process.exit(1);
    });
}

// Graceful process handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // optional: close server & exit if you want to fail fast in production
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // optional: close server & exit in production
});

export default app;
