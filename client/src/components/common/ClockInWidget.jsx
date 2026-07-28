import React, { useState, useEffect, useContext } from 'react';
import { LogIn, LogOut, Clock, CheckCircle2, MapPin } from 'lucide-react';
import { checkIn, checkOut, getMyAttendance } from '../../services/attendanceService';
import { NotificationContext } from '../../context/NotificationContext';

const ClockInWidget = () => {
  const { addToast } = useContext(NotificationContext);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
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

  const getCoordinates = () => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => {
            console.warn('Geolocation denied or unavailable:', err.message);
            resolve({ latitude: null, longitude: null });
          },
          { timeout: 8000 }
        );
      } else {
        resolve({ latitude: null, longitude: null });
      }
    });
  };

  const handleCheckIn = async () => {
    setClocking(true);
    try {
      const coords = await getCoordinates();
      const res = await checkIn(coords);
      addToast(res.message, 'success');
      fetchAttendance();
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed', 'danger');
    } finally {
      setClocking(false);
    }
  };

  const handleCheckOut = async () => {
    setClocking(true);
    try {
      const coords = await getCoordinates();
      const res = await checkOut(coords);
      addToast(res.message, 'success');
      fetchAttendance();
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-out failed', 'danger');
    } finally {
      setClocking(false);
    }
  };

  return (
    <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-sidebar) 100%)' }}>
      <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Office Geofence Attendance Tracker</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Office Radius Verified Clock-in & Hours Logging
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
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCheckIn} disabled={clocking}>
            <MapPin size={18} /> {clocking ? 'Verifying Office Location...' : 'Check In (Office Radius)'}
          </button>
        ) : !todayData?.checkOut ? (
          <button
            className="btn btn-secondary"
            style={{ flex: 1, borderColor: 'var(--warning)', color: 'var(--warning)' }}
            onClick={handleCheckOut}
            disabled={clocking}
          >
            <LogOut size={18} /> {clocking ? 'Verifying Location...' : 'Check Out'}
          </button>
        ) : (
          <div
            className="flex-row"
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '10px',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              borderRadius: '10px',
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={18} /> Shift Logged For Today ({todayData.status})
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockInWidget;
