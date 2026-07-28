import React, { useState, useEffect, useContext } from 'react';
import { Save, Building2, ShieldCheck, Plus, Trash2, Layers } from 'lucide-react';
import { getDepartments, createDepartment, deleteDepartment } from '../../services/departmentService';
import { NotificationContext } from '../../context/NotificationContext';

const SettingsPage = () => {
  const { addToast } = useContext(NotificationContext);
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [submittingDept, setSubmittingDept] = useState(false);

  const [companyData, setCompanyData] = useState({
    companyName: 'Pustak Market Publications & Distribution Pvt Ltd',
    tagline: 'Leading Book Publishing & Distribution Company',
    taxId: 'GSTIN2026-PUSTAK-88',
    supportEmail: 'hr@pustakmarket.com',
    currency: 'INR (₹)',
    workShiftStart: '09:00',
    workShiftEnd: '17:30',
  });

  const fetchDepts = async () => {
    try {
      setLoadingDepts(true);
      const res = await getDepartments();
      setDepartments(res.data || []);
    } catch (e) {
      addToast('Failed to load departments', 'danger');
    } finally {
      setLoadingDepts(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    setSubmittingDept(true);
    try {
      const res = await createDepartment({ name: newDeptName, description: newDeptDesc });
      setDepartments([...departments, res.data]);
      setNewDeptName('');
      setNewDeptDesc('');
      addToast(`Department '${res.data.name}' added successfully!`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add department', 'danger');
    } finally {
      setSubmittingDept(false);
    }
  };

  const handleDeleteDept = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove '${name}' department?`)) return;

    try {
      await deleteDepartment(id);
      setDepartments(departments.filter((d) => d._id !== id));
      addToast(`Department '${name}' removed successfully!`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete department', 'danger');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    addToast('System settings saved successfully!', 'success');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings & Company Configuration</h1>
          <p className="page-subtitle">Manage company details, dynamic departments (add/remove), and shift rules</p>
        </div>
      </div>

      <div style={{ maxWidth: '900px' }}>
        {/* Dynamic Department Management Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 className="flex-row" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', gap: '8px' }}>
            <Layers size={22} color="var(--primary)" /> Department Management (Add / Remove Departments)
          </h3>

          <form onSubmit={handleAddDept} className="flex-row" style={{ gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="New Department Name (e.g. R&D, Legal)"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              style={{ flex: '1 1 220px' }}
              required
            />
            <input
              type="text"
              className="form-input"
              placeholder="Description (Optional)"
              value={newDeptDesc}
              onChange={(e) => setNewDeptDesc(e.target.value)}
              style={{ flex: '1 1 220px' }}
            />
            <button type="submit" className="btn btn-primary" disabled={submittingDept}>
              <Plus size={16} /> Add Department
            </button>
          </form>

          {loadingDepts ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading departments...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {departments.map((dept) => (
                <div
                  key={dept._id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{dept.name}</div>
                    {dept.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dept.description}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteDept(dept._id, dept.name)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                    title="Remove Department"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Company Settings Form */}
        <form onSubmit={handleSave}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 className="flex-row" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', gap: '8px' }}>
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
            <h3 className="flex-row" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', gap: '8px' }}>
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
    </div>
  );
};

export default SettingsPage;
