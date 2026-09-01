import React, { useState, useEffect } from 'react';
import "./SearchResultsPage.css";
import { useSearchParams, Link } from 'react-router-dom';
import { Search, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { productApi } from '../../api/products';
import ProductGrid from '../../components/common/ProductGrid';
import ErrorState from '../../components/common/ErrorState';
import { SORT_OPTIONS } from '../../utils/constants';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const searchDeals = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.getProducts({
        search: searchQuery || undefined,
      });
      setProducts(Array.isArray(data) ? data : []);

      // Persist to recentSearches in localStorage
      if (searchQuery && searchQuery.trim()) {
        try {
          const stored = JSON.parse(localStorage.getItem('recentSearches') || '[]');
          const updated = [
            searchQuery.trim(),
            ...stored.filter((q) => q.toLowerCase() !== searchQuery.trim().toLowerCase()),
          ].slice(0, 10);
          localStorage.setItem('recentSearches', JSON.stringify(updated));
        } catch {
          // ignore storage errors
        }
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message || 'Failed to search deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchDeals(query);
  }, [query]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'discount-desc') return (Number(b.discountPercentage) || 0) - (Number(a.discountPercentage) || 0);
    if (sortBy === 'price-asc') return (Number(a.currentPrice) || 0) - (Number(b.currentPrice) || 0);
    if (sortBy === 'price-desc') return (Number(b.currentPrice) || 0) - (Number(a.currentPrice) || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div className="container" style={{ paddingTop: '1rem' }}>
      {/* Search Header Form */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <form onSubmit={handleFormSubmit} style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem' }}>
            Search 50%+ Discount Deals
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products, brands, or deal keywords..."
                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* Query Bar */}
      <div className="deals-header-bar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {query ? (
              <>
                Results for <span style={{ color: 'var(--primary)' }}>"{query}"</span>
              </>
            ) : (
              'All Search Results'
            )}
          </h2>
          <p className="deals-count">
            Found <strong>{products.length}</strong> matching 50%+ deals
          </p>
        </div>

        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort search results"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {error ? (
        <ErrorState title="Error Fetching Search Results" message={error} onRetry={() => searchDeals(query)} />
      ) : (
        <ProductGrid
          products={sortedProducts}
          loading={loading}
          skeletonCount={8}
          emptyTitle={`No deals found for "${query}"`}
          emptyDescription="We could not find any active 50%+ discount deals matching your keywords. Try searching for different terms or browse categories."
          actionLabel="Clear Search"
          actionLink="/deals"
        />
      )}
    </div>
  );
};

export default SearchResultsPage;
