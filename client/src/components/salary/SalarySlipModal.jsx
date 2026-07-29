import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, BookMarked, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import api from '../../services/api';

const SalarySlipModal = ({ salary, onClose }) => {
  const printRef = useRef(null);
  const [tasksList, setTasksList] = useState([]);
  const [pendingAdvanceAmount, setPendingAdvanceAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (salary) {
      // 1. Task Details: use salary.tasksDetails if available, else fetch from API
      if (salary.tasksDetails && salary.tasksDetails.length > 0) {
        setTasksList(salary.tasksDetails);
      } else if (salary.user) {
        const empId = salary.user._id || salary.user;
        setLoading(true);
        api
          .get('/tasks', { params: { assignedTo: empId, taskStatus: 'Approved', limit: 100 } })
          .then((res) => {
            const rawTasks = res.data?.data || [];
            const mapped = rawTasks.map((t) => ({
              taskId: t.taskId || 'N/A',
              taskTitle: t.taskTitle,
              completedDate: t.completedDate || t.updatedAt || t.createdAt,
              amount: t.taskPaymentAmount || 0,
              projectName: t.project?.bookName || t.project?.projectName || 'General',
            }));
            setTasksList(mapped);
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      }

      // 2. Pending Advance: use salary.pendingAdvance if available, else fetch from API
      if (salary.pendingAdvance !== undefined && salary.pendingAdvance > 0) {
        setPendingAdvanceAmount(salary.pendingAdvance);
      } else if (salary.user) {
        const empId = salary.user._id || salary.user;
        api
          .get('/advances', { params: { user: empId, limit: 100 } })
          .then((res) => {
            const allAdvances = res.data?.data || [];
            const pendingReqs = allAdvances.filter(
              (adv) => adv.status === 'Pending' || adv.status === 'Approved'
            );
            const total = pendingReqs.reduce((sum, adv) => sum + (adv.amount || 0), 0);
            const remaining = Math.max(0, total - (salary.advanceSalary || 0));
            setPendingAdvanceAmount(remaining);
          })
          .catch(() => {});
      }
    }
  }, [salary]);

  if (!salary) return null;

  const employee = salary.user || {};
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthLabel = monthNames[salary.month - 1] || `Month ${salary.month}`;

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary Slip - ${salary.salaryId}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #1e293b; margin: 0; padding: 15px; }
            .slip-card { width: 100%; max-width: 800px; margin: 0 auto; background: #fff; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 13px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 700; color: #334155; }
            .section-header { font-size: 14px; font-weight: 700; color: #1e3a8a; margin: 16px 0 8px 0; border-bottom: 2px solid #2563eb; padding-bottom: 4px; }
            .total-box { background: #0284c7; color: #fff; padding: 12px 16px; border-radius: 6px; display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; }
            .footer-signatures { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="slip-card">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '850px', width: '100%', padding: '0', overflow: 'hidden' }}>
        {/* Modal Toolbar Header */}
        <div
          style={{
            padding: '16px 24px',
            background: 'var(--bg-input, #f8fafc)',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Official Employee Salary Statement</h3>
          <div className="flex-row" style={{ gap: '10px' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={16} /> Print Salary Slip
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Print Content Area */}
        <div ref={printRef} style={{ padding: '32px', background: '#ffffff', color: '#1e293b' }}>
          {/* Slip Brand Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '3px solid #2563eb',
              paddingBottom: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 800, fontSize: '1.5rem' }}>
                <BookMarked size={28} /> PUSTAK MARKET EMS
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Book Publication & Distribution Enterprise
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>SALARY SLIP</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Pay Period: {monthLabel} {salary.year}
              </span>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                Ref ID: {salary.salaryId}
              </div>
            </div>
          </div>

          {/* Employee & Payment Info Grid */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '20px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <tbody>
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ padding: '8px 12px', width: '18%', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                  Employee Name:
                </td>
                <td style={{ padding: '8px 12px', width: '32%', fontWeight: 600, fontSize: '0.9rem' }}>
                  {employee.fullName || 'N/A'}
                </td>
                <td style={{ padding: '8px 12px', width: '18%', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                  Employee ID:
                </td>
                <td style={{ padding: '8px 12px', width: '32%', fontWeight: 600, fontSize: '0.9rem' }}>
                  {employee.employeeId || 'N/A'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                  Department:
                </td>
                <td style={{ padding: '8px 12px', fontSize: '0.9rem' }}>{employee.department || 'N/A'}</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                  Designation:
                </td>
                <td style={{ padding: '8px 12px', fontSize: '0.9rem' }}>{employee.designation || 'N/A'}</td>
              </tr>
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                  Salary Model:
                </td>
                <td style={{ padding: '8px 12px', fontSize: '0.9rem', fontWeight: 600 }}>{salary.salaryType}</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                  Payment Status:
                </td>
                <td style={{ padding: '8px 12px', fontSize: '0.9rem', fontWeight: 700, color: salary.status === 'Paid' ? '#16a34a' : '#d97706' }}>
                  {salary.status}
                </td>
              </tr>
            </tbody>
          </table>

          {/* 1. Completed Tasks Breakdown Table (Required by User) */}
          <div style={{ marginBottom: '22px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={18} color="#16a34a" /> Completed Tasks & Deliverables Payout Breakdown:
            </h4>
            {tasksList.length === 0 ? (
              <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', color: '#64748b' }}>
                No task-based payouts or incentives recorded for this period.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Task ID</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Task Name</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Completion Date</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Project / Book</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>Task Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {tasksList.map((t, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#2563eb' }}>
                        {t.taskId || `TASK-${idx + 1}`}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}>
                        {t.taskTitle}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', color: '#475569' }}>
                        {t.completedDate ? new Date(t.completedDate).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', color: '#475569' }}>
                        {t.projectName || 'General'}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                        ₹{Number(t.amount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 2. Detailed Earnings vs Deductions Breakdown (with Pending Advance) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Earnings Column */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#16a34a', paddingBottom: '6px', borderBottom: '2px solid #22c55e', marginBottom: '10px' }}>
                EARNINGS (+)
              </h4>
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Fixed Base Salary:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{(salary.fixedSalary || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Task Payouts / Incentives:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{(salary.taskIncentive || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Overtime ({salary.overtimeHours || 0} hrs):</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{(salary.overtimeAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Performance Bonus:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{(salary.bonus || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid #cbd5e1', fontWeight: 700 }}>
                    <td style={{ padding: '8px 0', color: '#16a34a' }}>Gross Earnings:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#16a34a', fontSize: '0.95rem' }}>
                      ₹{((salary.fixedSalary || 0) + (salary.taskIncentive || 0) + (salary.overtimeAmount || 0) + (salary.bonus || 0)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions Column */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#dc2626', paddingBottom: '6px', borderBottom: '2px solid #ef4444', marginBottom: '10px' }}>
                DEDUCTIONS (-)
              </h4>
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Advance Salary Deduction:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>
                      -₹{(salary.advanceSalary || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  {pendingAdvanceAmount > 0 && (
                    <tr style={{ background: '#fffbeb' }}>
                      <td style={{ padding: '6px 8px', color: '#b45309', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={14} color="#b45309" /> Pending Advance Balance:
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: '#b45309' }}>
                        ₹{pendingAdvanceAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Penalty / Fine:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>
                      -₹{(salary.penalty || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr style={{ borderTop: '1px solid #cbd5e1', fontWeight: 700 }}>
                    <td style={{ padding: '8px 0', color: '#dc2626' }}>Total Deductions:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#dc2626', fontSize: '0.95rem' }}>
                      -₹{((salary.advanceSalary || 0) + (salary.penalty || 0)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Final Net Salary Payable Banner */}
          <div
            style={{
              padding: '16px 20px',
              background: '#f0f9ff',
              border: '2px dashed #0284c7',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0369a1', fontWeight: 800 }}>
                FINAL NET SALARY PAYABLE
              </div>
              <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px' }}>
                Formula: (Fixed + Task Payouts + Overtime + Bonus) - (Advance Deducted + Penalty)
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0369a1' }}>
              ₹{(salary.totalEarnings || 0).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Signatures & Footer */}
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '40px' }}></div>
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', minWidth: '160px', fontWeight: 600 }}>
                Employee Signature
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '40px' }}></div>
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', minWidth: '160px', fontWeight: 600 }}>
                Authorized HR / Admin Signatory
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.75rem', color: '#94a3b8' }}>
            This document is an official computer-generated salary slip statement for Pustak Market EMS.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalarySlipModal;
