import React, { useState } from 'react';
import Modal from '../common/Modal';

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const GeneratePayrollModal = ({ isOpen, onClose, onGenerate, employees = [] }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [targetEmployee, setTargetEmployee] = useState('');
  const [advanceSalary, setAdvanceSalary] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({ month, year, userId: targetEmployee || null, advanceSalary: Number(advanceSalary || 0) });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Automated Monthly Payroll"
      maxWidth="550px"
    >
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          This will compute salary statements according to employee salary models (Monthly, Per-Task, or Hybrid) including approved task payouts.
        </p>

        <div className="form-group">
          <label className="form-label">Pay Period Month *</label>
          <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Pay Period Year *</label>
          <input
            type="number"
            className="form-input"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Target Scope</label>
          <select
            className="form-select"
            value={targetEmployee}
            onChange={(e) => setTargetEmployee(e.target.value)}
          >
            <option value="">All Active Employees</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.fullName} ({emp.employeeId}) - {emp.salaryType}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Advance Salary Deduction (₹)</label>
          <input
            type="number"
            min="0"
            className="form-input"
            value={advanceSalary}
            onChange={(e) => setAdvanceSalary(e.target.value)}
            placeholder="Deduct advance salary amount taken (optional)"
          />
        </div>

        <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Run Payroll Engine
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GeneratePayrollModal;
