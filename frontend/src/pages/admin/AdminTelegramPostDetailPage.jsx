import React, { useState, useEffect } from 'react';
import "./AdminTelegramPostDetailPage.css";
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  PlayCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  ExternalLink,
  Package,
  RefreshCw,
} from 'lucide-react';
import { telegramApi } from '../../api/telegram';
import StatusBadge from '../../components/admin/StatusBadge';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AdminTelegramPostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { success, error: toastError } = useToast();

  const loadPost = async () => {
    setLoading(true);
    try {
      const data = await telegramApi.getPostById(id);
      setPost(data);
    } catch (err) {
      console.error('Failed to load post details:', err);
      toastError(err.message || 'Telegram post not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadPost();
  }, [id]);

  const handleProcessNow = async () => {
    setProcessing(true);
    try {
      await telegramApi.processPostManually(id);
      success('Processing triggered for Telegram deal post.');
      loadPost();
    } catch (err) {
      toastError(err.message || 'Failed to process Telegram post');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: '40px', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '300px' }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div>
        <Link to="/admin/telegram" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={14} />
          <span>Back to Posts</span>
        </Link>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
          Telegram post not found.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/telegram" className="btn btn-secondary btn-icon" title="Back">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Telegram Post #{post.id}</h1>
              <StatusBadge status={post.status} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Received: {formatDate(post.receivedAt)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadPost}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          {post.status !== 'PROCESSED' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleProcessNow}
              disabled={processing}
            >
              <PlayCircle size={14} />
              <span>{processing ? 'Processing...' : 'Run Scraper & Process'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Layout (PDF Sec 20.18) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.75rem' }}>
        {/* Left Column: Original Telegram Message Bubble */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Send size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Original Telegram Deal Post</h3>
            </div>

            {/* Messenger-style Card */}
            <div
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                fontSize: '0.92rem',
                lineHeight: 1.6,
                color: 'var(--text-main)',
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
              }}
            >
              {post.messageText || 'No text content available'}
            </div>

            {/* Read-Only Protected Affiliate URL */}
            <div style={{ marginTop: '1.25rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Lock size={12} color="var(--primary)" />
                <span>Exact Extracted Affiliate URL (Protected)</span>
              </label>
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all',
                  color: 'var(--text-main)',
                }}
              >
                {post.affiliateUrl}
              </div>
            </div>
          </div>

          {/* Linked Product Card (if processed) */}
          {post.product && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={18} color="var(--success)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Linked Product</h3>
                </div>
                <Link to={`/admin/products/${post.product.id}`} className="btn btn-secondary btn-sm">
                  <span>View Product</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{post.product.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Product ID #{post.product.id} • Status: {post.product.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metadata & Processing Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Metadata Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Message Telemetry
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Telegram Message ID</span>
                <span style={{ fontWeight: 700 }}>{post.telegramMessageId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Channel ID</span>
                <span style={{ fontWeight: 600 }}>{post.channelId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Channel Username</span>
                <span style={{ fontWeight: 600 }}>@{post.channelUsername || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Detected Marketplace</span>
                <span style={{ fontWeight: 700 }}>{post.marketplace || 'Auto-Detected'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Received Timestamp</span>
                <span style={{ fontSize: '0.8rem' }}>{formatDate(post.receivedAt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Processed Timestamp</span>
                <span style={{ fontSize: '0.8rem' }}>{formatDate(post.processedAt)}</span>
              </div>
            </div>
          </div>

          {/* Processing Log Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Scraping & Validation Log
            </h3>

            {post.processingMessage && (
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Processing Message</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.2rem', background: 'var(--bg-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  {post.processingMessage}
                </p>
              </div>
            )}

            {post.errorMessage ? (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  color: 'var(--danger)',
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.85rem' }}>Processing Failure</strong>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{post.errorMessage}</p>
                </div>
              </div>
            ) : post.status === 'PROCESSED' ? (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #d1fae5',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#065f46',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <CheckCircle size={18} />
                <span>Deal verified with &gt;= 50% discount and published!</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Deal is waiting in the ingestion queue.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTelegramPostDetailPage;
