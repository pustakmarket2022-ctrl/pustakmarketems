import React, { useState, useContext } from 'react';
import { FileSpreadsheet, Download, Users, Clock, CheckSquare, DollarSign } from 'lucide-react';
import { exportReportExcel } from '../../services/reportService';
import { NotificationContext } from '../../context/NotificationContext';

const ReportsPage = () => {
  const { addToast } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);

  const handleExport = async (type, filename) => {
    setLoading(true);
    try {
      const res = await exportReportExcel(type);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast(`${filename} exported to Excel successfully!`, 'success');
    } catch (err) {
      addToast('Failed to export report to Excel', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    {
      type: 'employees',
      title: 'Employee Directory & Salary Models Report',
      description: 'Export list of all employees, assigned publication departments, designations, and fixed/per-task compensation rates.',
      icon: Users,
      color: '#6366F1',
      filename: 'PustakMarket_Employees_Report',
    },
    {
      type: 'attendance',
      title: 'Daily Attendance & Working Hours Log',
      description: 'Export daily check-in, check-out timestamps, total calculated working hours, late entries, and leave records.',
      icon: Clock,
      color: '#10B981',
      filename: 'PustakMarket_Attendance_Report',
    },
    {
      type: 'tasks',
      title: 'Publication Tasks & Deliverables Report',
      description: 'Export all project task assignments, estimated vs actual hours, task payment amounts, approval statuses, and progress %.',
      icon: CheckSquare,
      color: '#0EA5E9',
      filename: 'PustakMarket_Tasks_Report',
    },
    {
      type: 'salary',
      title: 'Monthly Salary & Payroll Disbursal Report',
      description: 'Export detailed payroll summary including fixed salary, task incentives, bonus, penalties, and net payouts.',
      icon: DollarSign,
      color: '#8B5CF6',
      filename: 'PustakMarket_Salary_Report',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Enterprise System Reports & Exports</h1>
          <p className="page-subtitle">Download audit logs, payroll summaries, and project analytics in Excel format</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.type} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="flex-row">
                <div
                  className="stat-icon-wrapper"
                  style={{ background: `${card.color}1A`, color: card.color }}
                >
                  <Icon size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{card.title}</h3>
                  <span className="badge badge-info" style={{ marginTop: '4px' }}>
                    <FileSpreadsheet size={12} /> Excel Format (.xlsx)
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{card.description}</p>

              <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={loading}
                  onClick={() => handleExport(card.type, card.filename)}
                >
                  <Download size={16} /> Export to Excel Spreadsheet
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsPage;
