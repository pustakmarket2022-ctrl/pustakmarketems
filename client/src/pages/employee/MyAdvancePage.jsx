import React, { useState, useEffect, useContext } from 'react';
import { CreditCard, Plus, Clock } from 'lucide-react';
import { getAdvances, requestAdvance } from '../../services/advanceService';
import { NotificationContext } from '../../context/NotificationContext';

const MyAdvancePage = () => {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useContext(NotificationContext);

  const fetchMyAdvances = async () => {
    try {
      setLoading(true);
      const res = await getAdvances();
      setAdvances(res.data || []);
    } catch (e) {
      addToast('Failed to fetch advances', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAdvances();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !reason) return;
    setSubmitting(true);
    try {
      await requestAdvance({ amount: Number(amount), reason });
      addToast('Advance salary request submitted successfully', 'success');
      setShowModal(false);
      setAmount('');
      setReason('');
      fetchMyAdvances();
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to submit request', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header flex-row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title flex-row" style={{ gap: '10px' }}>
            <CreditCard color="var(--primary)" size={28} /> My Advance Salary Requests
          </h1>
          <p className="page-subtitle">Request salary advance and track approval status</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Request Advance
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>Loading your requests...</div>
        ) : advances.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No advance salary requests. Click "Request Advance" to submit a new request.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Date Requested</th>
                </tr>
              </thead>
              <tbody>
                {advances.map((req) => (
                  <tr key={req._id}>
                    <td><strong>{req.advanceId}</strong></td>
                    <td><strong style={{ color: 'var(--primary)' }}>₹{req.amount?.toLocaleString()}</strong></td>
                    <td style={{ maxWidth: '300px' }}>{req.reason}</td>
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
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Request Advance Salary</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Advance Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  min="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount (e.g. 5000)"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Advance</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Medical emergency, urgent personal needs, etc."
                  required
                />
              </div>

              <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAdvancePage;
