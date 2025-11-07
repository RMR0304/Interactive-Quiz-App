import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true }
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    responses: { type: [responseSchema], default: [] },
    score: { type: Number, required: true },
    total: { type: Number, required: true }
  },
  { timestamps: true }
);

const Result = mongoose.model('Result', resultSchema);
export default Result;



