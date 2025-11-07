import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-blue-700">
          Quiz App
        </Link>
        <div className="flex items-center gap-3">
          {user?.role === 'teacher' || user?.role === 'admin' ? (
            <>
              <Link to="/teacher" className="text-sm text-blue-700 hover:underline">Create Quiz</Link>
              {/* ===== TEACHER COMPONENT START ===== */}
              <Link to="/teacher/dashboard" className="text-sm text-green-700 hover:underline font-medium">Teacher Dashboard</Link>
              {/* ===== TEACHER COMPONENT END ===== */}
            </>
          ) : null}
          {/* ADMIN FEATURE START */}
          {user?.role === 'admin' ? (
            <Link to="/admin" className="text-sm text-purple-700 hover:underline font-medium">Admin Dashboard</Link>
          ) : null}
          {/* ADMIN FEATURE END */}
          {user ? (
            <>
              <span className="text-sm text-gray-700">{user.name} ({user.role})</span>
              <button onClick={onLogout} className="btn btn-primary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-blue-700 hover:underline">Login</Link>
              <Link to="/signup" className="text-sm text-blue-700 hover:underline">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}



