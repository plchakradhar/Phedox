import React, { useState, useEffect } from 'react';
import "./AdminProcessingPage.css";
import { Link } from 'react-router-dom';
import {
  Cpu,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { telegramApi } from '../../api/telegram';
import KPICard from '../../components/admin/KPICard';
import StatusBadge from '../../components/admin/StatusBadge';
import DataTable from '../../components/admin/DataTable';
import { formatDate, formatRelativeTime, truncateText } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AdminProcessingPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [retryingId, setRetryingId] = useState(null);
  const { success, error: toastError } = useToast();

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await telegramApi.getAllPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load processing queue:', err);
      toastError(err.message || 'Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        telegramApi.getAllPosts()
          .then((data) => {
            if (Array.isArray(data)) setPosts(data);
          })
          .catch(() => {});
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleRetry = async (postId) => {
    setRetryingId(postId);
    try {
      await telegramApi.processPostManually(postId);
      success(`Retrying post #${postId}...`);
      loadQueue();
    } catch (err) {
      toastError(err.message || 'Failed to retry post');
    } finally {
      setRetryingId(null);
    }
  };

  // KPI Calculations
  const pendingCount = posts.filter((p) => (p.status || '').toUpperCase() === 'RECEIVED').length;
  const processingCount = posts.filter((p) => (p.status || '').toUpperCase() === 'PROCESSING').length;
  const successCount = posts.filter((p) => (p.status || '').toUpperCase() === 'PROCESSED').length;
  const failedCount = posts.filter((p) => (p.status || '').toUpperCase() === 'FAILED').length;

  const columns = [
    {
      key: 'id',
      label: 'Post ID',
      sortable: true,
      render: (id) => (
        <Link to={`/admin/telegram/${id}`} style={{ fontWeight: 700, color: 'var(--primary)' }}>
          #{id}
        </Link>
      ),
    },
    {
      key: 'marketplace',
      label: 'Store',
      sortable: true,
      render: (mkt) => <span style={{ fontWeight: 600 }}>{mkt || 'Auto'}</span>,
    },
    {
      key: 'messageText',
      label: 'Deal Message & Error Summary',
      render: (msg, row) => (
        <div style={{ maxWidth: '360px' }}>
          <div style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {msg}
          </div>
          {row.errorMessage && (
            <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px', fontWeight: 600 }}>
              ⚠ Error: {row.errorMessage}
            </div>
          )}
          {row.processingMessage && !row.errorMessage && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              ℹ {row.processingMessage}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Current Status',
      sortable: true,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'receivedAt',
      label: 'Received',
      sortable: true,
      render: (t) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {formatRelativeTime(t)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to={`/admin/telegram/${row.id}`} className="btn btn-secondary btn-icon" title="View details">
            <Eye size={14} />
          </Link>
          {row.status === 'FAILED' && (
            <button
              type="button"
              className="btn btn-deal btn-sm"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              onClick={() => handleRetry(row.id)}
              disabled={retryingId === row.id}
            >
              <RotateCcw size={12} className={retryingId === row.id ? 'spin' : ''} />
              <span>Retry</span>
            </button>
          )}
          {row.status === 'RECEIVED' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              onClick={() => handleRetry(row.id)}
              disabled={retryingId === row.id}
            >
              <PlayCircle size={12} />
              <span>Process</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Processing / Queue Monitor</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Live status of background scrapers, discount validation tasks, and pending Telegram ingestion queues.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label className="filter-checkbox-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-Refresh (10s)</span>
          </label>

          <button type="button" className="btn btn-secondary btn-sm" onClick={loadQueue}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Now</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (PDF Sec 20.19) */}
      <div className="kpi-grid">
        <KPICard
          title="Pending Ingestion"
          value={pendingCount}
          icon={Clock}
          color="#3b82f6"
          bgColor="#eff6ff"
          subText="Awaiting scraper run"
        />
        <KPICard
          title="Currently Processing"
          value={processingCount}
          icon={PlayCircle}
          color="#f59e0b"
          bgColor="#fffbeb"
          subText="Active web scrapes"
        />
        <KPICard
          title="Successfully Processed"
          value={successCount}
          icon={CheckCircle2}
          color="#10b981"
          bgColor="#ecfdf5"
          subText="Published to store"
        />
        <KPICard
          title="Failed / Under 50%"
          value={failedCount}
          icon={AlertTriangle}
          color="#ef4444"
          bgColor="#fef2f2"
          subText="Rejected or scraped error"
        />
      </div>

      <DataTable
        columns={columns}
        data={posts}
        loading={loading}
        searchPlaceholder="Search queue items..."
      />
    </div>
  );
};

export default AdminProcessingPage;
