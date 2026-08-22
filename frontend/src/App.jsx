import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/common/Layout';

// Pages
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { ResetPassword } from './pages/Auth/ResetPassword';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { AttendancePage } from './pages/Attendance/AttendancePage';
import { LeavePage } from './pages/Leaves/LeavePage';
import { EmployeesPage } from './pages/Employees/EmployeesPage';
import { PayrollPage } from './pages/Payroll/PayrollPage';
import { ProfilePage } from './pages/Profile/ProfilePage';

// Global Styles
import './styles/variables.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/leaves" element={<LeavePage />} />
              <Route path="/payroll" element={<PayrollPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Admin-Only Routes */}
              <Route element={<ProtectedRoute requiredRole="hr_admin" />}>
                <Route path="/employees" element={<EmployeesPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
