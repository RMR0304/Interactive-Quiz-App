// ADMIN FEATURE START
import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'quizzes') {
      loadQuizzes();
    } else if (activeTab === 'stats') {
      loadStats();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/admin/users?search=${searchTerm}`);
      setUsers(data.users || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/admin/quizzes?search=${searchTerm}`);
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? All their results will also be deleted.')) {
      return;
    }
    try {
      await api.delete(`/admin/users/${userId}`);
      setSuccess('User deleted successfully');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? All results for this quiz will also be deleted.')) {
      return;
    }
    try {
      await api.delete(`/admin/quizzes/${quizId}`);
      setSuccess('Quiz deleted successfully');
      loadQuizzes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      setSuccess('User role updated successfully');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update user role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['users', 'quizzes', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Search */}
      {(activeTab === 'users' || activeTab === 'quizzes') && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input flex-1"
          />
          <button onClick={activeTab === 'users' ? loadUsers : loadQuizzes} className="btn btn-primary">
            Search
          </button>
        </div>
      )}

      {/* Content */}
      {loading && <div className="text-center py-8">Loading...</div>}

      {activeTab === 'users' && !loading && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id || user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id || user.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => deleteUser(user._id || user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="text-center py-8 text-gray-500">No users found</div>}
          </div>
        </div>
      )}

      {activeTab === 'quizzes' && !loading && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Manage Quizzes</h2>
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz._id || quiz.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{quiz.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <span>Questions: {quiz.questions?.length || 0}</span>
                      {quiz.createdBy && (
                        <span className="ml-4">Created by: {quiz.createdBy.name || quiz.createdBy.email}</span>
                      )}
                      <span className="ml-4">
                        Created: {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteQuiz(quiz._id || quiz.id)}
                    className="btn text-red-600 hover:text-red-900 ml-4"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {quizzes.length === 0 && <div className="text-center py-8 text-gray-500">No quizzes found</div>}
          </div>
        </div>
      )}

      {activeTab === 'stats' && !loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Users</h3>
            <div className="space-y-1 text-sm">
              <div>Total: {stats.users.total}</div>
              <div>Students: {stats.users.students}</div>
              <div>Teachers: {stats.users.teachers}</div>
              <div>Admins: {stats.users.admins}</div>
              <div className="text-blue-600">New (7 days): {stats.users.recent}</div>
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Quizzes</h3>
            <div className="space-y-1 text-sm">
              <div>Total: {stats.quizzes.total}</div>
              <div className="text-blue-600">New (7 days): {stats.quizzes.recent}</div>
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Results</h3>
            <div className="space-y-1 text-sm">
              <div>Total: {stats.results.total}</div>
              <div className="text-blue-600">New (7 days): {stats.results.recent}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ADMIN FEATURE END

