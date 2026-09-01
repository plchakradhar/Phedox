import React from 'react';
import "./ErrorState.css";
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ErrorState = ({
  title = 'Something Went Wrong',
  message = 'Failed to load content from the server. Please check your connection and try again.',
  onRetry,
  showHomeButton = true,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid #fee2e2',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#fef2f2',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <AlertCircle size={28} />
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5, marginBottom: '1.5rem' }}>
        {message}
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {onRetry && (
          <button type="button" className="btn btn-primary btn-sm" onClick={onRetry}>
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        )}

        {showHomeButton && (
          <Link to="/" className="btn btn-secondary btn-sm">
            <Home size={14} />
            <span>Go to Home</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
