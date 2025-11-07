import { Router } from 'express';
import Quiz from '../models/Quiz.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

// Public: list quizzes (basic info, no answers)
router.get('/', async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({})
      .select('title description createdAt')
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    next(err);
  }
});

// Protected: get quiz questions (students do not receive correct answers)
router.get('/:id', auth, async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let questions = quiz.questions.map((q) => ({
      text: q.text,
      options: q.options
    }));

    // Teachers/Admins can request answers via ?includeAnswers=true
    const includeAnswers =
      (req.user.role === 'teacher' || req.user.role === 'admin') &&
      req.query.includeAnswers === 'true';

    if (includeAnswers) {
      questions = quiz.questions.map((q) => ({
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer
      }));
    }

    res.json({
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      questions
    });
  } catch (err) {
    next(err);
  }
});

// Protected: create quiz (teacher/admin)
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const { title, description, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Title and questions are required' });
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

    const quiz = await Quiz.create({
      title,
      description: description || '',
      questions,
      createdBy: req.user._id
    });

    res.status(201).json({ id: quiz._id });
  } catch (err) {
    next(err);
  }
});

export default router;



