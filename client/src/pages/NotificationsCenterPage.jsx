import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Filter,
  Search,
  ExternalLink,
  Volume2,
  VolumeX,
  ShieldCheck,
  Calendar,
  CheckSquare,
  Clock,
  DollarSign,
  CreditCard,
  UserCheck,
  Award,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socketService';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { NotificationContext } from '../context/NotificationContext';

const moduleTypes = ['All', 'Task', 'Attendance', 'Leave', 'Salary', 'Meeting', 'Advance', 'Overtime', 'System'];

const NotificationsCenterPage = () => {
  const navigate = useNavigate();
  const { addToast } = useContext(NotificationContext);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters State
  const [selectedModule, setSelectedModule] = useState('All');
  const [readFilter, setReadFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Batch Select State
  const [selectedIds, setSelectedIds] = useState([]);

  // Audio & Push Notification Settings
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('ems_notif_sound') === 'true'
  );
  const [browserPermission, setBrowserPermission] = useState(
    window.Notification ? window.Notification.permission : 'default'
  );

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 15,
        type: selectedModule === 'All' ? '' : selectedModule,
        readStatus: readFilter,
        search: searchQuery,
        startDate,
        endDate,
      };

      const res = await api.get('/notifications', { params });
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      addToast('Failed to load notifications', 'danger');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedModule, readFilter, searchQuery, startDate, endDate, addToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-Time Socket.IO Listener
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handleNewNotification = (data) => {
        if (soundEnabled) {
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});
          } catch (e) {}
        }
        fetchNotifications();
      };

      socket.on('new_notification', handleNewNotification);
      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [soundEnabled, fetchNotifications]);

  // Toggle Sound Preference
  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('ems_notif_sound', String(nextState));
    addToast(`Audio notification chime ${nextState ? 'enabled' : 'disabled'}`, 'info');
  };

  // Request Browser Notification Permission
  const requestBrowserPermission = async () => {
    if (!window.Notification) {
      addToast('Browser push notifications are not supported in this browser.', 'warning');
      return;
    }

    const permission = await window.Notification.requestPermission();
    setBrowserPermission(permission);
    if (permission === 'granted') {
      addToast('Browser push notifications enabled!', 'success');
      new window.Notification('Pustak Market EMS', {
        body: 'Real-time push notifications enabled successfully.',
      });
    } else {
      addToast('Browser push notifications permission denied.', 'warning');
    }
  };

  // Notification Click & Navigation
  const handleItemClick = async (n) => {
    try {
      if (!n.isRead) {
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

  // Mark Single as Read
  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      addToast('Notification marked as read', 'success');
      fetchNotifications();
    } catch (e) {
      addToast('Operation failed', 'danger');
    }
  };

  // Mark All Read
  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      addToast('All notifications marked as read', 'success');
      fetchNotifications();
    } catch (e) {
      addToast('Operation failed', 'danger');
    }
  };

  // Delete Single Notification
  const handleDeleteSingle = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this notification?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      addToast('Notification deleted', 'success');
      fetchNotifications();
    } catch (e) {
      addToast('Failed to delete notification', 'danger');
    }
  };

  // Batch Selection Checkbox Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(notifications.map((n) => n._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (e, id) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Delete Selected Notifications
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected notification(s)?`)) return;
    try {
      await api.post('/notifications/delete-multiple', { notificationIds: selectedIds });
      addToast(`Deleted ${selectedIds.length} notification(s)`, 'success');
      setSelectedIds([]);
      fetchNotifications();
    } catch (e) {
      addToast('Batch deletion failed', 'danger');
    }
  };

  // Delete All Notifications
  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL your notifications?')) return;
    try {
      await api.delete('/notifications');
      addToast('All notifications cleared', 'success');
      setSelectedIds([]);
      fetchNotifications();
    } catch (e) {
      addToast('Failed to clear notifications', 'danger');
    }
  };

  const getModuleIcon = (type) => {
    switch (type) {
      case 'Task': return <CheckSquare size={18} color="var(--primary)" />;
      case 'Attendance': return <Clock size={18} color="#ec4899" />;
      case 'Leave': return <UserCheck size={18} color="#8b5cf6" />;
      case 'Salary': return <DollarSign size={18} color="#10b981" />;
      case 'Meeting': return <Calendar size={18} color="#0ea5e9" />;
      case 'Advance': return <CreditCard size={18} color="#f59e0b" />;
      case 'Overtime': return <Layers size={18} color="#6366f1" />;
      default: return <Bell size={18} color="var(--primary)" />;
    }
  };

  return (
    <div className="page-container">
      {/* Header Toolbar */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex-row" style={{ gap: '10px' }}>
            <Bell color="var(--primary)" size={28} /> Enterprise Notification Center
          </h1>
          <p className="page-subtitle">
            Real-time push alerts, task updates, payroll slips, meeting invitations, and attendance audits
          </p>
        </div>

        <div className="flex-row" style={{ gap: '10px', flexWrap: 'wrap' }}>
          {/* Audio Chime Sound Toggle */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={toggleSound}
            title={soundEnabled ? 'Disable Audio Chime' : 'Enable Audio Chime'}
          >
            {soundEnabled ? <Volume2 size={16} color="var(--success)" /> : <VolumeX size={16} color="var(--text-muted)" />}
            {soundEnabled ? 'Chime ON' : 'Chime OFF'}
          </button>

          {/* Browser Desktop Push Toggle */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={requestBrowserPermission}
            title="Enable Desktop Push Notifications"
          >
            <ShieldCheck size={16} color={browserPermission === 'granted' ? 'var(--success)' : 'var(--warning)'} />
            Push: {browserPermission}
          </button>

          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            <CheckCircle2 size={16} /> Mark All Read
          </button>

          {selectedIds.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>
              <Trash2 size={16} /> Delete Selected ({selectedIds.length})
            </button>
          )}

          <button className="btn btn-danger btn-sm" onClick={handleDeleteAll}>
            Clear All
          </button>
        </div>
      </div>

      {/* Module Filter Tabs */}
      <div className="flex-row" style={{ gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        {moduleTypes.map((m) => (
          <button
            key={m}
            type="button"
            className="btn btn-secondary btn-sm"
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: selectedModule === m ? 700 : 500,
              background: selectedModule === m ? 'var(--primary)' : 'var(--bg-input)',
              color: selectedModule === m ? '#ffffff' : 'var(--text-main)',
              border: selectedModule === m ? '1px solid var(--primary)' : '1px solid var(--border-color)',
            }}
            onClick={() => {
              setSelectedModule(m);
              setCurrentPage(1);
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Search & Filter Control Panel */}
      <div className="search-filter-panel" style={{ marginBottom: '20px' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '240px' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Search notification title or content..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex-row" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={readFilter}
            onChange={(e) => {
              setReadFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '150px' }}
          >
            <option value="all">All Statuses</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>

          <input
            type="date"
            className="form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Start Date"
            style={{ width: '150px' }}
          />

          <input
            type="date"
            className="form-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="End Date"
            style={{ width: '150px' }}
          />
        </div>
      </div>

      {/* Notification List Table Container */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Top Selection Bar */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: '12px 20px',
                background: 'var(--bg-input)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === notifications.length && notifications.length > 0}
                  onChange={handleSelectAll}
                />
                Select All ({notifications.length} on this page)
              </label>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Showing <strong>{notifications.length}</strong> of <strong>{total}</strong> notifications | Unread: <strong style={{ color: 'var(--primary)' }}>{unreadCount}</strong>
              </div>
            </div>
          )}

          {notifications.length === 0 ? (
            <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No notifications found matching your search and filter criteria.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleItemClick(n)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-color)',
                  background: !n.isRead ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                <div className="flex-row" style={{ gap: '12px', alignItems: 'flex-start', flex: 1 }}>
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(n._id)}
                    onChange={(e) => handleToggleSelect(e, n._id)}
                    style={{ marginTop: '10px' }}
                  />

                  {/* Module Icon */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '2px',
                    }}
                  >
                    {getModuleIcon(n.type)}
                  </div>

                  <div>
                    <div className="flex-row" style={{ gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span
                          style={{
                            background: 'var(--primary)',
                            color: '#fff',
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontWeight: 700,
                          }}
                        >
                          UNREAD
                        </span>
                      )}
                      {(n.route || n.link) && <ExternalLink size={14} color="var(--primary)" />}
                    </div>

                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                      {n.message}
                    </div>

                    <div className="flex-row" style={{ gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      <span>Module: <strong>{n.type}</strong></span>
                      <span>•</span>
                      <span>Priority: <strong>{n.priority || 'Medium'}</strong></span>
                      <span>•</span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions (Mark Read & Delete) */}
                <div className="flex-row" style={{ gap: '8px' }}>
                  {!n.isRead && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={(e) => handleMarkRead(e, n._id)}
                      title="Mark as Read"
                    >
                      <CheckCircle2 size={14} color="var(--success)" /> Read
                    </button>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px', color: 'var(--danger)' }}
                    onClick={(e) => handleDeleteSingle(e, n._id)}
                    title="Delete Notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={pages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default NotificationsCenterPage;
