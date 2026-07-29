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
  Sun,
  Moon,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { LanguageContext } from '../../context/LanguageContext';
import { ThemeContext } from '../../context/ThemeContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useContext(LanguageContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

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
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        overflowX: 'hidden',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Sticky Header Navbar */}
      <header
        style={{
          minHeight: '70px',
          background: 'var(--bg-header)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 200,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Brand Logo */}
        <div className="flex-row" style={{ gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 16px var(--landing-glow)',
              transition: 'all 0.3s ease',
            }}
          >
            <BookMarked size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', lineHeight: '1.2', color: 'var(--text-main)' }}>
              PUSTAK MARKET
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Book Publishing EMS
            </div>
          </div>
        </div>

        {/* Desktop Nav Links & Actions */}
        <div className="landing-desktop-nav flex-row" style={{ gap: '16px' }}>
          <a href="#tracker" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>
            {t('trackBookStatus') || 'Track Project'}
          </a>
          <a href="#ecosystem" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>
            Services
          </a>
          <a href="#features" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>
            Why Choose Us
          </a>

          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Toggle Theme (Dark / Light)"
          >
            {theme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#6366F1" />}
          </button>

          {/* Bilingual Switcher */}
          <button
            onClick={toggleLanguage}
            style={{
              background: 'var(--landing-badge-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--primary)',
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
            style={{
              padding: '9px 18px',
              fontSize: '0.88rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px var(--landing-glow)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={() => navigate('/login')}
          >
            {t('employeePortal') || 'Sign In'} <ArrowRight size={15} />
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="landing-mobile-toggle"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
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
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-color)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 190,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          }}
        >
          <a
            href="#tracker"
            style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            🔍 Track Project
          </a>
          <a
            href="#ecosystem"
            style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            📚 Publishing Services
          </a>
          <a
            href="#features"
            style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            ⚡ Why Choose Us
          </a>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                toggleTheme();
              }}
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
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
              {theme === 'dark' ? <Sun size={16} color="#F59E0B" /> : <Moon size={16} color="#6366F1" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              style={{
                flex: 1,
                background: 'var(--landing-badge-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--primary)',
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
              <Globe size={16} /> {language === 'en' ? 'मराठी भाषा' : 'English'}
            </button>
          </div>

          <button
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.95rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/login');
            }}
          >
            Staff Portal Sign In <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Hero Banner Section */}
      <section
        style={{
          padding: '65px 20px 45px 20px',
          textAlign: 'center',
          background: 'var(--landing-mesh)',
          maxWidth: '1200px',
          margin: '0 auto',
          transition: 'background 0.5s ease',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            background: 'var(--landing-badge-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--primary)',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '22px',
            boxShadow: '0 4px 14px var(--landing-glow)',
          }}
        >
          <Sparkles size={16} color="var(--primary)" /> Enterprise Book Publishing & Management System
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5.5vw, 3.8rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            color: 'var(--text-main)',
          }}
        >
          Streamlining Book Publishing <br /> & Live Author Tracking
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
            color: 'var(--text-secondary)',
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
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#ffffff',
              fontWeight: 700,
              boxShadow: '0 6px 20px var(--landing-glow)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease',
            }}
          >
            <Search size={18} /> Track Book Project
          </a>
          <button
            style={{
              padding: '14px 24px',
              fontSize: '1rem',
              borderRadius: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontWeight: 700,
              cursor: 'pointer',
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
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>500+</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Books Published</span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', margin: 0 }}>99.4%</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>On-Time Release</span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)', margin: 0 }}>50+</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Specialist Staff</span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>24/7</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Real-Time Status</span>
          </div>
        </div>
      </section>

      {/* Public Real-Time Project Tracker Widget */}
      <section id="tracker" style={{ padding: '40px 20px 60px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <div
          style={{
            padding: 'clamp(20px, 4vw, 36px)',
            borderRadius: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Live Publication Status Tracker
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Enter your Project ID, ISBN, or Book Title to check live publishing stages.
            </p>
          </div>

          <form onSubmit={handleTrackProject}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 260px', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 46px',
                    fontSize: '1rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    color: 'var(--text-main)',
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
                style={{
                  padding: '14px 28px',
                  fontSize: '1rem',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                  flex: '0 0 auto',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: '#ffffff',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px var(--landing-glow)',
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
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
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
                background: 'var(--bg-main)',
                border: '1px solid var(--primary)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div className="flex-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>
                  {trackingData.projectId}
                </strong>
                <Badge text={trackingData.status} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                  {trackingData.bookName}
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Author: <strong style={{ color: 'var(--text-main)' }}>{trackingData.author}</strong> | Format: <strong style={{ color: 'var(--text-main)' }}>{trackingData.publicationType}</strong> ({trackingData.category})
                </div>
                {trackingData.ISBN && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    ISBN: {trackingData.ISBN}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Publication Progress</span>
                  <strong style={{ color: 'var(--primary)' }}>{trackingData.completionPercentage}% Completed</strong>
                </div>
                <div style={{ height: '10px', background: 'var(--bg-input)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${trackingData.completionPercentage}%`,
                      background: 'linear-gradient(90deg, var(--primary), var(--success))',
                      borderRadius: '10px',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>

              {/* Milestones List */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
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
                          background: m.status === 'In Progress' ? 'var(--primary-light)' : 'var(--bg-card)',
                          border: m.status === 'In Progress' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          borderRadius: '10px',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        <div className="flex-row" style={{ gap: '12px' }}>
                          {m.status === 'Completed' && <CheckCircle2 size={20} color="var(--success)" />}
                          {m.status === 'In Progress' && <Clock size={20} color="var(--primary)" />}
                          {m.status === 'Pending' && <Circle size={20} color="var(--text-muted)" />}
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: m.status === 'Pending' ? 'var(--text-muted)' : 'var(--text-main)' }}>
                              Step {idx + 1}: {m.stepName}
                            </strong>
                            {m.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{m.notes}</div>}
                          </div>
                        </div>
                        <Badge text={m.status} />
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                      Editorial ➔ Graphic Design ➔ Proofreading ➔ Press Printing ➔ Distribution
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '8px' }}>
                <div>Assigned Specialists: <strong style={{ color: 'var(--text-main)' }}>{trackingData.teamCount || 4}</strong></div>
                <div>Target Release: <strong style={{ color: 'var(--text-main)' }}>{new Date(trackingData.deadline).toLocaleDateString()}</strong></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Services Ecosystem Section */}
      <section id="ecosystem" style={{ padding: '60px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', transition: 'background 0.3s ease' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text-main)', marginBottom: '10px' }}>
            Complete Book Publishing Ecosystem
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '650px', margin: '0 auto 40px auto' }}>
            Comprehensive services powering authors, press teams, graphic artists, and book distributors.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div className="theme-card-hover" style={{ background: 'var(--bg-main)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <BookOpen size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Editorial & Proofreading</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Content editing, grammar refinement, manuscript formatting, and translation across English, Hindi, and Marathi literature.
              </p>
            </div>

            <div className="theme-card-hover" style={{ background: 'var(--bg-main)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Layers size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Graphic & Cover Design</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Eye-catching cover designs, vector illustrations, typography layout, jacket artwork, and eBook formatting.
              </p>
            </div>

            <div className="theme-card-hover" style={{ background: 'var(--bg-main)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Printer size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Offset & Digital Press</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Industrial offset press printing, premium hardcovers, paperbacks, matte/gloss lamination, and foil stamping.
              </p>
            </div>

            <div className="theme-card-hover" style={{ background: 'var(--bg-main)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Globe size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>National Distribution</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                ISBN allotment, warehouse order fulfillment, retail bookstore placement, and listing on Amazon & Flipkart.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="features" style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text-main)', marginBottom: '10px' }}>
          Why Leading Authors Choose Pustak Market
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
          Built for quality, transparency, and speed.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <Zap color="var(--primary)" size={28} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>Rapid Turnaround</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Automated milestone alerts and streamlined department workflows.</p>
            </div>
          </div>

          <div style={{ padding: '20px', textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <ShieldCheck color="var(--success)" size={28} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>100% Author Rights</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Complete copyright protection and transparent royalty tracking.</p>
            </div>
          </div>

          <div style={{ padding: '20px', textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <Award color="var(--warning)" size={28} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>Premium Press Quality</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>High DPI print accuracy and durable binding quality standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          background: 'var(--landing-footer-bg)',
          padding: '32px 20px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          transition: 'background 0.3s ease',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div>
            <strong>PUSTAK MARKET EMS</strong> • Enterprise Book Publishing Platform © 2026
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/track" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Live Tracker</Link>
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
