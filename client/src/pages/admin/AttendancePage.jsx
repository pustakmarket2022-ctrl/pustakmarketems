import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Clock, Calendar, Check, X, FileSpreadsheet, Edit, Plus, UserCheck } from 'lucide-react';
import { getAttendance, getLeaves, reviewLeave, updateAttendance, markAttendanceManual } from '../../services/attendanceService';
import { getUsers } from '../../services/userService';
import { exportReportExcel } from '../../services/reportService';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { NotificationContext } from '../../context/NotificationContext';

const statusOptions = ['Present', 'Absent', 'Half Day', 'Leave', 'Overtime', 'Holiday'];

const AttendancePage = () => {
  const { addToast } = useContext(NotificationContext);
  const [tab, setTab] = useState('attendance'); // 'attendance' | 'leaves'
  const [logs, setLogs] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Edit / Manual Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [editForm, setEditForm] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkIn: '',
    checkOut: '',
    workingHours: 8,
    reason: 'Admin Presenty Update',
    notes: '',
  });

  useEffect(() => {
    getUsers({ limit: 100 }).then((res) => setEmployees(res.data || [])).catch(() => {});
  }, []);

  const fetchAttendanceLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 15 };
      if (selectedEmp) params.user = selectedEmp;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await getAttendance(params);
      setLogs(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      addToast('Failed to fetch attendance logs', 'danger');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedEmp, startDate, endDate, addToast]);

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

  const handleOpenManualModal = (log = null) => {
    if (log) {
      setSelectedLog(log);
      setEditForm({
        userId: log.user?._id || log.user,
        date: log.date || new Date().toISOString().split('T')[0],
        status: log.status || 'Present',
        checkIn: log.checkIn ? new Date(log.checkIn).toISOString().substring(11, 16) : '',
        checkOut: log.checkOut ? new Date(log.checkOut).toISOString().substring(11, 16) : '',
        workingHours: log.workingHours || 8,
        reason: 'Admin Presenty Update',
        notes: log.notes || '',
      });
    } else {
      setSelectedLog(null);
      setEditForm({
        userId: employees[0]?._id || '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
        checkIn: '09:30',
        checkOut: '18:30',
        workingHours: 9,
        reason: 'Admin Manual Entry',
        notes: '',
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    try {
      if (selectedLog) {
        await updateAttendance(selectedLog._id, editForm);
        addToast(`Attendance status updated for ${selectedLog.user?.fullName}`, 'success');
      } else {
        await markAttendanceManual(editForm);
        addToast('Attendance marked successfully', 'success');
      }
      setIsEditModalOpen(false);
      fetchAttendanceLogs();
    } catch (err) {
      addToast('Failed to update attendance record', 'danger');
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params = {};
      if (selectedEmp) params.user = selectedEmp;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await exportReportExcel('attendance', params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('Attendance Excel Report exported successfully!', 'success');
    } catch (err) {
      addToast('Failed to export Excel report', 'danger');
    } finally {
      setExporting(false);
    }
  };

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
          <h1 className="page-title">Attendance & Presenty Management</h1>
          <p className="page-subtitle">Admin attendance override, daily check-in logs, leave approvals, and Excel reports</p>
        </div>

        <div className="flex-row" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => handleOpenManualModal(null)}>
            <Plus size={16} /> Mark / Edit Presenty
          </button>
          <button className="btn btn-secondary" onClick={handleExportExcel} disabled={exporting}>
            <FileSpreadsheet size={16} /> {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
          <button
            className="btn btn-secondary"
            style={{ background: tab === 'attendance' ? 'var(--primary-light)' : undefined, color: tab === 'attendance' ? 'var(--primary)' : undefined }}
            onClick={() => setTab('attendance')}
          >
            <Clock size={16} /> Daily Attendance Logs
          </button>
          <button
            className="btn btn-secondary"
            style={{ background: tab === 'leaves' ? 'var(--primary-light)' : undefined, color: tab === 'leaves' ? 'var(--primary)' : undefined }}
            onClick={() => setTab('leaves')}
          >
            <Calendar size={16} /> Leave Applications ({leaves.filter((l) => l.status === 'Pending').length})
          </button>
        </div>
      </div>

      {tab === 'attendance' && (
        <div className="search-filter-panel" style={{ marginBottom: '20px' }}>
          <div className="flex-row" style={{ gap: '12px', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">Filter By Employee</label>
              <select
                className="form-select"
                value={selectedEmp}
                onChange={(e) => {
                  setSelectedEmp(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">-- All Employees --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName} ({emp.department} - {emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 150px' }}>
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div style={{ flex: '1 1 150px' }}>
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {(selectedEmp || startDate || endDate) && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSelectedEmp('');
                    setStartDate('');
                    setEndDate('');
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No attendance records found for selected criteria.
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
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => handleOpenManualModal(item)}
                          title="Edit Presenty Status"
                        >
                          <Edit size={14} /> Update Presenty
                        </button>
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

      {/* Admin Edit Presenty Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedLog ? `Update Attendance Presenty - ${selectedLog.user?.fullName || ''} (${selectedLog.date})` : 'Mark / Update Employee Attendance'}
        maxWidth="500px"
      >
        <form onSubmit={handleSaveAttendance}>
          {!selectedLog && (
            <div className="form-group">
              <label className="form-label">Select Employee *</label>
              <select
                className="form-select"
                value={editForm.userId}
                onChange={(e) => setEditForm({ ...editForm, userId: e.target.value })}
                required
              >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName} ({emp.department} - {emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Attendance Date *</label>
            <input
              type="date"
              className="form-input"
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Presenty Status *</label>
            <select
              className="form-select"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              required
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Working Hours (hrs)</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={editForm.workingHours}
                onChange={(e) => setEditForm({ ...editForm, workingHours: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Audit Note</label>
              <input
                type="text"
                className="form-input"
                placeholder="Reason for presenty update..."
                value={editForm.reason}
                onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Presenty Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
