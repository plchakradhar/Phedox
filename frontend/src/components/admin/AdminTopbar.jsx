import React from 'react';
import "./AdminTopbar.css";
import { Menu, Shield, User, LogOut, Bell, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminTopbar = ({ title, onMenuToggle }) => {
  const { admin, logout } = useAuth();

  return (
    <header className="admin-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onMenuToggle}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {title}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link
          to="/"
          target="_blank"
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ExternalLink size={14} />
          <span style={{ display: 'none', md: 'inline' }}>Public Site</span>
        </Link>

        {/* User Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.35rem 0.75rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {admin?.username ? admin.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {admin?.username || 'Admin'}
          </span>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={logout}
          title="Logout"
          style={{ color: 'var(--danger)' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
