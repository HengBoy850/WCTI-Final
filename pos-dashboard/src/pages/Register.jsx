import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'cashier', label: 'Cashier' },
  { value: 'staff', label: 'Kitchen Staff' },
  { value: 'admin', label: 'Admin' },
];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cashier', signupCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.registerStaff(form);
      login(token, user);
      navigate('/pos');
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
        <h2 style={{ marginBottom: 6, fontSize: 20 }}>Create a staff account</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 22 }}>
          Requires an admin signup code — ask your manager for it.
        </p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@restaurant.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
          </div>
          <div className="form-group">
            <label>Role</label>
            <div className="role-select-grid">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  className={`role-chip ${form.role === r.value ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, role: r.value })}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Admin signup code</label>
            <input
              required
              value={form.signupCode}
              onChange={(e) => setForm({ ...form, signupCode: e.target.value })}
              placeholder="Provided by your admin"
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="form-footer">
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
