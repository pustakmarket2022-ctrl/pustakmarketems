import React, { useState, useEffect, useContext, useCallback } from 'react';
import { CheckSquare, Upload, MessageSquare, FolderDown, FileText, Image, Download, ExternalLink } from 'lucide-react';
import { getTasks, submitTask, addComment, updateTaskStatus } from '../../services/taskService';
import TaskSubmitModal from '../../components/tasks/TaskSubmitModal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotesWidget from '../../components/common/NotesWidget';
import { NotificationContext } from '../../context/NotificationContext';

const MyTasksPage = () => {
  const { addToast } = useContext(NotificationContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTasks({ limit: 50 });
      setTasks(res.data);
    } catch (err) {
      addToast('Failed to fetch tasks', 'danger');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleOpenSubmit = (t) => {
    setSelectedTask(t);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitWork = async (taskId, formData) => {
    try {
      await submitTask(taskId, formData);
      addToast('Work deliverable submitted for review successfully!', 'success');
      setIsSubmitModalOpen(false);
      fetchTasks();
    } catch (err) {
      addToast(err.response?.data?.message || 'Submission failed', 'danger');
    }
  };

  const getFileUrl = (att) => {
    if (!att) return '#';
    const filePath = typeof att === 'string' ? att : (att.filePath || att.path || att.url || '');
    if (!filePath) return '#';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const cleanPath = filePath.replace(/\\/g, '/');
    let backendUrl = 'http://localhost:5000';
    if (process.env.REACT_APP_API_URL) {
      backendUrl = process.env.REACT_APP_API_URL.replace('/api', '');
    } else if (typeof window !== 'undefined' && window.location) {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      backendUrl = `${protocol}//${hostname}:5000`;
    }
    return `${backendUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  };

  const isImageFile = (fileNameOrPath = '') => {
    const ext = fileNameOrPath.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Assigned Publication Tasks</h1>
          <p className="page-subtitle">Track task deadlines, access admin reference files, update progress & upload deliverables</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {tasks.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              No tasks assigned to you right now.
            </div>
          ) : (
            tasks.map((t) => (
              <div key={t._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{t.taskId}</strong>

                  {/* Status Dropdown Selector for Employee */}
                  <div className="flex-row" style={{ gap: '8px', alignItems: 'center' }}>
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto', fontWeight: 700, borderRadius: '6px' }}
                      value={t.taskStatus}
                      disabled={t.taskStatus === 'Approved'}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          await updateTaskStatus(t._id, {
                            taskStatus: newStatus,
                            progressPercentage: newStatus === 'Completed' || newStatus === 'Submitted' ? 100 : newStatus === 'In Progress' ? 50 : t.progressPercentage || 0,
                          });
                          addToast(`Task status updated to '${newStatus}'`, 'success');
                          fetchTasks();
                        } catch (err) {
                          addToast('Failed to update status', 'danger');
                        }
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <Badge text={t.taskStatus} />
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0' }}>{t.taskTitle}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Category: <strong>{t.project ? `📖 ${t.project.bookName || t.project.projectName}` : '🏢 General Office Work (Internal Task)'}</strong>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{t.description}</p>

                <div
                  className="flex-row"
                  style={{
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-input)',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Payout Amount: </span>
                    <strong style={{ color: 'var(--success)' }}>₹{(t.taskPaymentAmount || 0).toLocaleString('en-IN')}</strong>
                    {t.pageCount > 0 && t.ratePerPage > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                        ({t.pageCount} pgs × ₹{t.ratePerPage})
                      </span>
                    )}
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Deadline: </span>
                    <strong>{new Date(t.deadline).toLocaleDateString('en-IN')}</strong>
                  </div>
                </div>

                {/* Shared Working Files & References Section */}
                {t.attachments && t.attachments.length > 0 && (
                  <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FolderDown size={16} /> Shared Reference & Working Files ({t.attachments.length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {t.attachments.map((att, idx) => {
                        const fullUrl = getFileUrl(att);
                        const fileName = att.fileName || (typeof att === 'string' ? att.split('/').pop() : `Reference_${idx + 1}`);
                        const isImg = isImageFile(fullUrl || fileName);

                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              background: 'var(--bg-card)',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                              fontSize: '0.8rem',
                            }}
                          >
                            <div className="flex-row" style={{ gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                              {isImg ? <Image size={16} color="var(--primary)" /> : <FileText size={16} color="var(--primary)" />}
                              <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</span>
                            </div>
                            <div className="flex-row" style={{ gap: '6px', marginLeft: '8px' }}>
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              >
                                <ExternalLink size={12} /> View
                              </a>
                              <a
                                href={fullUrl}
                                download={fileName}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-primary btn-sm"
                                style={{ padding: '3px 10px', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Download size={12} /> Download
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Task Completion Progress Bar */}
                <div>
                  <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Work Progress:</span>
                    <strong style={{ color: 'var(--primary)' }}>{t.progressPercentage || 0}% Completed</strong>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '8px' }}>
                    <div className="progress-bar-fill" style={{ width: `${t.progressPercentage || 0}%` }} />
                  </div>

                  {/* Quick Percentage Presets */}
                  {t.taskStatus !== 'Approved' && (
                    <div className="flex-row" style={{ gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Set Progress:</span>
                      {[10, 25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            fontWeight: t.progressPercentage === pct ? 800 : 500,
                            background: t.progressPercentage === pct ? 'var(--primary-light)' : 'var(--bg-input)',
                            color: t.progressPercentage === pct ? 'var(--primary)' : 'var(--text-main)',
                          }}
                          onClick={async () => {
                            try {
                              const newStatus = pct === 100 ? 'Submitted' : 'In Progress';
                              await updateTaskStatus(t._id, { progressPercentage: pct, taskStatus: newStatus });
                              addToast(`Task progress updated to ${pct}%`, 'success');
                              fetchTasks();
                            } catch (err) {
                              addToast('Failed to update progress', 'danger');
                            }
                          }}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Task Notes Widget */}
                <div style={{ marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <NotesWidget entityType="Task" entityId={t._id} entityName={t.taskTitle} />
                </div>

                {/* Submit Action */}
                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  {t.taskStatus === 'Approved' ? (
                    <div
                      style={{
                        padding: '10px',
                        background: 'var(--success-bg)',
                        color: 'var(--success)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      ✓ Task Approved & Payment Released
                    </div>
                  ) : t.taskStatus === 'Submitted' ? (
                    <div
                      style={{
                        padding: '10px',
                        background: 'var(--warning-bg)',
                        color: 'var(--warning)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div>Under Review by Admin</div>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ alignSelf: 'center', fontSize: '0.75rem' }}
                        onClick={() => handleOpenSubmit(t)}
                      >
                        <Upload size={14} /> Upload Additional Deliverables
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => handleOpenSubmit(t)}
                    >
                      <Upload size={16} /> Submit Deliverable / Upload Files
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <TaskSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleSubmitWork}
        task={selectedTask}
      />
    </div>
  );
};

export default MyTasksPage;
