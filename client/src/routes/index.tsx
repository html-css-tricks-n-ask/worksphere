import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.js';

// Import Pages
import Dashboard from '../pages/Dashboard.js';
import EmployeeList from '../pages/EmployeeList.js';
import EmployeeCreate from '../pages/EmployeeCreate.js';
import EmployeeEdit from '../pages/EmployeeEdit.js';
import EmployeeDetails from '../pages/EmployeeDetails.js';
import Departments from '../pages/Departments.js';
import Designations from '../pages/Designations.js';
import Attendance from '../pages/Attendance.js';
import Leave from '../pages/Leave.js';
import Holidays from '../pages/Holidays.js';
import Shifts from '../pages/Shifts.js';

// Payroll pages
import PayrollDashboard from '../pages/PayrollDashboard.js';
import SalaryStructure from '../pages/SalaryStructure.js';
import PayrollList from '../pages/PayrollList.js';
import Reimbursements from '../pages/Reimbursements.js';
import Compensation from '../pages/Compensation.js';

// Administration & Security pages
import CompanySettings from '../pages/CompanySettings.js';
import Permissions from '../pages/Permissions.js';
import Announcements from '../pages/Announcements.js';
import AuditLogs from '../pages/AuditLogs.js';

// Other stubs
import Documents from '../pages/Documents.js';
import Reports from '../pages/Reports.js';
import Notifications from '../pages/Notifications.js';
import Profile from '../pages/Profile.js';
import CompanyProfile from '../pages/CompanyProfile.js';
import { Login, RegisterCompany, ForgotPassword, ResetPassword, VerifyEmail } from '../features/auth/index.js';
import NotFound from '../pages/NotFound.js';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register-company" element={<RegisterCompany />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Authenticated Dashboard Shell Layout */}
      <Route path="/" element={<AppLayout />}>
        {/* Redirect empty path to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Employee directory routes */}
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/create" element={<EmployeeCreate />} />
        <Route path="employees/:id" element={<EmployeeDetails />} />
        <Route path="employees/:id/edit" element={<EmployeeEdit />} />

        {/* Division routes */}
        <Route path="departments" element={<Departments />} />
        <Route path="designations" element={<Designations />} />

        {/* Workforce Management routes */}
        <Route path="attendance" element={<Attendance />} />
        <Route path="leave" element={<Leave />} />
        <Route path="holidays" element={<Holidays />} />
        <Route path="shifts" element={<Shifts />} />

        {/* Payroll routes */}
        <Route path="payroll" element={<PayrollDashboard />} />
        <Route path="payroll/structures" element={<SalaryStructure />} />
        <Route path="payroll/processing" element={<PayrollList />} />
        <Route path="reimbursements" element={<Reimbursements />} />
        <Route path="compensation" element={<Compensation />} />

        {/* Enterprise & Security routes */}
        <Route path="announcements" element={<Announcements />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="settings" element={<CompanySettings />} />
        <Route path="permissions" element={<Permissions />} />

        {/* Stubs */}
        <Route path="documents" element={<Documents />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="company" element={<CompanyProfile />} />
        
        {/* Catch-all page errors */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Catch-all redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
