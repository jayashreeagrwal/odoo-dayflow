import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try { const res = await api.forgotPassword({ email }); setMessage(res.message); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '1.5rem' }}>
    <div className="card" style={{ width: '100%', maxWidth: 440, padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>Reset your password</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Enter your verified work email to receive a secure reset link.</p>
      {message && <div style={{ color: '#065f46', background: '#ecfdf5', padding: '.75rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', gap: 8 }}><CheckCircle size={18}/>{message}</div>}
      {error && <div style={{ color: '#991b1b', background: '#fef2f2', padding: '.75rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', gap: 8 }}><AlertCircle size={18}/>{error}</div>}
      <form onSubmit={submit}><div className="form-group"><label className="form-label">Email address</label><div style={{position:'relative'}}><input type="email" className="form-control" style={{paddingLeft:'2.3rem'}} value={email} onChange={(e)=>setEmail(e.target.value)} required/><Mail size={16} style={{position:'absolute',left:'.75rem',top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}}/></div></div><button className="btn btn-primary" style={{width:'100%'}} disabled={loading}>{loading?'Sending...':'Send Reset Link'}</button></form>
      <div style={{textAlign:'center',marginTop:'1.5rem'}}><Link to="/login">Return to sign in</Link></div>
    </div>
  </div>;
};
