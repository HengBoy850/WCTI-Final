import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.loginStaff({ ...form, remember });
      if (!['admin', 'staff', 'cashier'].includes(user.role)) {
        setError('This account does not have POS access.');
        setLoading(false);
        return;
      }
      login(token, user);
      if (user.role === 'staff') navigate('/orders');
      else navigate('/pos');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand"><span className="dot" />Savory POS</div>
        <h2 style={{ marginBottom: 6, fontSize: 20 }}>Staff sign in</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 22 }}>
          For cashiers, kitchen staff and admins only.
        </p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@restaurant.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <div className="checkbox-row">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} id="remember" />
            <label htmlFor="remember">Stay signed in on this device</label>
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="form-footer">
          New team member? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register with admin code</Link>
        </div>
        {/* <div style={{ marginTop: 18, fontSize: 11.5, color: 'var(--muted)', borderTop: '1px dashed var(--line)', paddingTop: 14 }}>
          Demo — admin@restaurant.com / admin123 · staff@restaurant.com / staff123 · cashier@restaurant.com / cashier123
        </div> */}
      </div>
    </div>
  );
}
