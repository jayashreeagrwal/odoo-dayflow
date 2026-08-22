import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';

export const Register = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event) => { event.preventDefault(); setError(''); if (!token) return setError('Invitation token is missing.'); if (password !== confirmation) return setError('Passwords do not match.'); setLoading(true); try { const result = await api.acceptInvitation({ token, password }); localStorage.setItem('dayflow_token', result.token); localStorage.setItem('dayflow_user', JSON.stringify(result.user)); window.location.href = '/dashboard'; } catch (err) { setError(err.message || 'Unable to activate account'); } finally { setLoading(false); } };
  return <main className="auth-panel"><div className="auth-form-wrap"><div className="auth-heading"><span className="auth-eyebrow">Employee onboarding</span><h2>Activate your account</h2><p>Create a secure password from your invitation.</p></div>{error && <div className="auth-error" role="alert">{error}</div>}<form onSubmit={submit} className="auth-form"><div className="form-group"><label className="form-label">Password</label><input className="form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div><div className="form-group"><label className="form-label">Confirm password</label><input className="form-control" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div><button className="btn btn-primary auth-submit" disabled={loading || !token}>{loading ? 'Activating...' : 'Activate account'}</button></form></div></main>;
};
