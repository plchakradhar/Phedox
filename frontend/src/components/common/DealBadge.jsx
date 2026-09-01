import React from 'react';
import "./DealBadge.css";

export const DealBadge = ({ discount, className = '', size = 'md' }) => {
  const num = Number(discount);
  if (!num || num < 1) return null;

  const formattedDiscount = `${Math.round(num)}% OFF`;

  return (
    <span className={`card-deal-badge ${className} size-${size}`}>
      {formattedDiscount}
    </span>
  );
};

export default DealBadge;
