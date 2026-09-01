import React, { useState, useEffect } from 'react';
import "./AdminCategoriesPage.css";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { categoryApi } from '../../api/categories';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import CategoryStrokeIcon from '../../components/common/CategoryStrokeIcon';
import { FALLBACK_CATEGORY_IMAGE } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    active: true,
  });

  const { success, error: toastError } = useToast();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      toastError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', imageUrl: '', active: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      active: category.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toastError('Category name is required');
      return;
    }

    // Duplicate check on client
    const isDuplicate = categories.some(
      (c) =>
        c.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
        (!editingCategory || c.id !== editingCategory.id)
    );
    if (isDuplicate) {
      toastError('A category with this name already exists.');
      return;
    }

    setActionLoading(true);
    try {
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, formData);
        success('Category updated successfully!');
      } else {
        await categoryApi.createCategory(formData);
        success('New category created successfully!');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      toastError(err.message || 'Failed to save category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await categoryApi.deleteCategory(deleteTarget.id);
      success('Category deleted successfully!');
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      toastError(err.message || 'Failed to delete category (products may depend on it)');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Category',
      sortable: true,
      render: (name, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {row.imageUrl ? (
              <img
                src={row.imageUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <CategoryStrokeIcon name={name || row.id} size={22} strokeWidth={1.85} color="var(--primary)" />
            )}
          </div>
          <div>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{name}</span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID #{row.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (desc) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {desc || '—'}
        </span>
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
            title="Edit category"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            style={{ color: 'var(--danger)' }}
            onClick={() => setDeleteTarget(row)}
            title="Delete category"
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Categories Management</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Organize products and deals across shopping taxonomy categories.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={loadCategories}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Create Category</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        searchPlaceholder="Search categories..."
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `Edit Category #${editingCategory.id}` : 'Create New Category'}
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Electronics, Fashion, Home & Kitchen"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              placeholder="Short description for browse and category header..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Icon / Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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
              <span>Category Active & Visible to Customers</span>
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
              {actionLoading ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"? If active deals belong to this category, consider deactivating instead.`}
        confirmLabel="Delete Category"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminCategoriesPage;
