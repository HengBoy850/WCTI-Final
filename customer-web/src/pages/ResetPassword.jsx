import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.resetPassword({ token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h2 style={{ marginBottom: 6 }}>Set a new password</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 22 }}>
          Paste the reset token from the previous step.
        </p>
        {error && <div className="form-error">{error}</div>}
        {success ? (
          <div className="form-success">Password reset! Redirecting to login...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Reset token</label>
              <input required value={token} onChange={(e) => setToken(e.target.value)} />
            </div>
            <div className="form-group">
              <label>New password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <button className="submit-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
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
