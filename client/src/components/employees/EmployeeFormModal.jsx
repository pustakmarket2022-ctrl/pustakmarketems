import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Plus, Edit3 } from 'lucide-react';

const standardDepartments = [
  'Editorial',
  'Content Writing',
  'Proofreading',
  'Graphic Design',
  'Marketing',
  'Sales',
  'Printing',
  'Warehouse',
  'Accounts',
  'HR',
  'IT',
  'Custom Department...',
];

const EmployeeFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    department: 'Editorial',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    address: '',
    salaryType: 'Monthly',
    fixedSalary: 0,
    perTaskRate: 0,
    status: 'Active',
  });

  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDeptInput, setCustomDeptInput] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (initialData) {
      const isStd = standardDepartments.includes(initialData.department);
      setFormData({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        password: '',
        phone: initialData.phone || '',
        department: isStd ? initialData.department : 'Custom Department...',
        designation: initialData.designation || '',
        joiningDate: initialData.joiningDate ? new Date(initialData.joiningDate).toISOString().split('T')[0] : '',
        address: initialData.address || '',
        salaryType: initialData.salaryType || 'Monthly',
        fixedSalary: initialData.fixedSalary || 0,
        perTaskRate: initialData.perTaskRate || 0,
        status: initialData.status || 'Active',
      });

      if (!isStd && initialData.department) {
        setIsCustomDept(true);
        setCustomDeptInput(initialData.department);
      } else {
        setIsCustomDept(false);
        setCustomDeptInput('');
      }
    } else {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        department: 'Editorial',
        designation: '',
        joiningDate: new Date().toISOString().split('T')[0],
        address: '',
        salaryType: 'Monthly',
        fixedSalary: 0,
        perTaskRate: 0,
        status: 'Active',
      });
      setIsCustomDept(false);
      setCustomDeptInput('');
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department') {
      if (value === 'Custom Department...') {
        setIsCustomDept(true);
      } else {
        setIsCustomDept(false);
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalDepartment = isCustomDept ? customDeptInput.trim() : formData.department;

    if (!finalDepartment) {
      alert('Please enter a department name.');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'department') {
        data.append('department', finalDepartment);
      } else if (formData[key] !== '' && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    if (imageFile) {
      data.append('profileImage', imageFile);
    }

    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Employee - ${initialData?.employeeId}` : 'Add New Employee'}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="fullName"
              className="form-input"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Initial Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="text"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Department Selection with Custom Manual Department Entry */}
          <div className="form-group">
            <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Publication Department *</label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                onClick={() => {
                  setIsCustomDept(!isCustomDept);
                  if (!isCustomDept) setFormData((prev) => ({ ...prev, department: 'Custom Department...' }));
                }}
              >
                {isCustomDept ? 'Select Standard' : '+ Add Custom Manual'}
              </button>
            </div>

            {isCustomDept ? (
              <input
                type="text"
                className="form-input"
                placeholder="Enter New Department Name Manually..."
                value={customDeptInput}
                onChange={(e) => setCustomDeptInput(e.target.value)}
                required
              />
            ) : (
              <select name="department" className="form-select" value={formData.department} onChange={handleChange}>
                {standardDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Designation *</label>
            <input
              type="text"
              name="designation"
              className="form-input"
              placeholder="e.g. Chief Typesetter / Senior Editor"
              value={formData.designation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Salary Model *</label>
            <select name="salaryType" className="form-select" value={formData.salaryType} onChange={handleChange}>
              <option value="Monthly">Monthly Fixed</option>
              <option value="Task Based">Per Task Based</option>
              <option value="Hybrid">Hybrid (Fixed + Per Task)</option>
            </select>
          </div>

          {(formData.salaryType === 'Monthly' || formData.salaryType === 'Hybrid') && (
            <div className="form-group">
              <label className="form-label">Fixed Monthly Base Salary (₹ INR)</label>
              <input
                type="number"
                name="fixedSalary"
                className="form-input"
                value={formData.fixedSalary}
                onChange={handleChange}
              />
            </div>
          )}

          {(formData.salaryType === 'Task Based' || formData.salaryType === 'Hybrid') && (
            <div className="form-group">
              <label className="form-label">Default Per Task Rate (₹ INR)</label>
              <input
                type="number"
                name="perTaskRate"
                className="form-input"
                value={formData.perTaskRate}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Joining Date</label>
            <input
              type="date"
              name="joiningDate"
              className="form-input"
              value={formData.joiningDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '8px' }}>
          <label className="form-label">Profile Image Avatar</label>
          <input
            type="file"
            accept="image/*"
            className="form-input"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Address Details</label>
          <textarea
            name="address"
            className="form-textarea"
            rows="2"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEdit ? 'Save Changes' : 'Create Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;
