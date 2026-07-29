import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  User,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { getOvertime, requestOvertime, reviewOvertime } from '../services/overtimeService';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OvertimePage = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'HR' || user?.role === 'Manager';

  const [overtimes, setOvertimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Request Modal State (Employee)
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqDate, setReqDate] = useState(new Date().toISOString().split('T')[0]);
  const [reqHours, setReqHours] = useState('2');
  const [reqReason, setReqReason] = useState('');
  const [reqHourlyRate, setReqHourlyRate] = useState('100');
  const [submittingReq, setSubmittingReq] = useState(false);

  // Review Modal State (Admin)
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewRate, setReviewRate] = useState('100');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOvertimeData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'All') {
        params.status = filterStatus;
      }
      const res = await getOvertime(params);
      setOvertimes(res.data || []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch overtime requests', 'danger');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, addToast]);

  useEffect(() => {
    fetchOvertimeData();
  }, [fetchOvertimeData]);

  // Handle Employee Overtime Submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!reqHours || parseFloat(reqHours) <= 0) {
      addToast('Please enter valid overtime hours', 'danger');
      return;
    }
    if (!reqReason.trim()) {
      addToast('Please provide a reason or work description', 'danger');
      return;
    }

    try {
      setSubmittingReq(true);
      await requestOvertime({
        date: reqDate,
        hours: parseFloat(reqHours),
        reason: reqReason,
        hourlyRate: parseFloat(reqHourlyRate || '100'),
      });
      addToast('Overtime request submitted successfully!', 'success');
      setShowRequestModal(false);
      setReqHours('2');
      setReqReason('');
      fetchOvertimeData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit overtime request', 'danger');
    } finally {
      setSubmittingReq(false);
    }
  };

  // Open Admin Review Modal
  const openReviewModal = (item, status) => {
    setSelectedRequest(item);
    setReviewStatus(status);
    setReviewNotes('');
    setReviewRate(item.hourlyRate || 100);
  };

  // Handle Admin Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setSubmittingReview(true);
      await reviewOvertime(selectedRequest._id, {
        status: reviewStatus,
        reviewNotes,
        hourlyRate: parseFloat(reviewRate || selectedRequest.hourlyRate || 100),
      });
      addToast(`Overtime request marked as ${reviewStatus}`, 'success');
      setSelectedRequest(null);
      fetchOvertimeData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to review overtime request', 'danger');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filtering by search term
  const filteredOvertimes = overtimes.filter((item) => {
    const empName = item.user?.fullName?.toLowerCase() || '';
    const empDept = item.user?.department?.toLowerCase() || '';
    const reasonText = item.reason?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return empName.includes(search) || empDept.includes(search) || reasonText.includes(search);
  });

  // Calculate statistics
  const totalApprovedHours = overtimes
    .filter((o) => o.status === 'Approved')
    .reduce((sum, o) => sum + (o.hours || 0), 0);

  const totalPayout = overtimes
    .filter((o) => o.status === 'Approved')
    .reduce((sum, o) => sum + (o.totalAmount || (o.hours || 0) * (o.hourlyRate || 100)), 0);

  const pendingCount = overtimes.filter((o) => o.status === 'Pending').length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 className="page-title flex-row" style={{ gap: '10px' }}>
            <Clock color="var(--primary)" size={28} /> Overtime Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {isAdmin
              ? 'Review and manage employee extra work hours and payouts'
              : 'Track your extra hours, submission status, and estimated overtime payouts'}
          </p>
        </div>
        <div>
          {!isAdmin && (
            <button className="btn btn-primary flex-row" style={{ gap: '8px' }} onClick={() => setShowRequestModal(true)}>
              <Plus size={18} /> Request Overtime
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card card flex-row" style={{ gap: '16px', padding: '20px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Approved OT Hours</span>
            <h3 style={{ fontSize: '1.4rem', margin: '4px 0 0 0', fontWeight: '700' }}>{totalApprovedHours} hrs</h3>
          </div>
        </div>

        <div className="stat-card card flex-row" style={{ gap: '16px', padding: '20px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {isAdmin ? 'Total Approved Payout' : 'My Total OT Earned'}
            </span>
            <h3 style={{ fontSize: '1.4rem', margin: '4px 0 0 0', fontWeight: '700' }}>₹{totalPayout.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card card flex-row" style={{ gap: '16px', padding: '20px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
            }}
          >
            <AlertCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Requests</span>
            <h3 style={{ fontSize: '1.4rem', margin: '4px 0 0 0', fontWeight: '700' }}>{pendingCount}</h3>
          </div>
        </div>

        <div className="stat-card card flex-row" style={{ gap: '16px', padding: '20px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(14, 165, 233, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0ea5e9',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Submissions</span>
            <h3 style={{ fontSize: '1.4rem', margin: '4px 0 0 0', fontWeight: '700' }}>{overtimes.length}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div className="flex-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Search Box */}
          <div className="flex-row" style={{ gap: '10px', flex: '1', minWidth: '240px' }}>
            <Search size={18} color="var(--text-secondary)" />
            <input
              type="text"
              className="form-control"
              placeholder={isAdmin ? 'Search employee name, department, or reason...' : 'Search by work details or reason...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex-row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            <Filter size={16} color="var(--text-secondary)" style={{ marginRight: '4px' }} />
            {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
              <button
                key={st}
                className={`btn ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                onClick={() => setFilterStatus(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Data */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredOvertimes.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Clock size={48} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '12px' }} />
          <h3>No Overtime Requests Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {searchTerm || filterStatus !== 'All'
              ? 'Try adjusting your filters or search terms.'
              : isAdmin
              ? 'No employee has submitted overtime requests yet.'
              : 'You have not submitted any overtime requests yet.'}
          </p>
        </div>
      ) : (
        <div className="table-container card" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Request ID</th>
                {isAdmin && <th style={{ padding: '12px 16px' }}>Employee</th>}
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Hours</th>
                <th style={{ padding: '12px 16px' }}>Rate / Hr</th>
                <th style={{ padding: '12px 16px' }}>Total Amount</th>
                <th style={{ padding: '12px 16px' }}>Reason / Details</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                {isAdmin && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredOvertimes.map((item) => {
                const amount = item.totalAmount || item.hours * (item.hourlyRate || 100);
                return (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>{item.overtimeId}</td>

                    {isAdmin && (
                      <td style={{ padding: '14px 16px' }}>
                        <div className="flex-row" style={{ gap: '10px' }}>
                          {item.user?.profileImage ? (
                            <img
                              src={item.user.profileImage}
                              alt=""
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                              }}
                            >
                              {item.user?.fullName?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.user?.fullName || 'N/A'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {item.user?.department || 'General'}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}

                    <td style={{ padding: '14px 16px', fontSize: '0.9rem' }}>
                      <span className="flex-row" style={{ gap: '6px' }}>
                        <Calendar size={14} color="var(--text-secondary)" /> {item.date}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                      <span
                        style={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: '#6366f1',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                        }}
                      >
                        {item.hours} hrs
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '0.9rem' }}>₹{item.hourlyRate || 100}/hr</td>

                    <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--success)' }}>
                      ₹{amount.toLocaleString('en-IN')}
                    </td>

                    <td style={{ padding: '14px 16px', maxWidth: '240px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.reason}</div>
                      {item.reviewNotes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <em>Note: {item.reviewNotes}</em>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        className={`badge ${
                          item.status === 'Approved'
                            ? 'badge-success'
                            : item.status === 'Rejected'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {item.status === 'Approved' && <CheckCircle2 size={12} />}
                        {item.status === 'Rejected' && <XCircle size={12} />}
                        {item.status === 'Pending' && <Clock size={12} />}
                        {item.status}
                      </span>
                    </td>

                    {isAdmin && (
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {item.status === 'Pending' ? (
                          <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              className="btn btn-success"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => openReviewModal(item, 'Approved')}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => openReviewModal(item, 'Rejected')}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            onClick={() => openReviewModal(item, item.status)}
                          >
                            Edit Review
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee Overtime Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content card" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: 'var(--card-bg, #fff)' }}>
            <div className="modal-header flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }} className="flex-row">
                <Clock color="var(--primary)" size={22} style={{ marginRight: '8px' }} /> Submit Overtime Request
              </h2>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setShowRequestModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>Date of Overtime</label>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: '100%', padding: '10px' }}
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>Overtime Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="16"
                  className="form-control"
                  style={{ width: '100%', padding: '10px' }}
                  value={reqHours}
                  onChange={(e) => setReqHours(e.target.value)}
                  placeholder="e.g. 2.5"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>Estimated Hourly Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  style={{ width: '100%', padding: '10px' }}
                  value={reqHourlyRate}
                  onChange={(e) => setReqHourlyRate(e.target.value)}
                  placeholder="e.g. 100"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Note: Admin may adjust hourly rate during review</span>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>Work Description / Reason</label>
                <textarea
                  className="form-control"
                  rows="3"
                  style={{ width: '100%', padding: '10px' }}
                  placeholder="Describe the tasks or urgent deliverables completed during overtime..."
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  required
                />
              </div>

              <div className="modal-footer flex-row" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingReq}>
                  {submittingReq ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Review Modal */}
      {selectedRequest && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content card" style={{ width: '100%', maxWidth: '520px', padding: '24px', background: 'var(--card-bg, #fff)' }}>
            <div className="modal-header flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Review Overtime Request</h2>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setSelectedRequest(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-secondary, #f8fafc)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
              <div><strong>Employee:</strong> {selectedRequest.user?.fullName} ({selectedRequest.user?.department || 'N/A'})</div>
              <div><strong>Date:</strong> {selectedRequest.date}</div>
              <div><strong>Requested Hours:</strong> {selectedRequest.hours} hrs</div>
              <div><strong>Reason:</strong> {selectedRequest.reason}</div>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>Review Status</label>
                <div className="flex-row" style={{ gap: '12px' }}>
                  <button
                    type="button"
                    className={`btn ${reviewStatus === 'Approved' ? 'btn-success' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setReviewStatus('Approved')}
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button
                    type="button"
                    className={`btn ${reviewStatus === 'Rejected' ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setReviewStatus('Rejected')}
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>

              {reviewStatus === 'Approved' && (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>Hourly Rate (₹/hr)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    style={{ width: '100%', padding: '10px' }}
                    value={reviewRate}
                    onChange={(e) => setReviewRate(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '4px', fontWeight: '600' }}>
                    Calculated Total Payout: ₹{(selectedRequest.hours * (parseFloat(reviewRate) || 0)).toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>Review Notes / Feedback</label>
                <textarea
                  className="form-control"
                  rows="2"
                  style={{ width: '100%', padding: '10px' }}
                  placeholder="Optional notes or feedback for the employee..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <div className="modal-footer flex-row" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedRequest(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? 'Saving...' : `Save ${reviewStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OvertimePage;
