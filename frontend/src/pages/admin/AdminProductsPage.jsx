import React, { useState, useEffect, useMemo } from 'react';
import "./AdminProductsPage.css";
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { productApi } from '../../api/products';
import { categoryApi } from '../../api/categories';
import { marketplaceApi } from '../../api/marketplaces';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import StockBadge from '../../components/common/StockBadge';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { formatCurrency, formatPercent, resolveImageUrl } from '../../utils/formatters';
import { FALLBACK_PRODUCT_IMAGE } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marketplaces, setMarketplaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    categoryId: '',
    marketplaceId: '',
    originalPrice: '',
    currentPrice: '',
    highestPrice: '',
    averagePrice: '',
    lowestPrice: '',
    discountPercentage: '',
    rating: '4.2',
    ratingCount: '120',
    stockStatus: 'IN_STOCK',
    status: 'ACTIVE',
    productUrl: '',
    affiliateUrl: '',
  });

  const { success, error: toastError } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, mktRes] = await Promise.all([
        productApi.getProducts({}),
        categoryApi.getCategories(),
        marketplaceApi.getMarketplaces(),
      ]);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setMarketplaces(Array.isArray(mktRes) ? mktRes : []);
    } catch (err) {
      console.error('Failed to load products table:', err);
      toastError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setActionLoading(true);
    try {
      await productApi.deactivateProduct(deactivateTarget.id);
      success(`Product #${deactivateTarget.id} deactivated successfully`);
      setDeactivateTarget(null);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to deactivate product');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.categoryId || !newProduct.marketplaceId || !newProduct.currentPrice) {
      toastError('Please fill all required fields (*)');
      return;
    }

    setActionLoading(true);
    try {
      const orig = Number(newProduct.originalPrice) || Number(newProduct.currentPrice);
      const curr = Number(newProduct.currentPrice);
      const discount = orig > curr ? Math.round(((orig - curr) / orig) * 100) : 50;

      await productApi.createProduct({
        ...newProduct,
        categoryId: Number(newProduct.categoryId),
        marketplaceId: Number(newProduct.marketplaceId),
        originalPrice: orig,
        currentPrice: curr,
        highestPrice: Number(newProduct.highestPrice) || orig,
        averagePrice: Number(newProduct.averagePrice) || curr,
        lowestPrice: Number(newProduct.lowestPrice) || curr,
        discountPercentage: discount,
      });

      success('New product created successfully!');
      setIsCreateModalOpen(false);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to create product');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory && String(p.categoryId) !== String(selectedCategory)) return false;
      if (selectedMarketplace && String(p.marketplaceId) !== String(selectedMarketplace)) return false;
      if (selectedStatus && (p.status || '').toUpperCase() !== selectedStatus) return false;
      return true;
    });
  }, [products, selectedCategory, selectedMarketplace, selectedStatus]);

  const columns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (name, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '280px' }}>
          <img
            src={resolveImageUrl(row.primaryImageUrl) || FALLBACK_PRODUCT_IMAGE}
            alt=""
            className="table-thumbnail"
            onError={(e) => { e.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }}
          />
          <div style={{ overflow: 'hidden' }}>
            <Link
              to={`/admin/products/${row.id}`}
              style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              {name}
            </Link>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ID #{row.id} • {row.categoryName || 'General'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'marketplaceName',
      label: 'Store',
      sortable: true,
      render: (mkt) => (
        <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{mkt || '-'}</span>
      ),
    },
    {
      key: 'currentPrice',
      label: 'Price / MRP',
      sortable: true,
      render: (price, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(price)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
            {formatCurrency(row.originalPrice)}
          </div>
        </div>
      ),
    },
    {
      key: 'discountPercentage',
      label: 'Discount',
      sortable: true,
      render: (disc) => (
        <span style={{ fontWeight: 800, color: '#ef4444' }}>
          {formatPercent(disc)}
        </span>
      ),
    },
    {
      key: 'stockStatus',
      label: 'Stock',
      sortable: true,
      render: (stk) => <StockBadge status={stk} />,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (s) => <StatusBadge status={s} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Link
            to={`/admin/products/${row.id}`}
            className="btn btn-secondary btn-icon"
            title="Edit product"
          >
            <Edit2 size={14} />
          </Link>
          <Link
            to={`/products/${row.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-icon"
            title="View on public store"
          >
            <ExternalLink size={14} />
          </Link>
          {row.status !== 'INACTIVE' && (
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              style={{ color: 'var(--danger)' }}
              onClick={() => setDeactivateTarget(row)}
              title="Deactivate product"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Products Management</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage qualifying 50%+ discount products scraped from Telegram deals and external stores.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={loadData}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '160px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '160px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          value={selectedMarketplace}
          onChange={(e) => setSelectedMarketplace(e.target.value)}
        >
          <option value="">All Marketplaces</option>
          {marketplaces.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '140px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        loading={loading}
        searchPlaceholder="Search products by title, store, ID..."
        pageSize={10}
      />

      {/* Deactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Product"
        message={`Are you sure you want to deactivate "${deactivateTarget?.name}"? It will be immediately hidden from the public store and Buy Now redirects.`}
        confirmLabel="Deactivate Deal"
        isDanger={true}
        loading={actionLoading}
      />

      {/* Create Product Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Deal Product"
        maxWidth="620px"
      >
        <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                required
                className="form-select"
                value={newProduct.categoryId}
                onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Marketplace *</label>
              <select
                required
                className="form-select"
                value={newProduct.marketplaceId}
                onChange={(e) => setNewProduct({ ...newProduct, marketplaceId: e.target.value })}
              >
                <option value="">Select Marketplace</option>
                {marketplaces.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Original Price / MRP (₹) *</label>
              <input
                type="number"
                required
                className="form-input"
                placeholder="2999"
                value={newProduct.originalPrice}
                onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deal Price (₹) *</label>
              <input
                type="number"
                required
                className="form-input"
                placeholder="1499"
                value={newProduct.currentPrice}
                onChange={(e) => setNewProduct({ ...newProduct, currentPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Affiliate URL (ExtraPe / Merchant) *</label>
            <input
              type="url"
              required
              className="form-input"
              placeholder="https://extrape.com/..."
              value={newProduct.affiliateUrl}
              onChange={(e) => setNewProduct({ ...newProduct, affiliateUrl: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Product Page URL *</label>
            <input
              type="url"
              required
              className="form-input"
              placeholder="https://amazon.in/dp/..."
              value={newProduct.productUrl}
              onChange={(e) => setNewProduct({ ...newProduct, productUrl: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Product description and deal highlights..."
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={actionLoading}
            >
              {actionLoading ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;
