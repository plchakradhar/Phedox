import React, { useState, useEffect } from 'react';
import "./CategoriesPage.css";
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';
import { categoryApi } from '../../api/categories';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import CategoryStrokeIcon from '../../components/common/CategoryStrokeIcon';
import { FALLBACK_CATEGORY_IMAGE } from '../../utils/constants';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryApi.getCategories();
      setCategories(Array.isArray(data) ? data.filter((c) => c.active !== false) : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', margin: '1rem 0 3rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Explore by Category
        </span>
        <h1 className="section-title" style={{ fontSize: '2.25rem', marginTop: '0.25rem' }}>
          Browse Deal Categories
        </h1>
        <p className="section-subtitle" style={{ maxWidth: '540px', margin: '0.5rem auto 0' }}>
          Find massive discounts of 50% or more neatly organized across all major shopping categories.
        </p>
      </div>

      {error ? (
        <ErrorState title="Error Loading Categories" message={error} onRetry={fetchCategories} />
      ) : loading ? (
        <div className="categories-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="category-card" style={{ pointerEvents: 'none' }}>
              <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '70%', height: '18px', marginBottom: '6px' }} />
                <div className="skeleton" style={{ width: '50%', height: '14px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Categories Available"
          description="Categories will be loaded as soon as deals and categories are configured in the backend."
          actionLabel="View All Deals"
          actionLink="/deals"
        />
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="category-card"
            >
              <div className="category-icon">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
                    }}
                  />
                ) : (
                  <CategoryStrokeIcon
                    name={category.name || category.id}
                    size={24}
                    strokeWidth={1.85}
                    className="category-card-stroke-icon"
                  />
                )}
              </div>
              <div className="category-info" style={{ flex: 1 }}>
                <h4>{category.name}</h4>
                <p>{category.description || 'Browse 50%+ deals in this category'}</p>
              </div>
              <ArrowRight size={16} color="var(--primary)" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
