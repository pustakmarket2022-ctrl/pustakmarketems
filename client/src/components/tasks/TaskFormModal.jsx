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
    taskPaymentAmount: 2500,
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
        taskPaymentAmount: 2500,
        description: '',
      });
    }
  }, [initialData, isOpen, projectList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
              placeholder="e.g. Cover Jacket Typography & Proofing"
              required
            />
          </div>

          {/* Project Selection with Quick Add Project Button */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Publication Project *</label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => setShowQuickProject(!showQuickProject)}
              >
                <Plus size={14} /> {showQuickProject ? 'Cancel Quick Add' : '+ Quick Add New Project'}
              </button>
            </div>

            {/* Quick Add Project Form Card Inline */}
            {showQuickProject && (
              <div
                style={{
                  padding: '14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--primary)',
                  borderRadius: '10px',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                  <BookMarked size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Quick Project Registration
                </div>

                <div className="grid-2" style={{ gap: '10px' }}>
                  <input
                    type="text"
                    name="bookName"
                    className="form-input"
                    placeholder="Book Title *"
                    value={quickProjectData.bookName}
                    onChange={handleQuickProjectChange}
                    required
                  />
                  <input
                    type="text"
                    name="author"
                    className="form-input"
                    placeholder="Author Name *"
                    value={quickProjectData.author}
                    onChange={handleQuickProjectChange}
                    required
                  />
                </div>

                <div className="grid-2" style={{ gap: '10px' }}>
                  <input
                    type="text"
                    name="projectName"
                    className="form-input"
                    placeholder="Series Name (Optional)"
                    value={quickProjectData.projectName}
                    onChange={handleQuickProjectChange}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleCreateQuickProject}
                    disabled={quickLoading}
                  >
                    {quickLoading ? 'Saving...' : 'Create & Select Project'}
                  </button>
                </div>
              </div>
            )}

            <select name="project" className="form-select" value={formData.project} onChange={handleChange} required>
              <option value="">Select Project</option>
              {projectList.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.bookName} ({p.projectId || 'New Project'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select name="priority" className="form-select" value={formData.priority} onChange={handleChange}>
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Task Payment Amount (₹ INR) *</label>
            <input
              type="number"
              name="taskPaymentAmount"
              className="form-input"
              value={formData.taskPaymentAmount}
              onChange={handleChange}
              required
            />
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
            <label className="form-label">Deadline Date *</label>
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
