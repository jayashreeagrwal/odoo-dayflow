import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Users,
  CreditCard,
  UserCircle,
  LogOut,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isHrAdmin, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'DF';

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Briefcase size={20} />
        </div>
        <div className="brand-info">
          <h2>Dayflow</h2>
          <span>HRMS Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Core Modules</div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/attendance"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Clock size={18} />
          <span>Attendance</span>
        </NavLink>

        <NavLink
          to="/leaves"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <CalendarDays size={18} />
          <span>Leave Management</span>
        </NavLink>

        <NavLink
          to="/payroll"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <CreditCard size={18} />
          <span>Payroll & Salary</span>
        </NavLink>

        {isHrAdmin && (
          <>
            <div className="nav-section-title" style={{ marginTop: '0.75rem' }}>
              Administration
            </div>

            <NavLink
              to="/employees"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Users size={18} />
              <span>Employees Directory</span>
            </NavLink>
          </>
        )}

        <div className="nav-section-title" style={{ marginTop: '0.75rem' }}>
          Personal
        </div>

        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <UserCircle size={18} />
          <span>My Profile</span>
        </NavLink>
      </nav>

      {/* Footer User Card & Logout */}
      <div className="sidebar-footer">
        <div className="user-mini-card">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="user-avatar" />
          ) : (
            <div className="user-avatar">{initials}</div>
          )}
          <div className="user-mini-details">
            <div className="user-mini-name">{user?.name || 'User'}</div>
            <div className="user-mini-role">
              {isHrAdmin ? (
                <span style={{ color: '#818cf8', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <ShieldCheck size={12} /> HR Admin
                </span>
              ) : (
                'Employee'
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem', border: 'none', background: 'transparent', color: '#94a3b8' }}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
