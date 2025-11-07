// ===== TEACHER COMPONENT START =====
import { Router } from 'express';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

// All teacher routes require authentication and teacher role
router.use(auth);
router.use(requireRole('teacher', 'admin')); // Admin can also access teacher features

/**
 * GET /api/teacher/quizzes
 * Get all quizzes created by the logged-in teacher
 */
router.get('/quizzes', async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id })
      .select('title description createdAt questions')
      .sort({ createdAt: -1 })
      .lean();

    // Add attempt count for each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const attemptCount = await Result.countDocuments({ quiz: quiz._id });
        return {
          ...quiz,
          id: quiz._id,
          questionCount: quiz.questions?.length || 0,
          attemptCount
        };
      })
    );

    res.json({ quizzes: quizzesWithStats });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/teacher/quiz/:quizId/attempts
 * Get all student attempts for a specific quiz (only if teacher owns the quiz)
 */
router.get('/quiz/:quizId/attempts', async (req, res, next) => {
  try {
    const { quizId } = req.params;

    // Verify the quiz exists and belongs to the teacher
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check ownership (admin can view any quiz)
    if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to view this quiz' });
    }

    // Get all results for this quiz with student information
    const attempts = await Result.find({ quiz: quizId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Format the response
    const formattedAttempts = attempts.map((attempt) => ({
      id: attempt._id,
      studentName: attempt.user?.name || 'Unknown',
      studentEmail: attempt.user?.email || 'Unknown',
      score: attempt.score,
      total: attempt.total,
      percentage: attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0,
      attemptDate: attempt.createdAt,
      responses: attempt.responses
    }));

    res.json({
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questionCount: quiz.questions?.length || 0
      },
      attempts: formattedAttempts,
      totalAttempts: formattedAttempts.length
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/teacher/stats
 * Get teacher's statistics (total quizzes, total attempts, etc.)
 */
router.get('/stats', async (req, res, next) => {
  try {
    const teacherId = req.user._id;

    const totalQuizzes = await Quiz.countDocuments({ createdBy: teacherId });
    const totalAttempts = await Result.countDocuments({
      quiz: { $in: await Quiz.find({ createdBy: teacherId }).distinct('_id') }
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentQuizzes = await Quiz.countDocuments({
      createdBy: teacherId,
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentAttempts = await Result.countDocuments({
      quiz: { $in: await Quiz.find({ createdBy: teacherId }).distinct('_id') },
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get average score across all attempts
    const allResults = await Result.find({
      quiz: { $in: await Quiz.find({ createdBy: teacherId }).distinct('_id') }
    }).lean();

    const avgScore = allResults.length > 0
      ? Math.round(
          (allResults.reduce((sum, r) => sum + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) /
            allResults.length)
        )
      : 0;

    res.json({
      totalQuizzes,
      totalAttempts,
      recentQuizzes,
      recentAttempts,
      averageScore: avgScore
    });
  } catch (err) {
    next(err);
  }
});

export default router;
// ===== TEACHER COMPONENT END =====

