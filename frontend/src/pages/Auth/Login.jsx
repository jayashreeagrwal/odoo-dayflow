import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch (err) { setError(err.message || 'Invalid email or password'); }
    finally { setLoading(false); }
  };
  return <main className="auth-page"><section className="auth-intro"><div className="auth-brand">Dayflow</div><div className="auth-intro-copy"><span className="auth-kicker">HR operations, simplified</span><h1>Make every workday count.</h1><p>One calm place for attendance, time off, people, and payroll.</p></div></section><section className="auth-panel"><div className="auth-form-wrap"><div className="auth-heading"><span className="auth-eyebrow">Welcome back</span><h2>Sign in to your account</h2><p>Enter your details to continue.</p></div>{error && <div className="auth-error" role="alert">{error}</div>}<form onSubmit={submit} className="auth-form"><div className="form-group"><label className="form-label" htmlFor="login-email">Email address</label><input id="login-email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div><div className="form-group"><div className="auth-label-row"><label className="form-label" htmlFor="login-password">Password</label><Link to="/forgot-password">Forgot password?</Link></div><input id="login-password" className="form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></div><button type="submit" className="btn btn-primary auth-submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button></form><p className="auth-footer">New employee? Ask your HR administrator for an invitation.</p></div></section></main>;
};
