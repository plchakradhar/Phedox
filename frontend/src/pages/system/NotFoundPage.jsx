import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Home, Tag, Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      className="container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        textAlign: 'center',
        padding: '3rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <Compass size={44} />
      </div>

      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Error 404
      </span>

      <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.5rem 0 1rem' }}>
        Page Not Found
      </h1>

      <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.6, marginBottom: '2rem' }}>
        Oops! The page or deal you're looking for doesn't exist, may have expired, or has moved to a new location.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary btn-lg">
          <Home size={18} />
          <span>Go to Homepage</span>
        </Link>
        <Link to="/deals" className="btn btn-secondary btn-lg">
          <Tag size={18} />
          <span>Browse 50%+ Deals</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
