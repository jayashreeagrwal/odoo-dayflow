import React, { useState, useEffect } from 'react';
import { Menu, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onToggleSidebar}
          style={{ display: 'none' }}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <div className="header-time-chip">
          <Calendar size={15} />
          <span>
            {formattedDate} • {formattedTime}
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{user?.jobDetails?.designation || user?.role}</div>
          </div>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#4f46e5',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {user?.name?.slice(0, 1) || 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
