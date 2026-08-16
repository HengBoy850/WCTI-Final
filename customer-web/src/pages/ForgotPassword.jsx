import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoToken, setDemoToken] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.forgotPassword({ email });
      if (res.demoResetToken) {
        setDemoToken(res.demoResetToken);
      } else {
        setError('If that email exists, a reset link has been generated.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h2 style={{ marginBottom: 6 }}>Reset your password</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 22 }}>
          Enter your email and we'll generate a reset link.
        </p>
        {error && <div className="form-error">{error}</div>}
        {demoToken ? (
          <div className="form-success">
            Demo mode: no email is sent. Use this token to reset your password:
            <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: 12, marginTop: 8 }}>
              {demoToken}
            </div>
            <button
              className="submit-btn"
              style={{ marginTop: 12 }}
              onClick={() => navigate(`/reset-password?token=${demoToken}`)}
            >
              Continue to reset password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <button className="submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <div className="form-footer">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
