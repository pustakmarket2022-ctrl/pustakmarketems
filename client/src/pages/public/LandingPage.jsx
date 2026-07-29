import React, { useState, useContext, useEffect } from 'react';
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
  Palette,
  Sun,
  Moon,
  RotateCcw,
  Sliders,
  Check,
  Eye,
  Brush,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { LanguageContext } from '../../context/LanguageContext';

// Preset Themes Definition
const PRESET_THEMES = {
  'cyber-midnight': {
    id: 'cyber-midnight',
    name: 'Cyber Midnight',
    nameMr: 'सायबर मिड्नाईट (इंडिगो)',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    bg: '#0f172a',
    cardBg: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8',
    border: 'rgba(99, 102, 241, 0.25)',
    mesh: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.35), rgba(139, 92, 246, 0.15) 50%, transparent 80%)',
    headerBg: 'rgba(15, 23, 42, 0.88)',
    badgeBg: 'rgba(99, 102, 241, 0.15)',
    glow: 'rgba(99, 102, 241, 0.4)',
    isDark: true,
  },
  'emerald-neon': {
    id: 'emerald-neon',
    name: 'Emerald Cyber',
    nameMr: 'एमराल्ड सायबर (हिरवा)',
    primary: '#10b981',
    secondary: '#06b6d4',
    bg: '#061412',
    cardBg: '#0f2923',
    text: '#f0fdf4',
    muted: '#86efac',
    border: 'rgba(16, 185, 129, 0.25)',
    mesh: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.35), rgba(6, 182, 212, 0.15) 50%, transparent 80%)',
    headerBg: 'rgba(6, 20, 18, 0.88)',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    glow: 'rgba(16, 185, 129, 0.4)',
    isDark: true,
  },
  'sunset-glow': {
    id: 'sunset-glow',
    name: 'Sunset Flame',
    nameMr: 'सनसेट फ्लेम (सोनेरी/लाल)',
    primary: '#f59e0b',
    secondary: '#f43f5e',
    bg: '#180e0a',
    cardBg: '#2a1710',
    text: '#fff7ed',
    muted: '#fdba74',
    border: 'rgba(245, 158, 11, 0.25)',
    mesh: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.35), rgba(244, 63, 94, 0.15) 50%, transparent 80%)',
    headerBg: 'rgba(24, 14, 10, 0.88)',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    glow: 'rgba(245, 158, 11, 0.4)',
    isDark: true,
  },
  'sapphire-royal': {
    id: 'sapphire-royal',
    name: 'Sapphire Ocean',
    nameMr: 'सफायर ओशन (निळा)',
    primary: '#0ea5e9',
    secondary: '#3b82f6',
    bg: '#0a1329',
    cardBg: '#132145',
    text: '#f0f9ff',
    muted: '#7dd3fc',
    border: 'rgba(14, 165, 233, 0.25)',
    mesh: 'radial-gradient(ellipse at top, rgba(14, 165, 233, 0.35), rgba(59, 130, 246, 0.15) 50%, transparent 80%)',
    headerBg: 'rgba(10, 19, 41, 0.88)',
    badgeBg: 'rgba(14, 165, 233, 0.15)',
    glow: 'rgba(14, 165, 233, 0.4)',
    isDark: true,
  },
  'amethyst-magic': {
    id: 'amethyst-magic',
    name: 'Amethyst Glow',
    nameMr: 'ॲमेथिस्ट ग्लो (जांभळा)',
    primary: '#a855f7',
    secondary: '#ec4899',
    bg: '#140924',
    cardBg: '#24123d',
    text: '#faf5ff',
    muted: '#d8b4fe',
    border: 'rgba(168, 85, 247, 0.25)',
    mesh: 'radial-gradient(ellipse at top, rgba(168, 85, 247, 0.35), rgba(236, 72, 153, 0.15) 50%, transparent 80%)',
    headerBg: 'rgba(20, 9, 36, 0.88)',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    glow: 'rgba(168, 85, 247, 0.4)',
    isDark: true,
  },
  'clean-studio': {
    id: 'clean-studio',
    name: 'Clean Light Studio',
    nameMr: 'क्लीन लाईट स्टुडिओ (पांढरा)',
    primary: '#4f46e5',
    secondary: '#0284c7',
    bg: '#f8fafc',
    cardBg: '#ffffff',
    text: '#0f172a',
    muted: '#475569',
    border: 'rgba(79, 70, 229, 0.2)',
    mesh: 'radial-gradient(ellipse at top, rgba(79, 70, 229, 0.15), rgba(2, 132, 199, 0.08) 50%, transparent 80%)',
    headerBg: 'rgba(255, 255, 255, 0.92)',
    badgeBg: 'rgba(79, 70, 229, 0.1)',
    glow: 'rgba(79, 70, 229, 0.25)',
    isDark: false,
  },
};

const COLOR_SWATCHES = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#a855f7', '#ec4899', '#ef4444', '#14b8a6'];

const LandingPage = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useContext(LanguageContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Load Saved Theme Settings or Default to 'cyber-midnight'
  const savedThemeConfig = localStorage.getItem('pustak_landing_theme_config');
  const initialConfig = savedThemeConfig ? JSON.parse(savedThemeConfig) : { preset: 'cyber-midnight' };

  const [themePreset, setThemePreset] = useState(initialConfig.preset || 'cyber-midnight');
  const [customPrimary, setCustomPrimary] = useState(initialConfig.customPrimary || '#6366f1');
  const [fontFamily, setFontFamily] = useState(initialConfig.fontFamily || 'system-ui');
  const [glassIntensity, setGlassIntensity] = useState(initialConfig.glassIntensity || 'high'); // 'high', 'solid', 'neon'

  // Get active theme tokens
  const activePreset = PRESET_THEMES[themePreset] || PRESET_THEMES['cyber-midnight'];

  const primaryColor = themePreset === 'custom' ? customPrimary : activePreset.primary;
  const secondaryColor = activePreset.secondary;
  const bgColor = activePreset.bg;
  const cardBgColor = glassIntensity === 'solid' ? (activePreset.isDark ? '#1e293b' : '#ffffff') : activePreset.cardBg;
  const textColor = activePreset.text;
  const mutedColor = activePreset.muted;
  const borderColor = glassIntensity === 'neon' ? primaryColor : activePreset.border;
  const meshBg = activePreset.mesh;
  const headerBg = activePreset.headerBg;
  const badgeBg = activePreset.badgeBg;
  const glowColor = activePreset.glow;

  // Persist Theme Config
  useEffect(() => {
    const configToSave = {
      preset: themePreset,
      customPrimary,
      fontFamily,
      glassIntensity,
    };
    localStorage.setItem('pustak_landing_theme_config', JSON.stringify(configToSave));
  }, [themePreset, customPrimary, fontFamily, glassIntensity]);

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

  const resetTheme = () => {
    setThemePreset('cyber-midnight');
    setCustomPrimary('#6366f1');
    setFontFamily('system-ui');
    setGlassIntensity('high');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bgColor,
        color: textColor,
        overflowX: 'hidden',
        fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'mono' ? 'Courier New, monospace' : 'system-ui, -apple-system, sans-serif',
        transition: 'background 0.4s ease, color 0.4s ease',
      }}
    >
      {/* Sticky Header Navbar */}
      <header
        style={{
          minHeight: '70px',
          background: headerBg,
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${borderColor}`,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 200,
          boxShadow: `0 4px 20px rgba(0,0,0,0.1)`,
          transition: 'background 0.4s ease, border-color 0.4s ease',
        }}
      >
        {/* Brand Logo */}
        <div className="flex-row" style={{ gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: `0 4px 16px ${glowColor}`,
              transition: 'all 0.3s ease',
            }}
          >
            <BookMarked size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', lineHeight: '1.2', color: textColor }}>
              PUSTAK MARKET
            </div>
            <div style={{ fontSize: '0.72rem', color: mutedColor, fontWeight: 600 }}>
              Book Publishing EMS
            </div>
          </div>
        </div>

        {/* Desktop Nav Links & Actions */}
        <div className="landing-desktop-nav flex-row" style={{ gap: '16px' }}>
          <a href="#tracker" style={{ color: mutedColor, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>
            {t('trackBookStatus') || 'Track Project'}
          </a>
          <a href="#ecosystem" style={{ color: mutedColor, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>
            Services
          </a>
          <a href="#features" style={{ color: mutedColor, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}>
            Why Choose Us
          </a>

          {/* Theme Customizer Trigger Button */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            style={{
              background: badgeBg,
              border: `1px solid ${borderColor}`,
              color: primaryColor,
              padding: '6px 14px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: `0 2px 8px ${glowColor}`,
              transition: 'all 0.3s ease',
            }}
            title="Theme Customizer (हवी तशी थीम)"
          >
            <Palette size={15} />
            {language === 'mr' ? 'थीम बदला' : '🎨 Theme'}
          </button>

          {/* Bilingual Switcher */}
          <button
            onClick={toggleLanguage}
            style={{
              background: badgeBg,
              border: `1px solid ${borderColor}`,
              color: primaryColor,
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
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${glowColor}`,
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
            color: textColor,
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
            background: bgColor,
            borderBottom: `1px solid ${borderColor}`,
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
            style={{ color: textColor, fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            🔍 Track Project
          </a>
          <a
            href="#ecosystem"
            style={{ color: textColor, fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            📚 Publishing Services
          </a>
          <a
            href="#features"
            style={{ color: textColor, fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            ⚡ Why Choose Us
          </a>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setIsThemeModalOpen(true);
                setMobileMenuOpen(false);
              }}
              style={{
                flex: 1,
                background: badgeBg,
                border: `1px solid ${borderColor}`,
                color: primaryColor,
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
              <Palette size={16} /> Theme Customizer
            </button>

            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              style={{
                flex: 1,
                background: badgeBg,
                border: `1px solid ${borderColor}`,
                color: primaryColor,
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
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
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
          background: meshBg,
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
            background: badgeBg,
            border: `1px solid ${borderColor}`,
            color: primaryColor,
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '22px',
            boxShadow: `0 4px 14px ${glowColor}`,
          }}
        >
          <Sparkles size={16} color={primaryColor} /> Enterprise Book Publishing & Management System
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5.5vw, 3.8rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            background: activePreset.isDark
              ? 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Streamlining Book Publishing <br /> & Live Author Tracking
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
            color: mutedColor,
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
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: '#ffffff',
              fontWeight: 700,
              boxShadow: `0 6px 20px ${glowColor}`,
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
              background: cardBgColor,
              border: `1px solid ${borderColor}`,
              color: textColor,
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
            background: cardBgColor,
            borderRadius: '16px',
            border: `1px solid ${borderColor}`,
            backdropFilter: 'blur(12px)',
            boxShadow: `0 10px 30px rgba(0,0,0,0.15)`,
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: primaryColor, margin: 0 }}>500+</h3>
            <span style={{ fontSize: '0.8rem', color: mutedColor }}>Books Published</span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', margin: 0 }}>99.4%</h3>
            <span style={{ fontSize: '0.8rem', color: mutedColor }}>On-Time Release</span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', margin: 0 }}>50+</h3>
            <span style={{ fontSize: '0.8rem', color: mutedColor }}>Specialist Staff</span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: secondaryColor, margin: 0 }}>24/7</h3>
            <span style={{ fontSize: '0.8rem', color: mutedColor }}>Real-Time Status</span>
          </div>
        </div>
      </section>

      {/* Public Real-Time Project Tracker Widget */}
      <section id="tracker" style={{ padding: '40px 20px 60px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <div
          style={{
            padding: 'clamp(20px, 4vw, 36px)',
            borderRadius: '20px',
            background: cardBgColor,
            border: `1px solid ${borderColor}`,
            boxShadow: `0 20px 40px rgba(0, 0, 0, 0.25)`,
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: textColor, margin: 0 }}>
              Live Publication Status Tracker
            </h2>
            <p style={{ fontSize: '0.9rem', color: mutedColor, marginTop: '6px' }}>
              Enter your Project ID, ISBN, or Book Title to check live publishing stages.
            </p>
          </div>

          <form onSubmit={handleTrackProject}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 260px', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: mutedColor }} size={20} />
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 46px',
                    fontSize: '1rem',
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    color: textColor,
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
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  color: '#ffffff',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: `0 4px 14px ${glowColor}`,
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
                background: bgColor,
                border: `1px solid ${primaryColor}`,
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div className="flex-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ color: primaryColor, fontSize: '1rem' }}>
                  {trackingData.projectId}
                </strong>
                <Badge text={trackingData.status} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: textColor, margin: '0 0 6px 0' }}>
                  {trackingData.bookName}
                </h3>
                <div style={{ fontSize: '0.9rem', color: mutedColor }}>
                  Author: <strong style={{ color: textColor }}>{trackingData.author}</strong> | Format: <strong style={{ color: textColor }}>{trackingData.publicationType}</strong> ({trackingData.category})
                </div>
                {trackingData.ISBN && (
                  <div style={{ fontSize: '0.8rem', color: mutedColor, marginTop: '4px' }}>
                    ISBN: {trackingData.ISBN}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span style={{ color: mutedColor }}>Publication Progress</span>
                  <strong style={{ color: primaryColor }}>{trackingData.completionPercentage}% Completed</strong>
                </div>
                <div style={{ height: '10px', background: cardBgColor, borderRadius: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${trackingData.completionPercentage}%`,
                      background: `linear-gradient(90deg, ${primaryColor}, #10b981)`,
                      borderRadius: '10px',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>

              {/* Milestones List */}
              <div style={{ paddingTop: '16px', borderTop: `1px solid ${borderColor}` }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: mutedColor, marginBottom: '12px' }}>
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
                          background: m.status === 'In Progress' ? badgeBg : cardBgColor,
                          border: m.status === 'In Progress' ? `1px solid ${primaryColor}` : `1px solid ${borderColor}`,
                          borderRadius: '10px',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        <div className="flex-row" style={{ gap: '12px' }}>
                          {m.status === 'Completed' && <CheckCircle2 size={20} color="#10b981" />}
                          {m.status === 'In Progress' && <Clock size={20} color={primaryColor} />}
                          {m.status === 'Pending' && <Circle size={20} color={mutedColor} />}
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: m.status === 'Pending' ? mutedColor : textColor }}>
                              Step {idx + 1}: {m.stepName}
                            </strong>
                            {m.notes && <div style={{ fontSize: '0.78rem', color: mutedColor }}>{m.notes}</div>}
                          </div>
                        </div>
                        <Badge text={m.status} />
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: mutedColor, textAlign: 'center' }}>
                      Editorial ➔ Graphic Design ➔ Proofreading ➔ Press Printing ➔ Distribution
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.85rem', color: mutedColor, flexWrap: 'wrap', gap: '8px' }}>
                <div>Assigned Specialists: <strong style={{ color: textColor }}>{trackingData.teamCount || 4}</strong></div>
                <div>Target Release: <strong style={{ color: textColor }}>{new Date(trackingData.deadline).toLocaleDateString()}</strong></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Services Ecosystem Section */}
      <section id="ecosystem" style={{ padding: '60px 20px', background: cardBgColor, borderTop: `1px solid ${borderColor}`, transition: 'background 0.4s ease' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: textColor, marginBottom: '10px' }}>
            Complete Book Publishing Ecosystem
          </h2>
          <p style={{ fontSize: '0.95rem', color: mutedColor, marginBottom: '40px', maxWidth: '650px', margin: '0 auto 40px auto' }}>
            Comprehensive services powering authors, press teams, graphic artists, and book distributors.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div className="theme-card-hover" style={{ background: bgColor, padding: '28px', borderRadius: '16px', border: `1px solid ${borderColor}`, textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: badgeBg, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <BookOpen size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, marginBottom: '8px' }}>Editorial & Proofreading</h3>
              <p style={{ fontSize: '0.88rem', color: mutedColor, lineHeight: 1.6 }}>
                Content editing, grammar refinement, manuscript formatting, and translation across English, Hindi, and Marathi literature.
              </p>
            </div>

            <div className="theme-card-hover" style={{ background: bgColor, padding: '28px', borderRadius: '16px', border: `1px solid ${borderColor}`, textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: badgeBg, color: secondaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Layers size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, marginBottom: '8px' }}>Graphic & Cover Design</h3>
              <p style={{ fontSize: '0.88rem', color: mutedColor, lineHeight: 1.6 }}>
                Eye-catching cover designs, vector illustrations, typography layout, jacket artwork, and eBook formatting.
              </p>
            </div>

            <div className="theme-card-hover" style={{ background: bgColor, padding: '28px', borderRadius: '16px', border: `1px solid ${borderColor}`, textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: badgeBg, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Printer size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, marginBottom: '8px' }}>Offset & Digital Press</h3>
              <p style={{ fontSize: '0.88rem', color: mutedColor, lineHeight: 1.6 }}>
                Industrial offset press printing, premium hardcovers, paperbacks, matte/gloss lamination, and foil stamping.
              </p>
            </div>

            <div className="theme-card-hover" style={{ background: bgColor, padding: '28px', borderRadius: '16px', border: `1px solid ${borderColor}`, textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: badgeBg, color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Globe size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, marginBottom: '8px' }}>National Distribution</h3>
              <p style={{ fontSize: '0.88rem', color: mutedColor, lineHeight: 1.6 }}>
                ISBN allotment, warehouse order fulfillment, retail bookstore placement, and listing on Amazon & Flipkart.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="features" style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: textColor, marginBottom: '10px' }}>
          Why Leading Authors Choose Pustak Market
        </h2>
        <p style={{ fontSize: '0.95rem', color: mutedColor, marginBottom: '40px' }}>
          Built for quality, transparency, and speed.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <Zap color={primaryColor} size={28} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: textColor }}>Rapid Turnaround</h4>
              <p style={{ fontSize: '0.85rem', color: mutedColor, margin: 0 }}>Automated milestone alerts and streamlined department workflows.</p>
            </div>
          </div>

          <div style={{ padding: '20px', textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <ShieldCheck color="#10b981" size={28} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: textColor }}>100% Author Rights</h4>
              <p style={{ fontSize: '0.85rem', color: mutedColor, margin: 0 }}>Complete copyright protection and transparent royalty tracking.</p>
            </div>
          </div>

          <div style={{ padding: '20px', textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <Award color="#f59e0b" size={28} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: textColor }}>Premium Press Quality</h4>
              <p style={{ fontSize: '0.85rem', color: mutedColor, margin: 0 }}>High DPI print accuracy and durable binding quality standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Theme Customizer Button (Bottom-Right) */}
      <button
        onClick={() => setIsThemeModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 300,
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          color: '#ffffff',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '30px',
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: `0 8px 24px ${glowColor}`,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        className="theme-card-hover"
      >
        <Palette size={18} />
        <span>{language === 'mr' ? 'हवी तशी थीम' : 'Customize Theme'}</span>
      </button>

      {/* Interactive Theme Customizer Drawer / Modal */}
      {isThemeModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 400,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setIsThemeModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              height: '100%',
              background: cardBgColor,
              color: textColor,
              borderLeft: `1px solid ${borderColor}`,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Brush size={24} color={primaryColor} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: textColor }}>
                      {language === 'mr' ? 'थीम सानुकूलित करा' : 'Landing Theme Customizer'}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: mutedColor }}>
                      {language === 'mr' ? 'हवी तशी थीम आणि रंगे निवडा' : 'Customize presets, accent colors & styles'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsThemeModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: mutedColor, cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Theme Presets Section */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: primaryColor, display: 'block', marginBottom: '10px' }}>
                  🎨 PRESET THEMES ({Object.keys(PRESET_THEMES).length})
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {Object.values(PRESET_THEMES).map((preset) => {
                    const isSelected = themePreset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setThemePreset(preset.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '12px',
                          background: preset.bg,
                          border: isSelected ? `2px solid ${preset.primary}` : `1px solid ${preset.border}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? `0 4px 14px ${preset.glow}` : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: preset.primary }} />
                          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: preset.secondary }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: preset.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {language === 'mr' ? preset.nameMr : preset.name}
                          </div>
                        </div>
                        {isSelected && <Check size={16} color={preset.primary} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Accent Swatches */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: primaryColor, display: 'block', marginBottom: '10px' }}>
                  ✨ PRIMARY ACCENT COLOR
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch}
                      onClick={() => {
                        setThemePreset('custom');
                        setCustomPrimary(swatch);
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: swatch,
                        border: primaryColor === swatch ? '3px solid #ffffff' : 'none',
                        cursor: 'pointer',
                        boxShadow: primaryColor === swatch ? `0 0 10px ${swatch}` : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                      }}
                    >
                      {primaryColor === swatch && <Check size={14} />}
                    </button>
                  ))}

                  {/* HTML Color Picker */}
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => {
                      setThemePreset('custom');
                      setCustomPrimary(e.target.value);
                    }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: `1px solid ${borderColor}`,
                      cursor: 'pointer',
                      background: 'none',
                    }}
                    title="Custom Color Picker"
                  />
                </div>
              </div>

              {/* Card Glassmorphism / Style Option */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: primaryColor, display: 'block', marginBottom: '10px' }}>
                  💎 CARD GLASSMORPHISM & STYLE
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'high', label: 'Glass Blur' },
                    { id: 'solid', label: 'Solid Slate' },
                    { id: 'neon', label: 'Neon Border' },
                  ].map((styleOpt) => (
                    <button
                      key={styleOpt.id}
                      onClick={() => setGlassIntensity(styleOpt.id)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: glassIntensity === styleOpt.id ? badgeBg : bgColor,
                        border: glassIntensity === styleOpt.id ? `1px solid ${primaryColor}` : `1px solid ${borderColor}`,
                        color: glassIntensity === styleOpt.id ? primaryColor : mutedColor,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      {styleOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography Font Selector */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: primaryColor, display: 'block', marginBottom: '10px' }}>
                  🔤 TYPOGRAPHY FONT
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'system-ui', label: 'Modern Sans' },
                    { id: 'serif', label: 'Book Serif' },
                    { id: 'mono', label: 'Tech Mono' },
                  ].map((fontOpt) => (
                    <button
                      key={fontOpt.id}
                      onClick={() => setFontFamily(fontOpt.id)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: fontFamily === fontOpt.id ? badgeBg : bgColor,
                        border: fontFamily === fontOpt.id ? `1px solid ${primaryColor}` : `1px solid ${borderColor}`,
                        color: fontFamily === fontOpt.id ? primaryColor : mutedColor,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      {fontOpt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div style={{ paddingTop: '16px', borderTop: `1px solid ${borderColor}`, display: 'flex', gap: '12px' }}>
              <button
                onClick={resetTheme}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  color: mutedColor,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw size={15} /> Reset
              </button>

              <button
                onClick={() => setIsThemeModalOpen(false)}
                style={{
                  flex: 2,
                  padding: '10px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${glowColor}`,
                }}
              >
                {language === 'mr' ? 'थीम लागू करा' : 'Apply Theme'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${borderColor}`,
          background: activePreset.isDark ? '#090d16' : '#e2e8f0',
          padding: '32px 20px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: mutedColor,
          transition: 'background 0.4s ease',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div>
            <strong>PUSTAK MARKET EMS</strong> • Enterprise Book Publishing Platform © 2026
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/track" style={{ color: primaryColor, textDecoration: 'none' }}>Live Tracker</Link>
            <Link to="/login" style={{ color: primaryColor, textDecoration: 'none' }}>Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
