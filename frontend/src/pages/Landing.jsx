import { Link } from 'react-router-dom';
import { getCurrentUser } from '../services/auth.js';

export default function Landing() {
  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">Quiz App</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create, take, and manage quizzes with ease. Perfect for teachers and students.
          </p>

          {user ? (
            <div className="flex gap-4 justify-center">
              <Link
                to="/dashboard"
                className="btn btn-primary px-8 py-3 text-lg"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="btn btn-primary px-8 py-3 text-lg"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Quizzes</h3>
            <p className="text-gray-600">
              Teachers can easily create custom quizzes with multiple choice questions.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Take Quizzes</h3>
            <p className="text-gray-600">
              Students can browse and take quizzes, then view their results instantly.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">
              View detailed results and track performance over time.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                1
              </div>
              <h4 className="font-semibold mb-2">Sign Up</h4>
              <p className="text-sm text-gray-600">Create your account as a student or teacher</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                2
              </div>
              <h4 className="font-semibold mb-2">Create or Browse</h4>
              <p className="text-sm text-gray-600">Teachers create quizzes, students browse available quizzes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                3
              </div>
              <h4 className="font-semibold mb-2">Take Quiz</h4>
              <p className="text-sm text-gray-600">Answer questions and submit your responses</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                4
              </div>
              <h4 className="font-semibold mb-2">View Results</h4>
              <p className="text-sm text-gray-600">See your score and detailed feedback</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

