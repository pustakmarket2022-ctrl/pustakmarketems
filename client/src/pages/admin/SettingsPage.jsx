import React, { useState, useContext } from 'react';
import { Save, Building2, ShieldCheck, Mail } from 'lucide-react';
import { NotificationContext } from '../../context/NotificationContext';

const SettingsPage = () => {
  const { addToast } = useContext(NotificationContext);
  const [companyData, setCompanyData] = useState({
    companyName: 'Pustak Market Publications & Distribution Pvt Ltd',
    tagline: 'Leading Book Publishing & Distribution Company',
    taxId: 'GSTIN2026-PUSTAK-88',
    supportEmail: 'hr@pustakmarket.com',
    currency: 'INR (₹)',
    workShiftStart: '09:00',
    workShiftEnd: '17:30',
  });

  const handleSave = (e) => {
    e.preventDefault();
    addToast('System settings saved successfully!', 'success');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings & Company Configuration</h1>
          <p className="page-subtitle">Configure organization profile, working shift hours, tax parameters, & email defaults</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: '800px' }}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 className="flex-row" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
            <Building2 size={20} color="var(--primary)" /> Organization Profile
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Company Official Name</label>
              <input
                type="text"
                className="form-input"
                value={companyData.companyName}
                onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Tagline</label>
              <input
                type="text"
                className="form-input"
                value={companyData.tagline}
                onChange={(e) => setCompanyData({ ...companyData, tagline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tax Registration / GSTIN</label>
              <input
                type="text"
                className="form-input"
                value={companyData.taxId}
                onChange={(e) => setCompanyData({ ...companyData, taxId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official HR Email</label>
              <input
                type="email"
                className="form-input"
                value={companyData.supportEmail}
                onChange={(e) => setCompanyData({ ...companyData, supportEmail: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payroll Currency</label>
              <input
                type="text"
                className="form-input"
                value={companyData.currency}
                onChange={(e) => setCompanyData({ ...companyData, currency: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 className="flex-row" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
            <ShieldCheck size={20} color="var(--success)" /> Attendance & Shift Rules
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Shift Start Time (Late Trigger)</label>
              <input
                type="time"
                className="form-input"
                value={companyData.workShiftStart}
                onChange={(e) => setCompanyData({ ...companyData, workShiftStart: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shift End Time</label>
              <input
                type="time"
                className="form-input"
                value={companyData.workShiftEnd}
                onChange={(e) => setCompanyData({ ...companyData, workShiftEnd: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          <Save size={18} /> Save Settings Configuration
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
