import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Clock, Calendar, Check, X } from 'lucide-react';
import { getAttendance, getLeaves, reviewLeave } from '../../services/attendanceService';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { NotificationContext } from '../../context/NotificationContext';

const AttendancePage = () => {
  const { addToast } = useContext(NotificationContext);
  const [tab, setTab] = useState('attendance'); // 'attendance' | 'leaves'
  const [logs, setLogs] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAttendanceLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAttendance({ page: currentPage, limit: 15 });
      setLogs(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      addToast('Failed to fetch attendance logs', 'danger');
    } finally {
      setLoading(false);
    }
  }, [currentPage, addToast]);

  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeaves();
      setLeaves(res.data);
    } catch (err) {
      addToast('Failed to fetch leave applications', 'danger');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (tab === 'attendance') {
      fetchAttendanceLogs();
    } else {
      fetchLeaveRequests();
    }
  }, [tab, fetchAttendanceLogs, fetchLeaveRequests]);

  const handleReviewLeave = async (id, status) => {
    try {
      await reviewLeave(id, { status, reviewNotes: `Decision by Admin` });
      addToast(`Leave application marked as ${status}`, 'success');
      fetchLeaveRequests();
    } catch (err) {
      addToast('Action failed', 'danger');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance & Leave Management</h1>
          <p className="page-subtitle">Track daily clock-in/out logs, working hours, and review employee leave requests</p>
        </div>

        <div className="flex-row" style={{ gap: '10px' }}>
          <button
            className={`btn ${tab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('attendance')}
          >
            <Clock size={16} /> Daily Attendance Logs
          </button>
          <button
            className={`btn ${tab === 'leaves' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('leaves')}
          >
            <Calendar size={16} /> Leave Applications ({leaves.filter((l) => l.status === 'Pending').length})
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : tab === 'attendance' ? (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee ID</th>
                  <th>Staff Name</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  logs.map((item) => (
                    <tr key={item._id}>
                      <td>{item.date}</td>
                      <td>
                        <strong style={{ color: 'var(--primary)' }}>{item.user?.employeeId}</strong>
                      </td>
                      <td>{item.user?.fullName}</td>
                      <td>{item.user?.department}</td>
                      <td>{item.checkIn ? new Date(item.checkIn).toLocaleTimeString() : '-'}</td>
                      <td>{item.checkOut ? new Date(item.checkOut).toLocaleTimeString() : '-'}</td>
                      <td>
                        <strong>{item.workingHours || 0} hrs</strong>
                      </td>
                      <td>
                        <Badge text={item.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={pages} onPageChange={(p) => setCurrentPage(p)} />
        </>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant Staff</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{l.user?.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.user?.department}</div>
                    </td>
                    <td>
                      <Badge text={l.leaveType} />
                    </td>
                    <td>{new Date(l.startDate).toLocaleDateString()}</td>
                    <td>{new Date(l.endDate).toLocaleDateString()}</td>
                    <td>
                      <strong>{l.totalDays} Days</strong>
                    </td>
                    <td style={{ maxWidth: '250px' }}>{l.reason}</td>
                    <td>
                      <Badge text={l.status} />
                    </td>
                    <td>
                      {l.status === 'Pending' ? (
                        <div className="flex-row" style={{ gap: '6px' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleReviewLeave(l._id, 'Approved')}
                            title="Approve Leave"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReviewLeave(l._id, 'Rejected')}
                            title="Reject Leave"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
