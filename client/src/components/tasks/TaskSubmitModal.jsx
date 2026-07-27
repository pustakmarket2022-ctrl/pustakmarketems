import React, { useState } from 'react';
import Modal from '../common/Modal';

const TaskSubmitModal = ({ isOpen, onClose, onSubmit, task }) => {
  const [progressPercentage, setProgressPercentage] = useState(100);
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);

  if (!task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('progressPercentage', progressPercentage);
    data.append('note', note);

    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        data.append('attachments', file);
      });
    }

    onSubmit(task._id, data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Submit Task Work - ${task.taskTitle}`}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '10px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Project</div>
          <div style={{ fontWeight: 700 }}>{task.project?.bookName || 'Publication Task'}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '4px' }}>
            Payment Incentive: <strong>₹{(task.taskPaymentAmount || 0).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Completion Percentage ({progressPercentage}%)</label>
          <input
            type="range"
            min="1"
            max="100"
            className="form-input"
            value={progressPercentage}
            onChange={(e) => setProgressPercentage(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Upload Work Deliverables / Attachments</label>
          <input
            type="file"
            multiple
            className="form-input"
            onChange={(e) => setFiles(e.target.files)}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Upload PDF chapters, manuscripts, artwork images, or ZIP files.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Submission Note / Comments for Admin</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Describe completed work..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Submit for Approval
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskSubmitModal;
