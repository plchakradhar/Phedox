import React, { useState } from 'react';
import "./AdminLayout.css";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

export const AdminLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '120px', height: '20px' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Derive page title from route
  const getTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard Overview';
    if (path.startsWith('/admin/products/')) return 'Product Details & Edit';
    if (path === '/admin/products') return 'Products Management';
    if (path === '/admin/categories') return 'Categories Management';
    if (path === '/admin/marketplaces') return 'Marketplaces Configuration';
    if (path.startsWith('/admin/telegram/')) return 'Telegram Post Details';
    if (path === '/admin/telegram') return 'Telegram Deals Ingestion';
    if (path === '/admin/processing') return 'Processing Queue Monitor';
    if (path === '/admin/analytics') return 'Analytics & Reports';
    if (path === '/admin/settings') return 'Admin Settings';
    return 'Admin Control Panel';
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="admin-main-panel">
        <AdminTopbar
          title={getTitle()}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
