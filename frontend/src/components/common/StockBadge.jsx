import React from 'react';
import "./StockBadge.css";
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const StockBadge = ({ status = 'IN_STOCK' }) => {
  const normalized = (status || '').toUpperCase();

  if (normalized === 'IN_STOCK') {
    return (
      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        <CheckCircle size={12} />
        <span>In Stock</span>
      </span>
    );
  }

  if (normalized === 'OUT_OF_STOCK') {
    return (
      <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        <XCircle size={12} />
        <span>Out of Stock</span>
      </span>
    );
  }

  return (
    <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      <AlertTriangle size={12} />
      <span>{status}</span>
    </span>
  );
};

export default StockBadge;
