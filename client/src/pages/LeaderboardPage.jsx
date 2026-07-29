import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Award,
  Trophy,
  Medal,
  Star,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Search,
  Filter,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { getLeaderboard } from '../services/leaderboardService';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';

const departments = ['All', 'Editorial & Content', 'Graphics & Cover Design', 'IT & Systems', 'Press & Printing', 'HR & Admin', 'Accounts & Finance'];

const LeaderboardPage = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeaderboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeaderboard({ department: selectedDept });
      setLeaderboard(res.data || []);
    } catch (err) {
      addToast('Failed to load performance leaderboard', 'danger');
    } finally {
      setLoading(false);
    }
  }, [selectedDept, addToast]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // Filter by search query
  const filteredLeaderboard = leaderboard.filter(
    (item) =>
      item.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top 3 Podium Winners
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  // Current Logged-in User's Rank Object
  const myRankObj = leaderboard.find(
    (item) => item._id === user?.id || item._id === user?._id || item.employeeId === user?.employeeId
  );

  return (
    <div className="page-container">
      {/* Page Title & Subtitle */}
      <div className="page-header flex-row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title flex-row" style={{ gap: '10px' }}>
            <Trophy color="#eab308" size={32} /> Employee Performance Leaderboard
          </h1>
          <p className="page-subtitle">
            AI-driven algorithmic ranking evaluating task approvals, attendance, punctuality & overtime dedication
          </p>
        </div>
      </div>

      {/* Logged-In Employee Personal Performance Card */}
      {myRankObj && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: '#ffffff',
            padding: '20px 24px',
            borderRadius: '16px',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div className="flex-row" style={{ gap: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                border: '2px solid #a5b4fc',
              }}
            >
              #{myRankObj.rank}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Your Current Leaderboard Status
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '2px 0 4px 0' }}>
                {myRankObj.fullName} ({myRankObj.badge})
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#e0e7ff', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>Tasks Completed: <strong>{myRankObj.metrics?.tasksCompleted}</strong></span>
                <span>Attendance Rate: <strong>{myRankObj.metrics?.attendanceRate}%</strong></span>
                <span>Overtime: <strong>{myRankObj.metrics?.overtimeHours} hrs</strong></span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#c7d2fe' }}>Algorithmic Score</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#facc15', lineHeight: 1 }}>
              {myRankObj.score} <span style={{ fontSize: '1rem', color: '#c7d2fe' }}>/ 100</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Top 3 Podium Winners Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {/* Rank #2 - Silver */}
            {top2 && (
              <div
                className="card"
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  borderTop: '5px solid #94a3b8',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-16px',
                    background: '#94a3b8',
                    color: '#fff',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                  }}
                >
                  🥈 Rank #2
                </div>
                <div style={{ marginTop: '10px', fontSize: '2.5rem' }}>🥈</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '8px 0 2px 0' }}>{top2.fullName}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                  {top2.department} • {top2.designation}
                </p>

                <div
                  style={{
                    background: 'var(--bg-input)',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    width: '100%',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Performance Score</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {top2.score} <span style={{ fontSize: '0.85rem' }}>pts</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                  <div>Completed: <strong>{top2.metrics?.tasksCompleted}</strong></div>
                  <div>Attendance: <strong>{top2.metrics?.attendanceRate}%</strong></div>
                </div>
              </div>
            )}

            {/* Rank #1 - Gold Winner */}
            {top1 && (
              <div
                className="card"
                style={{
                  padding: '28px',
                  textAlign: 'center',
                  borderTop: '5px solid #eab308',
                  background: 'var(--bg-input)',
                  boxShadow: 'var(--shadow-lg)',
                  position: 'relative',
                  transform: 'scale(1.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-18px',
                    background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                    color: '#fff',
                    padding: '6px 18px',
                    borderRadius: '20px',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(234, 179, 8, 0.4)',
                  }}
                >
                  👑 RANK #1 - EMPLOYEE OF THE MONTH
                </div>
                <div style={{ marginTop: '12px', fontSize: '3.2rem' }}>👑</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '8px 0 2px 0', color: 'var(--primary)' }}>
                  {top1.fullName}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
                  {top1.department} • {top1.designation}
                </p>

                <div
                  style={{
                    background: 'linear-gradient(135deg, #fef08a 0%, #fef9c3 100%)',
                    border: '1px solid #eab308',
                    color: '#854d0e',
                    padding: '12px',
                    borderRadius: '12px',
                    width: '100%',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Overall Performance Score</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ca8a04', lineHeight: 1, marginTop: '2px' }}>
                    {top1.score} <span style={{ fontSize: '1rem' }}>/ 100</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-around', width: '100%', fontWeight: 600 }}>
                  <div>Tasks: <strong>{top1.metrics?.tasksCompleted}</strong></div>
                  <div>Attendance: <strong>{top1.metrics?.attendanceRate}%</strong></div>
                  <div>Overtime: <strong>{top1.metrics?.overtimeHours}h</strong></div>
                </div>
              </div>
            )}

            {/* Rank #3 - Bronze */}
            {top3 && (
              <div
                className="card"
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  borderTop: '5px solid #b45309',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-16px',
                    background: '#b45309',
                    color: '#fff',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                  }}
                >
                  🥉 Rank #3
                </div>
                <div style={{ marginTop: '10px', fontSize: '2.5rem' }}>🥉</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '8px 0 2px 0' }}>{top3.fullName}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                  {top3.department} • {top3.designation}
                </p>

                <div
                  style={{
                    background: 'var(--bg-input)',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    width: '100%',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Performance Score</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {top3.score} <span style={{ fontSize: '0.85rem' }}>pts</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                  <div>Completed: <strong>{top3.metrics?.tasksCompleted}</strong></div>
                  <div>Attendance: <strong>{top3.metrics?.attendanceRate}%</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard Table Section */}
          <div className="card" style={{ padding: '0' }}>
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Full Algorithmic Ranking Standings ({filteredLeaderboard.length})
              </h3>

              <div className="flex-row" style={{ gap: '12px', flexWrap: 'wrap' }}>
                <div className="search-box" style={{ width: '220px' }}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex-row" style={{ gap: '6px' }}>
                  <Filter size={16} color="var(--text-muted)" />
                  <select
                    className="form-select"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>Rank</th>
                    <th>Employee Name</th>
                    <th>Department & Role</th>
                    <th>Tasks Output (40%)</th>
                    <th>Attendance (35%)</th>
                    <th>Punctuality (15%)</th>
                    <th>Overtime (10%)</th>
                    <th>Performance Score</th>
                    <th style={{ textAlign: 'center' }}>Badge Award</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No employees found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaderboard.map((item) => (
                      <tr
                        key={item._id}
                        style={{
                          background:
                            item._id === myRankObj?._id ? 'var(--primary-light)' : 'transparent',
                        }}
                      >
                        <td style={{ textAlign: 'center', fontWeight: 900, fontSize: '1rem' }}>
                          {item.rank === 1 ? '👑 #1' : item.rank === 2 ? '🥈 #2' : item.rank === 3 ? '🥉 #3' : `#${item.rank}`}
                        </td>
                        <td>
                          <div className="flex-row" style={{ gap: '10px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                              }}
                            >
                              {item.fullName.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.fullName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {item.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.department}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.designation}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--success)' }}>
                            {item.metrics?.tasksCompleted} Tasks ({item.metrics?.completionRate}%)
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score: {item.taskScore}/40</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.metrics?.presentDays} Days ({item.metrics?.attendanceRate}%)</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score: {item.attendanceScore}/35</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.metrics?.onTimeDays} On-Time</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score: {item.punctualityScore}/15</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.metrics?.overtimeHours} hrs</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score: {item.overtimeScore}/10</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>
                            {item.score} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/ 100</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              background: 'var(--bg-input)',
                              color: item.badgeColor,
                              border: `1px solid ${item.badgeColor}`,
                              display: 'inline-block',
                            }}
                          >
                            {item.badge}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardPage;
