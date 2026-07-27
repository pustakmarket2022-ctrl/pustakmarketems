import React, { useContext } from 'react';
import { Sun, Moon, Bell, LogOut, Globe } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { LanguageContext } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, toggleLanguage, t } = useContext(LanguageContext);

  return (
    <header className="header">
      <div className="flex-row">
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Pustak Market EMS Portal
        </span>
      </div>

      <div className="flex-row" style={{ gap: '14px' }}>
        {/* Bilingual Language Switcher Button */}
        <button
          onClick={toggleLanguage}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            padding: '6px 14px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          title="Switch Language (English / मराठी)"
        >
          <Globe size={16} />
          {language === 'en' ? 'मराठी' : 'English'}
        </button>

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#6366F1" />}
        </button>

        {/* Notifications Button */}
        <Link
          to={user?.role === 'Employee' ? '/employee/notifications' : '/admin/notifications'}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
          title="Notifications"
        >
          <Bell size={20} />
        </Link>

        {/* User Info Badge & Avatar */}
        <Link to={user?.role === 'Employee' ? '/employee/profile' : '/admin/settings'} className="user-profile-badge">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.fullName} className="avatar" />
          ) : (
            <div className="avatar-placeholder">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.2' }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {user?.role} ({user?.department})
            </div>
          </div>
        </Link>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px 12px', color: 'var(--danger)' }}
          title="Logout"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
