import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Link } from 'react-router-dom';

export default function Dashboard({ user }) {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    api.get('/quizzes').then(({ data }) => setQuizzes(data)).catch(() => setQuizzes([]));
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-600">Welcome back{user ? `, ${user.name}` : ''}!</p>
        </div>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <Link to="/teacher" className="btn btn-primary">Create Quiz</Link>
        )}
      </header>

      <section className="grid sm:grid-cols-2 gap-4">
        {quizzes.map((q) => (
          <div className="card" key={q._id}>
            <h3 className="text-lg font-semibold">{q.title}</h3>
            <p className="text-gray-600 text-sm">{q.description}</p>
            <Link to={`/quiz/${q._id || q.id}`} className="btn btn-primary mt-3 inline-block">
              Start Quiz
            </Link>
          </div>
        ))}
        {quizzes.length === 0 && <div className="text-gray-600">No quizzes yet.</div>}
      </section>
    </div>
  );
}



