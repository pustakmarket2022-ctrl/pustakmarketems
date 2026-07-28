import React, { useRef } from 'react';
import { X, Printer, Download, BookMarked, CheckCircle2 } from 'lucide-react';

const SalarySlipModal = ({ salary, onClose }) => {
  const printRef = useRef(null);

  if (!salary) return null;

  const employee = salary.user || {};
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthLabel = monthNames[salary.month - 1] || salary.month;

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
      <html>
        <head>
          <title>Salary Slip - ${salary.salaryId}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #333; }
            .slip-header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .slip-title { font-size: 20px; font-weight: bold; color: #1e3a8a; }
            .info-table, .calc-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .info-table td, .calc-table td, .calc-table th { padding: 10px; border: 1px solid #e2e8f0; font-size: 14px; }
            .calc-table th { background: #f1f5f9; text-align: left; font-weight: bold; }
            .total-row { background: #eff6ff; font-weight: bold; font-size: 16px; }
            .footer-sign { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; color: #64748b; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '750px', width: '100%', padding: '0', overflow: 'hidden' }}>
        {/* Header toolbar */}
        <div
          style={{
            padding: '16px 24px',
            background: 'var(--bg-input)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Salary Slip Statement</h3>
          <div className="flex-row" style={{ gap: '10px' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={16} /> Print Salary Slip
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Print content area */}
        <div ref={printRef} style={{ padding: '32px', background: '#fff', color: '#1e293b' }}>
          {/* Slip Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '16px',
              marginBottom: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 800, fontSize: '1.4rem' }}>
                <BookMarked size={26} /> PUSTAK MARKET
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                Book Publication & Distribution House
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>PAYSLIP</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Period: {monthLabel} {salary.year}
              </span>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563eb', marginTop: '2px' }}>
                Ref ID: {salary.salaryId}
              </div>
            </div>
          </div>

          {/* Employee Info Grid */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '24px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
            }}
          >
            <tbody>
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ padding: '8px 12px', width: '20%', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                  Employee Name:
                </td>
                <td style={{ padding: '8px 12px', width: '30%', fontWeight: 600, fontSize: '0.9rem' }}>
                  {employee.fullName || 'N/A'}
                </td>
                <td style={{ padding: '8px 12px', width: '20%', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                  Employee ID:
                </td>
                <td style={{ padding: '8px 12px', width: '30%', fontWeight: 600, fontSize: '0.9rem' }}>
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
                  Salary Type:
                </td>
                <td style={{ padding: '8px 12px', fontSize: '0.9rem' }}>{salary.salaryType}</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                  Payment Status:
                </td>
                <td style={{ padding: '8px 12px', fontSize: '0.9rem', fontWeight: 700, color: salary.status === 'Paid' ? '#16a34a' : '#d97706' }}>
                  {salary.status}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Detailed Earnings vs Deductions Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Earnings */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', paddingBottom: '6px', borderBottom: '2px solid #22c55e', marginBottom: '10px' }}>
                EARNINGS (+)
              </h4>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Basic Salary:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{(salary.fixedSalary || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Task Incentives:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{(salary.taskIncentive || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Overtime ({salary.overtimeHours || 0} hrs):</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{(salary.overtimeAmount || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Performance Bonus:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{(salary.bonus || 0).toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid #cbd5e1', fontWeight: 700 }}>
                    <td style={{ padding: '8px 0', color: '#16a34a' }}>Total Gross Earnings:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#16a34a' }}>
                      ₹{((salary.fixedSalary || 0) + (salary.taskIncentive || 0) + (salary.overtimeAmount || 0) + (salary.bonus || 0)).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', paddingBottom: '6px', borderBottom: '2px solid #ef4444', marginBottom: '10px' }}>
                DEDUCTIONS (-)
              </h4>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Advance Deduction:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{(salary.advanceSalary || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#475569' }}>Penalty / Fine:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>₹{(salary.penalty || 0).toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid #cbd5e1', fontWeight: 700 }}>
                    <td style={{ padding: '8px 0', color: '#dc2626' }}>Total Deductions:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#dc2626' }}>
                      ₹{((salary.advanceSalary || 0) + (salary.penalty || 0)).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Net Pay Box */}
          <div
            style={{
              padding: '16px 20px',
              background: '#f0f9ff',
              border: '2px dashed #0284c7',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0369a1', fontWeight: 700 }}>
                FINAL NET SALARY PAYABLE
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                Formula: (Basic + Task + Overtime + Bonus) - (Advance + Penalty)
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0369a1' }}>
              ₹{(salary.totalEarnings || 0).toLocaleString()}
            </div>
          </div>

          {/* Signatures */}
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <div>
              <div style={{ height: '40px' }}></div>
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '4px', textAlign: 'center', minWidth: '150px' }}>
                Employee Signature
              </div>
            </div>
            <div>
              <div style={{ height: '40px' }}></div>
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '4px', textAlign: 'center', minWidth: '150px' }}>
                Authorized HR / Accounts
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalarySlipModal;
