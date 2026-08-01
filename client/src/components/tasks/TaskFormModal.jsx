import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Plus, BookMarked, Check } from 'lucide-react';
import { createProject } from '../../services/projectService';

const priorities = ['Low', 'Medium', 'High', 'Urgent'];

const TaskFormModal = ({ isOpen, onClose, onSubmit, projects = [], employees = [], initialData = null, isEdit = false, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    taskTitle: '',
    project: '',
    assignedTo: [],
    priority: 'Medium',
    estimatedHours: 10,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    pageCount: 0,
    ratePerPage: 0,
    taskPaymentAmount: 0,
    description: '',
  });

  // Quick Add Project State
  const [showQuickProject, setShowQuickProject] = useState(false);
  const [quickProjectData, setQuickProjectData] = useState({
    bookName: '',
    projectName: '',
    author: '',
    category: 'Literature & Academic',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedBudget: 150000,
  });
  const [quickLoading, setQuickLoading] = useState(false);
  const [projectList, setProjectList] = useState(projects);

  useEffect(() => {
    setProjectList(projects);
  }, [projects]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        taskTitle: initialData.taskTitle || '',
        project: initialData.project ? (typeof initialData.project === 'object' ? initialData.project._id : initialData.project) : '',
        assignedTo: initialData.assignedTo
          ? initialData.assignedTo.map((e) => (typeof e === 'object' ? e._id : e))
          : [],
        priority: initialData.priority || 'Medium',
        estimatedHours: initialData.estimatedHours || 10,
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
        pageCount: initialData.pageCount || 0,
        ratePerPage: initialData.ratePerPage || 0,
        taskPaymentAmount: initialData.taskPaymentAmount || 0,
        description: initialData.description || '',
      });
    } else {
      setFormData({
        taskTitle: '',
        project: projectList[0]?._id || '',
        assignedTo: [],
        priority: 'Medium',
        estimatedHours: 10,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pageCount: 0,
        ratePerPage: 0,
        taskPaymentAmount: 0,
        description: '',
      });
    }
  }, [initialData, isOpen, projectList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'pageCount' || name === 'ratePerPage') {
        const pages = Number(name === 'pageCount' ? value : prev.pageCount || 0);
        const rate = Number(name === 'ratePerPage' ? value : prev.ratePerPage || 0);
        if (pages > 0 && rate > 0) {
          updated.taskPaymentAmount = pages * rate;
        }
      }
      return updated;
    });
  };

  const handleQuickProjectChange = (e) => {
    const { name, value } = e.target;
    setQuickProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateQuickProject = async (e) => {
    e.preventDefault();
    if (!quickProjectData.bookName || !quickProjectData.author) return;

    setQuickLoading(true);
    try {
      const res = await createProject({
        ...quickProjectData,
        projectName: quickProjectData.projectName || quickProjectData.bookName,
        status: 'Active',
        priority: 'Medium',
        publicationType: 'Book',
        milestones: [
          { stepName: 'Manuscript Editing', status: 'In Progress' },
          { stepName: 'Cover Design', status: 'Pending' },
          { stepName: 'Proofreading', status: 'Pending' },
          { stepName: 'Press Printing', status: 'Pending' },
        ],
      });

      const newProj = res.data;
      setProjectList((prev) => [newProj, ...prev]);
      setFormData((prev) => ({ ...prev, project: newProj._id }));
      setShowQuickProject(false);

      if (onProjectCreated) onProjectCreated(newProj);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create quick project');
    } finally {
      setQuickLoading(false);
    }
  };

  const handleEmployeeToggle = (empId) => {
    setFormData((prev) => {
      const exists = prev.assignedTo.includes(empId);
      if (exists) {
        return { ...prev, assignedTo: prev.assignedTo.filter((id) => id !== empId) };
      } else {
        return { ...prev, assignedTo: [...prev.assignedTo, empId] };
      }
    });
  };

  const [adminFiles, setAdminFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (adminFiles && adminFiles.length > 0) {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'assignedTo') {
          data.append('assignedTo', JSON.stringify(formData.assignedTo));
        } else {
          data.append(key, formData[key]);
        }
      });
      Array.from(adminFiles).forEach((f) => data.append('attachments', f));
      onSubmit(data);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Task - ${initialData?.taskId}` : 'Create & Assign Task'}
      maxWidth="740px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              name="taskTitle"
              className="form-input"
              value={formData.taskTitle}
              onChange={handleChange}
              placeholder="e.g. Manuscript Proofreading & Formatting"
              required
            />
          </div>

          <div className="form-group">
            <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Publication Project *</label>
              <button
                type="button"
                className="btn btn-secondary btn-sm flex-row"
                style={{ padding: '2px 8px', fontSize: '0.75rem', gap: '4px' }}
                onClick={() => setShowQuickProject(!showQuickProject)}
              >
                <Plus size={12} /> {showQuickProject ? 'Cancel' : 'Quick Add Book'}
              </button>
            </div>

            {showQuickProject ? (
              <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  name="bookName"
                  placeholder="Book / Publication Title *"
                  className="form-input"
                  value={quickProjectData.bookName}
                  onChange={handleQuickProjectChange}
                  required
                />
                <input
                  type="text"
                  name="author"
                  placeholder="Author Name *"
                  className="form-input"
                  value={quickProjectData.author}
                  onChange={handleQuickProjectChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm flex-row"
                  onClick={handleCreateQuickProject}
                  disabled={quickLoading || !quickProjectData.bookName || !quickProjectData.author}
                  style={{ alignSelf: 'flex-end', gap: '4px' }}
                >
                  <Check size={14} /> {quickLoading ? 'Creating...' : 'Save Book & Assign'}
                </button>
              </div>
            ) : (
              <select
                name="project"
                className="form-select"
                value={formData.project || 'office_work'}
                onChange={handleChange}
              >
                <option value="office_work">🏢 General Office Work (Internal / Non-Project Task)</option>
                {projectList.length > 0 && (
                  <optgroup label="Publication Projects">
                    {projectList.map((p) => (
                      <option key={p._id} value={p._id}>
                        📖 {p.bookName || p.projectName} ({p.projectId || 'PRJ'})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleChange}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Hours</label>
            <input
              type="number"
              name="estimatedHours"
              className="form-input"
              value={formData.estimatedHours}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Page Count / Quantity</label>
            <input
              type="number"
              name="pageCount"
              className="form-input"
              value={formData.pageCount}
              onChange={handleChange}
              placeholder="e.g. 10 pages"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rate Per Page (₹/Page)</label>
            <input
              type="number"
              name="ratePerPage"
              className="form-input"
              value={formData.ratePerPage}
              onChange={handleChange}
              placeholder="e.g. 10 ₹"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Task Payout (₹) (Optional)</label>
            <input
              type="number"
              name="taskPaymentAmount"
              className="form-input"
              value={formData.taskPaymentAmount}
              onChange={handleChange}
              placeholder="Optional (e.g. 100)"
            />
          </div>

          {Number(formData.pageCount) > 0 && Number(formData.ratePerPage) > 0 && (
            <div
              style={{
                gridColumn: 'span 2',
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--success)',
                color: 'var(--success)',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>📄 Per-Page Rate Calculation:</span>
              <span>
                {formData.pageCount} pages × ₹{formData.ratePerPage}/page = <strong>₹{formData.taskPaymentAmount} Total</strong>
              </span>
            </div>
          )}

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Task Deadline *</label>
            <input
              type="date"
              name="deadline"
              className="form-input"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '12px' }}>
          <label className="form-label">Assign Employees (Multiple Selection)</label>
          <div
            style={{
              maxHeight: '120px',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '10px',
              background: 'var(--bg-input)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}
          >
            {employees.map((emp) => (
              <label
                key={emp._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.assignedTo.includes(emp._id)}
                  onChange={() => handleEmployeeToggle(emp._id)}
                />
                {emp.fullName} ({emp.department})
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Task Instructions & Requirements</label>
          <textarea
            name="description"
            className="form-textarea"
            rows="3"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Share Working / Reference Files for Employee(s)</label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            className="form-input"
            onChange={(e) => setAdminFiles(e.target.files)}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Upload raw manuscripts, guidelines, templates or project assets for assigned employees to work on.
          </span>
        </div>

        <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEdit ? 'Save Task' : 'Assign Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
