import React from 'react';
import "./KPICard.css";

export const KPICard = ({
  title,
  value,
  icon: Icon,
  color = '#2563eb',
  bgColor = '#eff6ff',
  subText,
}) => {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ backgroundColor: bgColor, color: color }}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="kpi-info">
        <span className="kpi-label">{title}</span>
        <span className="kpi-value">{value !== undefined && value !== null ? value : '-'}</span>
        {subText && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{subText}</span>}
      </div>
    </div>
  );
};

export default KPICard;
