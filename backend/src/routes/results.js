import { Router } from 'express';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

// Submit quiz responses (student)
router.post('/submit/:quizId', auth, requireRole('student', 'teacher', 'admin'), async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // array of selected option indices

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be an array' });
    }

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'All questions must be answered' });
    }

    let score = 0;
    const responses = answers.map((selectedAnswer, idx) => {
      const isCorrect = selectedAnswer === quiz.questions[idx].correctAnswer;
      if (isCorrect) score += 1;
      return {
        questionIndex: idx,
        selectedAnswer,
        isCorrect
      };
    });

    const existing = await Result.findOne({ user: req.user._id, quiz: quiz._id });
    if (existing) {
      // Upsert: overwrite previous submission
      existing.responses = responses;
      existing.score = score;
      existing.total = quiz.questions.length;
      await existing.save();
      return res.json({ resultId: existing._id, score, total: existing.total });
    }

    const result = await Result.create({
      user: req.user._id,
      quiz: quiz._id,
      responses,
      score,
      total: quiz.questions.length
    });

    res.status(201).json({ resultId: result._id, score, total: result.total });
  } catch (err) {
    next(err);
  }
});

// Get current user's results
router.get('/me', auth, async (req, res, next) => {
  try {
    const results = await Result.find({ user: req.user._id })
      .populate('quiz', 'title')
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Get results for a specific quiz (teacher/admin)
router.get('/quiz/:quizId', auth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const results = await Result.find({ quiz: quizId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

export default router;



