import React, { useState, useEffect } from 'react';
import "./OfflineBanner.css";
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      style={{
        backgroundColor: '#ef4444',
        color: '#ffffff',
        padding: '0.6rem 1rem',
        fontSize: '0.88rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        zIndex: 100,
        position: 'sticky',
        top: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
      }}
    >
      <WifiOff size={18} />
      <span>You are currently offline. Please check your internet connection.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: '#ffffff',
          border: 'none',
          padding: '0.2rem 0.6rem',
          borderRadius: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.8rem',
          cursor: 'pointer',
        }}
      >
        <RefreshCw size={12} />
        Retry
      </button>
    </div>
  );
};

export default OfflineBanner;
