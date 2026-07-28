import React, { useState, useEffect, useContext } from 'react';
import { FileSpreadsheet, Download, Users, Clock, CheckSquare, DollarSign, CreditCard, Calendar, Filter } from 'lucide-react';
import { exportReportExcel } from '../../services/reportService';
import { getUsers } from '../../services/userService';
import { NotificationContext } from '../../context/NotificationContext';

const monthList = [
  { num: 1, label: 'January' },
  { num: 2, label: 'February' },
  { num: 3, label: 'March' },
  { num: 4, label: 'April' },
  { num: 5, label: 'May' },
  { num: 6, label: 'June' },
  { num: 7, label: 'July' },
  { num: 8, label: 'August' },
  { num: 9, label: 'September' },
  { num: 10, label: 'October' },
  { num: 11, label: 'November' },
  { num: 12, label: 'December' },
];

const ReportsPage = () => {
  const { addToast } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  // Filter States
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    getUsers({ limit: 100 }).then((res) => setEmployees(res.data || [])).catch(() => {});
  }, []);

  const handleExport = async (type, filename) => {
    setLoading(true);
    try {
      const params = {};
      if (selectedEmp) params.user = selectedEmp;
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await exportReportExcel(type, params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const empObj = employees.find((e) => e._id === selectedEmp);
      const empPrefix = empObj ? `${empObj.fullName.replace(/\s+/g, '_')}_` : '';
      
      link.setAttribute('download', `${empPrefix}${filename}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast(`${filename} exported successfully!`, 'success');
    } catch (err) {
      addToast('Failed to export report to Excel', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    {
      type: 'attendance',
      title: 'Employee Attendance & Working Hours Report',
      description: 'Export check-in/out timestamps, working hours, late status, and attendance logs filtered by employee or date range.',
      icon: Clock,
      color: '#10B981',
      filename: 'Attendance_Report',
    },
    {
      type: 'tasks',
      title: 'Employee Task Performance & Deliverables Report',
      description: 'Export assigned tasks, estimated vs actual hours, task payment amounts, completion statuses, and progress %.',
      icon: CheckSquare,
      color: '#0EA5E9',
      filename: 'Tasks_Report',
    },
    {
      type: 'salary',
      title: 'Monthly Salary & Payroll Disbursal Report',
      description: 'Export detailed payroll summary including fixed salary, task incentives, overtime, bonus, penalties, advance deductions, and net payouts.',
      icon: DollarSign,
      color: '#8B5CF6',
      filename: 'Salary_Report',
    },
    {
      type: 'advance',
      title: 'Advance Salary Requests & Deductions Report',
      description: 'Export all advance salary requests, amounts, reasons, approval statuses, and deduction schedules.',
      icon: CreditCard,
      color: '#F59E0B',
      filename: 'Advance_Report',
    },
    {
      type: 'overtime',
      title: 'Employee Overtime Hours & Payouts Report',
      description: 'Export overtime hours requested, approved rates, and total calculated overtime earnings.',
      icon: Calendar,
      color: '#EC4899',
      filename: 'Overtime_Report',
    },
    {
      type: 'employees',
      title: 'All Employee Directory & Compensation Models',
      description: 'Export comprehensive list of all active employees, publication departments, designations, and salary rates.',
      icon: Users,
      color: '#6366F1',
      filename: 'Employees_Directory_Report',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee-Wise Reports & Excel Exports</h1>
          <p className="page-subtitle">Filter by specific Employee, Month, or Date Range and export tailored Excel reports</p>
        </div>
      </div>

      {/* Employee-Wise Filter Panel */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-sidebar) 100%)' }}>
        <h3 className="flex-row" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', gap: '8px' }}>
          <Filter size={20} color="var(--primary)" /> Filter Reports By Employee & Pay Period
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Employee</label>
            <select
              className="form-select"
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
            >
              <option value="">-- All Employees --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.department} - {emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Month</label>
            <select
              className="form-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">-- All Months --</option>
              {monthList.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Year</label>
            <input
              type="number"
              className="form-input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Start Date (Optional)</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">End Date (Optional)</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {(selectedEmp || selectedMonth || startDate || endDate) && (
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSelectedEmp('');
                setSelectedMonth('');
                setStartDate('');
                setEndDate('');
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Report Export Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
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
                  <Download size={16} /> Download Filtered Excel Report
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
