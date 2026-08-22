import React, { useState, useEffect } from 'react';
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  CreditCard,
  Edit3,
  FileText,
  CheckCircle,
  Shield,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const ProfilePage = () => {
  const { user, updateUserData, isHrAdmin } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfile(user);
      setEditForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSuccessMessage('');

    try {
      const res = await api.updateSelfProfile(profile._id, editForm);
      setProfile(res.user);
      updateUserData(res.user);
      setIsEditModalOpen(false);
      setSuccessMessage('Profile details updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Personal information, job credentials, and verified employment records</p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsEditModalOpen(true)}>
          <Edit3 size={16} /> Edit Contact Info
        </button>
      </div>

      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #a7f3d0',
          }}
        >
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Top Banner Profile Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #4f46e5',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
              }}
            />
          ) : (
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                backgroundColor: '#4f46e5',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.25rem',
                fontWeight: 700,
              }}
            >
              {profile?.name?.slice(0, 2).toUpperCase() || 'EM'}
            </div>
          )}

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{profile?.name}</h2>
              <StatusBadge status={profile?.jobDetails?.status || 'Active'} />
              {isHrAdmin && (
                <span style={{ fontSize: '0.75rem', backgroundColor: '#eef2ff', color: '#4f46e5', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Shield size={12} /> HR Administrator
                </span>
              )}
            </div>

            <p style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {profile?.jobDetails?.designation} • {profile?.jobDetails?.department}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={15} /> {profile?.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={15} /> {profile?.phone || 'Not provided'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} /> {profile?.address || 'Not provided'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Job Details Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Briefcase size={20} color="#4f46e5" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Official Job Details</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Employee ID</span>
              <span style={{ fontWeight: 600, color: '#4f46e5' }}>{profile?.employeeId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Department</span>
              <span style={{ fontWeight: 600 }}>{profile?.jobDetails?.department}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Designation / Title</span>
              <span style={{ fontWeight: 600 }}>{profile?.jobDetails?.designation}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Employment Type</span>
              <span style={{ fontWeight: 600 }}>{profile?.jobDetails?.employmentType || 'Full-Time'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Date of Joining</span>
              <span style={{ fontWeight: 600 }}>
                {profile?.jobDetails?.joiningDate ? new Date(profile.jobDetails.joiningDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Salary Structure Card (Read-Only) */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <CreditCard size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Salary Structure</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Basic Salary</span>
              <span style={{ fontWeight: 600 }}>${(profile?.salaryStructure?.basic || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>House Rent Allowance (HRA)</span>
              <span style={{ fontWeight: 600 }}>${(profile?.salaryStructure?.hra || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Special Allowances</span>
              <span style={{ fontWeight: 600 }}>${(profile?.salaryStructure?.allowances || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#ef4444' }}>Monthly Deductions (Tax/PF)</span>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>-${(profile?.salaryStructure?.deductions || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Net Disbursed Compensation</span>
              <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>
                ${(profile?.salaryStructure?.netSalary || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="#8b5cf6" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Verified Verification Documents</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>✓ All mandatory files verified</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'Government Photo ID / Passport', type: 'Identification', date: 'Jan 2024' },
            { name: 'Signed Employment Contract', type: 'Legal Agreement', date: 'Jan 2024' },
            { name: 'Academic Degree & Certifications', type: 'Qualifications', date: 'Jan 2024' },
            { name: 'Tax W-4 / Withholding Declaration', type: 'Tax & Compliance', date: 'Jan 2024' },
          ].map((doc, i) => (
            <div
              key={i}
              style={{
                border: '1px solid #e2e8f0',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <FileText size={24} color="#4f46e5" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{doc.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {doc.type} • Verified
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Personal Information"
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-control"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <input
              type="text"
              className="form-control"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              placeholder="e.g. 123 Main St, New York"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Avatar Image URL</label>
            <input
              type="url"
              className="form-control"
              value={editForm.avatar}
              onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
              Or choose a sample avatar:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {sampleAvatars.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Avatar ${i}`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: editForm.avatar === url ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                    transform: editForm.avatar === url ? 'scale(1.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setEditForm({ ...editForm, avatar: url })}
                />
              ))}
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saveLoading}>
              {saveLoading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
