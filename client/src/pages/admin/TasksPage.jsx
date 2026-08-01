import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { getTasks, createTask, updateTask, deleteTask, reviewTask } from '../../services/taskService';
import { getProjects } from '../../services/projectService';
import { getUsers } from '../../services/userService';
import { exportReportExcel } from '../../services/reportService';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import TaskReviewModal from '../../components/tasks/TaskReviewModal';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { NotificationContext } from '../../context/NotificationContext';
import { LanguageContext } from '../../context/LanguageContext';

const taskStatuses = ['All Statuses', 'Pending', 'In Progress', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed'];

const TasksPage = () => {
  const { addToast } = useContext(NotificationContext);
  const { t } = useContext(LanguageContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchDependencies = async () => {
    try {
      const pRes = await getProjects({ limit: 100 });
      const eRes = await getUsers({ limit: 100 });
      setProjects(pRes.data);
      setEmployees(eRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTasks({
        page: currentPage,
        search,
        taskStatus: taskStatus === 'All Statuses' ? '' : taskStatus,
        assignedTo: selectedEmp,
        sortBy,
        limit: 10,
      });
      setTasks(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      addToast('Failed to fetch tasks', 'danger');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, taskStatus, selectedEmp, sortBy, addToast]);

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleOpenAdd = () => {
    setSelectedTask(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setSelectedTask(t);
    setIsFormModalOpen(true);
  };

  const handleOpenReview = (t) => {
    setSelectedTask(t);
    setIsReviewModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedTask) {
        await updateTask(selectedTask._id, data);
        addToast('Task updated successfully', 'success');
      } else {
        await createTask(data);
        addToast('Task created & assigned successfully', 'success');
      }
      setIsFormModalOpen(false);
      fetchTasks();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'danger');
    }
  };

  const handleReviewSubmit = async (taskId, reviewData) => {
    try {
      await reviewTask(taskId, reviewData);
      addToast(`Task submission ${reviewData.action.toLowerCase()} successfully`, 'success');
      setIsReviewModalOpen(false);
      fetchTasks();
    } catch (err) {
      addToast(err.response?.data?.message || 'Review action failed', 'danger');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete task '${title}'?`)) {
      try {
        await deleteTask(id);
        addToast('Task deleted', 'success');
        fetchTasks();
      } catch (err) {
        addToast(err.response?.data?.message || 'Delete failed', 'danger');
      }
    }
  };

  const getFileUrl = (att) => {
    if (!att) return '#';
    const filePath = typeof att === 'string' ? att : (att.filePath || att.path || att.url || '');
    if (!filePath) return '#';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    const backendUrl = process.env.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL.replace('/api', '')
      : 'http://localhost:5000';
    return `${backendUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Task & Working File Deliverables</h1>
          <p className="page-subtitle">Assign editorial tasks, set task payments, & download employee working files</p>
        </div>
        <div className="flex-row" style={{ gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={async () => {
              try {
                const params = {};
                if (selectedEmp) params.user = selectedEmp;
                const res = await exportReportExcel('tasks', params);
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Tasks_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                addToast('Tasks Excel Report exported successfully!', 'success');
              } catch (e) {
                addToast('Failed to export Excel', 'danger');
              }
            }}
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} /> {t('assignTask')}
          </button>
        </div>
      </div>

      <div className="search-filter-panel">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Search task title, ID, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-row" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="createdAt_desc">📅 Assign Date: Latest First</option>
            <option value="createdAt_asc">📅 Assign Date: Oldest First</option>
            <option value="deadline_asc">⏰ Deadline: Earliest First</option>
            <option value="deadline_desc">⏰ Deadline: Latest First</option>
          </select>

          <select
            className="form-select"
            value={selectedEmp}
            onChange={(e) => {
              setSelectedEmp(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">-- Filter By Employee --</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.fullName} ({emp.department})
              </option>
            ))}
          </select>

          <select className="form-select" value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)}>
            {taskStatuses.map((s) => (
              <option key={s} value={s === 'All Statuses' ? '' : s}>
                {s}
              </option>
            ))}
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
                <th>Task ID</th>
                <th>Task Title</th>
                <th>Project</th>
                <th>Assigned Staff</th>
                <th>Assign Date</th>
                <th>Deadline</th>
                <th>Payment</th>
                <th>Working File</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map((taskItem) => (
                  <tr key={taskItem._id}>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>{taskItem.taskId}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{taskItem.taskTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Est. {taskItem.estimatedHours} hrs | {taskItem.progressPercentage}% Complete
                      </div>
                    </td>
                    <td>
                      {taskItem.project ? (
                        <span>📖 {taskItem.project.bookName || taskItem.project.projectName}</span>
                      ) : (
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          🏢 General Office Work
                        </span>
                      )}
                    </td>
                    <td>
                      {(taskItem.assignedTo || []).map((u) => u.fullName).join(', ') || 'Unassigned'}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {taskItem.createdAt ? new Date(taskItem.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color:
                            taskItem.deadline && new Date(taskItem.deadline) < new Date() && taskItem.taskStatus !== 'Completed' && taskItem.taskStatus !== 'Approved'
                              ? '#dc2626'
                              : 'inherit',
                        }}
                      >
                        {taskItem.deadline ? new Date(taskItem.deadline).toLocaleDateString('en-IN') : 'N/A'}
                        {taskItem.deadline && new Date(taskItem.deadline) < new Date() && taskItem.taskStatus !== 'Completed' && taskItem.taskStatus !== 'Approved' && (
                          <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700 }}>Overdue</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--success)' }}>₹{(taskItem.taskPaymentAmount || 0).toLocaleString('en-IN')}</strong>
                      {taskItem.pageCount > 0 && taskItem.ratePerPage > 0 && (
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          ({taskItem.pageCount} pgs × ₹{taskItem.ratePerPage}/pg)
                        </div>
                      )}
                    </td>
                    <td>
                      {taskItem.attachments && taskItem.attachments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {taskItem.attachments.map((att, idx) => {
                            const fileName = typeof att === 'string' ? att.split('/').pop() : (att.fileName || 'Attachment');
                            return (
                              <a
                                key={idx}
                                href={getFileUrl(att)}
                                download={fileName}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title={`Download ${fileName}`}
                              >
                                <Download size={13} color="var(--primary)" /> {fileName.length > 15 ? `${fileName.substring(0, 15)}...` : fileName}
                              </a>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No File Uploaded</span>
                      )}
                    </td>
                    <td>
                      <Badge text={taskItem.priority} />
                    </td>
                    <td>
                      <Badge text={taskItem.taskStatus} />
                    </td>
                    <td>
                      <div className="flex-row" style={{ gap: '6px' }}>
                        {(taskItem.taskStatus === 'Submitted' || taskItem.taskStatus === 'Under Review') && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenReview(taskItem)}
                            title="Review Work"
                          >
                            <CheckCircle2 size={14} /> Review
                          </button>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(taskItem)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(taskItem._id, taskItem.taskTitle)}>
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

      <Pagination currentPage={currentPage} totalPages={pages} onPageChange={(p) => setCurrentPage(p)} />

      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        projects={projects}
        employees={employees}
        initialData={selectedTask}
        isEdit={!!selectedTask}
      />

      <TaskReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReview={handleReviewSubmit}
        task={selectedTask}
      />
    </div>
  );
};

export default TasksPage;
