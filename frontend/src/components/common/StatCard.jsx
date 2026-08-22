import React from 'react';

export const StatCard = ({ icon: Icon, title, value, variant = 'primary', subtext }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${variant}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
        {subtext && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{subtext}</div>}
      </div>
    </div>
  );
};
