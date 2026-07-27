import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';
import { getMyAttendance, applyLeave, getLeaves } from '../../services/attendanceService';
import ClockInWidget from '../../components/common/ClockInWidget';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { NotificationContext } from '../../context/NotificationContext';

const leaveTypes = ['Casual', 'Sick', 'Paid', 'Unpaid'];

const MyAttendancePage = () => {
  const { addToast } = useContext(NotificationContext);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Leave Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const aRes = await getMyAttendance();
      const lRes = await getLeaves();
      setAttendanceLogs(aRes.history);
      setLeaves(lRes.data);
    } catch (err) {
      addToast('Failed to fetch attendance history', 'danger');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await applyLeave(leaveForm);
      addToast('Leave application submitted successfully', 'success');
      setIsLeaveModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit leave', 'danger');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance & Leaves</h1>
          <p className="page-subtitle">Clock in/out daily, track working hours, and submit leave requests</p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsLeaveModalOpen(true)}>
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <ClockInWidget />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Attendance History */}
        <div className="card">
          <h3 className="flex-row" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            <Clock size={18} color="var(--primary)" /> 30-Day Attendance Log
          </h3>
          <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                      No history logs.
                    </td>
                  </tr>
                ) : (
                  attendanceLogs.map((item) => (
                    <tr key={item._id}>
                      <td>{item.date}</td>
                      <td>{item.checkIn ? new Date(item.checkIn).toLocaleTimeString() : '-'}</td>
                      <td>{item.checkOut ? new Date(item.checkOut).toLocaleTimeString() : '-'}</td>
                      <td>{item.workingHours || 0} hrs</td>
                      <td>
                        <Badge text={item.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Requests */}
        <div className="card">
          <h3 className="flex-row" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            <Calendar size={18} color="var(--accent)" /> My Leave Applications
          </h3>
          <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                      No leave applications submitted.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l._id}>
                      <td>
                        <Badge text={l.leaveType} />
                      </td>
                      <td>
                        {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td>{l.totalDays} Days</td>
                      <td>
                        <Badge text={l.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply for Leave"
        maxWidth="550px"
      >
        <form onSubmit={handleApplyLeave}>
          <div className="form-group">
            <label className="form-label">Leave Type *</label>
            <select
              className="form-select"
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
            >
              {leaveTypes.map((t) => (
                <option key={t} value={t}>
                  {t} Leave
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-input"
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-input"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Leave *</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsLeaveModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Leave Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyAttendancePage;
