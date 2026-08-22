import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { StatusBadge } from '../common/StatusBadge';

export const ClockWidget = ({ todayData, onAttendanceUpdate }) => {
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isCheckedIn = Boolean(todayData?.isCheckedIn);
  const isCheckedOut = Boolean(todayData?.isCheckedOut);

  const handleCheckIn = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.checkIn();
      setMessage('Checked in successfully!');
      if (onAttendanceUpdate) onAttendanceUpdate();
    } catch (err) {
      setError(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.checkOut();
      setMessage('Checked out successfully!');
      if (onAttendanceUpdate) onAttendanceUpdate();
    } catch (err) {
      setError(err.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="clock-widget-card">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c7d2fe', fontSize: '0.875rem', fontWeight: 600 }}>
            <Clock size={18} />
            <span>ATTENDANCE TRACKER</span>
          </div>
          <StatusBadge status={isCheckedIn ? (isCheckedOut ? 'Completed' : 'Present') : 'Not Checked In'} />
        </div>

        <div className="clock-time-display">{formattedTime}</div>

        <p style={{ color: '#c7d2fe', fontSize: '0.8125rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#a7f3d0', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fecaca', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ marginTop: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.06)', padding: '0.75rem', borderRadius: '8px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#c7d2fe', textTransform: 'uppercase' }}>Check In</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
              {todayData?.checkIn ? new Date(todayData.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#c7d2fe', textTransform: 'uppercase' }}>Check Out</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
              {todayData?.checkOut ? new Date(todayData.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!isCheckedIn ? (
            <button
              className="btn btn-success"
              style={{ flex: 1, padding: '0.75rem', fontWeight: 600 }}
              onClick={handleCheckIn}
              disabled={loading}
            >
              <LogIn size={18} />
              {loading ? 'Processing...' : 'Clock In Now'}
            </button>
          ) : !isCheckedOut ? (
            <button
              className="btn btn-danger"
              style={{ flex: 1, padding: '0.75rem', fontWeight: 600 }}
              onClick={handleCheckOut}
              disabled={loading}
            >
              <LogOut size={18} />
              {loading ? 'Processing...' : 'Clock Out'}
            </button>
          ) : (
            <div style={{ width: '100%', textAlign: 'center', padding: '0.6rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, color: '#a7f3d0' }}>
              ✓ Workday attendance recorded ({todayData?.workHours || 0} hrs)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
