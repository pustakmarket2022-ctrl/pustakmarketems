import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { NotificationContext } from '../../context/NotificationContext';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useContext(NotificationContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      addToast('Failed to fetch notifications', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (n) => {
    try {
      if (!n.isRead) {
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
        );
        await api.put(`/notifications/${n._id}/read`);
      }
      const targetRoute = n.route || n.link;
      if (targetRoute) {
        navigate(targetRoute);
      } else {
        fetchNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      await api.put('/notifications/read-all');
      addToast('All notifications marked as read', 'success');
      fetchNotifications();
    } catch (err) {
      addToast('Failed to update notifications', 'danger');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications Center</h1>
          <p className="page-subtitle">Real-time system broadcasts, task updates, meetings, & payroll alerts</p>
        </div>
        <button className="btn btn-secondary" onClick={handleMarkAllRead}>
          <CheckCircle size={16} /> Mark All as Read
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card" style={{ padding: '0' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--border-color)',
                  background: n.isRead ? 'transparent' : 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                <div className="flex-row" style={{ gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      marginTop: '2px',
                    }}
                  >
                    <Bell size={18} />
                  </div>
                  <div>
                    <div className="flex-row" style={{ gap: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{n.title}</div>
                      {(n.route || n.link) && <ExternalLink size={14} color="var(--primary)" />}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <Badge text={n.type} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
