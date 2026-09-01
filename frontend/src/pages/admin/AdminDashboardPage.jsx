import React, { useState, useEffect } from 'react';
import "./AdminDashboardPage.css";
import { Link } from 'react-router-dom';
import {
  Package,
  Send,
  MousePointerClick,
  Layers,
  Store,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  ExternalLink,
  Plus,
  PlayCircle,
} from 'lucide-react';
import { analyticsApi } from '../../api/analytics';
import { productApi } from '../../api/products';
import { telegramApi } from '../../api/telegram';
import KPICard from '../../components/admin/KPICard';
import StatusBadge from '../../components/admin/StatusBadge';
import { formatCurrency, formatPercent, formatRelativeTime } from '../../utils/formatters';
import { FALLBACK_PRODUCT_IMAGE } from '../../utils/constants';
import ErrorState from '../../components/common/ErrorState';
import { useToast } from '../../context/ToastContext';

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { success, error: toastError } = useToast();

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, productsRes, telegramRes] = await Promise.allSettled([
        analyticsApi.getDashboardAnalytics(),
        productApi.getProducts({ minDiscount: 50 }),
        telegramApi.getAllPosts(),
      ]);

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value);
      }
      if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value)) {
        setRecentProducts(productsRes.value.slice(0, 5));
      }
      if (telegramRes.status === 'fulfilled' && Array.isArray(telegramRes.value)) {
        setRecentPosts(telegramRes.value.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleProcessPost = async (postId) => {
    try {
      await telegramApi.processPostManually(postId);
      success(`Triggered manual processing for post #${postId}`);
      loadDashboardData();
    } catch (err) {
      toastError(err.message || 'Failed to process Telegram post');
    }
  };

  const pendingPostsCount = recentPosts.filter((p) => p.status === 'RECEIVED' || p.status === 'PROCESSING').length;
  const failedPostsCount = recentPosts.filter((p) => p.status === 'FAILED').length;

  return (
    <div>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            System Overview & Metrics
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time telemetry on Telegram deal ingestion, product scrapers, and customer click redirects.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadDashboardData}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Metrics</span>
          </button>
          <Link to="/admin/telegram" className="btn btn-primary btn-sm">
            <Send size={14} />
            <span>Ingest Post</span>
          </Link>
        </div>
      </div>

      {error && <ErrorState title="Dashboard Connection Notice" message={error} onRetry={loadDashboardData} />}

      {/* KPI Cards Row (PDF Sec 6.1 & 20.12) */}
      <div className="kpi-grid">
        <KPICard
          title="Active Live Deals"
          value={analytics?.totalActiveProducts !== undefined ? analytics.totalActiveProducts : recentProducts.length}
          icon={Package}
          color="#2563eb"
          bgColor="#eff6ff"
          subText="Live on public store"
        />
        <KPICard
          title="Affiliate Clicks"
          value={analytics?.totalClicks !== undefined ? analytics.totalClicks : 0}
          icon={MousePointerClick}
          color="#10b981"
          bgColor="#ecfdf5"
          subText="Direct merchant redirects"
        />
        <KPICard
          title="Telegram Posts"
          value={analytics?.totalTelegramPosts !== undefined ? analytics.totalTelegramPosts : recentPosts.length}
          icon={Send}
          color="#8b5cf6"
          bgColor="#f5f3ff"
          subText="Received from channels"
        />
        <KPICard
          title="Pending / Processing"
          value={pendingPostsCount}
          icon={Clock}
          color="#f59e0b"
          bgColor="#fffbeb"
          subText="Queue backlog"
        />
      </div>

      {/* Two Column Layout: Recent Qualifying Deals & Recent Telegram Ingestion */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Left: Recent Active Deals */}
        <div className="data-table-container">
          <div className="table-toolbar">
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Recent 50%+ Qualifying Deals</h3>
            <Link to="/admin/products" className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price / MRP</th>
                  <th>Discount</th>
                  <th>Store</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No active deals found.
                    </td>
                  </tr>
                ) : (
                  recentProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={p.primaryImageUrl || FALLBACK_PRODUCT_IMAGE}
                            alt=""
                            className="table-thumbnail"
                            onError={(e) => { e.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }}
                          />
                          <div style={{ maxWidth: '180px' }}>
                            <Link
                              to={`/admin/products/${p.id}`}
                              style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              {p.name}
                            </Link>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.categoryName || 'General'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{formatCurrency(p.currentPrice)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {formatCurrency(p.originalPrice)}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#ef4444' }}>
                          {formatPercent(p.discountPercentage)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.marketplaceName || 'Store'}</span>
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Telegram Posts */}
        <div className="data-table-container">
          <div className="table-toolbar">
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Recent Telegram Ingestions</h3>
            <Link to="/admin/telegram" className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
              <span>All Posts</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Post ID</th>
                  <th>Channel / Msg</th>
                  <th>Marketplace</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No Telegram posts recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPosts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <Link to={`/admin/telegram/${post.id}`} style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          #{post.id}
                        </Link>
                      </td>
                      <td>
                        <div style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                          {post.messageText || 'Telegram Deal Post'}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {formatRelativeTime(post.receivedAt)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{post.marketplace || 'Auto-Detect'}</span>
                      </td>
                      <td>
                        <StatusBadge status={post.status} />
                      </td>
                      <td>
                        {post.status !== 'PROCESSED' && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleProcessPost(post.id)}
                            title="Process now"
                          >
                            <PlayCircle size={13} />
                            <span>Run</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Schedulers & Health Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Price & Stock Scheduler</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Runs Hourly (Every 60m)</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Dead Link Verifier</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Auto-deactivates 404s</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Scrapers Enabled</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Amazon, Flipkart, Myntra</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
