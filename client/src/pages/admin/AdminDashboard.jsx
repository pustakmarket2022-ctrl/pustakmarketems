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
  Zap,
  Sparkles,
  ChevronRight,
  BookMarked,
  ShieldCheck,
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
import { getDashboardStats } from '../../services/userService';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';

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
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminName = user?.fullName || 'Milind Kasbe';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const cards = data?.cards || {};
  const charts = data?.charts || {};

  // Chart 1: Department Distribution (Doughnut)
  const deptLabels = (charts.deptDistribution || []).map((d) => d._id);
  const deptCounts = (charts.deptDistribution || []).map((d) => d.count);

  const deptChartData = {
    labels: deptLabels.length ? deptLabels : ['Editorial', 'Graphics', 'Printing', 'Warehouse'],
    datasets: [
      {
        data: deptCounts.length ? deptCounts : [4, 2, 3, 2],
        backgroundColor: [
          '#6366F1',
          '#8B5CF6',
          '#0EA5E9',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#EC4899',
        ],
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
      {/* Executive Banner Header for Admin Milind Kasbe Sir */}
      <div
        className="card"
        style={{
          padding: '28px 36px',
          marginBottom: '28px',
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
            {t('welcomeBack')}, {adminName} Sir! 🙏
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('overviewSubtitle')}
          </p>
        </div>

        {/* Quick Action Shortcuts for Milind Kasbe Sir */}
        <div className="flex-row" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/admin/employees')}
          >
            <Plus size={16} /> {t('addEmployee')}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/admin/projects')}
          >
            <BookMarked size={16} /> {t('launchProject')}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/admin/payroll')}
          >
            <DollarSign size={16} /> {t('runPayroll')}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/admin/reports')}
          >
            <FileSpreadsheet size={16} /> {t('reports')}
          </button>
        </div>
      </div>

      {/* 10 Executive Metric Cards */}
      <div className="grid-cards">
        <StatCard
          icon={Users}
          title={t('totalWorkforce')}
          value={cards.totalEmployees || 0}
          color="#6366F1"
        />
        <StatCard
          icon={UserCheck}
          title={t('activeEmployees')}
          value={cards.activeEmployees || 0}
          color="#10B981"
        />
        <StatCard
          icon={BookOpen}
          title={t('publicationSeries')}
          value={cards.totalProjects || 0}
          color="#0EA5E9"
        />
        <StatCard
          icon={FolderCheck}
          title={t('activeProjects')}
          value={cards.activeProjects || 0}
          color="#8B5CF6"
        />
        <StatCard
          icon={CheckSquare}
          title={t('totalTasks')}
          value={cards.totalTasks || 0}
          color="#3B82F6"
        />
        <StatCard
          icon={Clock}
          title={t('pendingTasks')}
          value={cards.pendingTasks || 0}
          color="#F59E0B"
        />
        <StatCard
          icon={TrendingUp}
          title={t('approvedTasks')}
          value={cards.completedTasks || 0}
          color="#10B981"
        />
        <StatCard
          icon={UserCheck}
          title={t('todayAttendance')}
          value={cards.attendanceToday || 0}
          color="#EC4899"
        />
        <StatCard
          icon={DollarSign}
          title={t('monthlySalaryExpense')}
          value={`₹ ${(cards.monthlySalaryExpense || 0).toLocaleString('en-IN')}`}
          color="#8B5CF6"
        />
        <StatCard
          icon={AlertCircle}
          title={t('pendingPayouts')}
          value={`₹ ${(cards.pendingPayments || 0).toLocaleString('en-IN')}`}
          color="#EF4444"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid-charts">
        {/* Department Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            Department Workforce Distribution
          </h3>
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={deptChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { color: 'var(--text-main)' } },
                },
              }}
            />
          </div>
        </div>

        {/* Task Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            Publication Task Status Breakdown
          </h3>
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={taskChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { color: 'var(--text-main)' } },
                },
              }}
            />
          </div>
        </div>

        {/* Project Progress */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Active Book Publication Progress Tracker
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Real-time milestone progress monitored by Milind Kasbe Sir
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/admin/projects')}
            >
              Manage Projects <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ height: '300px' }}>
            <Bar
              data={projChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    max: 100,
                    ticks: { color: 'var(--text-secondary)', callback: (v) => `${v}%` },
                    grid: { color: 'var(--border-color)' },
                  },
                  x: {
                    ticks: { color: 'var(--text-secondary)' },
                    grid: { color: 'var(--border-color)' },
                  },
                },
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
