'use client';
import Link from 'next/link';
import { useState } from 'react';
import Brand from '@/components/Brand';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try { await login(username.trim(), password); }
    catch (err) { setError(err.status === 401 ? 'Wrong username/email or password.' : err.message); setBusy(false); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-top"><ThemeToggle /></div>
      <div className="card auth-card fade-in">
        <div style={{ marginBottom: '1.4rem', position: 'relative' }}><Link href="/"><Brand small /></Link></div>
        <h1>Welcome back 💗</h1>
        <p className="sub">Log in to see your week.</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Username or email</label>
            <input className="input" required value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        </form>
        <p className="auth-foot">New here? <Link href="/register">Create an account</Link></p>
      </div>
    </div>
  );
}
