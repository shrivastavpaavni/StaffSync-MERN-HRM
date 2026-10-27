import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend }) => {
  const colorMap = {
    primary: { bg: 'var(--primary-light)', text: 'var(--primary)' },
    success: { bg: 'var(--success-light)', text: 'var(--success)' },
    warning: { bg: 'var(--warning-light)', text: 'var(--warning)' },
    danger: { bg: 'var(--danger-light)', text: 'var(--danger)' },
    info: { bg: 'var(--info-light)', text: 'var(--info)' },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card-custom p-3 h-100">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div
            className="rounded-3 p-2 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: scheme.bg, color: scheme.text }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="d-flex align-items-baseline gap-2">
        <h3 className="fw-bold mb-0 text-dark">{value}</h3>
        {trend && (
          <span
            className="small fw-semibold"
            style={{ color: trend.startsWith('+') ? 'var(--success)' : 'var(--text-muted)' }}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="text-muted small mb-0 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
