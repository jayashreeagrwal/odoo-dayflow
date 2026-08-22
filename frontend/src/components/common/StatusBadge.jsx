import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase().replace(/\s+/g, '-');
  
  let badgeClass = 'badge-present';
  if (['pending', 'half-day', 'on-leave'].includes(normalized)) {
    badgeClass = 'badge-pending';
  } else if (['absent', 'rejected', 'inactive'].includes(normalized)) {
    badgeClass = 'badge-absent';
  } else if (['leave', 'sick', 'casual', 'unpaid'].includes(normalized)) {
    badgeClass = 'badge-leave';
  } else if (['approved', 'present', 'active', 'paid'].includes(normalized)) {
    badgeClass = 'badge-present';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
};
