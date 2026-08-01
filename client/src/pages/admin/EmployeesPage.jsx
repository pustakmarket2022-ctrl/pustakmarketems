import React, { useState, useEffect, useContext, useCallback } from 'react';
import { UserPlus, Search, Edit2, Trash2, Filter, KeyRound, RefreshCw } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser, adminResetUserPassword } from '../../services/userService';
import EmployeeFormModal from '../../components/employees/EmployeeFormModal';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { NotificationContext } from '../../context/NotificationContext';
import { LanguageContext } from '../../context/LanguageContext';

const standardDeptList = [
  'Editorial',
  'Content Writing',
  'Proofreading',
  'Graphic Design',
  'Marketing',
  'Sales',
  'Printing',
  'Warehouse',
  'Accounts',
  'HR',
  'IT',
];

const EmployeesPage = () => {
  const { addToast } = useContext(NotificationContext);
  const { t } = useContext(LanguageContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [salaryType, setSalaryType] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Reset Password Modal State
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetTargetEmp, setResetTargetEmp] = useState(null);
  const [newPassword, setNewPassword] = useState('EMS@123456');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({
        page: currentPage,
        search,
        department: department === 'All Departments' ? '' : department,
        salaryType: salaryType === 'All Models' ? '' : salaryType,
        status: status === 'All Statuses' ? '' : status,
        limit: 10,
      });
      setEmployees(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      addToast('Failed to fetch employees list', 'danger');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, department, salaryType, status, addToast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOpenAdd = () => {
    setSelectedEmp(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp);
    setIsModalOpen(true);
  };

  const handleOpenResetPassword = (emp) => {
    setResetTargetEmp(emp);
    setNewPassword('EMS@123456');
    setIsResetPasswordModalOpen(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetTargetEmp || !newPassword) return;
    setResetSubmitting(true);
    try {
      await adminResetUserPassword(resetTargetEmp._id, newPassword);
      addToast(`Password for ${resetTargetEmp.fullName} reset successfully!`, 'success');
      setIsResetPasswordModalOpen(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Password reset failed', 'danger');
    } finally {
      setResetSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedEmp) {
        await updateUser(selectedEmp._id, formData);
        addToast('Employee details updated successfully', 'success');
      } else {
        await createUser(formData);
        addToast('New employee created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'danger');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete employee '${name}'?`)) {
      try {
        await deleteUser(id);
        addToast('Employee deleted', 'success');
        fetchEmployees();
      } catch (err) {
        addToast(err.response?.data?.message || 'Delete failed', 'danger');
      }
    }
  };

  // Combine standard and any custom departments in the current list
  const activeDepartments = Array.from(
    new Set([...standardDeptList, ...employees.map((e) => e.department).filter(Boolean)])
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('employees')}</h1>
          <p className="page-subtitle">Manage publication editorial staff, custom departments, designations, & compensation</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <UserPlus size={18} /> {t('addEmployee')}
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="search-filter-panel">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Search employee name, ID, email, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-row" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All Departments</option>
            {activeDepartments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select className="form-select" value={salaryType} onChange={(e) => setSalaryType(e.target.value)}>
            <option value="">All Salary Models</option>
            <option value="Monthly">Monthly Fixed</option>
            <option value="Task Based">Per Task Based</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('employeeId')}</th>
                <th>{t('fullName')}</th>
                <th>{t('department')}</th>
                <th>{t('designation')}</th>
                <th>{t('salaryModel')}</th>
                <th>{t('compensation')}</th>
                <th>{t('status')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No employee records found matching your filters.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>{emp.employeeId}</strong>
                    </td>
                    <td>
                      <div className="flex-row" style={{ gap: '10px' }}>
                        {emp.profileImage ? (
                          <img src={emp.profileImage} alt={emp.fullName} className="avatar avatar-sm" />
                        ) : (
                          <div className="avatar-placeholder avatar-sm">
                            {emp.fullName ? emp.fullName.charAt(0).toUpperCase() : 'E'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700 }}>{emp.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{emp.department}</strong>
                    </td>
                    <td>{emp.designation}</td>
                    <td>
                      <Badge text={emp.salaryType} />
                    </td>
                    <td>
                      {emp.salaryType === 'Monthly' && (
                        <span>₹{(emp.fixedSalary || 0).toLocaleString('en-IN')}/mo</span>
                      )}
                      {emp.salaryType === 'Task Based' && (
                        <span>₹{(emp.perTaskRate || 0).toLocaleString('en-IN')}/task</span>
                      )}
                      {emp.salaryType === 'Hybrid' && (
                        <span>
                          ₹{(emp.fixedSalary || 0).toLocaleString('en-IN')} + ₹{(emp.perTaskRate || 0).toLocaleString('en-IN')}/task
                        </span>
                      )}
                    </td>
                    <td>
                      <Badge text={emp.status} />
                    </td>
                    <td>
                      <div className="flex-row" style={{ gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit Employee"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleOpenResetPassword(emp)}
                          title="Reset Employee Password"
                          style={{ background: '#f59e0b', color: '#fff', border: 'none' }}
                        >
                          <KeyRound size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(emp._id, emp.fullName)}
                          title="Delete Employee"
                        >
                          <Trash2 size={14} />
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

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={pages} onPageChange={(p) => setCurrentPage(p)} />

      {/* Modal Form */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedEmp}
        isEdit={!!selectedEmp}
      />

      {/* Admin Direct Reset Password Modal */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title={`Reset Password for ${resetTargetEmp?.fullName || 'Employee'}`}
        maxWidth="480px"
      >
        <form onSubmit={handleResetPasswordSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Set a new password for <strong>{resetTargetEmp?.fullName}</strong> ({resetTargetEmp?.employeeId} - {resetTargetEmp?.email}). An email & notification will automatically be sent to the employee.
            </p>

            <div className="form-group">
              <label className="form-label">New Password *</label>
              <div className="flex-row" style={{ gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm flex-row"
                  onClick={generateRandomPassword}
                  title="Generate Random Password"
                  style={{ whiteSpace: 'nowrap', gap: '4px' }}
                >
                  <RefreshCw size={14} /> Auto Generate
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsResetPasswordModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={resetSubmitting}>
              {resetSubmitting ? 'Resetting...' : 'Set New Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
