import React from "react";
import "./ProductCard.css";
import { useNavigate } from "react-router-dom";
import { Star, ExternalLink, Truck, CheckCircle, ShieldCheck } from "lucide-react";
import DealBadge from "./DealBadge";
import PriceBlock from "./PriceBlock";
import CategoryStrokeIcon from "./CategoryStrokeIcon";
import { FALLBACK_PRODUCT_IMAGE } from "../../utils/constants";
import { resolveImageUrl } from "../../utils/formatters";
import { clickApi } from "../../api/clicks";

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  if (!product) return null;

  const {
    id,
    name,
    categoryName,
    marketplaceName,
    currentPrice,
    originalPrice,
    discountPercentage,
    rating,
    ratingCount,
    stockStatus,
    primaryImageUrl,
    imageUrls,
    status,
  } = product;

  const rawImg = primaryImageUrl || (imageUrls && imageUrls[0]) || '';
  const imageUrl = resolveImageUrl(rawImg) || FALLBACK_PRODUCT_IMAGE;
  const isOutOfStock = stockStatus === "OUT_OF_STOCK" || status === "INACTIVE";
  const numDiscount = discountPercentage ? Math.round(Number(discountPercentage)) : 0;
  const numRating = rating ? Number(rating).toFixed(1) : null;

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    clickApi.buyNow(id);
  };

  const handleCardClick = () => navigate(`/products/${id}`);

  const getMarketplaceClass = (mName) => {
    const m = (mName || "").toLowerCase();
    if (m.includes("flipkart")) return "badge-flipkart";
    if (m.includes("amazon")) return "badge-amazon";
    if (m.includes("myntra")) return "badge-myntra";
    if (m.includes("meesho")) return "badge-meesho";
    if (m.includes("ajio")) return "badge-ajio";
    if (m.includes("nykaa")) return "badge-nykaa";
    if (m.includes("jiomart")) return "badge-jiomart";
    if (m.includes("croma")) return "badge-croma";
    if (m.includes("tatacliq") || m.includes("tata cliq")) return "badge-tatacliq";
    if (m.includes("snapdeal")) return "badge-snapdeal";
    if (m.includes("shopsy")) return "badge-shopsy";
    return "badge-default";
  };

  return (
    <div
      className={`product-card ${isOutOfStock ? "is-out-of-stock" : ""}`}
      onClick={handleCardClick}
    >
      {/* ── Image Section ── */}
      <div className="card-image-wrapper">
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
          }}
        />

        {numDiscount > 0 ? (
          <div className="card-badge-left">
            <DealBadge discount={numDiscount} size="sm" />
          </div>
        ) : null}

        {marketplaceName ? (
          <span className={`card-marketplace-badge ${getMarketplaceClass(marketplaceName)}`}>
            {marketplaceName}
          </span>
        ) : null}

        {isOutOfStock && <div className="card-stock-overlay">Out of Stock</div>}
      </div>

      {/* ── Card Content ── */}
      <div className="card-content">
        {/* Category Header */}
        {categoryName && (
          <div className="card-category-line">
            <CategoryStrokeIcon
              name={categoryName}
              size={12}
              strokeWidth={1.85}
              className="card-cat-icon"
            />
            <span className="card-cat-text">{categoryName}</span>
          </div>
        )}

        {/* Product Title */}
        <h3 className="card-title" title={name}>
          {name}
        </h3>

        {/* Rating & Assured Badge */}
        <div className="card-rating-stock">
          {numRating ? (
            <div className="rating-wrap">
              <span className="rating-pill">
                <span>{numRating}</span>
                <Star size={10} fill="#ffffff" color="#ffffff" />
              </span>
              {ratingCount && (
                <span className="rating-count">({ratingCount})</span>
              )}
            </div>
          ) : (
            <div className="verified-deal-pill">
              <ShieldCheck size={12} />
              <span>Verified Deal</span>
            </div>
          )}

          {!isOutOfStock ? (
            <span className="card-assured-badge">
              <CheckCircle size={10} strokeWidth={2.5} />
              <span>Assured</span>
            </span>
          ) : (
            <span className="card-out-badge">Out of Stock</span>
          )}
        </div>

        {/* Price Row */}
        <div className="card-price-wrap">
          <PriceBlock
            currentPrice={currentPrice}
            originalPrice={originalPrice}
            discountPercentage={discountPercentage}
            size="md"
          />
        </div>

        {/* Delivery Info */}
        {!isOutOfStock && (
          <div className="card-delivery-info">
            <Truck size={12} className="delivery-icon" />
            <span>Free Delivery</span>
          </div>
        )}

        {/* Action Button */}
        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="btn-card-buy"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            title={isOutOfStock ? "Out of Stock" : "Buy Deal"}
          >
            <span>Buy Now</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
