// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await login(form);
      nav('/');
    } catch (e) {
      // axios error shape
      const message = e?.response?.data?.message || e?.message || 'Login failed';
      setErr(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 100px)' }} className="d-flex align-items-center justify-content-center">
      <div className="auth-card shadow-sm p-4 rounded" style={{ width: '100%', maxWidth: 420 }}>
        <div className="text-center mb-3">
          <h3 className="mb-1">Welcome back</h3>
          <div className="text-muted small">Sign in to access your account</div>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        <form onSubmit={submit} noValidate>
          <div className="mb-3">
            <label className="form-label small">Email</label>
            <input
              className="form-control auth-input"
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <label className="form-label small">Password</label>
            <input
              className="form-control auth-input"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="rememberMe" />
              <label className="form-check-label small" htmlFor="rememberMe">Remember me</label>
            </div>
            {/* <Link to="/forgot" className="small">Forgot?</Link> */}
          </div>

          <button className="btn btn-primary w-100" type="submit" disabled={busy}>
            {busy ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-3 small text-muted">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
