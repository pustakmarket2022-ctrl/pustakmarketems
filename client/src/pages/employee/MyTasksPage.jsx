import React, { useState, useEffect, useContext, useCallback } from 'react';
import { CheckSquare, Upload, MessageSquare } from 'lucide-react';
import { getTasks, submitTask, addComment } from '../../services/taskService';
import TaskSubmitModal from '../../components/tasks/TaskSubmitModal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Assigned Publication Tasks</h1>
          <p className="page-subtitle">Track task deadlines, upload work deliverables, and receive task payouts</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {tasks.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              No tasks assigned to you right now.
            </div>
          ) : (
            tasks.map((t) => (
              <div key={t._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="flex-row" style={{ justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--primary)' }}>{t.taskId}</strong>
                  <Badge text={t.taskStatus} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t.taskTitle}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Project: <strong>{t.project?.bookName}</strong>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.description}</p>

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
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Deadline: </span>
                    <strong>{new Date(t.deadline).toLocaleDateString()}</strong>
                  </div>
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
                      }}
                    >
                      Under Review by Admin
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => handleOpenSubmit(t)}
                    >
                      <Upload size={16} /> Submit Deliverable / Files
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
