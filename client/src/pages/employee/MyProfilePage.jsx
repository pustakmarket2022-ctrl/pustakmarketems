import React, { useState, useContext, useEffect } from 'react';
import { User, Lock, Save, Camera } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { updateProfile, updatePassword } from '../../services/authService';
import { NotificationContext } from '../../context/NotificationContext';

const MyProfilePage = () => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('fullName', profileData.fullName);
    formData.append('phone', profileData.phone);
    formData.append('address', profileData.address);

    if (avatarFile) {
      formData.append('profileImage', avatarFile);
    }

    try {
      const res = await updateProfile(formData);
      updateUserProfile(res.user);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Profile update failed', 'danger');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return addToast('New passwords do not match!', 'danger');
    }

    try {
      await updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      addToast('Password changed successfully!', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Password change failed', 'danger');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Account & Profile</h1>
          <p className="page-subtitle">Manage personal information, avatar, and security credentials</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Profile Info Form */}
        <div className="card">
          <h3 className="flex-row" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
            <User size={20} color="var(--primary)" /> Profile Information
          </h3>

          <form onSubmit={handleProfileSubmit}>
            <div className="flex-row" style={{ gap: '16px', marginBottom: '20px' }}>
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt=""
                  style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div className="avatar-placeholder" style={{ width: '70px', height: '70px', fontSize: '1.8rem' }}>
                  {user?.fullName ? user.fullName.charAt(0) : 'U'}
                </div>
              )}

              <div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Camera size={14} /> Change Avatar
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                  />
                </label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {avatarFile ? avatarFile.name : 'JPG, PNG or GIF files supported'}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input type="text" className="form-input" value={user?.employeeId || ''} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-Only)</label>
              <input type="email" className="form-input" value={user?.email || ''} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
              <Save size={16} /> Save Profile Changes
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="flex-row" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
            <Lock size={20} color="var(--warning)" /> Change Password
          </h3>

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                className="form-input"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                className="form-input"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                className="form-input"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
