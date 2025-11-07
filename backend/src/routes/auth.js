import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

const createToken = (user) => {
  const payload = { id: user._id, role: user.role };
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  const secret = process.env.JWT_SECRET || 'devsecret';
  return jwt.sign(payload, secret, { expiresIn });
};

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    console.log('[REGISTER] Attempt:', { name, email, role, passwordLength: password?.length });

    // Validate required fields
    if (!name || !email || !password) {
      console.log('[REGISTER] Missing required fields');
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Validate password length
    if (password.length < 6) {
      console.log('[REGISTER] Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // CRITICAL FIX: Normalize email to lowercase before querying
    // User model has lowercase: true, so emails are stored lowercase
    // But queries don't auto-lowercase, so we must normalize here
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();

    console.log('[REGISTER] Normalized email:', normalizedEmail);

    // Check if user already exists
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      console.log('[REGISTER] Email already exists:', normalizedEmail);
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create new user
    console.log('[REGISTER] Creating user...');
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
      role: role && ['student', 'teacher', 'admin'].includes(role) ? role : 'student'
    });

    console.log('[REGISTER] User created:', user.email, user.role);

    // Generate token
    const token = createToken(user);
    console.log('[REGISTER] Token generated');

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('[REGISTER] Error:', err);
    // Handle duplicate key error (race condition)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: `Validation error: ${errors}` });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('[LOGIN] Request received:', { email, passwordProvided: !!password });

    // Validate required fields
    if (!email || !password) {
      console.log('[LOGIN] Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // CRITICAL FIX: Normalize email to lowercase before querying
    // User model stores emails in lowercase, but queries don't auto-lowercase
    // This ensures case-insensitive login
    const normalizedEmail = email.toLowerCase().trim();

    console.log(`[LOGIN] Attempt for email: ${normalizedEmail}`);

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`[LOGIN] User not found: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`[LOGIN] User found: ${user.email}, Role: ${user.role}`);

    // Compare password
    const match = await user.comparePassword(password);
    if (!match) {
      console.log(`[LOGIN] Password mismatch for: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`[LOGIN] Success! User: ${user.email}, Role: ${user.role}`);

    // Generate token
    const token = createToken(user);
    console.log('[LOGIN] Token generated successfully');

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('[LOGIN] Error:', err);
    // Handle specific errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    next(err);
  }
});

export default router;



