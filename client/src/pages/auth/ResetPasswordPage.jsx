import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, BookMarked } from 'lucide-react';
import { resetPassword } from '../../services/authService';
import { NotificationContext } from '../../context/NotificationContext';

const ResetPasswordPage = () => {
  const { resettoken } = useParams();
  const navigate = useNavigate();
  const { addToast } = useContext(NotificationContext);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return addToast('Passwords do not match', 'danger');
    }

    setSubmitting(true);
    try {
      await resetPassword(resettoken, password);
      addToast('Password reset successfully! Please login with your new password.', 'success');
      navigate('/login');
    } catch (err) {
      addToast(err.response?.data?.message || 'Password reset failed', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'var(--bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '10px',
            }}
          >
            <BookMarked size={26} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Set New Password</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="search-input-wrapper" style={{ minWidth: '100%' }}>
              <Lock className="search-icon" size={18} />
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="search-input-wrapper" style={{ minWidth: '100%' }}>
              <Lock className="search-icon" size={18} />
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', marginTop: '12px' }}
          >
            {submitting ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
