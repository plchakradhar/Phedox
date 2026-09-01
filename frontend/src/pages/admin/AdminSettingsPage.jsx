import React from 'react';
import "./AdminSettingsPage.css";
import {
  Settings,
  Shield,
  User,
  Server,
  Bell,
  LogOut,
  CheckCircle2,
  Lock,
  Database,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsPage = () => {
  const { admin, logout } = useAuth();
  const { info } = useToast();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>System Settings & Administration</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Manage your administrator profile, view safe system configuration, and operational preferences.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        {/* Profile Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <User size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Admin Profile</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Username</span>
              <span style={{ fontWeight: 700 }}>{admin?.username || 'admin'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Role</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{admin?.role || 'SUPER_ADMIN'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Authentication</span>
              <span style={{ fontWeight: 600 }}>JWT Bearer Token</span>
            </div>
          </div>
        </div>

        {/* System & Architecture Status Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Server size={18} color="#10b981" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Platform Services & Health</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Spring Boot Backend (Port 8080)</span>
              </div>
              <span className="badge badge-success">ACTIVE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>PostgreSQL Database</span>
              </div>
              <span className="badge badge-success">CONNECTED</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Hourly Price Check Scheduler</span>
              </div>
              <span className="badge badge-success">RUNNING</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Dead Link & Stock Scheduler</span>
              </div>
              <span className="badge badge-success">RUNNING</span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Bell size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Notification & Ingestion Rules</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label className="filter-checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Strict 50% discount enforcement on all scrapers</span>
            </label>
            <label className="filter-checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Automatic unpublishing of out-of-stock items</span>
            </label>
            <label className="filter-checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Preserve original Telegram ExtraPe affiliate links</span>
            </label>
          </div>
        </div>

        {/* Security & Logout Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Lock size={18} color="#ef4444" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Security & Session</h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            To safeguard system security, database passwords, Telegram bot tokens, and server secrets are never exposed on client browsers.
          </p>

          <button
            type="button"
            className="btn btn-deal btn-sm"
            onClick={logout}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LogOut size={14} />
            <span>Sign Out of Administration</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
