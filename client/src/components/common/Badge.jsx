import React from 'react';

const Badge = ({ type = 'info', text }) => {
  let badgeClass = 'badge-info';

  const lower = (text || '').toLowerCase();
  if (['active', 'approved', 'completed', 'paid', 'present'].includes(lower)) {
    badgeClass = 'badge-success';
  } else if (['pending', 'in progress', 'under review', 'processing', 'late', 'hybrid', 'planning'].includes(lower)) {
    badgeClass = 'badge-warning';
  } else if (['inactive', 'rejected', 'cancelled', 'terminated', 'absent', 'unpaid'].includes(lower)) {
    badgeClass = 'badge-danger';
  } else if (['monthly', 'task based', 'high', 'urgent'].includes(lower)) {
    badgeClass = 'badge-primary';
  }

  return <span className={`badge ${badgeClass}`}>{text}</span>;
};

export default Badge;
