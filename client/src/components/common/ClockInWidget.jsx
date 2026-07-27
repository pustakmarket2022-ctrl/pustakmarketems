import React, { useState, useEffect, useContext } from 'react';
import { LogIn, LogOut, Clock, CheckCircle2 } from 'lucide-react';
import { checkIn, checkOut, getMyAttendance } from '../../services/attendanceService';
import { NotificationContext } from '../../context/NotificationContext';

const ClockInWidget = () => {
  const { addToast } = useContext(NotificationContext);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchAttendance = async () => {
    try {
      const res = await getMyAttendance();
      setTodayData(res.today);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await checkIn();
      addToast(res.message, 'success');
      fetchAttendance();
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed', 'danger');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await checkOut();
      addToast(res.message, 'success');
      fetchAttendance();
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-out failed', 'danger');
    }
  };

  return (
    <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-sidebar) 100%)' }}>
      <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Attendance Time Tracker</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Daily Work Clock-in & Working Hours Logging
          </p>
        </div>
        <div
          className="badge badge-info"
          style={{ padding: '6px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Clock size={16} />
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      <div
        className="flex-row"
        style={{
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'space-around',
          background: 'var(--bg-input)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CHECK IN TIME</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
            {todayData?.checkIn ? new Date(todayData.checkIn).toLocaleTimeString() : '-- : --'}
          </div>
        </div>

        <div style={{ width: '1px', height: '35px', background: 'var(--border-color)' }} />

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CHECK OUT TIME</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
            {todayData?.checkOut ? new Date(todayData.checkOut).toLocaleTimeString() : '-- : --'}
          </div>
        </div>

        <div style={{ width: '1px', height: '35px', background: 'var(--border-color)' }} />

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>WORKING HOURS</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)', marginTop: '2px' }}>
            {todayData?.workingHours ? `${todayData.workingHours} hrs` : '0.0 hrs'}
          </div>
        </div>
      </div>

      <div className="flex-row" style={{ gap: '12px' }}>
        {!todayData?.checkIn ? (
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCheckIn}>
            <LogIn size={18} /> Clock In Now
          </button>
        ) : !todayData?.checkOut ? (
          <button className="btn btn-secondary" style={{ flex: 1, borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={handleCheckOut}>
            <LogOut size={18} /> Clock Out Now
          </button>
        ) : (
          <div
            className="flex-row"
            style={{
              flex: 1,
              justify: 'center',
              padding: '10px',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              borderRadius: '10px',
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={18} /> Shift Logged For Today
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockInWidget;
