import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';

export const LeavePage = () => {
  const { user, isHrAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(isHrAdmin ? 'all' : 'my'); // 'my' or 'all'
  const [myLeaves, setMyLeaves] = useState([]);
  const [myStats, setMyStats] = useState({});
  const [allLeaves, setAllLeaves] = useState([]);
  const [allSummary, setAllSummary] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters for Admin
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Apply Leave Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Paid',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [applyError, setApplyError] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  // Admin Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' or 'Rejected'
  const [adminComment, setAdminComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const myRes = await api.getMyLeaves();
      setMyLeaves(myRes.leaves || []);
      setMyStats(myRes.stats || {});

      if (isHrAdmin) {
        const queryParams = new URLSearchParams({
          status: statusFilter,
          search: searchTerm,
        }).toString();

        const allRes = await api.getAllLeaves(queryParams);
        setAllLeaves(allRes.leaves || []);
        setAllSummary(allRes.summary || {});
      }
    } catch (err) {
      console.error('Fetch leaves error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, searchTerm, isHrAdmin]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');

    if (!applyForm.startDate || !applyForm.endDate || !applyForm.reason) {
      setApplyError('Please fill in all required fields');
      return;
    }

    if (new Date(applyForm.endDate) < new Date(applyForm.startDate)) {
      setApplyError('End date cannot be earlier than start date');
      return;
    }

    setApplyLoading(true);
    try {
      await api.applyLeave(applyForm);
      setIsApplyModalOpen(false);
      setApplyForm({ leaveType: 'Paid', startDate: '', endDate: '', reason: '' });
      await fetchLeaves();
    } catch (err) {
      setApplyError(err.message || 'Failed to submit leave request');
    } finally {
      setApplyLoading(false);
    }
  };

  const openReviewModal = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setAdminComment(action === 'Approved' ? 'Approved by HR' : 'Unable to approve due to team schedule');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setReviewLoading(true);
    try {
      await api.updateLeaveStatus(selectedLeave._id, {
        status: reviewAction,
        adminComment,
      });
      setReviewModalOpen(false);
      setSelectedLeave(null);
      await fetchLeaves();
    } catch (err) {
      alert(`Failed to update leave status: ${err.message}`);
    } finally {
      setReviewLoading(false);
    }
  };

  // Helper to calculate approximate days in apply modal
  const calculateDays = () => {
    if (!applyForm.startDate || !applyForm.endDate) return 0;
    const start = new Date(applyForm.startDate);
    const end = new Date(applyForm.endDate);
    if (end < start) return 0;
    const diff = Math.abs(end - start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave & Time-Off Management</h1>
          <p className="page-subtitle">Submit leave applications and manage approval workflows</p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsApplyModalOpen(true)}>
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      {/* Tabs for Admin */}
      {isHrAdmin && (
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Company Approvals Queue ({allSummary.pendingCount ?? 0} Pending)
          </button>
          <button
            className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Personal Leaves
          </button>
        </div>
      )}

      {/* VIEW: PERSONAL LEAVES */}
      {(!isHrAdmin || activeTab === 'my') && (
        <div>
          {/* Leave Balances Grid */}
          <div className="stats-grid">
            <StatCard
              icon={CalendarDays}
              title="Paid Leaves"
              value={`${myStats.leaveBalance?.paid ?? 12} Days`}
              variant="primary"
              subtext="Annual allowance"
            />
            <StatCard
              icon={Clock}
              title="Sick Leaves"
              value={`${myStats.leaveBalance?.sick ?? 8} Days`}
              variant="info"
              subtext="Medical allowance"
            />
            <StatCard
              icon={CheckCircle}
              title="Approved Requests"
              value={myStats.approvedCount ?? 0}
              variant="success"
              subtext="Taken this year"
            />
            <StatCard
              icon={AlertCircle}
              title="Pending Review"
              value={myStats.pendingCount ?? 0}
              variant="warning"
              subtext="Awaiting HR action"
            />
          </div>

          {/* Leaves Table */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>My Leave History</h3>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>{myLeaves.length} Total Requests</span>
            </div>

            {myLeaves.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <CalendarDays size={36} style={{ margin: '0 auto 0.5rem', color: '#cbd5e1' }} />
                <p>You haven't submitted any leave requests yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Total Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Admin Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaves.map((l) => (
                      <tr key={l._id}>
                        <td>
                          <StatusBadge status={l.leaveType} />
                        </td>
                        <td style={{ fontWeight: 500 }}>
                          {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td>{l.daysCount} days</td>
                        <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {l.reason}
                        </td>
                        <td>
                          <StatusBadge status={l.status} />
                        </td>
                        <td>
                          {l.adminComment ? (
                            <span style={{ fontSize: '0.8125rem', color: '#334155' }}>"{l.adminComment}"</span>
                          ) : (
                            <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic' }}>Pending evaluation</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: HR ADMIN APPROVALS QUEUE */}
      {isHrAdmin && activeTab === 'all' && (
        <div>
          {/* Summary KPIs */}
          <div className="stats-grid">
            <StatCard
              icon={AlertCircle}
              title="Pending Review"
              value={allSummary.pendingCount ?? 0}
              variant="warning"
              subtext="Action needed"
            />
            <StatCard
              icon={CheckCircle}
              title="Total Approved"
              value={allSummary.approvedCount ?? 0}
              variant="success"
              subtext="Confirmed time-off"
            />
            <StatCard
              icon={XCircle}
              title="Total Rejected"
              value={allSummary.rejectedCount ?? 0}
              variant="danger"
              subtext="Declined requests"
            />
            <StatCard
              icon={FileText}
              title="Total Submissions"
              value={allSummary.total ?? 0}
              variant="primary"
              subtext="All company applications"
            />
          </div>

          {/* Filters */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <div className="filter-bar" style={{ marginBottom: 0 }}>
              <div className="search-input-box">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by employee, email, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={16} className="search-icon-inside" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#64748b' }}>Filter Status:</label>
                <select
                  className="form-control"
                  style={{ width: 'auto' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Approvals</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Approvals Table */}
          <div className="card">
            {allLeaves.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                <p>No leave applications found for this filter.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLeaves.map((l) => (
                      <tr key={l._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: '#eef2ff',
                                color: '#4f46e5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            >
                              {l.user?.name?.slice(0, 2).toUpperCase() || 'EM'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{l.user?.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {l.user?.employeeId} • {l.user?.jobDetails?.department}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={l.leaveType} />
                        </td>
                        <td style={{ fontWeight: 500 }}>
                          {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td>{l.daysCount} days</td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {l.reason}
                        </td>
                        <td>
                          <StatusBadge status={l.status} />
                        </td>
                        <td>
                          {l.status === 'Pending' ? (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => openReviewModal(l, 'Approved')}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => openReviewModal(l, 'Rejected')}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                              {l.reviewedBy ? `Reviewed by ${l.reviewedBy.name}` : 'Resolved'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* APPLY FOR LEAVE MODAL */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Time-Off / Leave"
      >
        {applyError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              border: '1px solid #fecaca',
            }}
          >
            <AlertCircle size={18} />
            <span>{applyError}</span>
          </div>
        )}

        <form onSubmit={handleApplySubmit}>
          <div className="form-group">
            <label className="form-label">Leave Category *</label>
            <select
              className="form-control"
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              required
            >
              <option value="Paid">Paid Leave (Annual)</option>
              <option value="Sick">Sick / Medical Leave</option>
              <option value="Casual">Casual / Personal Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-control"
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-control"
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {calculateDays() > 0 && (
            <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#eef2ff', borderRadius: '8px', color: '#4338ca', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1rem' }}>
              ℹ️ Total Leave Duration: {calculateDays()} Calendar Day(s)
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Reason / Remarks *</label>
            <textarea
              className="form-control"
              placeholder="Please describe why you are requesting time off..."
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={applyLoading}>
              {applyLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADMIN REVIEW MODAL */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`${reviewAction} Leave Request`}
      >
        {selectedLeave && (
          <form onSubmit={handleReviewSubmit}>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{selectedLeave.user?.name}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.2rem' }}>
                {selectedLeave.leaveType} Leave • {new Date(selectedLeave.startDate).toLocaleDateString()} to {new Date(selectedLeave.endDate).toLocaleDateString()} ({selectedLeave.daysCount} days)
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#334155', marginTop: '0.5rem', fontStyle: 'italic' }}>
                "{selectedLeave.reason}"
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">HR Comment / Response Notes</label>
              <textarea
                className="form-control"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Optional explanation or instructions..."
              />
            </div>

            <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${reviewAction === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                disabled={reviewLoading}
              >
                {reviewLoading ? 'Saving...' : `Confirm ${reviewAction}`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
