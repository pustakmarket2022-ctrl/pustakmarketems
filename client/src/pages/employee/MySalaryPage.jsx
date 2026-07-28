import React, { useState, useEffect, useContext, useCallback } from 'react';
import { DollarSign, Download, Printer, Eye } from 'lucide-react';
import { getSalaries, downloadSalarySlip } from '../../services/salaryService';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SalarySlipModal from '../../components/salary/SalarySlipModal';
import { NotificationContext } from '../../context/NotificationContext';
import { LanguageContext } from '../../context/LanguageContext';

const monthList = [
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

const MySalaryPage = () => {
  const { addToast } = useContext(NotificationContext);
  const { language } = useContext(LanguageContext);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const fetchSalaries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSalaries({ limit: 24 });
      setSalaries(res.data || []);
    } catch (err) {
      addToast('Failed to fetch salary records', 'danger');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

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
      addToast('Salary slip PDF downloaded successfully!', 'success');
    } catch (err) {
      addToast('Failed to download salary slip PDF', 'danger');
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
          <h1 className="page-title">My Earnings & Salary Statements</h1>
          <p className="page-subtitle">View monthly salary breakdowns, overtime, advance deductions, and print salary slips</p>
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
                <th>Pay Period</th>
                <th>Salary Model</th>
                <th>Base Fixed</th>
                <th>Task Incentive</th>
                <th>Overtime</th>
                <th>Advance Deduct</th>
                <th>Bonus</th>
                <th>Total Net Payout</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No salary statements generated yet.
                  </td>
                </tr>
              ) : (
                salaries.map((s) => (
                  <tr key={s._id}>
                    <td><strong style={{ color: 'var(--primary)' }}>{s.salaryId}</strong></td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>
                        {getMonthName(s.month)} {s.year}
                      </strong>
                    </td>
                    <td><Badge text={s.salaryType} /></td>
                    <td>₹{(s.fixedSalary || 0).toLocaleString('en-IN')}</td>
                    <td>₹{(s.taskIncentive || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--primary)' }}>+₹{(s.overtimeAmount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--danger)' }}>-₹{(s.advanceSalary || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--success)' }}>+₹{(s.bonus || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--success)' }}>
                        ₹{(s.totalEarnings || 0).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td><Badge text={s.status} /></td>
                    <td>
                      <div className="flex-row" style={{ gap: '6px' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedSalary(s)}
                          title="View & Print Slip"
                        >
                          <Printer size={14} /> Print
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDownloadPDF(s._id, s.salaryId)}
                          title="Download PDF"
                        >
                          <Download size={14} /> PDF
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

      {selectedSalary && (
        <SalarySlipModal salary={selectedSalary} onClose={() => setSelectedSalary(null)} />
      )}
    </div>
  );
};

export default MySalaryPage;
