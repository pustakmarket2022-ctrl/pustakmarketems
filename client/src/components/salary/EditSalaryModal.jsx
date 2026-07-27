import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const EditSalaryModal = ({ isOpen, onClose, onSave, salary = null }) => {
  const [bonus, setBonus] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [advanceSalary, setAdvanceSalary] = useState(0);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (salary) {
      setBonus(salary.bonus || 0);
      setPenalty(salary.penalty || 0);
      setAdvanceSalary(salary.advanceSalary || 0);
      setRemarks(salary.remarks || '');
    }
  }, [salary]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!salary) return;
    onSave(salary._id, {
      bonus: Number(bonus),
      penalty: Number(penalty),
      advanceSalary: Number(advanceSalary),
      remarks,
    });
  };

  const calculatedTotal = salary
    ? Math.max(
        0,
        (salary.fixedSalary || 0) +
          (salary.taskIncentive || 0) +
          Number(bonus || 0) -
          Number(penalty || 0) -
          Number(advanceSalary || 0)
      )
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Payroll (${salary?.user?.fullName || ''} - ${salary?.salaryId || ''})`}
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
            <span>Base Fixed Salary:</span>
            <strong>₹{(salary?.fixedSalary || 0).toLocaleString('en-IN')}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
            <span>Task Incentive:</span>
            <strong>+₹{(salary?.taskIncentive || 0).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Performance Bonus (₹)</label>
          <input
            type="number"
            min="0"
            className="form-input"
            value={bonus}
            onChange={(e) => setBonus(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Penalty / Deductions (₹)</label>
          <input
            type="number"
            min="0"
            className="form-input"
            value={penalty}
            onChange={(e) => setPenalty(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ color: 'var(--danger)', fontWeight: 600 }}>
            Advance Salary Taken Deduction (₹)
          </label>
          <input
            type="number"
            min="0"
            className="form-input"
            style={{ border: '1px solid var(--danger)' }}
            value={advanceSalary}
            onChange={(e) => setAdvanceSalary(e.target.value)}
            placeholder="Enter advance amount taken by employee to deduct"
          />
          <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            This amount will be deducted directly from the monthly payout.
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Remarks / Notes</label>
          <textarea
            className="form-textarea"
            rows="2"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add notes for this adjustment..."
          />
        </div>

        <div
          style={{
            background: 'var(--bg-hover)',
            padding: '12px 16px',
            borderRadius: '8px',
            margin: '16px 0',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Calculated Net Total Payout:</span>
          <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
            ₹{calculatedTotal.toLocaleString('en-IN')}
          </strong>
        </div>

        <div className="modal-footer" style={{ padding: '12px 0 0 0' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Salary Adjustments
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSalaryModal;
