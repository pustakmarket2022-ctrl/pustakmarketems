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
  Menu,
  X,
  Award,
  ShieldCheck,
  Zap,
  Users,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { LanguageContext } from '../../context/LanguageContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useContext(LanguageContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      setTrackingError(err.response?.data?.message || 'No project found with that Project ID, ISBN, or Book Name.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0f172a)', color: 'var(--text-main, #f8fafc)', overflowX: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sticky Header Navbar */}
      <header
        style={{
          minHeight: '70px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 200,
        }}
      >
        {/* Brand Logo */}
        <div className="flex-row" style={{ gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <BookMarked size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
              PUSTAK MARKET
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
              Book Publishing EMS
            </div>
          </div>
        </div>

        {/* Desktop Nav Links & Actions */}
        <div className="landing-desktop-nav flex-row" style={{ gap: '16px' }}>
          <a href="#tracker" style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>
            {t('trackBookStatus') || 'Track Project'}
          </a>
          <a href="#ecosystem" style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>
            Services
          </a>
          <a href="#features" style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>
            Why Choose Us
          </a>

          {/* Bilingual Switcher */}
          <button
            onClick={toggleLanguage}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#818cf8',
              padding: '6px 14px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Switch Language (English / मराठी)"
          >
            <Globe size={14} />
            {language === 'en' ? 'मराठी' : 'English'}
          </button>

          <button
            className="btn btn-primary"
            style={{ padding: '9px 18px', fontSize: '0.88rem', borderRadius: '10px' }}
            onClick={() => navigate('/login')}
          >
            {t('employeePortal') || 'Sign In'} <ArrowRight size={15} style={{ marginLeft: '4px' }} />
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="landing-mobile-toggle"
          style={{
            background: 'none',
            border: 'none',
            color: '#f8fafc',
            cursor: 'pointer',
            padding: '8px',
          }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </header>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            background: '#0f172a',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 190,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          }}
        >
          <a
            href="#tracker"
            style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            🔍 Track Project
          </a>
          <a
            href="#ecosystem"
            style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            📚 Publishing Services
          </a>
          <a
            href="#features"
            style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            ⚡ Why Choose Us
          </a>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              style={{
                flex: 1,
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#818cf8',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Globe size={16} /> {language === 'en' ? 'मराठी भाषेवर स्विच करा' : 'Switch to English'}
            </button>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', borderRadius: '8px' }}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
            >
              Staff Portal Sign In <ArrowRight size={16} style={{ marginLeft: '6px' }} />
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner Section */}
      <section
        style={{
          padding: '60px 20px 40px 20px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.25), transparent 70%)',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '20px',
          }}
        >
          <Sparkles size={16} color="#818cf8" /> Enterprise Book Publishing & Management System
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5.5vw, 3.6rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Streamlining Book Publishing <br /> & Live Author Tracking
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
            color: '#94a3b8',
            maxWidth: '780px',
            margin: '0 auto 32px auto',
            lineHeight: 1.6,
          }}
        >
          Pustak Market EMS unifies Editorial, Graphic Cover Design, Proofreading, Offset Printing, and National Distribution into a single high-performance platform.
        </p>

        <div className="flex-row" style={{ justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <a
            href="#tracker"
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              borderRadius: '12px',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Search size={18} /> Track Book Project
          </a>
          <button
            className="btn btn-secondary"
            style={{
              padding: '14px 24px',
              fontSize: '1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
            }}
            onClick={() => navigate('/login')}
          >
            Employee / Admin Login
          </button>
        </div>

        {/* Quick Stats Grid Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginTop: '50px',
            padding: '24px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6366f1', margin: 0 }}>500+</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Books Published</span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', margin: 0 }}>99.4%</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>On-Time Release</span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', margin: 0 }}>50+</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Specialist Staff</span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0ea5e9', margin: 0 }}>24/7</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Real-Time Status</span>
          </div>
        </div>
      </section>

      {/* Public Real-Time Project Tracker Widget */}
      <section id="tracker" style={{ padding: '40px 20px 60px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <div
          style={{
            padding: ' clamp(20px, 4vw, 36px)',
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Live Publication Status Tracker
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '6px' }}>
              Enter your Project ID, ISBN, or Book Title to check live publishing stages.
            </p>
          </div>

          <form onSubmit={handleTrackProject}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 260px', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={20} />
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 46px',
                    fontSize: '1rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    outline: 'none',
                  }}
                  placeholder="e.g. PM-2026-0001, ISBN, or Title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  padding: '14px 28px',
                  fontSize: '1rem',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                  flex: '0 0 auto',
                }}
                disabled={trackingLoading}
              >
                {trackingLoading ? 'Searching...' : 'Track Status'}
              </button>
            </div>
          </form>

          {/* Error Notice */}
          {trackingError && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                borderRadius: '12px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {trackingError}
            </div>
          )}

          {/* Result Tracking Card */}
          {trackingData && (
            <div
              style={{
                marginTop: '28px',
                padding: '24px',
                background: '#0f172a',
                border: '1px solid #6366f1',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div className="flex-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ color: '#818cf8', fontSize: '1rem' }}>
                  {trackingData.projectId}
                </strong>
                <Badge text={trackingData.status} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
                  {trackingData.bookName}
                </h3>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Author: <strong style={{ color: '#f8fafc' }}>{trackingData.author}</strong> | Format: <strong style={{ color: '#f8fafc' }}>{trackingData.publicationType}</strong> ({trackingData.category})
                </div>
                {trackingData.ISBN && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    ISBN: {trackingData.ISBN}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>Publication Progress</span>
                  <strong style={{ color: '#6366f1' }}>{trackingData.completionPercentage}% Completed</strong>
                </div>
                <div style={{ height: '10px', background: '#1e293b', borderRadius: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${trackingData.completionPercentage}%`,
                      background: 'linear-gradient(90deg, #6366f1, #10b981)',
                      borderRadius: '10px',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>

              {/* Milestones List */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '12px' }}>
                  PUBLICATION STAGES:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {trackingData.milestones && trackingData.milestones.length > 0 ? (
                    trackingData.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: m.status === 'In Progress' ? 'rgba(99, 102, 241, 0.12)' : '#1e293b',
                          border: m.status === 'In Progress' ? '1px solid #6366f1' : '1px solid #334155',
                          borderRadius: '10px',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        <div className="flex-row" style={{ gap: '12px' }}>
                          {m.status === 'Completed' && <CheckCircle2 size={20} color="#10b981" />}
                          {m.status === 'In Progress' && <Clock size={20} color="#6366f1" />}
                          {m.status === 'Pending' && <Circle size={20} color="#64748b" />}
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: m.status === 'Pending' ? '#94a3b8' : '#f8fafc' }}>
                              Step {idx + 1}: {m.stepName}
                            </strong>
                            {m.notes && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{m.notes}</div>}
                          </div>
                        </div>
                        <Badge text={m.status} />
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
                      Editorial ➔ Graphic Design ➔ Proofreading ➔ Press Printing ➔ Distribution
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap', gap: '8px' }}>
                <div>Assigned Specialists: <strong style={{ color: '#f8fafc' }}>{trackingData.teamCount || 4}</strong></div>
                <div>Target Release: <strong style={{ color: '#f8fafc' }}>{new Date(trackingData.deadline).toLocaleDateString()}</strong></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Services Ecosystem Section */}
      <section id="ecosystem" style={{ padding: '60px 20px', background: '#1e293b', borderTop: '1px solid #334155' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: '#f8fafc', marginBottom: '10px' }}>
            Complete Book Publishing Ecosystem
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginBottom: '40px', maxWidth: '650px', margin: '0 auto 40px auto' }}>
            Comprehensive services powering authors, press teams, graphic artists, and book distributors.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#0f172a', padding: '28px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <BookOpen size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>Editorial & Proofreading</h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Content editing, grammar refinement, manuscript formatting, and translation across English, Hindi, and Marathi literature.
              </p>
            </div>

            <div style={{ background: '#0f172a', padding: '28px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Layers size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>Graphic & Cover Design</h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Eye-catching cover designs, vector illustrations, typography layout, jacket artwork, and eBook formatting.
              </p>
            </div>

            <div style={{ background: '#0f172a', padding: '28px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Printer size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>Offset & Digital Press</h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Industrial offset press printing, premium hardcovers, paperbacks, matte/gloss lamination, and foil stamping.
              </p>
            </div>

            <div style={{ background: '#0f172a', padding: '28px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Globe size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>National Distribution</h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
                ISBN allotment, warehouse order fulfillment, retail bookstore placement, and listing on Amazon & Flipkart.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="features" style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: '#f8fafc', marginBottom: '10px' }}>
          Why Leading Authors Choose Pustak Market
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginBottom: '40px' }}>
          Built for quality, transparency, and speed.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <Zap color="#6366f1" size={28} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: '#f8fafc' }}>Rapid Turnaround</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Automated milestone alerts and streamlined department workflows.</p>
            </div>
          </div>

          <div style={{ padding: '20px', textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <ShieldCheck color="#10b981" size={28} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: '#f8fafc' }}>100% Author Rights</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Complete copyright protection and transparent royalty tracking.</p>
            </div>
          </div>

          <div style={{ padding: '20px', textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <Award color="#f59e0b" size={28} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: '#f8fafc' }}>Premium Press Quality</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>High DPI print accuracy and durable binding quality standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #334155',
          background: '#090d16',
          padding: '32px 20px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#64748b',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div>
            <strong>PUSTAK MARKET EMS</strong> • Enterprise Book Publishing Platform © 2026
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/track" style={{ color: '#818cf8', textDecoration: 'none' }}>Live Tracker</Link>
            <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none' }}>Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
