import React, { useState, useEffect, useMemo, useCallback } from 'react';
import "./DealsPage.css";
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, RotateCcw, X } from 'lucide-react';
import { productApi } from '../../api/products';
import { categoryApi } from '../../api/categories';
import { marketplaceApi } from '../../api/marketplaces';
import ProductGrid from '../../components/common/ProductGrid';
import ErrorState from '../../components/common/ErrorState';
import CategoryStrokeIcon from '../../components/common/CategoryStrokeIcon';
import { SORT_OPTIONS, DISCOUNT_FILTER_OPTIONS } from '../../utils/constants';

export const DealsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialized from URL query params
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marketplaces, setMarketplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const selectedCategory = searchParams.get('categoryId') || '';
  const selectedMarketplace = searchParams.get('marketplaceId') || '';
  const minDiscount = searchParams.get('minDiscount') || '';
  const searchTerm = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Fetch metadata (categories, marketplaces) once
  useEffect(() => {
    Promise.all([categoryApi.getCategories(), marketplaceApi.getMarketplaces()])
      .then(([cats, mkts]) => {
        if (Array.isArray(cats)) setCategories(cats.filter((c) => c.active !== false));
        if (Array.isArray(mkts)) setMarketplaces(mkts.filter((m) => m.active !== false));
      })
      .catch((err) => console.warn('Failed to load filter metadata:', err));
  }, []);

  // Fetch products with backend filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.getProducts({
        categoryId: selectedCategory || undefined,
        marketplaceId: selectedMarketplace || undefined,
        minDiscount: minDiscount || undefined,
        search: searchTerm || undefined,
      });
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load deals:', err);
      setError(err.message || 'Failed to fetch deals from server');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedMarketplace, minDiscount, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update query params helper
  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === '' || value === null || value === undefined) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, String(value));
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams({ minDiscount: '', sort: 'newest' }));
  };

  // Helper names
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return '';
    const found = categories.find((c) => String(c.id) === String(selectedCategory));
    return found ? found.name : '';
  }, [categories, selectedCategory]);

  const selectedMarketplaceName = useMemo(() => {
    if (!selectedMarketplace) return '';
    const found = marketplaces.find((m) => String(m.id) === String(selectedMarketplace));
    return found ? found.name : '';
  }, [marketplaces, selectedMarketplace]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedMarketplace) count++;
    if (minDiscount && minDiscount !== '' && minDiscount !== '0') count++;
    if (searchTerm && searchTerm.trim()) count++;
    if (inStockOnly) count++;
    if (maxPrice && !isNaN(Number(maxPrice))) count++;
    return count;
  }, [selectedCategory, selectedMarketplace, minDiscount, searchTerm, inStockOnly, maxPrice]);

  // Client-side filtering for extra price limit, in-stock & sorting
  const processedProducts = useMemo(() => {
    let result = [...products];

    if (inStockOnly) {
      result = result.filter((p) => (p.stockStatus || '').toUpperCase() === 'IN_STOCK');
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      result = result.filter((p) => Number(p.currentPrice) <= Number(maxPrice));
    }

    // Sorting
    switch (currentSort) {
      case 'discount-desc':
        result.sort((a, b) => (Number(b.discountPercentage) || 0) - (Number(a.discountPercentage) || 0));
        break;
      case 'price-asc':
        result.sort((a, b) => (Number(a.currentPrice) || 0) - (Number(b.currentPrice) || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (Number(b.currentPrice) || 0) - (Number(a.currentPrice) || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (timeB !== timeA) return timeB - timeA;
          return (Number(b.id) || 0) - (Number(a.id) || 0);
        });
        break;
    }

    return result;
  }, [products, inStockOnly, maxPrice, currentSort]);

  const FilterContent = (
    <div className="filter-options-body">
      {/* Search within deals */}
      <div className="filter-group">
        <h4 className="filter-title">Search in Deals</h4>
        <div className="filter-search-box">
          <Search size={15} className="filter-search-icon" />
          <input
            type="text"
            placeholder="Keywords, brand..."
            value={searchTerm}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="filter-search-input"
          />
          {searchTerm && (
            <button
              type="button"
              className="filter-search-clear"
              onClick={() => updateFilter('search', '')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Discount Threshold Filter */}
      <div className="filter-group">
        <h4 className="filter-title">Minimum Discount</h4>
        <div className="filter-discount-grid">
          {DISCOUNT_FILTER_OPTIONS.map((opt) => {
            const isSelected = (minDiscount || '') === (opt.value || '');
            return (
              <button
                key={opt.value}
                type="button"
                className={`filter-discount-btn ${isSelected ? 'active' : ''}`}
                onClick={() => updateFilter('minDiscount', opt.value)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="filter-group">
          <h4 className="filter-title">Categories</h4>
          <div className="filter-options-scroll">
            <label className={`filter-option-item ${!selectedCategory ? 'active' : ''}`}>
              <input
                type="radio"
                name="categoryId"
                checked={!selectedCategory}
                onChange={() => updateFilter('categoryId', '')}
              />
              <span className="filter-option-icon">
                <SlidersHorizontal size={15} />
              </span>
              <span className="filter-option-text">All Categories</span>
            </label>
            {categories.map((cat) => {
              const isSelected = String(selectedCategory) === String(cat.id);
              return (
                <label key={cat.id} className={`filter-option-item ${isSelected ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="categoryId"
                    checked={isSelected}
                    onChange={() => updateFilter('categoryId', cat.id)}
                  />
                  <span className="filter-option-icon">
                    <CategoryStrokeIcon
                      name={cat.name || cat.id}
                      size={16}
                      strokeWidth={1.85}
                      style={{ color: isSelected ? 'var(--primary)' : '#666666' }}
                    />
                  </span>
                  <span className="filter-option-text">{cat.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Marketplace Filter */}
      {marketplaces.length > 0 && (
        <div className="filter-group">
          <h4 className="filter-title">Stores & Marketplaces</h4>
          <div className="filter-options-scroll">
            <label className={`filter-option-item ${!selectedMarketplace ? 'active' : ''}`}>
              <input
                type="radio"
                name="marketplaceId"
                checked={!selectedMarketplace}
                onChange={() => updateFilter('marketplaceId', '')}
              />
              <span className="filter-option-text">All Stores</span>
            </label>
            {marketplaces.map((mkt) => {
              const isSelected = String(selectedMarketplace) === String(mkt.id);
              return (
                <label key={mkt.id} className={`filter-option-item ${isSelected ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="marketplaceId"
                    checked={isSelected}
                    onChange={() => updateFilter('marketplaceId', mkt.id)}
                  />
                  <span className="filter-option-text">{mkt.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Max Price Filter */}
      <div className="filter-group">
        <h4 className="filter-title">Max Price (₹)</h4>
        <div className="filter-price-input-wrap">
          <span className="filter-price-prefix">₹</span>
          <input
            type="number"
            placeholder="e.g. 1999"
            value={maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="filter-price-input"
          />
          {maxPrice && (
            <button
              type="button"
              className="filter-price-clear"
              onClick={() => updateFilter('maxPrice', '')}
              aria-label="Clear price"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="filter-price-presets">
          {[500, 1000, 2000, 5000].map((val) => (
            <button
              key={val}
              type="button"
              className={`filter-preset-btn ${String(maxPrice) === String(val) ? 'active' : ''}`}
              onClick={() => updateFilter('maxPrice', String(maxPrice) === String(val) ? '' : String(val))}
            >
              ≤ ₹{val}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Only Toggle */}
      <div className="filter-group">
        <label className="filter-toggle-card">
          <span className="filter-toggle-info">
            <span className="filter-toggle-title">In Stock Only</span>
            <span className="filter-toggle-subtitle">Hide currently out-of-stock deals</span>
          </span>
          <input
            type="checkbox"
            className="filter-toggle-checkbox"
            checked={inStockOnly}
            onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
          />
        </label>
      </div>

      {/* Reset button */}
      <button
        type="button"
        className="btn btn-secondary btn-sm filter-reset-all-btn"
        onClick={handleResetFilters}
      >
        <RotateCcw size={14} />
        <span>Reset All Filters</span>
      </button>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '1rem' }}>
      {/* Header bar */}
      <div className="deals-header-bar">
        <div className="deals-header-title-wrap">
          <h1 className="section-title">All Deals</h1>
          <p className="deals-count">
            Showing <strong>{processedProducts.length}</strong> active deals
          </p>
        </div>

        <div className="deals-header-controls">
          {/* Mobile filter button */}
          <button
            type="button"
            className={`mobile-filter-trigger-btn ${activeFilterCount > 0 ? 'has-filters' : ''}`}
            onClick={() => setIsMobileFilterOpen(true)}
            aria-label="Open filter drawer"
          >
            <Filter size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="mobile-filter-badge">{activeFilterCount}</span>
            )}
          </button>

          {/* Sort dropdown */}
          <select
            className="sort-select"
            value={currentSort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            aria-label="Sort deals"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Quick Filter Horizontal Scroll */}
      <div className="mobile-quick-filters-bar">
        <button
          type="button"
          className={`quick-filter-pill ${!minDiscount && !inStockOnly ? 'active' : ''}`}
          onClick={() => {
            updateFilter('minDiscount', '');
            updateFilter('inStock', '');
          }}
        >
          All
        </button>
        <button
          type="button"
          className={`quick-filter-pill ${minDiscount === '80' ? 'active' : ''}`}
          onClick={() => updateFilter('minDiscount', minDiscount === '80' ? '' : '80')}
        >
          80%+ OFF
        </button>
        <button
          type="button"
          className={`quick-filter-pill ${minDiscount === '70' ? 'active' : ''}`}
          onClick={() => updateFilter('minDiscount', minDiscount === '70' ? '' : '70')}
        >
          70%+ OFF
        </button>
        <button
          type="button"
          className={`quick-filter-pill ${minDiscount === '50' ? 'active' : ''}`}
          onClick={() => updateFilter('minDiscount', minDiscount === '50' ? '' : '50')}
        >
          50%+ OFF
        </button>
        <button
          type="button"
          className={`quick-filter-pill ${inStockOnly ? 'active' : ''}`}
          onClick={() => updateFilter('inStock', inStockOnly ? '' : 'true')}
        >
          In Stock
        </button>
      </div>

      {/* Active Filters Chips Bar */}
      {activeFilterCount > 0 && (
        <div className="active-filter-chips-bar">
          <span className="active-chips-label">Active:</span>
          {searchTerm && (
            <button type="button" className="active-chip" onClick={() => updateFilter('search', '')}>
              <span>"{searchTerm}"</span>
              <X size={12} />
            </button>
          )}
          {minDiscount && (
            <button type="button" className="active-chip" onClick={() => updateFilter('minDiscount', '')}>
              <span>{minDiscount}%+ OFF</span>
              <X size={12} />
            </button>
          )}
          {selectedCategoryName && (
            <button type="button" className="active-chip" onClick={() => updateFilter('categoryId', '')}>
              <span>{selectedCategoryName}</span>
              <X size={12} />
            </button>
          )}
          {selectedMarketplaceName && (
            <button type="button" className="active-chip" onClick={() => updateFilter('marketplaceId', '')}>
              <span>{selectedMarketplaceName}</span>
              <X size={12} />
            </button>
          )}
          {maxPrice && (
            <button type="button" className="active-chip" onClick={() => updateFilter('maxPrice', '')}>
              <span>≤ ₹{maxPrice}</span>
              <X size={12} />
            </button>
          )}
          {inStockOnly && (
            <button type="button" className="active-chip" onClick={() => updateFilter('inStock', '')}>
              <span>In Stock</span>
              <X size={12} />
            </button>
          )}
          <button type="button" className="active-chip-clear" onClick={handleResetFilters}>
            Clear All
          </button>
        </div>
      )}

      {/* Deals main layout */}
      <div className="deals-layout">
        {/* Desktop Sidebar (Hidden on mobile) */}
        <aside className="filter-sidebar">
          <div className="filter-sidebar-header">
            <span className="filter-sidebar-title">
              <SlidersHorizontal size={18} />
              <span>Filter Deals</span>
            </span>
            {activeFilterCount > 0 && (
              <span className="filter-active-count-badge">{activeFilterCount}</span>
            )}
          </div>
          {FilterContent}
        </aside>

        {/* Product Grid Area */}
        <main>
          {error ? (
            <ErrorState title="Error Loading Deals" message={error} onRetry={fetchProducts} />
          ) : (
            <ProductGrid
              products={processedProducts}
              loading={loading}
              skeletonCount={8}
              emptyTitle="No Qualifying Deals Match"
              emptyDescription="Try adjusting your filters or minimum discount threshold to see more deals."
              onResetFilters={handleResetFilters}
            />
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer (Modal / Bottom Sheet) */}
      {isMobileFilterOpen && (
        <div className="deals-drawer-backdrop" onClick={() => setIsMobileFilterOpen(false)}>
          <div
            className="deals-drawer-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="deals-drawer-header">
              <div className="deals-drawer-title-wrap">
                <SlidersHorizontal size={18} />
                <h3 className="deals-drawer-title">Filter Deals</h3>
                {activeFilterCount > 0 && (
                  <span className="deals-drawer-badge">{activeFilterCount}</span>
                )}
              </div>
              <div className="deals-drawer-header-actions">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    className="deals-drawer-clear-btn"
                    onClick={handleResetFilters}
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  className="deals-drawer-close-btn"
                  onClick={() => setIsMobileFilterOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="deals-drawer-body">
              {FilterContent}
            </div>

            <div className="deals-drawer-footer">
              <button
                type="button"
                className="btn btn-primary btn-deal-apply"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Apply Filters ({processedProducts.length} Deals)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealsPage;
