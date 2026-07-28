import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, DollarSign, Clock, BookOpen, Award, CreditCard, Calendar } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import ClockInWidget from '../../components/common/ClockInWidget';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TodoWidget from '../../components/employee/TodoWidget';
import { getTasks } from '../../services/taskService';
import { getSalaries } from '../../services/salaryService';
import { getBestEmployee } from '../../services/userService';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [bestEmp, setBestEmp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tRes = await getTasks({ limit: 5 });
        const sRes = await getSalaries({ limit: 5 });
        const bRes = await getBestEmployee();
        setTasks(tRes.data || []);
        setSalaries(sRes.data || []);
        setBestEmp(bRes.data);
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
  const bestEmpUser = bestEmp?.employee;

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

      {/* Best Employee Highlight Banner */}
      {bestEmpUser && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#fff',
            marginBottom: '24px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Award size={36} color="#fbbf24" />
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, color: '#fbbf24' }}>
              BEST EMPLOYEE OF THE MONTH
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
              {bestEmpUser.fullName} ({bestEmpUser.designation} - {bestEmpUser.department})
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              {bestEmp.reason || 'Outstanding performance & dedication.'}
            </div>
          </div>
        </div>
      )}

      {/* Clickable Stats Overview */}
      <div className="grid-cards" style={{ marginBottom: '24px' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/employee/tasks')}>
          <StatCard icon={CheckSquare} title="Assigned Tasks" value={tasks.length} color="#6366F1" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/employee/tasks')}>
          <StatCard icon={Clock} title="Tasks In Progress" value={pendingTasksCount} color="#F59E0B" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/employee/salary')}>
          <StatCard icon={DollarSign} title="Current Period Earnings" value={currentSalary} color="#10B981" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/employee/advances')}>
          <StatCard icon={CreditCard} title="My Advances" value="View / Request" color="#0EA5E9" />
        </div>
      </div>

      {/* Clock In & Todo Widget Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        <ClockInWidget />
        <TodoWidget />
      </div>

      {/* Active Tasks Table */}
      <div className="card">
        <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Active Tasks</h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/employee/tasks')}>
            View All Tasks
          </button>
        </div>
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
                    <td><strong style={{ color: 'var(--primary)' }}>{t.taskId}</strong></td>
                    <td>{t.taskTitle}</td>
                    <td>{t.project?.bookName}</td>
                    <td><strong style={{ color: 'var(--success)' }}>₹{(t.taskPaymentAmount || 0).toLocaleString('en-IN')}</strong></td>
                    <td>{new Date(t.deadline).toLocaleDateString()}</td>
                    <td><Badge text={t.taskStatus} /></td>
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
