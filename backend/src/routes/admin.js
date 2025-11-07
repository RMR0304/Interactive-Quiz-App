// ADMIN FEATURE START
import { Router } from 'express';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(auth);
router.use(requireRole('admin'));

// ==================== USER MANAGEMENT ====================

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password') // Never expose passwords
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/users/:id
 * Get single user by ID
 */
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user (name, email, role)
 */
router.put('/users/:id', async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.params.id;

    // Prevent admin from removing their own admin role
    if (userId === req.user._id.toString() && role && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot remove your own admin role' });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (role && ['student', 'teacher', 'admin'].includes(role)) {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    next(err);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
router.delete('/users/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all results associated with this user
    await Result.deleteMany({ user: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ==================== QUIZ MANAGEMENT ====================

/**
 * GET /api/admin/quizzes
 * Get all quizzes with pagination
 */
router.get('/quizzes', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search query
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const quizzes = await Quiz.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Quiz.countDocuments(query);

    res.json({
      quizzes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/quizzes/:id
 * Get single quiz by ID with full details
 */
router.get('/quizzes/:id', async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name email')
      .lean();

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/quizzes/:id
 * Update a quiz
 */
router.put('/quizzes/:id', async (req, res, next) => {
  try {
    const { title, description, questions } = req.body;
    const quizId = req.params.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description || '';
    if (questions) {
      // Validate questions
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: 'Questions must be a non-empty array' });
      }

      for (const [i, q] of questions.entries()) {
        if (
          !q.text ||
          !Array.isArray(q.options) ||
          q.options.length < 2 ||
          typeof q.correctAnswer !== 'number' ||
          q.correctAnswer < 0 ||
          q.correctAnswer >= q.options.length
        ) {
          return res.status(400).json({ message: `Invalid question at index ${i}` });
        }
      }
      updateData.questions = questions;
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({ message: 'Quiz updated successfully', quiz: updatedQuiz });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/quizzes/:id
 * Delete a quiz and all associated results
 */
router.delete('/quizzes/:id', async (req, res, next) => {
  try {
    const quizId = req.params.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Delete all results associated with this quiz
    await Result.deleteMany({ quiz: quizId });

    // Delete quiz
    await Quiz.findByIdAndDelete(quizId);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ==================== STATISTICS ====================

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalQuizzes = await Quiz.countDocuments();
    const totalResults = await Result.countDocuments();

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentQuizzes = await Quiz.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentResults = await Result.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      users: {
        total: totalUsers,
        students: totalStudents,
        teachers: totalTeachers,
        admins: totalAdmins,
        recent: recentUsers
      },
      quizzes: {
        total: totalQuizzes,
        recent: recentQuizzes
      },
      results: {
        total: totalResults,
        recent: recentResults
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
// ADMIN FEATURE END

