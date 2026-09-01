import React, { useState, useEffect } from 'react';
import "./AdminMarketplacesPage.css";
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { marketplaceApi } from '../../api/marketplaces';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

const MARKETPLACE_TYPES = [
  'AMAZON',
  'FLIPKART',
  'MYNTRA',
  'AJIO',
  'NYKAA',
  'TATACLIQ',
  'OTHER',
];

export const AdminMarketplacesPage = () => {
  const [marketplaces, setMarketplaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMarketplace, setEditingMarketplace] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'AMAZON',
    websiteUrl: '',
    active: true,
  });

  const { success, error: toastError } = useToast();

  const loadMarketplaces = async () => {
    setLoading(true);
    try {
      const data = await marketplaceApi.getMarketplaces();
      setMarketplaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load marketplaces:', err);
      toastError(err.message || 'Failed to fetch marketplaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaces();
  }, []);

  const handleOpenCreate = () => {
    setEditingMarketplace(null);
    setFormData({ name: '', type: 'AMAZON', websiteUrl: '', active: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mkt) => {
    setEditingMarketplace(mkt);
    setFormData({
      name: mkt.name || '',
      type: mkt.type || 'AMAZON',
      websiteUrl: mkt.websiteUrl || '',
      active: mkt.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toastError('Marketplace name is required');
      return;
    }

    // Uniqueness validation
    const duplicate = marketplaces.some(
      (m) =>
        (m.name.toLowerCase().trim() === formData.name.toLowerCase().trim() ||
          m.type === formData.type) &&
        (!editingMarketplace || m.id !== editingMarketplace.id)
    );
    if (duplicate) {
      toastError('A marketplace with this name or type already exists.');
      return;
    }

    setActionLoading(true);
    try {
      if (editingMarketplace) {
        await marketplaceApi.updateMarketplace(editingMarketplace.id, formData);
        success('Marketplace updated successfully!');
      } else {
        await marketplaceApi.createMarketplace(formData);
        success('New marketplace registered successfully!');
      }
      setIsModalOpen(false);
      loadMarketplaces();
    } catch (err) {
      toastError(err.message || 'Failed to save marketplace');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await marketplaceApi.deleteMarketplace(deleteTarget.id);
      success('Marketplace removed successfully!');
      setDeleteTarget(null);
      loadMarketplaces();
    } catch (err) {
      toastError(err.message || 'Failed to delete marketplace (products may depend on it)');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Marketplace / Store',
      sortable: true,
      render: (name, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <Store size={18} />
          </div>
          <div>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{name}</span>
            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              ID #{row.id} • Type: {row.type}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'websiteUrl',
      label: 'Website URL',
      render: (url) => (
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontSize: '0.85rem' }}
          >
            <span>{url}</span>
            <ExternalLink size={12} />
          </a>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>—</span>
        )
      ),
    },
    {
      key: 'active',
      label: 'Status',
      sortable: true,
      render: (active) => (
        <span className={`badge ${active !== false ? 'badge-success' : 'badge-danger'}`}>
          {active !== false ? 'ACTIVE' : 'INACTIVE'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={() => handleOpenEdit(row)}
            title="Edit marketplace"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            style={{ color: 'var(--danger)' }}
            onClick={() => setDeleteTarget(row)}
            title="Delete marketplace"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Marketplaces Configuration</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configure merchant platforms and domain scrapers (Amazon, Flipkart, Myntra, etc.).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={loadMarketplaces}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Add Marketplace</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={marketplaces}
        loading={loading}
        searchPlaceholder="Search marketplaces..."
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMarketplace ? `Edit Marketplace #${editingMarketplace.id}` : 'Register New Marketplace'}
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Store / Marketplace Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Amazon India, Flipkart, Myntra"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Marketplace Scraper Engine / Type *</label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {MARKETPLACE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Base Website URL</label>
            <input
              type="url"
              placeholder="https://www.amazon.in"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <span>Marketplace Active & Ingestion Enabled</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : editingMarketplace ? 'Save Changes' : 'Register Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Marketplace"
        message={`Are you sure you want to delete marketplace "${deleteTarget?.name}"?`}
        confirmLabel="Delete Marketplace"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminMarketplacesPage;
