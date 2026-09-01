import React from 'react';
import "./EmptyState.css";
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = ShoppingBag,
  title = 'No Items Found',
  description = 'There are no items to display at this moment.',
  actionLabel,
  actionLink,
  onAction,
  secondaryActionLabel,
  secondaryActionLink,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <Icon size={32} />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.5, marginBottom: '1.5rem' }}>
        {description}
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionLabel && (
          actionLink ? (
            <Link to={actionLink} className="btn btn-primary btn-sm">
              <span>{actionLabel}</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={onAction}>
              <span>{actionLabel}</span>
            </button>
          )
        )}

        {secondaryActionLabel && secondaryActionLink && (
          <Link to={secondaryActionLink} className="btn btn-secondary btn-sm">
            <span>{secondaryActionLabel}</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
