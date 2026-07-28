import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookMarked,
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Printer,
  Globe,
  Clock,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { LanguageContext } from '../../context/LanguageContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useContext(LanguageContext);

  // Public Tracking State
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  const handleTrackProject = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setTrackingLoading(true);
    setTrackingError('');
    setTrackingData(null);

    try {
      const res = await api.get(`/projects/track/${encodeURIComponent(searchQuery.trim())}`);
      setTrackingData(res.data.data);
    } catch (err) {
      setTrackingError(err.response?.data?.message || 'No project found with that ID, ISBN, or Book Name.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', overflowX: 'hidden' }}>
      {/* Navbar Header */}
      <header
        style={{
          minHeight: '70px',
          background: 'var(--bg-header)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="flex-row" style={{ gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <BookMarked size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em', lineHeight: '1.2' }}>
              PUSTAK MARKET
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Book Publishing EMS
            </div>
          </div>
        </div>

        <div className="flex-row" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/track" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
            {t('trackBookStatus') || 'Track Project'}
          </Link>

          {/* Bilingual Language Switcher Button */}
          <button
            onClick={toggleLanguage}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Switch Language (English / मराठी)"
          >
            <Globe size={14} />
            {language === 'en' ? 'मराठी' : 'English'}
          </button>

          <button
            className="btn btn-primary btn-sm"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            onClick={() => navigate('/login')}
          >
            {t('employeePortal') || 'Sign In'} <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section
        style={{
          padding: '60px 16px 40px 16px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15), transparent 70%)',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          <Sparkles size={15} /> Enterprise Book Publishing System
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, var(--text-main) 0%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Streamlining Book Publishing <br style={{ display: 'var(--mobile-br, block)' }} /> & Real-Time Tracking
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 28px auto',
            lineHeight: 1.6,
          }}
        >
          Pustak Market EMS connects Editorial, Graphic Design, Proofreading, Printing, and Distribution into a single unified platform with real-time tracking for authors and clients.
        </p>

        <div className="flex-row" style={{ justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <a href="#tracker" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
            <Search size={16} /> Track Book Project
          </a>
          <button
            className="btn btn-secondary"
            style={{ padding: '12px 20px', fontSize: '0.95rem' }}
            onClick={() => navigate('/login')}
          >
            Staff Portal Sign In
          </button>
        </div>
      </section>

      {/* Public Client / Author Real-Time Project Tracker Widget */}
      <section id="tracker" style={{ padding: '20px 16px 60px 16px', maxWidth: '900px', margin: '0 auto' }}>
        <div
          className="card"
          style={{
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-sidebar) 100%)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 1.75rem)', fontWeight: 800, color: 'var(--text-main)' }}>
              Real-Time Publication Status Tracker
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Track book manuscript progress, ISBN status, & release timelines live.
            </p>
          </div>

          <form onSubmit={handleTrackProject}>
            <div className="flex-row" style={{ gap: '10px', flexWrap: 'wrap' }}>
              <div className="search-input-wrapper" style={{ flex: '1 1 240px' }}>
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '12px 12px 12px 38px', fontSize: '0.95rem' }}
                  placeholder="Enter Project ID (e.g. PM-2026-0001), ISBN, or Title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '12px 20px', fontSize: '0.95rem', width: 'auto' }}
                disabled={trackingLoading}
              >
                {trackingLoading ? 'Searching...' : 'Track Status'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {trackingError && (
            <div
              style={{
                marginTop: '20px',
                padding: '14px',
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                borderRadius: '10px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              {trackingError}
            </div>
          )}

          {/* Result Card */}
          {trackingData && (
            <div
              style={{
                marginTop: '24px',
                padding: '20px',
                background: 'var(--bg-input)',
                border: '1px solid var(--primary)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                animation: 'modalPop 0.3s ease-out',
              }}
            >
              <div className="flex-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                  {trackingData.projectId}
                </strong>
                <Badge text={trackingData.status} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {trackingData.bookName}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Author: <strong>{trackingData.author}</strong> | Format: <strong>{trackingData.publicationType}</strong> ({trackingData.category})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  ISBN: {trackingData.ISBN}
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Publishing Progress</span>
                  <strong style={{ color: 'var(--primary)' }}>{trackingData.completionPercentage}% Complete</strong>
                </div>
                <div className="progress-bar-bg" style={{ height: '8px' }}>
                  <div className="progress-bar-fill" style={{ width: `${trackingData.completionPercentage}%` }} />
                </div>
              </div>

              {/* Real-Time Milestones */}
              <div
                style={{
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  PUBLICATION STAGES:
                </div>

                {trackingData.milestones && trackingData.milestones.length > 0 ? (
                  trackingData.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex-row"
                      style={{
                        justify: 'space-between',
                        padding: '8px 12px',
                        background: m.status === 'In Progress' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                        border: m.status === 'In Progress' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        borderRadius: '8px',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div className="flex-row" style={{ gap: '10px' }}>
                        {m.status === 'Completed' && <CheckCircle2 size={18} color="var(--success)" />}
                        {m.status === 'In Progress' && <Clock size={18} color="var(--primary)" />}
                        {m.status === 'Pending' && <Circle size={18} color="var(--text-muted)" />}
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: m.status === 'Pending' ? 'var(--text-muted)' : 'var(--text-main)' }}>
                            Step {idx + 1}: {m.stepName}
                          </strong>
                          {m.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.notes}</div>}
                        </div>
                      </div>
                      <Badge text={m.status} />
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Editorial ➔ Graphic Design ➔ Proofreading ➔ Distribution
                  </div>
                )}
              </div>

              <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '8px' }}>
                <div>Assigned Specialists: <strong>{trackingData.teamCount || 3}</strong></div>
                <div>Target Release: <strong>{new Date(trackingData.deadline).toLocaleDateString()}</strong></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ padding: '40px 16px 60px 16px', background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 800, marginBottom: '8px' }}>
            Book Publishing Ecosystem
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
            End-to-end publishing services from manuscript refinement to bookstore distribution.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ textAlign: 'left' }}>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', marginBottom: '14px' }}>
                <BookOpen size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Editorial & Proofreading</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Editorial review, grammar check, indexing, and translation across English, Hindi, and Marathi literature.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'left' }}>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent)', marginBottom: '14px' }}>
                <Layers size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Graphic & Cover Design</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Vector illustrations, typography layout, jacket artwork, and interactive digital eBook formatting.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'left' }}>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--secondary)', marginBottom: '14px' }}>
                <Printer size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Offset & Digital Printing</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Industrial offset press printing, premium hardcovers, paperbacks, and matte/gloss foil finishing.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'left' }}>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', marginBottom: '14px' }}>
                <Globe size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Worldwide Distribution</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Warehouse fulfillment, ISBN registration, bookstore distribution, Amazon & Flipkart online listing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '28px 16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div>Pustak Market Publications & Distribution Pvt Ltd • Enterprise Edition 2026</div>
      </footer>
    </div>
  );
};

export default LandingPage;
