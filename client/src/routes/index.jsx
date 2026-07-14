import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

// Import Pages
import Dashboard from '../pages/Dashboard';
import EmployeeList from '../pages/EmployeeList';
import EmployeeCreate from '../pages/EmployeeCreate';
import EmployeeEdit from '../pages/EmployeeEdit';
import EmployeeDetails from '../pages/EmployeeDetails';
import Departments from '../pages/Departments';
import Designations from '../pages/Designations';
import Attendance from '../pages/Attendance';
import Leave from '../pages/Leave';
import Holidays from '../pages/Holidays';
import Shifts from '../pages/Shifts';

// Payroll pages
import PayrollDashboard from '../pages/PayrollDashboard';
import SalaryStructure from '../pages/SalaryStructure';
import PayrollList from '../pages/PayrollList';
import Reimbursements from '../pages/Reimbursements';
import Compensation from '../pages/Compensation';

// Administration & Security pages
import CompanySettings from '../pages/CompanySettings';
import Permissions from '../pages/Permissions';
import Announcements from '../pages/Announcements';
import AuditLogs from '../pages/AuditLogs';

// Other stubs
import Documents from '../pages/Documents';
import Reports from '../pages/Reports';
import Notifications from '../pages/Notifications';
import { useSelector } from 'react-redux';
import { Login, RegisterCompany, ForgotPassword, ResetPassword, VerifyEmail } from '../features/auth/index';
import NotFound from '../pages/NotFound';
import SuperAdminDashboard from '../pages/SuperAdminDashboard';
import Profile from '../pages/Profile';
import CompanyProfile from '../pages/CompanyProfile';
import Locations from '../pages/Locations';
import Teams from '../pages/Teams';
import ApprovalInbox from '../pages/ApprovalInbox';
import ActivateAccount from '../pages/ActivateAccount';
import OrgChart from '../pages/OrgChart';

export const AppRoutes = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    React.createElement(Routes, null
      /* Public Auth Routes */
      , React.createElement(Route, { path: "/login", element: React.createElement(Login, null ),} )
      , React.createElement(Route, { path: "/register-company", element: React.createElement(RegisterCompany, null ),} )
      , React.createElement(Route, { path: "/forgot-password", element: React.createElement(ForgotPassword, null ),} )
      , React.createElement(Route, { path: "/reset-password", element: React.createElement(ResetPassword, null ),} )
      , React.createElement(Route, { path: "/verify-email", element: React.createElement(VerifyEmail, null ),} )
      , React.createElement(Route, { path: "/activate-account", element: React.createElement(ActivateAccount, null ),} )

      /* Authenticated Dashboard Shell Layout */
      , React.createElement(Route, { path: "/", element: React.createElement(AppLayout, null ),}
        /* Redirect empty path dynamically based on role */
        , React.createElement(Route, {
            index: true,
            element: user?.role === 'Super Admin'
              ? React.createElement(Navigate, { to: "/super-admin", replace: true })
              : React.createElement(Navigate, { to: "/dashboard", replace: true })
          })

        , React.createElement(Route, { path: "dashboard", element: React.createElement(Dashboard, null ),} )
        , React.createElement(Route, { path: "super-admin", element: React.createElement(SuperAdminDashboard, null ),} )

        /* Employee directory routes */
        , React.createElement(Route, { path: "employees", element: React.createElement(EmployeeList, null ),} )
        , React.createElement(Route, { path: "employees/create", element: React.createElement(EmployeeCreate, null ),} )
        , React.createElement(Route, { path: "employees/:id", element: React.createElement(EmployeeDetails, null ),} )
        , React.createElement(Route, { path: "employees/:id/edit", element: React.createElement(EmployeeEdit, null ),} )
        , React.createElement(Route, { path: "org-chart", element: React.createElement(OrgChart, null ),} )

        /* Division routes */
        , React.createElement(Route, { path: "departments", element: React.createElement(Departments, null ),} )
        , React.createElement(Route, { path: "designations", element: React.createElement(Designations, null ),} )
        , React.createElement(Route, { path: "locations", element: React.createElement(Locations, null ),} )
        , React.createElement(Route, { path: "teams", element: React.createElement(Teams, null ),} )

        /* Workforce Management routes */
        , React.createElement(Route, { path: "attendance", element: React.createElement(Attendance, null ),} )
        , React.createElement(Route, { path: "leave", element: React.createElement(Leave, null ),} )
        , React.createElement(Route, { path: "approval-inbox", element: React.createElement(ApprovalInbox, null ),} )
        , React.createElement(Route, { path: "holidays", element: React.createElement(Holidays, null ),} )
        , React.createElement(Route, { path: "shifts", element: React.createElement(Shifts, null ),} )

        /* Payroll routes */
        , React.createElement(Route, { path: "payroll", element: React.createElement(PayrollDashboard, null ),} )
        , React.createElement(Route, { path: "payroll/structures", element: React.createElement(SalaryStructure, null ),} )
        , React.createElement(Route, { path: "payroll/processing", element: React.createElement(PayrollList, null ),} )
        , React.createElement(Route, { path: "reimbursements", element: React.createElement(Reimbursements, null ),} )
        , React.createElement(Route, { path: "compensation", element: React.createElement(Compensation, null ),} )

        /* Enterprise & Security routes */
        , React.createElement(Route, { path: "announcements", element: React.createElement(Announcements, null ),} )
        , React.createElement(Route, { path: "audit", element: React.createElement(AuditLogs, null ),} )
        , React.createElement(Route, { path: "settings", element: React.createElement(CompanySettings, null ),} )
        , React.createElement(Route, { path: "permissions", element: React.createElement(Permissions, null ),} )

        /* Stubs */
        , React.createElement(Route, { path: "documents", element: React.createElement(Documents, null ),} )
        , React.createElement(Route, { path: "reports", element: React.createElement(Reports, null ),} )
        , React.createElement(Route, { path: "notifications", element: React.createElement(Notifications, null ),} )
        , React.createElement(Route, { path: "profile", element: React.createElement(Profile, null ),} )
        , React.createElement(Route, { path: "company", element: React.createElement(CompanyProfile, null ),} )

        /* Catch-all page errors */
        , React.createElement(Route, { path: "*", element: React.createElement(NotFound, null ),} )
      )

      /* Catch-all redirect to login */
      , React.createElement(Route, { path: "*", element: React.createElement(Navigate, { to: "/login", replace: true,} ),} )
    )
  );
};

export default AppRoutes;
