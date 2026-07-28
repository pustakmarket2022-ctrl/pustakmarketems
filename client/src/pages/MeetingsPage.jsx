import React, { useState, useEffect, useContext } from 'react';
import { Calendar, Plus, MapPin, Clock, Users, Video } from 'lucide-react';
import { getMeetings, createMeeting } from '../services/meetingService';
import { getUsers } from '../services/userService';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [location, setLocation] = useState('Main Conference Room');
  const [meetingLink, setMeetingLink] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'HR' || user?.role === 'Manager';

  const fetchMeetingsData = async () => {
    try {
      setLoading(true);
      const res = await getMeetings();
      setMeetings(res.data || []);
      if (isAdmin) {
        const empRes = await getUsers({ limit: 100 });
        setEmployees(empRes.data || []);
      }
    } catch (e) {
      addToast('Failed to load meetings', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingsData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    setSubmitting(true);
    try {
      await createMeeting({
        title,
        description,
        date,
        time,
        durationMinutes: Number(durationMinutes),
        location,
        meetingLink,
        assignedEmployees: selectedEmployees,
      });
      addToast('Meeting scheduled & notifications sent', 'success');
      setShowModal(false);
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setSelectedEmployees([]);
      fetchMeetingsData();
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to schedule meeting', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEmployeeSelection = (id) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((eId) => eId !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header flex-row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title flex-row" style={{ gap: '10px' }}>
            <Calendar color="var(--primary)" size={28} /> Scheduled Meetings
          </h1>
          <p className="page-subtitle">View and schedule team & project discussions</p>
        </div>
        {isAdmin && (
          <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Schedule Meeting
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center' }}>Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No scheduled meetings found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {meetings.map((mtg) => (
            <div key={mtg._id} className="card">
              <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="badge badge-primary">{mtg.status}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{mtg.meetingId}</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                {mtg.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                {mtg.description || 'No description provided.'}
              </p>

              <div className="flex-col" style={{ gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <div className="flex-row" style={{ gap: '8px' }}>
                  <Calendar size={16} color="var(--primary)" />
                  <span>Date: <strong>{mtg.date}</strong> at <strong>{mtg.time}</strong> ({mtg.durationMinutes} mins)</span>
                </div>
                <div className="flex-row" style={{ gap: '8px' }}>
                  <MapPin size={16} color="var(--accent)" />
                  <span>Location: {mtg.location}</span>
                </div>
                {mtg.meetingLink && (
                  <div className="flex-row" style={{ gap: '8px' }}>
                    <Video size={16} color="#22c55e" />
                    <a href={mtg.meetingLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      Join Online Meeting
                    </a>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>Organizer: <strong>{mtg.createdBy?.fullName || 'Admin'}</strong></div>
                <div>Assigned Attendees: <strong>{mtg.assignedEmployees?.length || 0} Member(s)</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Schedule New Meeting</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Meeting Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Editorial Book Release Review"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Agenda</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Agenda topics..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time (HH:MM)</label>
                  <input
                    type="time"
                    className="form-input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Conference Room 1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Online Link (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Employees to Attend</label>
                <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px' }}>
                  {employees.map((emp) => (
                    <label key={emp._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp._id)}
                        onChange={() => toggleEmployeeSelection(emp._id)}
                      />
                      <span style={{ fontSize: '0.85rem' }}>{emp.fullName} ({emp.department} - {emp.employeeId})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Scheduling...' : 'Schedule & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
