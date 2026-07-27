import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookMarked,
  Search,
  BookOpen,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Printer,
  Globe,
  Clock,
  Award,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { useContext } from 'react';
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Navbar */}
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
        <div className="flex-row" style={{ gap: '12px' }}>
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
              Book Publication & Distribution
            </div>
          </div>
        </div>

        <div className="flex-row" style={{ gap: '20px' }}>
          <Link to="/track" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
            {t('trackBookStatus')}
          </Link>
          <a href="#services" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
            {t('publishingServices')}
          </a>

          {/* Bilingual Language Switcher Button */}
          <button
            onClick={toggleLanguage}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              padding: '6px 14px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Switch Language (English / मराठी)"
          >
            <Globe size={16} />
            {language === 'en' ? 'मराठी' : 'English'}
          </button>

          <button
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.9rem' }}
            onClick={() => navigate('/login')}
          >
            {t('employeePortal')} <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section
        style={{
          padding: '80px 20px 60px 20px',
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
            padding: '6px 16px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '20px',
          }}
        >
          <Sparkles size={16} /> Enterprise Book Publishing & Management System
        </div>

        <h1
          style={{
            fontSize: '3.2rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, var(--text-main) 0%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Streamlining Book Publishing <br /> & Real-Time Author Tracking
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6,
          }}
        >
          Pustak Market EMS connects Editorial, Graphic Design, Proofreading, Printing, and Distribution into a single unified platform with real-time tracking for authors and clients.
        </p>

        <div className="flex-row" style={{ justifyContent: 'center', gap: '16px' }}>
          <a href="#tracker" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <Search size={18} /> Track Your Book Project
          </a>
          <button
            className="btn btn-secondary"
            style={{ padding: '14px 24px', fontSize: '1rem' }}
            onClick={() => navigate('/login')}
          >
            Staff Portal Sign In
          </button>
        </div>
      </section>

      {/* Public Client / Author Real-Time Project Tracker Widget */}
      <section id="tracker" style={{ padding: '40px 20px 80px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <div
          className="card"
          style={{
            padding: '36px',
            boxShadow: 'var(--shadow-lg)',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-sidebar) 100%)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Real-Time Publication Status Tracker
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Authors & Clients can track book manuscript progress, ISBN status, & release timelines.
            </p>
          </div>

          <form onSubmit={handleTrackProject}>
            <div className="flex-row" style={{ gap: '12px', flexWrap: 'wrap' }}>
              <div className="search-input-wrapper" style={{ flex: 1, minWidth: '280px' }}>
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '14px 14px 14px 42px', fontSize: '1rem' }}
                  placeholder="Enter Project ID (e.g. PM-2026-0001), ISBN, or Book Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '14px 24px', fontSize: '1rem' }}
                disabled={trackingLoading}
              >
                {trackingLoading ? 'Searching...' : 'Track Project Status'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {trackingError && (
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                borderRadius: '10px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {trackingError}
            </div>
          )}

          {/* Result Card */}
          {trackingData && (
            <div
              style={{
                marginTop: '28px',
                padding: '24px',
                background: 'var(--bg-input)',
                border: '1px solid var(--primary)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                animation: 'modalPop 0.3s ease-out',
              }}
            >
              <div className="flex-row" style={{ justifyContent: 'space-between' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>
                  {trackingData.projectId}
                </strong>
                <Badge text={trackingData.status} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {trackingData.bookName}
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Author: <strong>{trackingData.author}</strong> | Format: <strong>{trackingData.publicationType}</strong> ({trackingData.category})
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  ISBN: {trackingData.ISBN}
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Publishing Lifecycle Progress</span>
                  <strong style={{ color: 'var(--primary)' }}>{trackingData.completionPercentage}% Complete</strong>
                </div>
                <div className="progress-bar-bg" style={{ height: '10px' }}>
                  <div className="progress-bar-fill" style={{ width: `${trackingData.completionPercentage}%` }} />
                </div>
              </div>

              {/* Dynamic Real-Time Milestone Steps Editor by Admin MK */}
              <div
                style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  REAL-TIME PUBLICATION TRACKING STAGES & MILESTONES:
                </div>

                {trackingData.milestones && trackingData.milestones.length > 0 ? (
                  trackingData.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex-row"
                      style={{
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: m.status === 'In Progress' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                        border: m.status === 'In Progress' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        borderRadius: '10px',
                      }}
                    >
                      <div className="flex-row" style={{ gap: '12px' }}>
                        {m.status === 'Completed' && (
                          <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center' }}>
                            <CheckCircle2 size={20} />
                          </div>
                        )}
                        {m.status === 'In Progress' && (
                          <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                            <Clock size={20} className="pulse" />
                          </div>
                        )}
                        {m.status === 'Pending' && (
                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            <Circle size={20} />
                          </div>
                        )}
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: m.status === 'Pending' ? 'var(--text-muted)' : 'var(--text-main)' }}>
                            Step {idx + 1}: {m.stepName}
                          </strong>
                          {m.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.notes}</div>}
                        </div>
                      </div>

                      <Badge text={m.status} />
                    </div>
                  ))
                ) : (
                  <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Editorial Review ➔ Graphic Design ➔ Proofreading ➔ Distribution</span>
                  </div>
                )}
              </div>

              <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div>
                  Assigned Team Members: <strong>{trackingData.teamCount} Specialists</strong>
                </div>
                <div>
                  Target Release Date: <strong>{new Date(trackingData.deadline).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Services Showcase Section */}
      <section id="services" style={{ padding: '60px 20px', background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
            Complete Book Publishing Ecosystem
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '48px' }}>
            Providing end-to-end publishing services from manuscript refinement to worldwide bookstore distribution.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
            <div className="card" style={{ textAlign: 'left' }}>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', marginBottom: '16px' }}>
                <BookOpen size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Editorial & Proofreading</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Expert editorial review, grammar correction, indexing, and translation across English, Hindi, and Marathi literature.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'left' }}>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent)', marginBottom: '16px' }}>
                <Layers size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Graphic & Cover Design</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                High-resolution vector illustrations, typography layout, jacket artwork, and interactive digital eBook formatting.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'left' }}>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--secondary)', marginBottom: '16px' }}>
                <Printer size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Offset & Digital Printing</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Industrial offset press printing, premium hardcovers, paperbacks, matte/gloss foil finishing, and short runs.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'left' }}>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', marginBottom: '16px' }}>
                <Globe size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Worldwide Distribution</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Warehouse fulfillment, ISBN registration, retail bookstore distribution, Amazon & Flipkart online listing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '36px 20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div>Pustak Market Publications & Distribution Pvt Ltd • Enterprise Edition 2026</div>
        <div style={{ marginTop: '8px' }}>Official Portal for Authors, Editors, Designers, and Logistics Specialists.</div>
      </footer>
    </div>
  );
};

export default LandingPage;
