import React, { useState, useEffect } from 'react';
import "./AdminAnalyticsPage.css";
import {
  BarChart3,
  MousePointerClick,
  Package,
  Send,
  Calendar,
  Layers,
  Store,
  RefreshCw,
  TrendingUp,
  Download,
} from 'lucide-react';
import { analyticsApi } from '../../api/analytics';
import KPICard from '../../components/admin/KPICard';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const { info } = useToast();

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getDashboardAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const handleExport = () => {
    info('Exporting analytics report as CSV...');
    if (!data) return;
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `onlineoffers_analytics_${dateRange}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const topDeals = data?.topDeals || [];
  const categoryMap = data?.categoryBreakdown || {};
  const marketplaceMap = data?.marketplaceBreakdown || {};

  const totalCategoryItems = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;
  const totalMarketplaceItems = Object.values(marketplaceMap).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Analytics & Deal Performance</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time click telemetry and product distribution across categories and stores.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time History</option>
          </select>

          <button type="button" className="btn btn-secondary btn-sm" onClick={loadAnalytics}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button type="button" className="btn btn-secondary btn-sm" onClick={handleExport}>
            <Download size={14} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          title="Total Affiliate Clicks"
          value={data?.totalClicks || 0}
          icon={MousePointerClick}
          color="#10b981"
          bgColor="#ecfdf5"
          subText="Direct merchant redirections"
        />
        <KPICard
          title="Active 50%+ Deals"
          value={data?.totalActiveProducts || 0}
          icon={Package}
          color="#2563eb"
          bgColor="#eff6ff"
          subText="Current qualifying catalog"
        />
        <KPICard
          title="Telegram Posts Ingested"
          value={data?.totalTelegramPosts || 0}
          icon={Send}
          color="#8b5cf6"
          bgColor="#f5f3ff"
          subText="Captured channel messages"
        />
      </div>

      {/* 2-Column Breakdown Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Category Breakdown Card */}
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
            <Layers size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Deals by Category</h3>
          </div>

          {Object.keys(categoryMap).length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No category metrics recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(categoryMap).map(([catName, count]) => {
                const pct = Math.round((count / totalCategoryItems) * 100);
                return (
                  <div key={catName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600 }}>{catName}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{count} deals ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          backgroundColor: 'var(--primary)',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Marketplace Breakdown Card */}
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
            <Store size={18} color="#f97316" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Deals by Marketplace / Store</h3>
          </div>

          {Object.keys(marketplaceMap).length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No marketplace metrics recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(marketplaceMap).map(([storeName, count]) => {
                const pct = Math.round((count / totalMarketplaceItems) * 100);
                return (
                  <div key={storeName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600 }}>{storeName}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{count} items ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          backgroundColor: '#f97316',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Deals by Popularity / Clicks */}
      <div className="data-table-container">
        <div className="table-toolbar">
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Top Performing Deals</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Store</th>
                <th>Current Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topDeals.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No deal conversion or click data available yet.
                  </td>
                </tr>
              ) : (
                topDeals.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.marketplaceName || '-'}</td>
                    <td>{formatCurrency(p.currentPrice)}</td>
                    <td><span style={{ color: '#ef4444', fontWeight: 800 }}>{formatPercent(p.discountPercentage)}</span></td>
                    <td>{p.stockStatus}</td>
                    <td>{p.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
