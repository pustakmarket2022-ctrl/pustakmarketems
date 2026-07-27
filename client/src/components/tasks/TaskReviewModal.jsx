import React, { useState } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { Download, FileText, CheckCircle2, XCircle } from 'lucide-react';

const TaskReviewModal = ({ isOpen, onClose, onReview, task }) => {
  const [reviewNotes, setReviewNotes] = useState('');

  if (!task) return null;

  const handleAction = (action) => {
    onReview(task._id, { action, reviewNotes });
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const backendUrl = process.env.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL.replace('/api', '')
      : 'http://localhost:5000';
    return `${backendUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Task Deliverable - ${task.taskId}`}
      maxWidth="680px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ background: 'var(--bg-input)', padding: '18px', borderRadius: '12px' }}>
          <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{task.taskTitle}</h4>
            <Badge text={task.taskStatus} />
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            {task.description}
          </p>

          <div className="flex-row" style={{ gap: '20px', fontSize: '0.85rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Publication Project: </span>
              <strong>{task.project?.bookName || task.project?.projectName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Task Amount: </span>
              <strong style={{ color: 'var(--success)' }}>₹{(task.taskPaymentAmount || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Employee: </span>
              <strong>{task.assignedTo?.map((u) => u.fullName).join(', ')}</strong>
            </div>
          </div>
        </div>

        {/* Uploaded Working Files & Deliverables Section */}
        <div>
          <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--primary)' }}>
            📁 Submitted Working Files & Deliverables ({task.attachments?.length || 0}):
          </h5>

          {task.attachments && task.attachments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {task.attachments.map((att, idx) => {
                const fullDownloadUrl = getFileUrl(att.filePath);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--primary)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div className="flex-row" style={{ gap: '10px' }}>
                      <FileText size={20} color="var(--primary)" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          {att.fileName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Uploaded on {new Date(att.uploadedAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <a
                      href={fullDownloadUrl}
                      download={att.fileName}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={15} /> Download Working File
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No attached working files found for this submission.
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Review Feedback / Approval Notes for Employee</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Enter editorial feedback or approval notes..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ padding: '16px 0 0 0', justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleAction('Rejected')}
          >
            <XCircle size={16} /> Reject Submission
          </button>
          <div className="flex-row" style={{ gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleAction('Approved')}
            >
              <CheckCircle2 size={16} /> Approve & Release Payment
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskReviewModal;
