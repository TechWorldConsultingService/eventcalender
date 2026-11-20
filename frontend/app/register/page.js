'use client';
import Link from 'next/link';
import { useState } from 'react';
import Brand from '@/components/Brand';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', username: '', email: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (form.password !== form.password2) { setError('Passwords do not match.'); return; }
    setBusy(true); setError('');
    try { await register({ ...form, username: form.username.trim() }); }
    catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-top"><ThemeToggle /></div>
      <div className="card auth-card fade-in">
        <div style={{ marginBottom: '1.4rem', position: 'relative' }}><Link href="/"><Brand small /></Link></div>
        <h1>Create account ✨</h1>
        <p className="sub">Start planning your prettiest week.</p>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="field">
              <label>First name</label>
              <input className="input" value={form.first_name} onChange={set('first_name')} autoComplete="given-name" />
            </div>
            <div className="field">
              <label>Last name</label>
              <input className="input" value={form.last_name} onChange={set('last_name')} autoComplete="family-name" />
            </div>
          </div>
          <div className="field">
            <label>Username</label>
            <input className="input" required value={form.username} onChange={set('username')} autoComplete="username" />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
          </div>
          <div className="form-row">
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} autoComplete="new-password" />
            </div>
            <div className="field">
              <label>Confirm</label>
              <input className="input" type="password" required value={form.password2} onChange={set('password2')} autoComplete="new-password" />
            </div>
          </div>
          {error && <p className="form-error" style={{ whiteSpace: 'pre-line' }}>{error}</p>}
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="auth-foot">Already have an account? <Link href="/login">Log in</Link></p>
      </div>
    </div>
  );
}
