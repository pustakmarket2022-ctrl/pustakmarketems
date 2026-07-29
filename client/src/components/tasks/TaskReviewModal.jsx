import React, { useState } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import NotesWidget from '../common/NotesWidget';
import { Download, FileText, CheckCircle2, XCircle, Image, ExternalLink } from 'lucide-react';

const TaskReviewModal = ({ isOpen, onClose, onReview, task }) => {
  const [reviewNotes, setReviewNotes] = useState('');

  if (!task) return null;

  const handleAction = (action) => {
    onReview(task._id, { action, reviewNotes });
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Task Deliverable - ${task.taskId}`}
      maxWidth="720px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ background: 'var(--bg-input)', padding: '18px', borderRadius: '12px' }}>
          <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{task.taskTitle}</h4>
            <Badge text={task.taskStatus} />
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
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
          <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📁 Submitted Working Files & Deliverables ({task.attachments?.length || 0}):
          </h5>

          {task.attachments && task.attachments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {task.attachments.map((att, idx) => {
                const fullDownloadUrl = getFileUrl(att);
                const fileName = typeof att === 'string' ? att.split('/').pop() : (att.fileName || `Deliverable_${idx + 1}`);
                const isImg = isImageFile(fileName);

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      background: 'var(--bg-input)',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div className="flex-row" style={{ gap: '10px' }}>
                        {isImg ? <Image size={20} color="var(--primary)" /> : <FileText size={20} color="var(--primary)" />}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            {fileName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Uploaded on {new Date(att.uploadedAt || Date.now()).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="flex-row" style={{ gap: '8px' }}>
                        <a
                          href={fullDownloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ExternalLink size={14} /> Open
                        </a>
                        <a
                          href={fullDownloadUrl}
                          download={fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '6px 14px', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Download size={14} /> Download File
                        </a>
                      </div>
                    </div>

                    {/* Inline Image Preview for image attachments */}
                    {isImg && (
                      <div style={{ marginTop: '4px', textAlign: 'center', background: '#000', borderRadius: '8px', padding: '6px', overflow: 'hidden' }}>
                        <img
                          src={fullDownloadUrl}
                          alt={fileName}
                          style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '6px', display: 'block', margin: '0 auto' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
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

        {/* Notes & Annotations Widget for Task */}
        <NotesWidget entityType="Task" entityId={task._id} entityName={task.taskTitle} />

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
