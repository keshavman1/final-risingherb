// frontend/src/pages/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await signup(form);
      nav('/');
    } catch (e) {
      const message = e?.response?.data?.message || e?.message || 'Signup failed';
      setErr(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 100px)' }} className="d-flex align-items-center justify-content-center">
      <div className="auth-card shadow-sm p-4 rounded" style={{ width: '100%', maxWidth: 520 }}>
        <div className="text-center mb-3">
          <h3 className="mb-1">Create your account</h3>
          <div className="text-muted small">Sign up to start ordering from Rising-Herb</div>
        </div>

        {err && <div className="alert alert-danger">{err}</div>}

        <form onSubmit={submit} noValidate>
          <div className="row">
            <div className="col-12 mb-3">
              <label className="form-label small">Full name</label>
              <input
                className="form-control auth-input"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="col-md-6 mb-3">
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

            <div className="col-md-6 mb-3">
              <label className="form-label small">Phone</label>
              <input
                className="form-control auth-input"
                placeholder="+91xxxxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label small">Password</label>
              <input
                className="form-control auth-input"
                type="password"
                placeholder="Choose a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="new-password"
              />
              <div className="form-text small">Use at least 6 characters.</div>
            </div>
          </div>

          <div className="d-grid">
            <button className="btn btn-success" type="submit" disabled={busy}>
              {busy ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="text-center mt-3 small text-muted">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
