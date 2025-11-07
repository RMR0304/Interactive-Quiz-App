import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import TeacherPanel from './pages/TeacherPanel.jsx';
// ===== TEACHER COMPONENT START =====
import TeacherDashboard from './pages/TeacherDashboard.jsx';
// ===== TEACHER COMPONENT END =====
// ADMIN FEATURE START
import AdminDashboard from './pages/AdminDashboard.jsx';
// ADMIN FEATURE END
import { getCurrentUser, logout } from './services/auth.js';
import { useEffect, useState } from 'react';

export default function App() {
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorage = () => setUser(getCurrentUser());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<div className="max-w-5xl mx-auto p-4"><Login onAuth={() => setUser(getCurrentUser())} /></div>} />
        <Route path="/signup" element={<div className="max-w-5xl mx-auto p-4"><Signup onAuth={() => setUser(getCurrentUser())} /></div>} />
        <Route path="/dashboard" element={<RequireAuth><div className="max-w-5xl mx-auto p-4"><Dashboard user={user} /></div></RequireAuth>} />
        <Route path="/quiz/:id" element={<RequireAuth><div className="max-w-5xl mx-auto p-4"><QuizPage /></div></RequireAuth>} />
        <Route path="/result" element={<RequireAuth><div className="max-w-5xl mx-auto p-4"><ResultPage /></div></RequireAuth>} />
        <Route path="/teacher" element={<RequireRole roles={['teacher', 'admin']} user={user}><div className="max-w-5xl mx-auto p-4"><TeacherPanel /></div></RequireRole>} />
        {/* ===== TEACHER COMPONENT START ===== */}
        <Route path="/teacher/dashboard" element={<RequireRole roles={['teacher', 'admin']} user={user}><div className="max-w-5xl mx-auto p-4"><TeacherDashboard /></div></RequireRole>} />
        {/* ===== TEACHER COMPONENT END ===== */}
        {/* ADMIN FEATURE START */}
        <Route path="/admin" element={<RequireRole roles={['admin']} user={user}><div className="max-w-5xl mx-auto p-4"><AdminDashboard /></div></RequireRole>} />
        {/* ADMIN FEATURE END */}
        <Route path="*" element={<div className="max-w-5xl mx-auto p-4"><div className="text-center p-8">Page not found</div></div>} />
      </Routes>
    </div>
  );
}

function RequireAuth({ children }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ children, roles, user }) {
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}



