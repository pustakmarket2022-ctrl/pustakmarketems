import React, { useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

const Toast = () => {
  const { toasts, removeToast } = useContext(NotificationContext);

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {toasts.map((toast) => {
        let bg = 'var(--info-bg)';
        let color = 'var(--info)';
        let Icon = Info;

        if (toast.type === 'success') {
          bg = 'var(--success-bg)';
          color = 'var(--success)';
          Icon = CheckCircle;
        } else if (toast.type === 'warning') {
          bg = 'var(--warning-bg)';
          color = 'var(--warning)';
          Icon = AlertCircle;
        } else if (toast.type === 'danger') {
          bg = 'var(--danger-bg)';
          color = 'var(--danger)';
          Icon = XCircle;
        }

        return (
          <div
            key={toast.id}
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${color}`,
              borderLeft: `5px solid ${color}`,
              borderRadius: '10px',
              padding: '12px 18px',
              minWidth: '280px',
              maxWidth: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div className="flex-row" style={{ gap: '10px' }}>
              <Icon size={20} color={color} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
