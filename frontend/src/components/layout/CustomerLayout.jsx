import React from 'react';
import "./CustomerLayout.css";
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import CategoryNav from '../common/CategoryNav';
import Footer from '../common/Footer';
import OfflineBanner from '../common/OfflineBanner';

export const CustomerLayout = () => {
  return (
    <div className="page-wrapper">
      <OfflineBanner />
      <Navbar />
      <CategoryNav />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
