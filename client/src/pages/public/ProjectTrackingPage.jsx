import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  BookMarked,
  Search,
  CheckCircle2,
  Clock,
  Circle,
  ArrowLeft,
  BookOpen,
  Calendar,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import ProjectContributorsModal from '../../components/projects/ProjectContributorsModal';

const ProjectTrackingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('id') || '');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isContributorsModalOpen, setIsContributorsModalOpen] = useState(false);

  const fetchTrackData = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const res = await api.get(`/projects/track/${encodeURIComponent(query.trim())}`);
      setTrackingData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No publication project found with that ID, ISBN, or Book Name.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialQuery = searchParams.get('id');
    if (initialQuery) {
      setSearchQuery(initialQuery);
      fetchTrackData(initialQuery);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrackData(searchQuery);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Top Header Navigation */}
      <header
        style={{
          height: '75px',
          background: 'var(--bg-header)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="flex-row" style={{ gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <BookMarked size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>
              PUSTAK MARKET
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Client & Author Tracking Portal
            </div>
          </div>
        </div>

        <div className="flex-row" style={{ gap: '16px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Home
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
            Staff Portal Login
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '960px', margin: '40px auto', padding: '0 20px' }}>
        {/* Banner Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            <Sparkles size={14} /> Official Author & Client Project Tracker
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Real-Time Book Publication Status
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Check your manuscript editing progress, cover design, proofreading status, & release timelines.
          </p>
        </div>

        {/* Search Card */}
        <div
          className="card"
          style={{
            padding: '28px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)',
            marginBottom: '32px',
          }}
        >
          <form onSubmit={handleSearch}>
            <div className="flex-row" style={{ gap: '12px', flexWrap: 'wrap' }}>
              <div className="search-input-wrapper" style={{ flex: 1, minWidth: '280px' }}>
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '14px 14px 14px 42px', fontSize: '1rem' }}
                  placeholder="Enter Project ID (e.g. PM-2026-0001), ISBN, or Book Title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '14px 28px', fontSize: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Track Project Status'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="card"
            style={{
              padding: '20px',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '1px solid var(--danger)',
              textAlign: 'center',
              fontWeight: 600,
              marginBottom: '32px',
            }}
          >
            {error}
          </div>
        )}

        {/* Live Tracking Result Details Card */}
        {trackingData && (
          <div
            className="card"
            style={{
              padding: '32px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              animation: 'modalPop 0.3s ease-out',
            }}
          >
            {/* Header info */}
            <div className="flex-row" style={{ justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Project ID: </span>
                <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{trackingData.projectId}</strong>
              </div>
              <Badge text={trackingData.status} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                {trackingData.bookName}
              </h2>
              <div className="flex-row" style={{ gap: '16px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <span>Author: <strong>{trackingData.author}</strong></span>
                <span>•</span>
                <span>Format: <strong>{trackingData.publicationType}</strong> ({trackingData.category})</span>
                <span>•</span>
                <span>ISBN: <strong>{trackingData.ISBN}</strong></span>
              </div>
            </div>

            {/* Overall Completion Percentage Bar */}
            <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '12px' }}>
              <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Overall Publishing Progress</span>
                <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{trackingData.completionPercentage}% Complete</strong>
              </div>
              <div className="progress-bar-bg" style={{ height: '12px' }}>
                <div className="progress-bar-fill" style={{ width: `${trackingData.completionPercentage}%` }} />
              </div>
            </div>

            {/* Live Milestone Tracking Steps */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
                Live Publication Stages & Milestone Steps
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trackingData.milestones && trackingData.milestones.length > 0 ? (
                  trackingData.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex-row"
                      style={{
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: m.status === 'In Progress' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-input)',
                        border: m.status === 'In Progress' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        borderRadius: '10px',
                      }}
                    >
                      <div className="flex-row" style={{ gap: '14px' }}>
                        {m.status === 'Completed' && (
                          <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center' }}>
                            <CheckCircle2 size={22} />
                          </div>
                        )}
                        {m.status === 'In Progress' && (
                          <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                            <Clock size={22} className="pulse" />
                          </div>
                        )}
                        {m.status === 'Pending' && (
                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            <Circle size={22} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: m.status === 'Pending' ? 'var(--text-muted)' : 'var(--text-main)' }}>
                            Stage {idx + 1}: {m.stepName}
                          </div>
                          {m.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.notes}</div>}
                        </div>
                      </div>

                      <Badge text={m.status} />
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No milestone steps specified yet.</div>
                )}
              </div>
            </div>

            {/* Footer Summary Meta */}
            <div
              className="flex-row"
              style={{
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div className="flex-row" style={{ gap: '12px' }}>
                <div className="flex-row" style={{ gap: '8px' }}>
                  <Users size={18} color="var(--primary)" />
                  <span>Assigned Specialists: <strong>{trackingData.teamCount} Editorial Members</strong></span>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', fontWeight: 600 }}
                  onClick={() => setIsContributorsModalOpen(true)}
                >
                  View Team & Work Summary
                </button>
              </div>
              <div className="flex-row" style={{ gap: '8px' }}>
                <Calendar size={18} color="var(--primary)" />
                <span>Estimated Release Date: <strong>{new Date(trackingData.deadline).toLocaleDateString()}</strong></span>
              </div>
            </div>
          </div>
        )}

        <ProjectContributorsModal
          isOpen={isContributorsModalOpen}
          onClose={() => setIsContributorsModalOpen(false)}
          projectId={trackingData?._id}
          projectData={trackingData}
        />
      </div>
    </div>
  );
};

export default ProjectTrackingPage;
