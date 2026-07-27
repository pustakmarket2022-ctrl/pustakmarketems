import React, { useState, useEffect, useContext } from 'react';
import { CheckSquare, DollarSign, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import ClockInWidget from '../../components/common/ClockInWidget';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getTasks } from '../../services/taskService';
import { getSalaries } from '../../services/salaryService';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tRes = await getTasks({ limit: 5 });
        const sRes = await getSalaries({ limit: 5 });
        setTasks(tRes.data);
        setSalaries(sRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const pendingTasksCount = tasks.filter((t) => t.taskStatus !== 'Completed' && t.taskStatus !== 'Approved').length;
  const currentSalary = salaries[0] ? `₹${(salaries[0].totalEarnings || 0).toLocaleString('en-IN')}` : '₹0';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.fullName}!</h1>
          <p className="page-subtitle">
            {user?.designation} • {user?.department} Department ({user?.salaryType} Salary Model)
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid-cards">
        <StatCard
          icon={CheckSquare}
          title="Assigned Tasks"
          value={tasks.length}
          color="#6366F1"
        />
        <StatCard
          icon={Clock}
          title="Tasks In Progress"
          value={pendingTasksCount}
          color="#F59E0B"
        />
        <StatCard
          icon={DollarSign}
          title="Current Period Earnings"
          value={currentSalary}
          color="#10B981"
        />
        <StatCard
          icon={BookOpen}
          title="Department"
          value={user?.department}
          color="#0EA5E9"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Daily Clock In Widget */}
        <ClockInWidget />

        {/* Compensation Summary Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Compensation Structure</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Your active salary calculation model is <strong>{user?.salaryType}</strong>.
            </p>
          </div>

          <div
            style={{
              padding: '16px',
              background: 'var(--bg-input)',
              borderRadius: '12px',
              margin: '16px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {(user?.salaryType === 'Monthly' || user?.salaryType === 'Hybrid') && (
              <div className="flex-row" style={{ justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fixed Base Monthly Salary:</span>
                <strong>₹{(user?.fixedSalary || 0).toLocaleString('en-IN')}</strong>
              </div>
            )}
            {(user?.salaryType === 'Task Based' || user?.salaryType === 'Hybrid') && (
              <div className="flex-row" style={{ justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Per Task Incentive Rate:</span>
                <strong style={{ color: 'var(--success)' }}>₹{(user?.perTaskRate || 0).toLocaleString('en-IN')} / task</strong>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            * Task payments are released immediately after Admin review & approval.
          </div>
        </div>
      </div>

      {/* Active Tasks Widget */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>My Active Tasks</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Task Title</th>
                <th>Project</th>
                <th>Payment Amount</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                    No assigned tasks currently.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>{t.taskId}</strong>
                    </td>
                    <td>{t.taskTitle}</td>
                    <td>{t.project?.bookName}</td>
                    <td>
                      <strong style={{ color: 'var(--success)' }}>₹{(t.taskPaymentAmount || 0).toLocaleString('en-IN')}</strong>
                    </td>
                    <td>{new Date(t.deadline).toLocaleDateString()}</td>
                    <td>
                      <Badge text={t.taskStatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
