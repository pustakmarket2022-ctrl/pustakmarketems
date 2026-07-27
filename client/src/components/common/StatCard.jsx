import React from 'react';

const StatCard = ({ icon: Icon, title, value, color = 'var(--primary)', subtext }) => {
  return (
    <div className="card stat-card">
      <div
        className="stat-icon-wrapper"
        style={{
          background: `${color}1A`, // 10% opacity
          color: color,
        }}
      >
        {Icon && <Icon size={26} />}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
        {subtext && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{subtext}</div>}
      </div>
    </div>
  );
};

export default StatCard;
