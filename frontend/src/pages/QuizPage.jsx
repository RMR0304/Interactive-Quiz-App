import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.js';

export default function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/quizzes/${id}`).then(({ data }) => {
      setQuiz(data);
      setAnswers(Array(data.questions.length).fill(null));
    }).catch(() => setQuiz(null));
  }, [id]);

  const selectAnswer = (qi, oi) => {
    const copy = [...answers];
    copy[qi] = oi;
    setAnswers(copy);
  };

  const submit = async () => {
    setError('');
    if (answers.some((a) => a === null)) {
      setError('Please answer all questions before submitting.');
      return;
    }
    try {
      const { data } = await api.post(`/results/submit/${id}`, { answers });
      navigate('/result', { state: { result: data, quiz } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed');
    }
  };

  if (!quiz) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{quiz.title}</h1>
      <p className="text-gray-600">{quiz.description}</p>

      {quiz.questions.map((q, qi) => (
        <div key={qi} className="card">
          <h3 className="font-medium">{qi + 1}. {q.text}</h3>
          <div className="mt-2 grid gap-2">
            {q.options.map((opt, oi) => (
              <label key={oi} className={`flex items-center gap-2 border rounded-md p-2 ${answers[qi] === oi ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name={`q-${qi}`}
                  checked={answers[qi] === oi}
                  onChange={() => selectAnswer(qi, oi)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {error && <div className="text-red-600">{error}</div>}
      <button className="btn btn-primary" onClick={submit}>Submit</button>
    </div>
  );
}



