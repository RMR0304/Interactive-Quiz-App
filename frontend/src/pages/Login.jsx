import { useState } from 'react';
import { api } from '../services/api.js';
import { saveAuth } from '../services/auth.js';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ onAuth }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Trim email and password to remove whitespace
    const trimmedForm = {
      email: form.email.trim(),
      password: form.password.trim()
    };

    // Validate
    if (!trimmedForm.email || !trimmedForm.password) {
      setError('Email and password are required');
      return;
    }

    try {
      console.log('Login attempt:', { email: trimmedForm.email, passwordLength: trimmedForm.password.length });
      const { data } = await api.post('/auth/login', trimmedForm);
      console.log('Login success:', data);
      saveAuth(data);
      onAuth?.();
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
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
        const errorMessage = err?.response?.data?.message || err?.message || 'Login failed';
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 card">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn btn-primary w-full" type="submit">Login</button>
      </form>
      <p className="text-sm text-gray-600 mt-3">
        No account? <Link to="/signup" className="text-blue-700">Sign up</Link>
      </p>
    </div>
  );
}



