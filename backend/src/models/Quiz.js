import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: 'Each question must have at least two options.'
      },
      required: true
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    questions: { type: [questionSchema], validate: v => v.length > 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;



