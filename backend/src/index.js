import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
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

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// CORS configuration - allow frontend to connect
// In development, allow both localhost:5173 and localhost:5174 (Vite may use different port)
export const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://interactive-quiz-app-1-x1v5.onrender.com' 
];
  
// Add production frontend URL from environment
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // In production, only allow whitelisted origins
      if (process.env.NODE_ENV === 'production') {
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          console.log('⚠️ CORS blocked origin:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        // In development, allow all for debugging
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === origin) {
          callback(null, true);
        } else {
          console.log('⚠️ CORS blocked origin:', origin);
          callback(null, true); // Allow for debugging
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

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
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error'
  });
});

// Start server only when not in test
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to DB', err);
      process.exit(1);
    });
}

export default app;



