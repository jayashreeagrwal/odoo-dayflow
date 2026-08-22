import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, Lock, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!token) return setError('This invitation link is missing its security token. Ask HR for a new invitation.');
    if (password !== confirmation) return setError('Passwords do not match');
    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return setError('Use at least 8 characters with uppercase, lowercase, and a number');
    }

    setLoading(true);
    try {
      const res = await api.acceptInvitation({ token, password });
      localStorage.setItem('dayflow_token', res.token);
      localStorage.setItem('dayflow_user', JSON.stringify(res.user));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Unable to activate your account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '460px' }} className="animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Briefcase size={24} />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700 }}>Activate your Dayflow account</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Verify your invitation by creating a secure password.</p>
        </div>
        <div className="card" style={{ padding: '2rem' }}>
          {error && <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#fef2f2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.25rem' }}><AlertCircle size={18} /><span>{error}</span></div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New password</label>
              <div style={{ position: 'relative' }}>
                <input type="password" className="form-control" style={{ paddingLeft: '2.3rem' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
              <small style={{ color: '#64748b' }}>At least 8 characters, including uppercase, lowercase, and a number.</small>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input type="password" className="form-control" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !token}>{loading ? 'Activating...' : 'Activate Account'}</button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}><Link to="/login">Return to sign in</Link></div>
        </div>
      </div>
    </div>
  );
};
