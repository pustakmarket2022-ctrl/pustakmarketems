import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckSquare,
  Clock,
  DollarSign,
  FileBarChart2,
  Bell,
  Settings,
  BookMarked,
  User,
  CreditCard,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const isAdmin = user?.role === 'Admin';

  const adminNav = [
    { label: t('dashboard') || 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: t('employees') || 'Employees', path: '/admin/employees', icon: Users },
    { label: t('projects') || 'Projects', path: '/admin/projects', icon: BookOpen },
    { label: t('tasks') || 'Tasks', path: '/admin/tasks', icon: CheckSquare },
    { label: t('attendance') || 'Attendance', path: '/admin/attendance', icon: Clock },
    { label: t('payroll') || 'Payroll', path: '/admin/payroll', icon: DollarSign },
    { label: 'Advances', path: '/admin/advances', icon: CreditCard },
    { label: 'Meetings', path: '/admin/meetings', icon: Calendar },
    { label: 'Discussions', path: '/admin/discussion', icon: MessageSquare },
    { label: t('reports') || 'Reports', path: '/admin/reports', icon: FileBarChart2 },
    { label: t('notifications') || 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: t('settings') || 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const employeeNav = [
    { label: t('dashboard') || 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { label: t('myTasks') || 'My Tasks', path: '/employee/tasks', icon: CheckSquare },
    { label: t('myAttendance') || 'My Attendance', path: '/employee/attendance', icon: Clock },
    { label: t('mySalary') || 'My Salary', path: '/employee/salary', icon: DollarSign },
    { label: 'My Advances', path: '/employee/advances', icon: CreditCard },
    { label: 'Meetings', path: '/employee/meetings', icon: Calendar },
    { label: 'Discussions', path: '/employee/discussion', icon: MessageSquare },
    { label: t('notifications') || 'Notifications', path: '/employee/notifications', icon: Bell },
    { label: t('myProfile') || 'My Profile', path: '/employee/profile', icon: User },
  ];

  const navItems = isAdmin ? adminNav : employeeNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}
        >
          <BookMarked size={22} />
        </div>
        <div>
          <div className="sidebar-logo-text">PUSTAK MARKET</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>EMS Enterprise</div>
        </div>
      </div>

      <nav className="sidebar-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div
          style={{
            padding: '12px',
            background: 'var(--bg-input)',
            borderRadius: '10px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Book Publishing EMS</div>
          <div>v2.0.0 (Enterprise)</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
