import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Customer Layout & Pages
import CustomerLayout from './components/layout/CustomerLayout';
import HomePage from './pages/public/HomePage';
import DealsPage from './pages/public/DealsPage';
import CategoriesPage from './pages/public/CategoriesPage';
import CategoryDealsPage from './pages/public/CategoryDealsPage';
import SearchResultsPage from './pages/public/SearchResultsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Admin Layout & Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductEditPage from './pages/admin/AdminProductEditPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminMarketplacesPage from './pages/admin/AdminMarketplacesPage';
import AdminTelegramPostsPage from './pages/admin/AdminTelegramPostsPage';
import AdminTelegramPostDetailPage from './pages/admin/AdminTelegramPostDetailPage';
import AdminProcessingPage from './pages/admin/AdminProcessingPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// System Pages
import NotFoundPage from './pages/system/NotFoundPage';
import ScrollToTop from './components/common/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Customer Routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:categoryId" element={<CategoryDealsPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/:id" element={<AdminProductEditPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="marketplaces" element={<AdminMarketplacesPage />} />
              <Route path="telegram" element={<AdminTelegramPostsPage />} />
              <Route path="telegram/:id" element={<AdminTelegramPostDetailPage />} />
              <Route path="processing" element={<AdminProcessingPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* 404 Fallback */}
            <Route element={<CustomerLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
