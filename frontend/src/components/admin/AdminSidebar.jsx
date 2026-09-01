import React from 'react';
import "./AdminSidebar.css";
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Store,
  Send,
  Cpu,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import phedoxLogoWhite from '../../assets/phedox-logo-white.png';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout, admin } = useAuth();

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: Layers },
    { to: '/admin/marketplaces', label: 'Marketplaces', icon: Store },
    { to: '/admin/telegram', label: 'Telegram Posts', icon: Send },
    { to: '/admin/processing', label: 'Processing Queue', icon: Cpu },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand */}
      <div className="admin-sidebar-brand" style={{ justifyContent: 'space-between' }}>
        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <img src={phedoxLogoWhite} alt="Phedox" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: '0.65rem', background: '#D90000', color: '#FFEA93', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
            ADMIN
          </span>
        </Link>
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onClose}
          style={{ color: 'white', background: 'transparent', display: isOpen ? 'block' : 'none' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav List */}
      <nav className="admin-nav">
        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', padding: '0.5rem 1rem' }}>
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div style={{ margin: '1rem 0', borderTop: '1px solid #1e293b' }} />

        <Link
          to="/"
          target="_blank"
          className="admin-nav-item"
          style={{ color: '#38bdf8' }}
        >
          <ExternalLink size={18} />
          <span>View Public Site</span>
        </Link>
      </nav>

      {/* Footer / User Profile & Logout */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {admin?.username || 'Administrator'}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{admin?.role || 'SUPER_ADMIN'}</span>
        </div>

        <button
          type="button"
          onClick={logout}
          style={{ color: '#ef4444', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
