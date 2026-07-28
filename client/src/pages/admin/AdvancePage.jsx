import React, { useState, useEffect, useContext } from 'react';
import { CreditCard, CheckCircle2, XCircle, Search, Filter, FileSpreadsheet } from 'lucide-react';
import { getAdvances, reviewAdvance } from '../../services/advanceService';
import { exportReportExcel } from '../../services/reportService';
import { NotificationContext } from '../../context/NotificationContext';

const AdvancePage = () => {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [deductionMonth, setDeductionMonth] = useState(new Date().getMonth() + 1);
  const [deductionYear, setDeductionYear] = useState(new Date().getFullYear());
  const { addToast } = useContext(NotificationContext);

  const fetchAdvances = async () => {
    try {
      setLoading(true);
      const res = await getAdvances({ status: filterStatus });
      setAdvances(res.data || []);
    } catch (err) {
      addToast('Failed to fetch advance requests', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvances();
  }, [filterStatus]);

  const handleReview = async (status) => {
    if (!selectedRequest) return;
    try {
      await reviewAdvance(selectedRequest._id, {
        status,
        reviewNotes,
        deductionMonth,
        deductionYear,
      });
      addToast(`Advance request marked as ${status}`, 'success');
      setSelectedRequest(null);
      setReviewNotes('');
      fetchAdvances();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to review request', 'danger');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header flex-row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title flex-row" style={{ gap: '10px' }}>
            <CreditCard color="var(--primary)" size={28} /> Advance Salary Requests
          </h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={async () => {
            try {
              const res = await exportReportExcel('advance', { status: filterStatus });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `Advance_Salary_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
              document.body.appendChild(link);
              link.click();
              link.remove();
              addToast('Advance Salary Excel Report exported successfully!', 'success');
            } catch (e) {
              addToast('Failed to export Excel', 'danger');
            }
          }}
        >
          <FileSpreadsheet size={16} /> Export Excel
        </button>
      </div>

      {/* Filters */}
      <div className="card flex-row" style={{ gap: '14px', marginBottom: '20px' }}>
        <div className="flex-row" style={{ gap: '8px' }}>
          <Filter size={18} color="var(--text-muted)" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Status:</span>
        </div>
        <select
          className="form-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>Loading advance requests...</div>
        ) : advances.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No advance requests found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Requested Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {advances.map((req) => (
                  <tr key={req._id}>
                    <td><strong>{req.advanceId}</strong></td>
                    <td>
                      <div className="flex-row" style={{ gap: '8px' }}>
                        <div className="avatar-placeholder" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>
                          {req.user?.fullName?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{req.user?.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.user?.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td>{req.user?.department}</td>
                    <td><strong style={{ color: 'var(--primary)' }}>₹{req.amount?.toLocaleString()}</strong></td>
                    <td style={{ maxWidth: '250px' }}>{req.reason}</td>
                    <td>
                      <span
                        className={`badge ${
                          req.status === 'Approved'
                            ? 'badge-success'
                            : req.status === 'Pending'
                            ? 'badge-warning'
                            : req.status === 'Paid'
                            ? 'badge-primary'
                            : 'badge-danger'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === 'Pending' ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedRequest(req)}
                        >
                          Review
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Reviewed by {req.reviewedBy?.fullName || 'Admin'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>Review Advance Request</h3>
            <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', marginBottom: '16px' }}>
              <div><strong>Employee:</strong> {selectedRequest.user?.fullName} ({selectedRequest.user?.employeeId})</div>
              <div><strong>Amount:</strong> ₹{selectedRequest.amount}</div>
              <div><strong>Reason:</strong> {selectedRequest.reason}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Review Notes / Remarks</label>
              <textarea
                className="form-textarea"
                rows="3"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add comments or instructions..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Deduction Month</label>
                <select
                  className="form-select"
                  value={deductionMonth}
                  onChange={(e) => setDeductionMonth(e.target.value)}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Month {i + 1}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deduction Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={deductionYear}
                  onChange={(e) => setDeductionYear(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedRequest(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={() => handleReview('Rejected')}>
                <XCircle size={16} /> Reject
              </button>
              <button type="button" className="btn btn-success" onClick={() => handleReview('Approved')}>
                <CheckCircle2 size={16} /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancePage;
