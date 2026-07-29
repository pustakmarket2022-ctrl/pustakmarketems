import React, { useState, useEffect, useContext, useCallback } from 'react';
import { DollarSign, Download, CheckCircle, Plus, Edit2, FileSpreadsheet, Eye } from 'lucide-react';
import { getSalaries, generatePayroll, updateSalary, downloadSalarySlip } from '../../services/salaryService';
import { getUsers } from '../../services/userService';
import { exportReportExcel } from '../../services/reportService';
import GeneratePayrollModal from '../../components/salary/GeneratePayrollModal';
import EditSalaryModal from '../../components/salary/EditSalaryModal';
import SalarySlipModal from '../../components/salary/SalarySlipModal';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { NotificationContext } from '../../context/NotificationContext';
import { LanguageContext } from '../../context/LanguageContext';

export const monthList = [
  { num: 1, en: 'January', mr: 'जानेवारी' },
  { num: 2, en: 'February', mr: 'फेब्रुवारी' },
  { num: 3, en: 'March', mr: 'मार्च' },
  { num: 4, en: 'April', mr: 'एप्रिल' },
  { num: 5, en: 'May', mr: 'मे' },
  { num: 6, en: 'June', mr: 'जून' },
  { num: 7, en: 'July', mr: 'जुलै' },
  { num: 8, en: 'August', mr: 'ऑगस्ट' },
  { num: 9, en: 'September', mr: 'सप्टेंबर' },
  { num: 10, en: 'October', mr: 'ऑक्टोबर' },
  { num: 11, en: 'November', mr: 'नोव्हेंबर' },
  { num: 12, en: 'December', mr: 'डिसेंबर' },
];

const PayrollPage = () => {
  const { addToast } = useContext(NotificationContext);
  const { language, t } = useContext(LanguageContext);
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [viewSalary, setViewSalary] = useState(null);

  const fetchEmployees = async () => {
    try {
      const res = await getUsers({ limit: 100 });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSalaries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSalaries({
        page: currentPage,
        month,
        year,
        status,
        limit: 10,
      });
      setSalaries(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      addToast('Failed to fetch payroll records', 'danger');
    } finally {
      setLoading(false);
    }
  }, [currentPage, month, year, status, addToast]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const handleGeneratePayroll = async (payload) => {
    try {
      const res = await generatePayroll(payload.month, payload.year, payload.userId, payload.advanceSalary);
      addToast(res.message, 'success');
      setIsModalOpen(false);
      fetchSalaries();
    } catch (err) {
      addToast(err.response?.data?.message || 'Payroll generation failed', 'danger');
    }
  };

  const handleOpenEditModal = (salary) => {
    setSelectedSalary(salary);
    setIsEditModalOpen(true);
  };

  const handleSaveSalaryEdit = async (id, payload) => {
    try {
      await updateSalary(id, payload);
      addToast('Salary adjustments saved successfully', 'success');
      setIsEditModalOpen(false);
      setSelectedSalary(null);
      fetchSalaries();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save salary adjustments', 'danger');
    }
  };

  const handleMarkPaid = async (id) => {
    if (window.confirm('Mark this salary payout as Disbursed (Paid)?')) {
      try {
        await updateSalary(id, { status: 'Paid' });
        addToast('Salary disbursed successfully', 'success');
        fetchSalaries();
      } catch (err) {
        addToast('Failed to update salary status', 'danger');
      }
    }
  };

  const handleDownloadPDF = async (id, salaryId) => {
    try {
      const res = await downloadSalarySlip(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SalarySlip_${salaryId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      addToast('Failed to download PDF salary slip', 'danger');
    }
  };

  const getMonthName = (mNum) => {
    const item = monthList.find((m) => m.num === mNum);
    if (!item) return `Month ${mNum}`;
    return language === 'mr' ? item.mr : item.en;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll & Compensation Engine</h1>
          <p className="page-subtitle">Multi-model salary engine (Fixed Monthly, Task Payment & Hybrid formula calculations)</p>
        </div>
        <div className="flex-row" style={{ gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={async () => {
              try {
                const res = await exportReportExcel('salary', { month, year });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Salary_Report_${month}_${year}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                addToast('Payroll Excel Report exported successfully!', 'success');
              } catch (e) {
                addToast('Failed to export Excel', 'danger');
              }
            }}
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <DollarSign size={18} /> Generate Monthly Payroll
          </button>
        </div>
      </div>

      <div className="search-filter-panel">
        <div className="flex-row" style={{ gap: '16px' }}>
          <div className="flex-row" style={{ gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Month:</span>
            <select
              className="form-select"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {monthList.map((m) => (
                <option key={m.num} value={m.num}>
                  {language === 'mr' ? m.mr : m.en} ({m.num})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-row" style={{ gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Year:</span>
            <input
              type="number"
              className="form-input"
              style={{ width: '100px' }}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Payment Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Slip ID</th>
                <th>Employee Name</th>
                <th>Period</th>
                <th>Model</th>
                <th>Base Fixed</th>
                <th>Task Incentive</th>
                <th>Bonus</th>
                <th>Penalty</th>
                <th>Adv. Deduction</th>
                <th>Net Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No payroll records for selected period. Click "Generate Monthly Payroll" above.
                  </td>
                </tr>
              ) : (
                salaries.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>{s.salaryId}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{s.user?.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.user?.department}</div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>{getMonthName(s.month)} {s.year}</strong>
                    </td>
                    <td>
                      <Badge text={s.salaryType} />
                    </td>
                    <td>₹{(s.fixedSalary || 0).toLocaleString('en-IN')}</td>
                    <td>₹{(s.taskIncentive || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--success)' }}>+₹{(s.bonus || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--danger)' }}>-₹{(s.penalty || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>-₹{(s.advanceSalary || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                        ₹{(s.totalEarnings || 0).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <Badge text={s.status} />
                    </td>
                    <td>
                      <div className="flex-row" style={{ gap: '6px' }}>
                        {s.status === 'Pending' && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEditModal(s)}
                              title="Edit Adjustments / Advance"
                            >
                              <Edit2 size={14} /> Adjust
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleMarkPaid(s._id)}
                              title="Disburse Payout"
                            >
                              <CheckCircle size={14} /> Disburse
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setViewSalary(s)}
                          title="View Salary Slip"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDownloadPDF(s._id, s.salaryId)}
                          title="Download Salary Slip PDF"
                        >
                          <Download size={14} /> PDF Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={pages} onPageChange={(p) => setCurrentPage(p)} />

      <GeneratePayrollModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGeneratePayroll}
        employees={employees}
      />

      <EditSalaryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSalary(null);
        }}
        onSave={handleSaveSalaryEdit}
        salary={selectedSalary}
      />

      {viewSalary && (
        <SalarySlipModal salary={viewSalary} onClose={() => setViewSalary(null)} />
      )}
    </div>
  );
};

export default PayrollPage;
