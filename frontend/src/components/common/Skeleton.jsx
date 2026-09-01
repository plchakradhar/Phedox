import React from 'react';
import "./Skeleton.css";

export const ProductCardSkeleton = () => {
  return (
    <div className="product-card" style={{ pointerEvents: 'none' }}>
      <div className="card-image-wrapper">
        <div className="skeleton" style={{ width: '80%', height: '80%', borderRadius: '4px' }} />
      </div>
      <div className="card-content">
        <div className="skeleton" style={{ width: '35%', height: '10px', marginBottom: '2px' }} />
        <div className="skeleton" style={{ width: '95%', height: '14px', marginBottom: '3px' }} />
        <div className="skeleton" style={{ width: '65%', height: '14px', marginBottom: '6px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div className="skeleton" style={{ width: '45px', height: '16px', borderRadius: '3px' }} />
          <div className="skeleton" style={{ width: '55px', height: '16px', borderRadius: '3px' }} />
        </div>
        <div className="skeleton" style={{ width: '60%', height: '20px', margin: '4px 0' }} />
        <div className="skeleton" style={{ width: '40%', height: '12px', marginBottom: '8px' }} />
        <div style={{ marginTop: 'auto', paddingTop: '0.55rem' }}>
          <div className="skeleton" style={{ width: '100%', height: '32px', borderRadius: '4px' }} />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="skeleton"
              style={{
                flex: c === 1 ? 2 : 1,
                height: '28px',
                borderRadius: 'var(--radius-sm)',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const KPISkeleton = () => {
  return (
    <div className="kpi-card">
      <div className="skeleton" style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <div className="skeleton" style={{ width: '60%', height: '12px' }} />
        <div className="skeleton" style={{ width: '40%', height: '24px' }} />
      </div>
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="product-details-container">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ width: '100%', paddingTop: '80%', borderRadius: 'var(--radius-lg)' }} />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="skeleton" style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="skeleton" style={{ width: '25%', height: '20px' }} />
        <div className="skeleton" style={{ width: '90%', height: '36px' }} />
        <div className="skeleton" style={{ width: '40%', height: '24px' }} />
        <div className="skeleton" style={{ width: '100%', height: '120px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ width: '100%', height: '48px', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: 'var(--radius-md)' }} />
      </div>
    </div>
  );
};
