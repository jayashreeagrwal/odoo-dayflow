import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building,
  Briefcase,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '+1 (555) 000-0000',
    address: '123 Tech Boulevard',
    basicSalary: 45000,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Employee Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        department: departmentFilter,
        status: statusFilter,
        search: searchTerm,
      }).toString();

      const res = await api.getAllEmployees(queryParams);
      setEmployees(res.employees || []);
    } catch (err) {
      console.error('Fetch employees error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [departmentFilter, statusFilter, searchTerm]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);

    try {
      await api.inviteEmployee(addForm);
      setIsAddModalOpen(false);
      setAddForm({
        employeeId: '',
        name: '',
        email: '',
        role: 'employee',
        department: 'Engineering',
        designation: 'Software Engineer',
        phone: '+1 (555) 000-0000',
        address: '123 Tech Boulevard',
        basicSalary: 45000,
      });
      await fetchEmployees();
    } catch (err) {
      setAddError(err.message || 'Failed to create employee');
    } finally {
      setAddLoading(false);
    }
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setEditForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      address: emp.address,
      role: emp.role,
      department: emp.jobDetails?.department || 'Engineering',
      designation: emp.jobDetails?.designation || 'Software Engineer',
      employmentType: emp.jobDetails?.employmentType || 'Full-Time',
      status: emp.jobDetails?.status || 'Active',
      basic: emp.salaryStructure?.basic || 45000,
      hra: emp.salaryStructure?.hra || 18000,
      allowances: emp.salaryStructure?.allowances || 7000,
      deductions: emp.salaryStructure?.deductions || 4000,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setEditLoading(true);
    try {
      await api.updateEmployeeByAdmin(editingEmployee._id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        role: editForm.role,
        department: editForm.department,
        designation: editForm.designation,
        employmentType: editForm.employmentType,
        status: editForm.status,
        salaryStructure: {
          basic: editForm.basic,
          hra: editForm.hra,
          allowances: editForm.allowances,
          deductions: editForm.deductions,
        },
      });

      setIsEditModalOpen(false);
      setEditingEmployee(null);
      await fetchEmployees();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove employee "${name}"?`)) {
      try {
        await api.deleteEmployee(id);
        await fetchEmployees();
      } catch (err) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees Directory</h1>
          <p className="page-subtitle">Manage organization staff, job assignments, and records</p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus size={16} /> Add New Employee
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <div className="search-input-box">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, ID, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="search-icon-inside" />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                <option value="Human Resources">Human Resources</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Quality Assurance">Quality Assurance</option>
              </select>
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
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List Grid/Table */}
      <div className="card">
        {employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <Users size={36} style={{ margin: '0 auto 0.5rem', color: '#cbd5e1' }} />
            <p>No employees match the selected criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Department & Role</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Net Monthly Pay</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {emp.avatar ? (
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: '#eef2ff',
                              color: '#4f46e5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: '0.8125rem',
                            }}
                          >
                            {emp.name?.slice(0, 2).toUpperCase() || 'EM'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{emp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: '#4f46e5' }}>{emp.employeeId}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{emp.jobDetails?.designation}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.jobDetails?.department}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>{emp.phone || '--'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{emp.address?.slice(0, 20)}...</div>
                    </td>
                    <td>
                      <StatusBadge status={emp.jobDetails?.status || 'Active'} />
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ${(emp.salaryStructure?.netSalary || 0).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.5rem' }}
                          onClick={() => openEditModal(emp)}
                          title="Edit employee"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          style={{ padding: '0.35rem 0.5rem' }}
                          onClick={() => handleDelete(emp._id, emp.name)}
                          title="Delete employee"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD EMPLOYEE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        maxWidth="620px"
      >
        {addError && (
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
            }}
          >
            <AlertCircle size={18} />
            <span>{addError}</span>
          </div>
        )}

        <form onSubmit={handleAddSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Employee ID *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. EMP005"
                value={addForm.employeeId}
                onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Michael Scott"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="michael@company.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account setup</label>
              <div style={{ padding: '0.75rem', background: '#eef2ff', color: '#3730a3', borderRadius: 8, fontSize: '0.8125rem' }}>
                A secure 24-hour invitation will be emailed to this address.
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-control"
                value={addForm.department}
                onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Quality Assurance">Quality Assurance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Senior Backend Dev"
                value={addForm.designation}
                onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={addLoading}>
              {addLoading ? 'Sending Invitation...' : 'Send Employee Invitation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT EMPLOYEE MODAL (HR ADMIN) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Details - ${editingEmployee?.name}`}
        maxWidth="650px"
      >
        {editingEmployee && (
          <form onSubmit={handleEditSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-control"
                  value={editForm.department || 'Engineering'}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.designation || ''}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Employment Status</label>
                <select
                  className="form-control"
                  value={editForm.status || 'Active'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={editForm.role || 'employee'}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="employee">Employee</option>
                  <option value="hr_admin">HR / Admin</option>
                </select>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', margin: '1rem 0', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: '#4f46e5' }}>
                Salary Structure ($ USD / month)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Basic</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.basic || 0}
                    onChange={(e) => setEditForm({ ...editForm, basic: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">HRA</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.hra || 0}
                    onChange={(e) => setEditForm({ ...editForm, hra: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Allowances</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.allowances || 0}
                    onChange={(e) => setEditForm({ ...editForm, allowances: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deductions</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.deductions || 0}
                    onChange={(e) => setEditForm({ ...editForm, deductions: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', textAlign: 'right' }}>
                Calculated Net Monthly Salary: $
                {(
                  (Number(editForm.basic) || 0) +
                  (Number(editForm.hra) || 0) +
                  (Number(editForm.allowances) || 0) -
                  (Number(editForm.deductions) || 0)
                ).toLocaleString()}
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Update Employee Record'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
