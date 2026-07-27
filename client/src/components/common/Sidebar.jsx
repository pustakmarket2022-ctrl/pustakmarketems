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
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  const adminNav = [
    { label: t('dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { label: t('employees'), path: '/admin/employees', icon: Users },
    { label: t('projects'), path: '/admin/projects', icon: BookOpen },
    { label: t('tasks'), path: '/admin/tasks', icon: CheckSquare },
    { label: t('attendance'), path: '/admin/attendance', icon: Clock },
    { label: t('payroll'), path: '/admin/payroll', icon: DollarSign },
    { label: t('reports'), path: '/admin/reports', icon: FileBarChart2 },
    { label: t('notifications'), path: '/admin/notifications', icon: Bell },
    { label: t('settings'), path: '/admin/settings', icon: Settings },
  ];

  const employeeNav = [
    { label: t('dashboard'), path: '/employee/dashboard', icon: LayoutDashboard },
    { label: t('myTasks'), path: '/employee/tasks', icon: CheckSquare },
    { label: t('myAttendance'), path: '/employee/attendance', icon: Clock },
    { label: t('mySalary'), path: '/employee/salary', icon: DollarSign },
    { label: t('notifications'), path: '/employee/notifications', icon: Bell },
    { label: t('myProfile'), path: '/employee/profile', icon: User },
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
          <div>v1.0.0 (Production)</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
