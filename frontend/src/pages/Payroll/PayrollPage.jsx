import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Printer,
  DollarSign,
  Edit2,
  Search,
  Building,
  CheckCircle2,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';

export const PayrollPage = () => {
  const { user, isHrAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(isHrAdmin ? 'all' : 'my'); // 'my' or 'all'
  const [myPayroll, setMyPayroll] = useState(null);
  const [allPayroll, setAllPayroll] = useState([]);
  const [allSummary, setAllSummary] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters for Admin
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Edit Salary Modal (Admin)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryForm, setSalaryForm] = useState({ basic: 0, hra: 0, allowances: 0, deductions: 0 });
  const [editLoading, setEditLoading] = useState(false);

  // View Payslip Modal
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const myRes = await api.getMyPayroll();
      setMyPayroll(myRes);

      if (isHrAdmin) {
        const queryParams = new URLSearchParams({
          department: departmentFilter,
          search: searchTerm,
        }).toString();

        const allRes = await api.getAllPayroll(queryParams);
        setAllPayroll(allRes.employees || []);
        setAllSummary(allRes.summary || {});
      }
    } catch (err) {
      console.error('Fetch payroll error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [departmentFilter, searchTerm, isHrAdmin]);

  const openEditSalary = (emp) => {
    setSelectedEmployee(emp);
    setSalaryForm({
      basic: emp.salaryStructure?.basic || 40000,
      hra: emp.salaryStructure?.hra || 15000,
      allowances: emp.salaryStructure?.allowances || 5000,
      deductions: emp.salaryStructure?.deductions || 3000,
    });
    setIsEditModalOpen(true);
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setEditLoading(true);
    try {
      await api.updateSalaryStructure(selectedEmployee._id, salaryForm);
      setIsEditModalOpen(false);
      await fetchPayrollData();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const openPayslip = (slip) => {
    setSelectedSlip(slip);
    setIsSlipModalOpen(true);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll & Compensation</h1>
          <p className="page-subtitle">Salary structures, monthly pay slips, and earnings breakdown</p>
        </div>
      </div>

      {/* Tabs for Admin */}
      {isHrAdmin && (
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Company Payroll Ledger
          </button>
          <button
            className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Personal Compensation
          </button>
        </div>
      )}

      {/* VIEW: EMPLOYEE PERSONAL PAYROLL */}
      {(!isHrAdmin || activeTab === 'my') && myPayroll && (
        <div>
          {/* Salary Component Cards */}
          <div className="stats-grid">
            <StatCard
              icon={CreditCard}
              title="Net Monthly Pay"
              value={`$${(myPayroll.salaryStructure?.netSalary || 0).toLocaleString()}`}
              variant="success"
              subtext="Take-home after deductions"
            />
            <StatCard
              icon={DollarSign}
              title="Basic Salary"
              value={`$${(myPayroll.salaryStructure?.basic || 0).toLocaleString()}`}
              variant="primary"
              subtext="Base compensation"
            />
            <StatCard
              icon={Building}
              title="HRA & Allowances"
              value={`$${((myPayroll.salaryStructure?.hra || 0) + (myPayroll.salaryStructure?.allowances || 0)).toLocaleString()}`}
              variant="info"
              subtext="Housing & perks"
            />
            <StatCard
              icon={TrendingUp}
              title="Deductions"
              value={`-$${(myPayroll.salaryStructure?.deductions || 0).toLocaleString()}`}
              variant="danger"
              subtext="Tax, PF & benefits"
            />
          </div>

          {/* Detailed Breakdown Card */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Salary Structure Breakdown (Read-Only)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#10b981', marginBottom: '0.75rem', fontWeight: 600 }}>
                  EARNINGS & ALLOWANCES
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.875rem' }}>
                  <span>Basic Pay</span>
                  <span style={{ fontWeight: 600 }}>${(myPayroll.salaryStructure?.basic || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.875rem' }}>
                  <span>House Rent Allowance (HRA)</span>
                  <span style={{ fontWeight: 600 }}>${(myPayroll.salaryStructure?.hra || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.875rem' }}>
                  <span>Special Allowances & Medical</span>
                  <span style={{ fontWeight: 600 }}>${(myPayroll.salaryStructure?.allowances || 0).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#ef4444', marginBottom: '0.75rem', fontWeight: 600 }}>
                  STATUTORY DEDUCTIONS
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.875rem' }}>
                  <span>Income Tax (TDS)</span>
                  <span style={{ fontWeight: 600 }}>${Math.round((myPayroll.salaryStructure?.deductions || 0) * 0.6).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.875rem' }}>
                  <span>Provident Fund (PF)</span>
                  <span style={{ fontWeight: 600 }}>${Math.round((myPayroll.salaryStructure?.deductions || 0) * 0.3).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.875rem' }}>
                  <span>Insurance & Other</span>
                  <span style={{ fontWeight: 600 }}>${Math.round((myPayroll.salaryStructure?.deductions || 0) * 0.1).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payslip History Table */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Generated Monthly Payslips</h3>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Payslip ID</th>
                    <th>Month</th>
                    <th>Gross Earnings</th>
                    <th>Deductions</th>
                    <th>Net Disbursed</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myPayroll.payslips?.map((slip) => (
                    <tr key={slip.id}>
                      <td style={{ fontWeight: 600, color: '#4f46e5' }}>{slip.id}</td>
                      <td style={{ fontWeight: 500 }}>{slip.month}</td>
                      <td>${slip.grossSalary.toLocaleString()}</td>
                      <td style={{ color: '#ef4444' }}>-${slip.deductions.toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: '#10b981' }}>${slip.netSalary.toLocaleString()}</td>
                      <td>
                        <span className="badge badge-present">Paid</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openPayslip(slip)}
                        >
                          <FileText size={14} /> View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: HR ADMIN COMPANY PAYROLL */}
      {isHrAdmin && activeTab === 'all' && (
        <div>
          {/* Admin KPIs */}
          <div className="stats-grid">
            <StatCard
              icon={CreditCard}
              title="Total Monthly Payroll"
              value={`$${(allSummary.totalMonthlyPayroll || 0).toLocaleString()}`}
              variant="primary"
              subtext={`Across ${allSummary.totalEmployees || 0} active employees`}
            />
            <StatCard
              icon={TrendingUp}
              title="Average Salary"
              value={`$${(allSummary.averageSalary || 0).toLocaleString()}`}
              variant="info"
              subtext="Per employee / month"
            />
            <StatCard
              icon={CheckCircle2}
              title="Disbursement Status"
              value="100% On-Time"
              variant="success"
              subtext="All records verified"
            />
          </div>

          {/* Filter Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <div className="filter-bar" style={{ marginBottom: 0 }}>
              <div className="search-input-box">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search employee or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={16} className="search-icon-inside" />
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

          {/* Master Company Payroll Ledger */}
          <div className="card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Designation</th>
                    <th>Basic</th>
                    <th>HRA</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Monthly Pay</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayroll.map((emp) => (
                    <tr key={emp._id}>
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
                            {emp.name?.slice(0, 2).toUpperCase() || 'EM'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{emp.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{emp.jobDetails?.designation}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.jobDetails?.department}</div>
                      </td>
                      <td>${(emp.salaryStructure?.basic || 0).toLocaleString()}</td>
                      <td>${(emp.salaryStructure?.hra || 0).toLocaleString()}</td>
                      <td>${(emp.salaryStructure?.allowances || 0).toLocaleString()}</td>
                      <td style={{ color: '#ef4444' }}>-${(emp.salaryStructure?.deductions || 0).toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: '#10b981' }}>
                        ${(emp.salaryStructure?.netSalary || 0).toLocaleString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditSalary(emp)}
                          title="Adjust salary structure"
                        >
                          <Edit2 size={14} /> Adjust Structure
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SALARY STRUCTURE MODAL (ADMIN) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Update Salary - ${selectedEmployee?.name}`}
      >
        {selectedEmployee && (
          <form onSubmit={handleSalarySubmit}>
            <div className="form-group">
              <label className="form-label">Basic Pay ($ USD)</label>
              <input
                type="number"
                className="form-control"
                value={salaryForm.basic}
                onChange={(e) => setSalaryForm({ ...salaryForm, basic: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">House Rent Allowance (HRA)</label>
              <input
                type="number"
                className="form-control"
                value={salaryForm.hra}
                onChange={(e) => setSalaryForm({ ...salaryForm, hra: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Special Allowances & Medical</label>
              <input
                type="number"
                className="form-control"
                value={salaryForm.allowances}
                onChange={(e) => setSalaryForm({ ...salaryForm, allowances: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Monthly Deductions (Tax / PF)</label>
              <input
                type="number"
                className="form-control"
                value={salaryForm.deductions}
                onChange={(e) => setSalaryForm({ ...salaryForm, deductions: Number(e.target.value) })}
                required
              />
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '8px', color: '#065f46', fontSize: '0.875rem', fontWeight: 600 }}>
              Calculated Net Monthly Salary: $
              {(
                Number(salaryForm.basic) +
                Number(salaryForm.hra) +
                Number(salaryForm.allowances) -
                Number(salaryForm.deductions)
              ).toLocaleString()}
            </div>

            <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Structure'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* PRINTABLE SALARY SLIP MODAL */}
      <Modal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        title="Official Salary Statement"
        maxWidth="680px"
      >
        {selectedSlip && (
          <div>
            <div
              id="printable-slip"
              style={{
                border: '1px solid #cbd5e1',
                padding: '2rem',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
              }}
            >
              {/* Slip Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #4f46e5', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#4f46e5' }}>DAYFLOW HRMS</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Every workday, perfectly aligned.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>PAYSLIP: {selectedSlip.month}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ref: {selectedSlip.id}</div>
                </div>
              </div>

              {/* Employee Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.8125rem' }}>
                <div>
                  <div><strong>Employee Name:</strong> {myPayroll?.employee?.name || user?.name}</div>
                  <div><strong>Employee ID:</strong> {myPayroll?.employee?.employeeId || user?.employeeId}</div>
                  <div><strong>Email:</strong> {myPayroll?.employee?.email || user?.email}</div>
                </div>
                <div>
                  <div><strong>Department:</strong> {myPayroll?.employee?.department || 'Engineering'}</div>
                  <div><strong>Designation:</strong> {myPayroll?.employee?.designation || 'Software Engineer'}</div>
                  <div><strong>Payment Status:</strong> <span style={{ color: '#10b981', fontWeight: 600 }}>Disbursed</span></div>
                </div>
              </div>

              {/* Earnings vs Deductions Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={{ padding: '0.6rem', textAlign: 'left', border: '1px solid #e2e8f0' }}>Earnings</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right', border: '1px solid #e2e8f0' }}>Amount ($)</th>
                    <th style={{ padding: '0.6rem', textAlign: 'left', border: '1px solid #e2e8f0' }}>Deductions</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right', border: '1px solid #e2e8f0' }}>Amount ($)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.5rem 0.6rem', border: '1px solid #e2e8f0' }}>Basic Salary</td>
                    <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', border: '1px solid #e2e8f0' }}>${selectedSlip.basic.toLocaleString()}</td>
                    <td style={{ padding: '0.5rem 0.6rem', border: '1px solid #e2e8f0' }}>Income Tax (TDS)</td>
                    <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', border: '1px solid #e2e8f0' }}>${Math.round(selectedSlip.deductions * 0.6).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0.6rem', border: '1px solid #e2e8f0' }}>House Rent Allowance (HRA)</td>
                    <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', border: '1px solid #e2e8f0' }}>${selectedSlip.hra.toLocaleString()}</td>
                    <td style={{ padding: '0.5rem 0.6rem', border: '1px solid #e2e8f0' }}>Provident Fund (PF)</td>
                    <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', border: '1px solid #e2e8f0' }}>${Math.round(selectedSlip.deductions * 0.4).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0.6rem', border: '1px solid #e2e8f0' }}>Special Allowances</td>
                    <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', border: '1px solid #e2e8f0' }}>${selectedSlip.allowances.toLocaleString()}</td>
                    <td style={{ padding: '0.5rem 0.6rem', border: '1px solid #e2e8f0' }}>Other Deductions</td>
                    <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', border: '1px solid #e2e8f0' }}>$0</td>
                  </tr>
                  <tr style={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>
                    <td style={{ padding: '0.6rem', border: '1px solid #e2e8f0' }}>Gross Earnings</td>
                    <td style={{ padding: '0.6rem', textAlign: 'right', border: '1px solid #e2e8f0' }}>${selectedSlip.grossSalary.toLocaleString()}</td>
                    <td style={{ padding: '0.6rem', border: '1px solid #e2e8f0' }}>Total Deductions</td>
                    <td style={{ padding: '0.6rem', textAlign: 'right', border: '1px solid #e2e8f0', color: '#ef4444' }}>-${selectedSlip.deductions.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Net Payable Highlight */}
              <div style={{ backgroundColor: '#eef2ff', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#3730a3' }}>NET SALARY DISBURSED:</span>
                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#4f46e5' }}>
                  ${selectedSlip.netSalary.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsSlipModalOpen(false)}>
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={handlePrintSlip}>
                <Printer size={16} /> Print / Save PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
