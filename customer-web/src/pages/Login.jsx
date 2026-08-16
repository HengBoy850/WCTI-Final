import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login(form);
      login(token, user);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/my-orders');
    } catch (err) {
      if (err.unverified) {
        navigate('/verify-email', { state: { email: err.email || form.email } });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h2 style={{ marginBottom: 6 }}>Welcome back</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 22 }}>Log in to your account</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="form-footer">
          <Link to="/forgot-password">Forgot password?</Link>
          <span> · </span>
          <Link to="/register">Create an account</Link>
        </div>
        <div style={{ marginTop: 18, fontSize: 12.5, color: 'var(--muted)', borderTop: '1px dashed var(--line)', paddingTop: 14 }}>
          Demo accounts — customer@restaurant.com / customer123
        </div>
      </div>
    </div>
  );
}
// admin@restaurant.com / admin123 · staff@restaurant.com / staff123 · 
