import React, { useState, useEffect, useMemo } from 'react';
import "./AdminTelegramPostsPage.css";
import { Link, useNavigate } from 'react-router-dom';
import {
  Send,
  Plus,
  PlayCircle,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { telegramApi } from '../../api/telegram';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/common/Modal';
import { formatDate, formatRelativeTime, truncateText } from '../../utils/formatters';
import { TELEGRAM_STATUSES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

export const AdminTelegramPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(false);

  // Ingest simulation modal
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [newPostData, setNewPostData] = useState({
    telegramMessageId: '',
    channelId: '-1001234567890',
    channelUsername: 'ExtraPeDeals',
    messageText: '',
    affiliateUrl: '',
    marketplace: 'Flipkart',
  });

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await telegramApi.getPostsByStatus(selectedStatus);
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load telegram posts:', err);
      toastError(err.message || 'Failed to fetch telegram posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedStatus]);

  const handleProcessPost = async (postId) => {
    setActionLoading(true);
    try {
      await telegramApi.processPostManually(postId);
      success(`Started processing Telegram post #${postId}`);
      loadPosts();
    } catch (err) {
      toastError(err.message || 'Failed to process Telegram post');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateIngest = async (e) => {
    e.preventDefault();
    if (!newPostData.messageText || !newPostData.affiliateUrl) {
      toastError('Message text and Affiliate URL are required');
      return;
    }

    setActionLoading(true);
    try {
      const msgId = newPostData.telegramMessageId ? Number(newPostData.telegramMessageId) : Math.floor(Date.now() / 1000);
      await telegramApi.receivePost({
        ...newPostData,
        telegramMessageId: msgId,
      });

      success('Telegram deal post ingested successfully into backend!');
      setIsIngestModalOpen(false);
      setNewPostData({
        telegramMessageId: '',
        channelId: '-1001234567890',
        channelUsername: 'ExtraPeDeals',
        messageText: '',
        affiliateUrl: '',
        marketplace: 'Flipkart',
      });
      loadPosts();
    } catch (err) {
      toastError(err.message || 'Failed to ingest telegram post');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (id) => (
        <Link to={`/admin/telegram/${id}`} style={{ fontWeight: 800, color: 'var(--primary)' }}>
          #{id}
        </Link>
      ),
    },
    {
      key: 'channelUsername',
      label: 'Channel',
      sortable: true,
      render: (ch, row) => (
        <div>
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>@{ch || 'Channel'}</span>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Msg #{row.telegramMessageId}
          </span>
        </div>
      ),
    },
    {
      key: 'messageText',
      label: 'Message Preview',
      render: (msg, row) => (
        <div style={{ maxWidth: '320px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {msg || '—'}
          </div>
          {row.errorMessage && (
            <div style={{ fontSize: '0.72rem', color: 'var(--danger)', marginTop: '2px', fontWeight: 600 }}>
              ⚠ {row.errorMessage}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'marketplace',
      label: 'Store',
      sortable: true,
      render: (mkt) => (
        <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{mkt || 'Auto'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'receivedAt',
      label: 'Received',
      sortable: true,
      render: (time) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {formatRelativeTime(time)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Link
            to={`/admin/telegram/${row.id}`}
            className="btn btn-secondary btn-icon"
            title="View Details"
          >
            <Eye size={14} />
          </Link>
          {row.status !== 'PROCESSED' && (
            <button
              type="button"
              className="btn btn-primary btn-icon"
              onClick={() => handleProcessPost(row.id)}
              title="Process / Scrap Deal Now"
              disabled={actionLoading}
            >
              <PlayCircle size={14} />
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Telegram Deals Ingestion</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Monitor real-time deal messages ingested from Telegram ExtraPe channels and their scraping lifecycle.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={loadPosts}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsIngestModalOpen(true)}>
            <Plus size={16} />
            <span>Simulate Ingest Deal</span>
          </button>
        </div>
      </div>

      {/* Status Filter Chips (PDF Sec 20.17) */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {TELEGRAM_STATUSES.map((st) => (
          <button
            key={st.value}
            type="button"
            className={`btn btn-sm ${selectedStatus === st.value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedStatus(st.value)}
          >
            {st.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={posts}
        loading={loading}
        searchPlaceholder="Search posts by message text, channel, ID..."
      />

      {/* Simulate Ingest Modal */}
      <Modal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        title="Simulate Telegram Deal Ingestion"
        maxWidth="580px"
      >
        <form onSubmit={handleSimulateIngest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Channel Username *</label>
              <input
                type="text"
                required
                className="form-input"
                value={newPostData.channelUsername}
                onChange={(e) => setNewPostData({ ...newPostData, channelUsername: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detected Marketplace</label>
              <select
                className="form-select"
                value={newPostData.marketplace}
                onChange={(e) => setNewPostData({ ...newPostData, marketplace: e.target.value })}
              >
                <option value="Flipkart">Flipkart</option>
                <option value="Amazon">Amazon</option>
                <option value="Myntra">Myntra</option>
                <option value="Ajio">Ajio</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Exact Affiliate Link (ExtraPe / URL) *</label>
            <input
              type="url"
              required
              className="form-input"
              placeholder="https://extrape.com/..."
              value={newPostData.affiliateUrl}
              onChange={(e) => setNewPostData({ ...newPostData, affiliateUrl: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telegram Message Content *</label>
            <textarea
              rows={4}
              required
              className="form-textarea"
              placeholder="🔥 LOOT OFFER: 70% OFF on Noise Smartwatch! Price dropped from ₹4999 to ₹1499! Buy here: https://extrape.com/..."
              value={newPostData.messageText}
              onChange={(e) => setNewPostData({ ...newPostData, messageText: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsIngestModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={actionLoading}
            >
              {actionLoading ? 'Ingesting...' : 'Ingest Deal Post'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTelegramPostsPage;
