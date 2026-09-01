import React from 'react';
import "./ProductGrid.css";
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from './Skeleton';
import EmptyState from './EmptyState';

export const ProductGrid = ({
  products = [],
  loading = false,
  skeletonCount = 8,
  emptyTitle = 'No Deals Found',
  emptyDescription = 'We could not find any deals matching your criteria.',
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetFilters ? 'Clear Filters' : 'Browse All Deals'}
        onAction={onResetFilters}
        actionLink={!onResetFilters ? '/deals' : undefined}
      />
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
