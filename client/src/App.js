import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Context Providers
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';

// Common Components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';

// Styles
import './styles/global.css';
import './styles/components.css';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeesPage from './pages/admin/EmployeesPage';
import ProjectsPage from './pages/admin/ProjectsPage';
import TasksPage from './pages/admin/TasksPage';
import AttendancePage from './pages/admin/AttendancePage';
import PayrollPage from './pages/admin/PayrollPage';
import ReportsPage from './pages/admin/ReportsPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import SettingsPage from './pages/admin/SettingsPage';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyTasksPage from './pages/employee/MyTasksPage';
import MyAttendancePage from './pages/employee/MyAttendancePage';
import MySalaryPage from './pages/employee/MySalaryPage';
import MyProfilePage from './pages/employee/MyProfilePage';

// Public Landing & Tracking Pages
import LandingPage from './pages/public/LandingPage';
import ProjectTrackingPage from './pages/public/ProjectTrackingPage';

// App Layout Shell for Protected Routes
const AppLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <Outlet />
      </div>
    </div>
  );
};

// Root Redirect Component
const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Employee') return <Navigate to="/employee/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Toast />
              <Routes>
                {/* Public Landing & Auth Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/track" element={<ProjectTrackingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:resettoken" element={<ResetPasswordPage />} />

                {/* Protected App Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/employees" element={<EmployeesPage />} />
                  <Route path="/admin/projects" element={<ProjectsPage />} />
                  <Route path="/admin/tasks" element={<TasksPage />} />
                  <Route path="/admin/attendance" element={<AttendancePage />} />
                  <Route path="/admin/payroll" element={<PayrollPage />} />
                  <Route path="/admin/reports" element={<ReportsPage />} />
                  <Route path="/admin/notifications" element={<NotificationsPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />} />

                  {/* Employee Routes */}
                  <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                  <Route path="/employee/tasks" element={<MyTasksPage />} />
                  <Route path="/employee/attendance" element={<MyAttendancePage />} />
                  <Route path="/employee/salary" element={<MySalaryPage />} />
                  <Route path="/employee/notifications" element={<NotificationsPage />} />
                  <Route path="/employee/profile" element={<MyProfilePage />} />
                </Route>

                {/* Default Index Route */}
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
