import React from 'react';
import "./CustomerLayout.css";
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import CategoryNav from '../common/CategoryNav';
import Footer from '../common/Footer';
import OfflineBanner from '../common/OfflineBanner';

export const CustomerLayout = () => {
  const location = useLocation();
  const isProductDetailPage = location.pathname.startsWith('/products/');

  return (
    <div className="page-wrapper">
      <OfflineBanner />
      <Navbar />
      {!isProductDetailPage && <CategoryNav />}
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
