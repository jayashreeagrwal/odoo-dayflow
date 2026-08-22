import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2, Search, Filter, Plus, Edit3, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { ClockWidget } from '../../components/attendance/ClockWidget';

export const AttendancePage = () => {
  const { isHrAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(isHrAdmin ? 'all' : 'my'); // 'my' or 'all'
  const [myRecords, setMyRecords] = useState([]);
  const [myStats, setMyStats] = useState({});
  const [allRecords, setAllRecords] = useState([]);
  const [allSummary, setAllSummary] = useState({});
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters for Admin
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Manual Adjustment Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [manualForm, setManualForm] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    workHours: 8,
    remarks: 'Manual HR adjustment',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      // Fetch today's status
      const todayRes = await api.getTodayAttendance();
      setTodayData(todayRes);

      // Fetch my attendance
      const myRes = await api.getMyAttendance();
      setMyRecords(myRes.records || []);
      setMyStats(myRes.stats || {});

      // If HR Admin, fetch all attendance
      if (isHrAdmin) {
        const queryParams = new URLSearchParams({
          date: selectedDate,
          status: statusFilter,
          department: departmentFilter,
          search: searchTerm,
        }).toString();

        const allRes = await api.getAllAttendance(queryParams);
        setAllRecords(allRes.records || []);
        setAllSummary(allRes.summary || {});

        const empRes = await api.getAllEmployees();
        setEmployeesList(empRes.employees || []);
      }
    } catch (err) {
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, statusFilter, departmentFilter, searchTerm, isHrAdmin]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await api.markManualAttendance(manualForm);
      setIsManualModalOpen(false);
      await fetchAttendanceData();
    } catch (err) {
      alert(`Failed to save manual attendance: ${err.message}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Tracking</h1>
          <p className="page-subtitle">Monitor work hours, timestamps, and daily logs</p>
        </div>

        {isHrAdmin && (
          <button className="btn btn-primary" onClick={() => setIsManualModalOpen(true)}>
            <Plus size={16} /> Mark Manual Attendance
          </button>
        )}
      </div>

      {/* Tabs */}
      {isHrAdmin && (
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Company Master View
          </button>
          <button
            className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Personal Attendance
          </button>
        </div>
      )}

      {/* VIEW: PERSONAL ATTENDANCE */}
      {(!isHrAdmin || activeTab === 'my') && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <ClockWidget todayData={todayData} onAttendanceUpdate={fetchAttendanceData} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <StatCard
                icon={UserCheck}
                title="Days Present"
                value={myStats.presentCount ?? 0}
                variant="success"
                subtext={`${myStats.totalDays ?? 0} total logged workdays`}
              />
              <StatCard
                icon={Clock}
                title="Total Hours"
                value={`${myStats.totalHours ?? 0} hrs`}
                variant="primary"
                subtext={`Avg. ${myStats.averageHours ?? 0} hrs / day`}
              />
            </div>
          </div>

          {/* My Attendance Log Table */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Personal Attendance History</h3>

            {myRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                No attendance records logged yet. Use the Clock In button to begin!
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Work Hours</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRecords.map((rec) => (
                      <tr key={rec._id}>
                        <td style={{ fontWeight: 600 }}>{rec.date}</td>
                        <td>{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                        <td>{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                        <td>{rec.workHours ? `${rec.workHours} hrs` : '--'}</td>
                        <td>
                          <StatusBadge status={rec.status} />
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{rec.remarks || 'Regular log'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: HR ADMIN MASTER ATTENDANCE */}
      {isHrAdmin && activeTab === 'all' && (
        <div>
          {/* Summary KPIs */}
          <div className="stats-grid">
            <StatCard
              icon={UserCheck}
              title="Present Today"
              value={allSummary.presentToday ?? 0}
              variant="success"
              subtext={`Out of ${allSummary.totalEmployees ?? 0} total employees`}
            />
            <StatCard
              icon={Clock}
              title="Half-Day"
              value={allSummary.halfDayToday ?? 0}
              variant="warning"
              subtext="Logged < 4 hours"
            />
            <StatCard
              icon={Calendar}
              title="On Leave"
              value={allSummary.onLeaveToday ?? 0}
              variant="info"
              subtext="Approved leaves"
            />
            <StatCard
              icon={UserX}
              title="Absent / Not Checked In"
              value={allSummary.absentToday ?? 0}
              variant="danger"
              subtext="No check-in record"
            />
          </div>

          {/* Filters Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <div className="filter-bar" style={{ marginBottom: 0 }}>
              <div className="search-input-box">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={16} className="search-icon-inside" />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#64748b' }}>Date:</label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: 'auto' }}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#64748b' }}>Status:</label>
                  <select
                    className="form-control"
                    style={{ width: 'auto' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Present">Present</option>
                    <option value="Half-day">Half-day</option>
                    <option value="Leave">Leave</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#64748b' }}>Department:</label>
                  <select
                    className="form-control"
                    style={{ width: 'auto' }}
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <option value="All">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Master Table */}
          <div className="card">
            {allRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <Clock size={36} style={{ margin: '0 auto 0.5rem', color: '#cbd5e1' }} />
                <p>No attendance entries found matching the filter criteria for {selectedDate}.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRecords.map((rec) => (
                      <tr key={rec._id}>
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
                              {rec.user?.name?.slice(0, 2).toUpperCase() || 'EM'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{rec.user?.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rec.user?.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td>{rec.user?.jobDetails?.department || 'General'}</td>
                        <td>{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                        <td>{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                        <td>{rec.workHours ? `${rec.workHours} hrs` : '--'}</td>
                        <td>
                          <StatusBadge status={rec.status} />
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{rec.remarks || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANUAL ATTENDANCE MODAL */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Mark Manual / Override Attendance"
      >
        <form onSubmit={handleManualSubmit}>
          <div className="form-group">
            <label className="form-label">Select Employee *</label>
            <select
              className="form-control"
              value={manualForm.userId}
              onChange={(e) => setManualForm({ ...manualForm, userId: e.target.value })}
              required
            >
              <option value="">-- Choose Employee --</option>
              {employeesList.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId} - {emp.jobDetails?.department})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-control"
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className="form-control"
                value={manualForm.status}
                onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                required
              >
                <option value="Present">Present</option>
                <option value="Half-day">Half-day</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work Hours</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              className="form-control"
              value={manualForm.workHours}
              onChange={(e) => setManualForm({ ...manualForm, workHours: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">HR Remarks / Reason</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Onsite client duty or punch-in card malfunction"
              value={manualForm.remarks}
              onChange={(e) => setManualForm({ ...manualForm, remarks: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
              {formSubmitting ? 'Saving...' : 'Save Attendance Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
