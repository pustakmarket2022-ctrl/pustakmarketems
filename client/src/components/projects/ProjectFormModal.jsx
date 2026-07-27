import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Plus, Trash2, CheckCircle2, Clock, Circle } from 'lucide-react';

const publicationTypes = ['Book', 'eBook', 'Magazine', 'Journal', 'Research Paper'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const statuses = ['Planning', 'Active', 'Hold', 'Completed', 'Cancelled'];

const defaultMilestones = [
  { stepName: 'Manuscript Review & Historical Verification', status: 'Completed', notes: '' },
  { stepName: 'Editorial Formatting & Indexing', status: 'Completed', notes: '' },
  { stepName: 'Cover Design & Vector Illustrations', status: 'In Progress', notes: '' },
  { stepName: 'Final Proofreading & Galleys Check', status: 'Pending', notes: '' },
  { stepName: 'Press Printing & Distribution Release', status: 'Pending', notes: '' },
];

const ProjectFormModal = ({ isOpen, onClose, onSubmit, employees = [], initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    bookName: '',
    author: '',
    ISBN: '',
    publicationType: 'Book',
    category: 'General Literature',
    description: '',
    priority: 'Medium',
    status: 'Planning',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedEmployees: [],
    estimatedBudget: 50000,
    completionPercentage: 0,
    milestones: defaultMilestones,
  });

  const [newStepName, setNewStepName] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        projectName: initialData.projectName || '',
        bookName: initialData.bookName || '',
        author: initialData.author || '',
        ISBN: initialData.ISBN || '',
        publicationType: initialData.publicationType || 'Book',
        category: initialData.category || 'General Literature',
        description: initialData.description || '',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'Planning',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
        assignedEmployees: initialData.assignedEmployees
          ? initialData.assignedEmployees.map((e) => (typeof e === 'object' ? e._id : e))
          : [],
        estimatedBudget: initialData.estimatedBudget || 0,
        completionPercentage: initialData.completionPercentage || 0,
        milestones: initialData.milestones && initialData.milestones.length > 0 ? initialData.milestones : defaultMilestones,
      });
    } else {
      setFormData({
        projectName: '',
        bookName: '',
        author: '',
        ISBN: '',
        publicationType: 'Book',
        category: 'General Literature',
        description: '',
        priority: 'Medium',
        status: 'Planning',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignedEmployees: [],
        estimatedBudget: 50000,
        completionPercentage: 0,
        milestones: defaultMilestones,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeToggle = (empId) => {
    setFormData((prev) => {
      const exists = prev.assignedEmployees.includes(empId);
      if (exists) {
        return { ...prev, assignedEmployees: prev.assignedEmployees.filter((id) => id !== empId) };
      } else {
        return { ...prev, assignedEmployees: [...prev.assignedEmployees, empId] };
      }
    });
  };

  // Milestone Step Handlers
  const handleMilestoneStatusChange = (index, status) => {
    setFormData((prev) => {
      const updated = [...prev.milestones];
      updated[index] = { ...updated[index], status };
      
      // Auto recalculate completion percentage
      const completedCount = updated.filter(m => m.status === 'Completed').length;
      const percentage = Math.round((completedCount / updated.length) * 100);

      return {
        ...prev,
        milestones: updated,
        completionPercentage: percentage,
      };
    });
  };

  const handleAddMilestone = () => {
    if (!newStepName.trim()) return;
    setFormData((prev) => {
      const updated = [...prev.milestones, { stepName: newStepName.trim(), status: 'Pending', notes: '' }];
      const completedCount = updated.filter(m => m.status === 'Completed').length;
      const percentage = Math.round((completedCount / updated.length) * 100);
      return {
        ...prev,
        milestones: updated,
        completionPercentage: percentage,
      };
    });
    setNewStepName('');
  };

  const handleRemoveMilestone = (index) => {
    setFormData((prev) => {
      const updated = prev.milestones.filter((_, i) => i !== index);
      const completedCount = updated.length > 0 ? updated.filter(m => m.status === 'Completed').length : 0;
      const percentage = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;
      return {
        ...prev,
        milestones: updated,
        completionPercentage: percentage,
      };
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
      title={isEdit ? `Edit Publication Project - ${formData.projectId || ''}` : 'Add New Book Publication Project'}
      maxWidth="780px"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Project Series Name *</label>
            <input
              type="text"
              name="projectName"
              className="form-input"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="e.g. Shivaji Maharaj Leadership Series"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Book Title *</label>
            <input
              type="text"
              name="bookName"
              className="form-input"
              value={formData.bookName}
              onChange={handleChange}
              placeholder="e.g. Shivaji Maharaj: Fort Governance"
              required
            />
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Author Name *</label>
            <input
              type="text"
              name="author"
              className="form-input"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Dr. M. K. Deshmukh"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ISBN Code</label>
            <input
              type="text"
              name="ISBN"
              className="form-input"
              value={formData.ISBN}
              onChange={handleChange}
              placeholder="978-81-94002-XX-X"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Publication Format</label>
            <select name="publicationType" className="form-select" value={formData.publicationType} onChange={handleChange}>
              {publicationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Genre / Category *</label>
            <input
              type="text"
              name="category"
              className="form-input"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. History & Management"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select name="priority" className="form-select" value={formData.priority} onChange={handleChange}>
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Release Deadline *</label>
            <input
              type="date"
              name="deadline"
              className="form-input"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Budget (₹ INR)</label>
            <input
              type="number"
              name="estimatedBudget"
              className="form-input"
              value={formData.estimatedBudget}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Milestone Steps Editor Section for Admin MK */}
        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Client Real-Time Tracking Steps ({formData.completionPercentage}% Overall)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin can mark steps as Completed / In Progress / Pending. Updates show live on Client Tracker!</p>
            </div>
            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
              {formData.completionPercentage}%
            </div>
          </div>

          {/* List of Milestones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {formData.milestones.map((m, idx) => (
              <div
                key={idx}
                className="flex-row"
                style={{
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'var(--bg-card)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div className="flex-row" style={{ gap: '10px', flex: 1 }}>
                  {m.status === 'Completed' && <CheckCircle2 size={18} color="var(--success)" />}
                  {m.status === 'In Progress' && <Clock size={18} color="var(--warning)" />}
                  {m.status === 'Pending' && <Circle size={18} color="var(--text-muted)" />}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.stepName}</span>
                </div>

                <div className="flex-row" style={{ gap: '8px' }}>
                  <select
                    className="form-select"
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    value={m.status}
                    onChange={(e) => handleMilestoneStatusChange(idx, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    type="button"
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                    onClick={() => handleRemoveMilestone(idx)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Custom Milestone Step */}
          <div className="flex-row" style={{ gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              placeholder="Add new milestone tracking step (e.g. Press Hardcover Proofing)..."
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ whiteSpace: 'nowrap' }}
              onClick={handleAddMilestone}
            >
              <Plus size={14} /> Add Step
            </button>
          </div>
        </div>

        {/* Assign Employees */}
        <div className="form-group" style={{ marginTop: '16px' }}>
          <label className="form-label">Assign Team Members (Publication Staff)</label>
          <div
            style={{
              maxHeight: '110px',
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
                  checked={formData.assignedEmployees.includes(emp._id)}
                  onChange={() => handleEmployeeToggle(emp._id)}
                />
                <span>
                  <strong>{emp.fullName}</strong> ({emp.department})
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEdit ? 'Save Project & Tracking Updates' : 'Create Publication Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectFormModal;
