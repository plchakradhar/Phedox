import React, { useState, useEffect } from 'react';
import "./AdminProductEditPage.css";
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Trash2,
  Lock,
  Eye,
} from 'lucide-react';
import { productApi } from '../../api/products';
import { categoryApi } from '../../api/categories';
import { marketplaceApi } from '../../api/marketplaces';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AdminProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [marketplaces, setMarketplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
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
    rating: '',
    ratingCount: '',
    stockStatus: 'IN_STOCK',
    status: 'ACTIVE',
    productUrl: '',
    affiliateUrl: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prod, cats, mkts] = await Promise.all([
        productApi.getProductById(id),
        categoryApi.getCategories(),
        marketplaceApi.getMarketplaces(),
      ]);

      setProduct(prod);
      setCategories(Array.isArray(cats) ? cats : []);
      setMarketplaces(Array.isArray(mkts) ? mkts : []);

      setFormData({
        name: prod.name || '',
        description: prod.description || '',
        categoryId: prod.categoryId || '',
        marketplaceId: prod.marketplaceId || '',
        originalPrice: prod.originalPrice || '',
        currentPrice: prod.currentPrice || '',
        highestPrice: prod.highestPrice || prod.originalPrice || '',
        averagePrice: prod.averagePrice || prod.currentPrice || '',
        lowestPrice: prod.lowestPrice || prod.currentPrice || '',
        discountPercentage: prod.discountPercentage || '',
        rating: prod.rating || '',
        ratingCount: prod.ratingCount || '',
        stockStatus: prod.stockStatus || 'IN_STOCK',
        status: prod.status || 'ACTIVE',
        productUrl: prod.productUrl || '',
        affiliateUrl: prod.affiliateUrl || '',
      });
    } catch (err) {
      console.error('Failed to load product for edit:', err);
      toastError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-recalculate discount if prices change
      if (name === 'originalPrice' || name === 'currentPrice') {
        const orig = Number(name === 'originalPrice' ? value : prev.originalPrice);
        const curr = Number(name === 'currentPrice' ? value : prev.currentPrice);
        if (orig > 0 && curr > 0 && orig >= curr) {
          updated.discountPercentage = Math.round(((orig - curr) / orig) * 100);
        }
      }

      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await productApi.updateProduct(id, {
        ...formData,
        categoryId: Number(formData.categoryId) || undefined,
        marketplaceId: Number(formData.marketplaceId) || undefined,
        originalPrice: Number(formData.originalPrice),
        currentPrice: Number(formData.currentPrice),
        highestPrice: Number(formData.highestPrice),
        averagePrice: Number(formData.averagePrice),
        lowestPrice: Number(formData.lowestPrice),
        discountPercentage: Number(formData.discountPercentage),
      });

      success('Product updated successfully!');
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setSaving(true);
    try {
      await productApi.deactivateProduct(id);
      success('Product deactivated.');
      setIsDeactivateOpen(false);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to deactivate product');
    } finally {
      setSaving(false);
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

  if (!product) {
    return (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/admin/products" className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} />
            <span>Back to Products</span>
          </Link>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
          Product not found.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/products" className="btn btn-secondary btn-icon" title="Back">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Edit Product #{id}</h1>
              <StatusBadge status={product.status} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Last checked: {formatDate(product.lastCheckedAt)} • Created: {formatDate(product.createdAt)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/products/${id}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
            <Eye size={14} />
            <span>View Public Page</span>
          </Link>
          {product.status !== 'INACTIVE' && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--danger)' }}
              onClick={() => setIsDeactivateOpen(true)}
            >
              <Trash2 size={14} />
              <span>Deactivate</span>
            </button>
          )}
        </div>
      </div>

      {/* Form Grid (PDF Sec 20.14) */}
      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
          {/* Left Column: Product Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                Product Details
              </h3>

              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={6}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Merchant URL</label>
                <input
                  type="url"
                  name="productUrl"
                  value={formData.productUrl}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {/* Protected Read-Only Affiliate URL (PDF Sec 6.3) */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={12} color="var(--primary)" />
                  <span>Exact Affiliate URL (Protected / Read-Only)</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.affiliateUrl}
                  className="form-input"
                  style={{ backgroundColor: 'var(--bg-subtle)', cursor: 'not-allowed', color: 'var(--text-secondary)' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Affiliate link is strictly preserved from the source Telegram post to maintain attribution integrity.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Price Information & Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Price Intelligence Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                Price Intelligence
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Current Deal Price (₹) *</label>
                  <input
                    type="number"
                    required
                    name="currentPrice"
                    value={formData.currentPrice}
                    onChange={handleChange}
                    className="form-input"
                    style={{ fontWeight: 700, color: 'var(--primary)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Original / MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Lowest Price (₹)</label>
                  <input
                    type="number"
                    name="lowestPrice"
                    value={formData.lowestPrice}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Average Price (₹)</label>
                  <input
                    type="number"
                    name="averagePrice"
                    value={formData.averagePrice}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Highest Price (₹)</label>
                  <input
                    type="number"
                    name="highestPrice"
                    value={formData.highestPrice}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Calculated Discount Percentage (%)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    className="form-input"
                    style={{ fontWeight: 800, color: '#ef4444', maxWidth: '120px' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>% OFF</span>
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                Metadata & Classification
              </h3>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Marketplace</label>
                <select
                  name="marketplaceId"
                  value={formData.marketplaceId}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Marketplace</option>
                  {marketplaces.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Stock Status</label>
                  <select
                    name="stockStatus"
                    value={formData.stockStatus}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="IN_STOCK">IN_STOCK</option>
                    <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                    <option value="LIMITED_STOCK">LIMITED_STOCK</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Deal Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer Bar (PDF Sec 20.14) */}
        <div
          style={{
            position: 'sticky',
            bottom: '1rem',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 20,
          }}
        >
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Changes will update both the backend database and public deal presentation immediately.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={saving}
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Product Changes'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Deactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Deal Product"
        message="Are you sure you want to deactivate this product? It will be removed from all public listings."
        confirmLabel="Deactivate Now"
        isDanger={true}
        loading={saving}
      />
    </div>
  );
};

export default AdminProductEditPage;
