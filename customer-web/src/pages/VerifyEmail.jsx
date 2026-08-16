import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(location.state?.devPreviewUrl ? 'A test email was generated.' : '');
  const [devPreviewUrl, setDevPreviewUrl] = useState(location.state?.devPreviewUrl || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.verifyEmail({ email, code });
      login(token, user);
      navigate('/my-orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setInfo('');
    setResending(true);
    try {
      const res = await api.resendVerification({ email });
      setInfo(res.message);
      setDevPreviewUrl(res.devPreviewUrl || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h2 style={{ marginBottom: 6 }}>Verify your email</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 22 }}>
          Enter the 6-digit code we sent to your email.
        </p>
        {error && <div className="form-error">{error}</div>}
        {info && (
          <div className="form-success">
            {info}
            {devPreviewUrl && (
              <>
                {' '}
                <a href={devPreviewUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit', fontWeight: 700 }}>
                  View test email
                </a>
              </>
            )}
          </div>
        )}
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Verification code</label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              style={{ letterSpacing: 4, textAlign: 'center', fontSize: 18 }}
            />
          </div>
          <button className="submit-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
        <div className="form-footer">
          Didn't get a code?{' '}
          <button onClick={handleResend} disabled={resending} style={{ color: 'var(--forest-dark)', fontWeight: 700, textDecoration: 'underline' }}>
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        </div>
        <div className="form-footer">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
