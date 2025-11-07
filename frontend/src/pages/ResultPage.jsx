import { useLocation, Link } from 'react-router-dom';

export default function ResultPage() {
  const { state } = useLocation();
  const result = state?.result;
  const quiz = state?.quiz;

  if (!result) {
    return (
      <div className="text-center p-8">
        <p>No result to show.</p>
        <Link to="/dashboard" className="text-blue-700 underline">Back to dashboard</Link>
      </div>
    );
  }

  const percent = Math.round((result.score / result.total) * 100);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Your Result</h1>
      {quiz && <h2 className="text-lg">{quiz.title}</h2>}
      <div className="card">
        <p className="text-gray-700">Score: <span className="font-semibold">{result.score} / {result.total}</span></p>
        <p className="text-gray-700">Percent: <span className="font-semibold">{percent}%</span></p>
      </div>
      <Link className="btn btn-primary" to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}


