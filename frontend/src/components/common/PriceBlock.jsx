import React from 'react';
import "./PriceBlock.css";
import { formatCurrency, calculateSavings, formatPercent } from '../../utils/formatters';

export const PriceBlock = ({
  currentPrice,
  originalPrice,
  discountPercentage,
  size = 'md',
  showSavings = false,
}) => {
  const hasOriginal = originalPrice && Number(originalPrice) > Number(currentPrice);
  const discountVal = discountPercentage ? Math.round(Number(discountPercentage)) : (
    hasOriginal ? Math.round(((Number(originalPrice) - Number(currentPrice)) / Number(originalPrice)) * 100) : null
  );
  const savings = calculateSavings(originalPrice, currentPrice);

  return (
    <div className={`card-price-block size-${size}`}>
      <div className="price-row">
        <span className="current-price">
          {formatCurrency(currentPrice)}
        </span>
        {hasOriginal && (
          <span className="original-price">
            {formatCurrency(originalPrice)}
          </span>
        )}
        {discountVal && discountVal > 0 ? (
          <span className="discount-tag">
            {discountVal}% off
          </span>
        ) : null}
      </div>

      {showSavings && savings > 0 && (
        <div className="savings-tag">
          Save {formatCurrency(savings)} ({formatPercent(discountPercentage)})
        </div>
      )}
    </div>
  );
};

export default PriceBlock;
