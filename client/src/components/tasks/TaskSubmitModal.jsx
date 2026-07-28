import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Upload, FileText, Image, File } from 'lucide-react';

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

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return <Image size={16} color="var(--primary)" />;
    }
    if (ext === 'pdf') {
      return <FileText size={16} color="#ef4444" />;
    }
    return <File size={16} color="var(--secondary)" />;
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
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Publication Project</div>
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
          <label className="form-label">Upload Work Deliverables (Images, PDF, Documents)</label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            className="form-input"
            onChange={(e) => setFiles(e.target.files)}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Supported formats: Images (JPG, PNG), PDF, Documents (DOCX, TXT), ZIP files.
          </span>

          {/* Immediate File Selection Preview */}
          {files && files.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                Selected Files ({files.length}):
              </div>
              {Array.from(files).map((f, idx) => (
                <div
                  key={idx}
                  className="flex-row"
                  style={{
                    padding: '6px 10px',
                    background: 'var(--bg-input)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    gap: '8px',
                    justifyContent: 'space-between',
                  }}
                >
                  <div className="flex-row" style={{ gap: '6px' }}>
                    {getFileIcon(f.name)}
                    <span>{f.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {(f.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Submission Note / Comments for Admin</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Describe completed work, changes, and notes..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Upload size={16} /> Submit for Approval
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskSubmitModal;
