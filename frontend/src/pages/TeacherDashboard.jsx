// ===== TEACHER COMPONENT START =====
import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export default function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadQuizzes();
    loadStats();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/teacher/quizzes');
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get('/teacher/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadQuizAttempts = async (quizId) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/teacher/quiz/${quizId}/attempts`);
      setAttempts(data.attempts || []);
      setSelectedQuiz(data.quiz);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load quiz attempts');
      setSelectedQuiz(null);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quizId) => {
    loadQuizAttempts(quizId);
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttempts = attempts.filter((attempt) =>
    attempt.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-700">Teacher Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-green-50 border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-1">Total Quizzes</h3>
            <p className="text-2xl font-bold text-green-700">{stats.totalQuizzes}</p>
            <p className="text-xs text-green-600 mt-1">New: {stats.recentQuizzes} (7 days)</p>
          </div>
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Total Attempts</h3>
            <p className="text-2xl font-bold text-blue-700">{stats.totalAttempts}</p>
            <p className="text-xs text-blue-600 mt-1">New: {stats.recentAttempts} (7 days)</p>
          </div>
          <div className="card bg-purple-50 border-purple-200">
            <h3 className="text-sm font-medium text-purple-800 mb-1">Average Score</h3>
            <p className="text-2xl font-bold text-purple-700">{stats.averageScore}%</p>
          </div>
          <div className="card bg-orange-50 border-orange-200">
            <h3 className="text-sm font-medium text-orange-800 mb-1">Active Quizzes</h3>
            <p className="text-2xl font-bold text-orange-700">{quizzes.length}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Quizzes Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-green-700">My Quizzes</h2>
            <button
              onClick={loadQuizzes}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input mb-4"
          />

          {loading && <div className="text-center py-4">Loading...</div>}

          {!loading && filteredQuizzes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {quizzes.length === 0 ? 'No quizzes created yet' : 'No quizzes match your search'}
            </div>
          )}

          {!loading && filteredQuizzes.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz.id || quiz._id}
                  onClick={() => handleQuizClick(quiz.id || quiz._id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedQuiz?.id === (quiz.id || quiz._id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{quiz.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Questions: {quiz.questionCount}</span>
                        <span>Attempts: {quiz.attemptCount}</span>
                        <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {selectedQuiz?.id === (quiz.id || quiz._id) && (
                      <span className="text-green-600 text-sm font-medium">Selected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Attempts Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-green-700">
              {selectedQuiz ? `Attempts: ${selectedQuiz.title}` : 'Quiz Attempts'}
            </h2>
            {selectedQuiz && (
              <button
                onClick={() => {
                  setSelectedQuiz(null);
                  setAttempts([]);
                  setSearchTerm('');
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
            )}
          </div>

          {!selectedQuiz && (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">Select a quiz to view student attempts</p>
              <p className="text-sm">Click on any quiz from the left panel</p>
            </div>
          )}

          {selectedQuiz && (
            <>
              {/* Search for attempts */}
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input mb-4"
              />

              {loading && <div className="text-center py-4">Loading attempts...</div>}

              {!loading && filteredAttempts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {attempts.length === 0
                    ? 'No attempts yet for this quiz'
                    : 'No attempts match your search'}
                </div>
              )}

              {!loading && filteredAttempts.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Student Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Score
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Attempt Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAttempts.map((attempt) => (
                        <tr key={attempt.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {attempt.studentName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {attempt.studentEmail}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span
                              className={`font-semibold ${
                                attempt.percentage >= 70
                                  ? 'text-green-600'
                                  : attempt.percentage >= 50
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {attempt.score} / {attempt.total} ({attempt.percentage}%)
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(attempt.attemptDate).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-sm text-gray-600">
                    Total attempts: {filteredAttempts.length}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// ===== TEACHER COMPONENT END =====

