import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';

export const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async (event) => { event.preventDefault(); setError(''); if(password!==confirmation)return setError('Passwords do not match'); setLoading(true); try{const res=await api.resetPassword({token,password});setMessage(res.message);}catch(err){setError(err.message);}finally{setLoading(false);} };
  return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8fafc',padding:'1.5rem'}}><div className="card" style={{width:'100%',maxWidth:440,padding:'2rem'}}><h1 style={{fontSize:'1.5rem',marginBottom:'.5rem'}}>Choose a new password</h1><p style={{color:'#64748b',marginBottom:'1.5rem'}}>Use at least 8 characters with uppercase, lowercase, and a number.</p>{message&&<div style={{color:'#065f46',background:'#ecfdf5',padding:'.75rem',borderRadius:8,marginBottom:'1rem',display:'flex',gap:8}}><CheckCircle size={18}/>{message}</div>}{error&&<div style={{color:'#991b1b',background:'#fef2f2',padding:'.75rem',borderRadius:8,marginBottom:'1rem',display:'flex',gap:8}}><AlertCircle size={18}/>{error}</div>}<form onSubmit={submit}><div className="form-group"><label className="form-label">New password</label><input type="password" className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)} required/></div><div className="form-group"><label className="form-label">Confirm password</label><input type="password" className="form-control" value={confirmation} onChange={(e)=>setConfirmation(e.target.value)} required/></div><button className="btn btn-primary" style={{width:'100%'}} disabled={loading||!token}>{loading?'Updating...':'Update Password'}</button></form><div style={{textAlign:'center',marginTop:'1.5rem'}}><Link to="/login">Return to sign in</Link></div></div></div>;
};
