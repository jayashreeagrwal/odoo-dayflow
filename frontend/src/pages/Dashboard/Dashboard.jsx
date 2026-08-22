import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  Clock,
  CreditCard,
  UserCircle,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ClockWidget } from '../../components/attendance/ClockWidget';

export const Dashboard = () => {
  const { user, isHrAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err) {
      console.error('Fetch dashboard stats error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleQuickApproveLeave = async (leaveId, status) => {
    try {
      setActionLoading(true);
      await api.updateLeaveStatus(leaveId, {
        status,
        adminComment: status === 'Approved' ? 'Approved via Quick Action' : 'Rejected via Quick Action',
      });
      await fetchDashboardData();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#64748b' }}>Gathering HR insights and workday metrics...</p>
      </div>
    );
  }

  // --- HR ADMIN DASHBOARD VIEW ---
  if (isHrAdmin) {
    const stats = data?.stats || {};
    const recentLeaves = data?.recentLeaves || [];
    const todayAttendance = data?.todayAttendance || [];

    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">HR & Admin Command Center</h1>
            <p className="page-subtitle">Welcome back, {user?.name}. Here is today's organization overview.</p>
          </div>
          <Link to="/employees" className="btn btn-primary">
            <Users size={16} /> Manage Employees
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="stats-grid">
          <StatCard
            icon={Users}
            title="Total Headcount"
            value={stats.totalEmployees ?? 0}
            variant="primary"
            subtext={`${stats.activeEmployees ?? 0} Active Staff`}
          />
          <StatCard
            icon={UserCheck}
            title="Present Today"
            value={stats.presentToday ?? 0}
            variant="success"
            subtext={`${stats.attendanceRate ?? 0}% Attendance Rate`}
          />
          <StatCard
            icon={CalendarDays}
            title="On Leave Today"
            value={stats.onLeaveToday ?? 0}
            variant="info"
            subtext={`${stats.halfDayToday ?? 0} on Half-day`}
          />
          <StatCard
            icon={AlertCircle}
            title="Pending Approvals"
            value={stats.pendingLeaves ?? 0}
            variant="warning"
            subtext="Action required"
          />
        </div>

        {/* 2-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Pending Leave Approvals Queue */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Pending Leave Approvals</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Requests awaiting your review</p>
              </div>
              <Link to="/leaves" style={{ fontSize: '0.8125rem', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {recentLeaves.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>All caught up!</p>
                <p style={{ fontSize: '0.75rem' }}>No pending leave applications in the queue.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentLeaves.map((leave) => (
                  <div
                    key={leave._id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{leave.user?.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({leave.user?.employeeId})</span>
                        <StatusBadge status={leave.leaveType} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()} ({leave.daysCount} days)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem', fontStyle: 'italic' }}>
                        "{leave.reason}"
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleQuickApproveLeave(leave._id, 'Approved')}
                        disabled={actionLoading}
                        title="Approve leave"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleQuickApproveLeave(leave._id, 'Rejected')}
                        disabled={actionLoading}
                        title="Reject leave"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Live Attendance Feed */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Today's Check-in Log</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Live attendance activity</p>
              </div>
              <Link to="/attendance" style={{ fontSize: '0.8125rem', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Master Log <ArrowRight size={14} />
              </Link>
            </div>

            {todayAttendance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <Clock size={32} style={{ margin: '0 auto 0.5rem', color: '#cbd5e1' }} />
                <p style={{ fontSize: '0.875rem' }}>No check-in activity recorded yet today.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {todayAttendance.map((rec) => (
                  <div
                    key={rec._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          backgroundColor: '#eef2ff',
                          color: '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        {rec.user?.name?.slice(0, 2).toUpperCase() || 'EM'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{rec.user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rec.user?.jobDetails?.department}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <StatusBadge status={rec.status} />
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                        {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- EMPLOYEE DASHBOARD VIEW ---
  const today = data?.today || {};
  const monthlyStats = data?.monthlyStats || {};
  const salary = data?.salary || {};
  const recentLeaves = data?.recentLeaves || [];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Portal</h1>
          <p className="page-subtitle">Welcome back, {user?.name}! Here is your workday overview.</p>
        </div>
        <Link to="/leaves" className="btn btn-primary">
          <CalendarDays size={16} /> Request Time-Off
        </Link>
      </div>

      {/* Top Grid: Clock In/Out Widget + Quick Access Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <ClockWidget todayData={today} onAttendanceUpdate={fetchDashboardData} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>MONTHLY ATTENDANCE</span>
              <Clock size={20} color="#4f46e5" />
            </div>
            <div style={{ margin: '0.75rem 0' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
                {monthlyStats.daysPresent ?? 0} Days
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                {monthlyStats.totalHours ?? 0} total hours logged
              </div>
            </div>
            <Link to="/attendance" style={{ fontSize: '0.8125rem', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View attendance log <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>LEAVE BALANCE</span>
              <CalendarDays size={20} color="#10b981" />
            </div>
            <div style={{ margin: '0.75rem 0' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
                {monthlyStats.leaveBalance?.paid ?? 12} Days
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Paid leaves available
              </div>
            </div>
            <Link to="/leaves" style={{ fontSize: '0.8125rem', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Apply for leave <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>ESTIMATED NET PAY</span>
              <CreditCard size={20} color="#f59e0b" />
            </div>
            <div style={{ margin: '0.75rem 0' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
                ${(salary?.netSalary || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Monthly direct deposit
              </div>
            </div>
            <Link to="/payroll" style={{ fontSize: '0.8125rem', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View Payslip Breakdown <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>MY PROFILE</span>
              <UserCircle size={20} color="#8b5cf6" />
            </div>
            <div style={{ margin: '0.75rem 0' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                {user?.jobDetails?.designation || 'Software Engineer'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                {user?.jobDetails?.department || 'Engineering'} • {user?.employeeId}
              </div>
            </div>
            <Link to="/profile" style={{ fontSize: '0.8125rem', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Edit personal details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Leave Requests Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>My Recent Leave Applications</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Track status of your time-off submissions</p>
          </div>
          <Link to="/leaves" className="btn btn-secondary btn-sm">
            View All Leaves
          </Link>
        </div>

        {recentLeaves.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.875rem' }}>No recent leave applications found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Admin Comment</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <StatusBadge status={l.leaveType} />
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td>{l.daysCount} days</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.reason}
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td style={{ color: l.adminComment ? '#334155' : '#94a3b8', fontStyle: l.adminComment ? 'normal' : 'italic' }}>
                      {l.adminComment || 'No comment yet'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
