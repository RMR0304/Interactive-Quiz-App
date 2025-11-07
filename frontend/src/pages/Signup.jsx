import { useState } from 'react';
import { api } from '../services/api.js';
import { saveAuth } from '../services/auth.js';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup({ onAuth }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Trim all fields to remove whitespace
    const trimmedForm = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      role: form.role
    };

    // Validate
    if (!trimmedForm.name || !trimmedForm.email || !trimmedForm.password) {
      setError('All fields are required');
      return;
    }

    if (trimmedForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      console.log('Signup attempt:', { name: trimmedForm.name, email: trimmedForm.email, role: trimmedForm.role, passwordLength: trimmedForm.password.length });
      const { data } = await api.post('/auth/register', trimmedForm);
      console.log('Signup success:', data);
      saveAuth(data);
      onAuth?.();
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      console.error('Error response:', err?.response?.data);
      
      // Handle network errors specifically
      if (!err.response) {
        if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
          setError('Cannot connect to server. Make sure backend is running on http://localhost:5000');
        } else if (err.code === 'ERR_NETWORK') {
          setError('Network error. Check your internet connection and ensure backend is running.');
        } else {
          setError(`Network error: ${err.message}`);
        }
      } else {
        const errorMessage = err?.response?.data?.message || err?.message || 'Signup failed';
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 card">
      <h1 className="text-2xl font-semibold mb-4">Sign up</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn btn-primary w-full" type="submit">Create account</button>
      </form>
      <p className="text-sm text-gray-600 mt-3">
        Have an account? <Link to="/login" className="text-blue-700">Login</Link>
      </p>
    </div>
  );
}



