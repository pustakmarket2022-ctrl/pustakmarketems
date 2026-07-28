import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookMarked, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@pustakmarket.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await login({ email, password });
      addToast(`Welcome back, ${res.user.fullName}!`, 'success');

      if (res.user.role === 'Employee') {
        navigate('/employee/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed. Invalid credentials.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent), var(--bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '12px',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
            }}
          >
            <BookMarked size={30} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>PUSTAK MARKET</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Book Publication Employee & Payroll Management System
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="search-input-wrapper" style={{ minWidth: '100%' }}>
              <Mail className="search-icon" size={18} />
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@pustakmarket.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex-row" style={{ justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem' }}>
                Forgot Password?
              </Link>
            </div>
            <div className="search-input-wrapper" style={{ minWidth: '100%', position: 'relative' }}>
              <Lock className="search-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', marginTop: '12px', padding: '12px' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
