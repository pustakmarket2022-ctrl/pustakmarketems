import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  BookOpen,
  FolderCheck,
  CheckSquare,
  Clock,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Plus,
  FileSpreadsheet,
  BookMarked,
  Award,
  CreditCard,
  Calendar,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { getDashboardStats, selectBestEmployee, getUsers } from '../../services/userService';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { NotificationContext } from '../../context/NotificationContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const { addToast } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBestEmpModal, setShowBestEmpModal] = useState(false);

  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [awardTitle, setAwardTitle] = useState('Best Employee of the Month');
  const [reason, setReason] = useState('Outstanding dedication and performance');
  const [submittingBestEmp, setSubmittingBestEmp] = useState(false);

  const adminName = user?.fullName || 'Milind Kasbe';

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const openBestEmpModal = async () => {
    try {
      const res = await getUsers({ limit: 100 });
      setEmployeeList(res.data || []);
      setShowBestEmpModal(true);
    } catch (e) {
      addToast('Failed to load employees list', 'danger');
    }
  };

  const handleSelectBestEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    setSubmittingBestEmp(true);
    try {
      await selectBestEmployee({ employeeId: selectedEmpId, awardTitle, reason });
      addToast('Best Employee of Month updated successfully!', 'success');
      setShowBestEmpModal(false);
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to select Best Employee', 'danger');
    } finally {
      setSubmittingBestEmp(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const cards = data?.cards || {};
  const charts = data?.charts || {};
  const bestEmp = data?.bestEmployee?.employee;

  // Chart 1: Department Distribution
  const deptLabels = (charts.deptDistribution || []).map((d) => d._id);
  const deptCounts = (charts.deptDistribution || []).map((d) => d.count);

  const deptChartData = {
    labels: deptLabels.length ? deptLabels : ['Editorial', 'Graphics', 'Printing', 'Warehouse'],
    datasets: [
      {
        data: deptCounts.length ? deptCounts : [4, 2, 3, 2],
        backgroundColor: ['#6366F1', '#8B5CF6', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899'],
        borderWidth: 0,
      },
    ],
  };

  // Chart 2: Task Status Breakdown
  const taskStatusLabels = (charts.taskStatusCounts || []).map((t) => t._id);
  const taskStatusCounts = (charts.taskStatusCounts || []).map((t) => t.count);

  const taskChartData = {
    labels: taskStatusLabels.length ? taskStatusLabels : ['Pending', 'In Progress', 'Submitted', 'Approved'],
    datasets: [
      {
        label: 'Tasks Count',
        data: taskStatusCounts.length ? taskStatusCounts : [3, 5, 2, 8],
        backgroundColor: ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981'],
        borderWidth: 0,
      },
    ],
  };

  // Chart 3: Project Progress
  const projLabels = (charts.projectProgress || []).map((p) => p.bookName || p.projectName);
  const projProgress = (charts.projectProgress || []).map((p) => p.completionPercentage);

  const projChartData = {
    labels: projLabels.length ? projLabels : ['Shivaji Maharaj', 'Vedic Maths', 'Bal Panchatantra'],
    datasets: [
      {
        label: 'Completion %',
        data: projProgress.length ? projProgress : [75, 60, 85],
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="page-container">
      {/* Executive Banner Header */}
      <div
        className="card"
        style={{
          padding: '28px 36px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div className="flex-row" style={{ gap: '8px', marginBottom: '8px' }}>
            <Badge text="Chief Editor & Admin Portal" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pustak Market Enterprise</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {t('welcomeBack') || 'Welcome Back'}, {adminName} Sir! 🙏
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Publication operations, employee workflows & real-time analytics
          </p>
        </div>

        <div className="flex-row" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/employees')}>
            <Plus size={16} /> {t('addEmployee') || 'Add Employee'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={openBestEmpModal}>
            <Award size={16} /> Award Best Employee
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/advances')}>
            <CreditCard size={16} /> Advances ({cards.pendingAdvancesCount || 0})
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/reports')}>
            <FileSpreadsheet size={16} /> Export Reports
          </button>
        </div>
      </div>

      {/* Best Employee of Month Highlight Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#fff',
          marginBottom: '24px',
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div className="flex-row" style={{ gap: '16px' }}>
          {bestEmp?.profileImage ? (
            <img
              src={bestEmp.profileImage}
              alt={bestEmp.fullName}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #ffffff',
              }}
            />
          ) : (
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ffffff22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff44',
              }}
            >
              <Award size={32} color="#fff" />
            </div>
          )}
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, opacity: 0.9 }}>
              ⭐ BEST EMPLOYEE OF THE MONTH ⭐
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '2px' }}>
              {bestEmp ? `${bestEmp.fullName} (${bestEmp.designation} - ${bestEmp.department})` : 'Not Selected Yet'}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.95, marginTop: '2px' }}>
              {data?.bestEmployee?.reason || 'Recognized for exceptional contribution & publishing excellence.'}
            </div>
          </div>
        </div>
        <div className="flex-row" style={{ gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/admin/leaderboard')}
            style={{ color: '#fff', borderColor: '#fff' }}
          >
            <Trophy size={16} /> Leaderboard Standings
          </button>
          <button
            type="button"
            onClick={openBestEmpModal}
            style={{
              background: '#ffffff',
              color: '#d97706',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Select Best Employee
          </button>
        </div>
      </div>

      {/* Clickable Stat Cards Grid */}
      <div className="grid-cards">
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/employees')}>
          <StatCard icon={Users} title="Total Workforce" value={cards.totalEmployees || 0} color="#6366F1" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/employees')}>
          <StatCard icon={UserCheck} title="Active Employees" value={cards.activeEmployees || 0} color="#10B981" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/projects')}>
          <StatCard icon={BookOpen} title="Publication Projects" value={cards.totalProjects || 0} color="#0EA5E9" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/tasks')}>
          <StatCard icon={CheckSquare} title="Total Tasks" value={cards.totalTasks || 0} color="#3B82F6" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/tasks')}>
          <StatCard icon={Clock} title="Pending Tasks" value={cards.pendingTasks || 0} color="#F59E0B" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/attendance')}>
          <StatCard icon={UserCheck} title="Today Attendance" value={cards.attendanceToday || 0} color="#EC4899" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/advances')}>
          <StatCard
            icon={CreditCard}
            title="Pending Advances"
            value={`${cards.pendingAdvancesCount || 0} (₹${(cards.pendingAdvancesTotal || 0).toLocaleString()})`}
            color="#F59E0B"
          />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/advances')}>
          <StatCard
            icon={CreditCard}
            title="Approved Advances"
            value={`₹${(cards.approvedAdvancesTotal || 0).toLocaleString()}`}
            color="#10B981"
          />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/advances')}>
          <StatCard
            icon={CreditCard}
            title="Paid Advances"
            value={`₹${(cards.paidAdvancesTotal || 0).toLocaleString()}`}
            color="#0EA5E9"
          />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/payroll')}>
          <StatCard
            icon={DollarSign}
            title="Monthly Payroll Expense"
            value={`₹ ${(cards.monthlySalaryExpense || 0).toLocaleString('en-IN')}`}
            color="#8B5CF6"
          />
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid-charts">
        {/* Department Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Department Workforce Breakdown</h3>
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={deptChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: 'var(--text-main)' } } },
              }}
            />
          </div>
        </div>

        {/* Task Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Publication Task Status</h3>
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={taskChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: 'var(--text-main)' } } },
              }}
            />
          </div>
        </div>

        {/* Project Progress */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Book Publication Progress Tracker</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Monitored by Admin & Chief Editor
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/projects')}>
              Manage Projects <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ height: '280px' }}>
            <Bar
              data={projChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { max: 100, ticks: { color: 'var(--text-secondary)', callback: (v) => `${v}%` } },
                  x: { ticks: { color: 'var(--text-secondary)' } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Select Best Employee Modal */}
      {showBestEmpModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Select Best Employee of the Month</h3>
            <form onSubmit={handleSelectBestEmployee}>
              <div className="form-group">
                <label className="form-label">Select Employee</label>
                <select
                  className="form-select"
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Employee --</option>
                  {employeeList.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName} ({emp.department} - {emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Award Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={awardTitle}
                  onChange={(e) => setAwardTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason / Citation</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBestEmpModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingBestEmp}>
                  {submittingBestEmp ? 'Saving...' : 'Set as Best Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
