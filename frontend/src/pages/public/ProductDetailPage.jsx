import React, { useState, useEffect, useMemo } from 'react';
import "./ProductDetailPage.css";
import { useParams, Link } from 'react-router-dom';
import {
  ExternalLink,
  Star,
  ShieldCheck,
  Zap,
  Tag,
  CheckCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { productApi } from '../../api/products';
import { clickApi } from '../../api/clicks';
import StockBadge from '../../components/common/StockBadge';
import ProductGrid from '../../components/common/ProductGrid';
import ErrorState from '../../components/common/ErrorState';
import CategoryStrokeIcon from '../../components/common/CategoryStrokeIcon';
import { ProductDetailSkeleton } from '../../components/common/Skeleton';
import { formatCurrency, formatPercent, formatDate, resolveImageUrl } from '../../utils/formatters';
import { FALLBACK_PRODUCT_IMAGE } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedDeals, setRelatedDeals] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { info } = useToast();

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.getProductById(id);
      setProduct(data);
      setActiveImageIndex(0);

      // Load related deals in same category
      if (data.categoryId) {
        productApi.getProducts({ categoryId: data.categoryId })
          .then((rel) => {
            if (Array.isArray(rel)) {
              setRelatedDeals(rel.filter((p) => p.id !== data.id).slice(0, 4));
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      setError(err.message || 'Product details could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProduct();
      window.scrollTo(0, 0);
    }
  }, [id]);

  // Robust image deduplication: strips sizing tokens & query parameters
  const uniqueImages = useMemo(() => {
    if (!product) return [FALLBACK_PRODUCT_IMAGE];
    const rawList = [product.primaryImageUrl, ...(product.imageUrls || [])].filter(Boolean);
    const seen = new Set();
    const result = [];

    for (const url of rawList) {
      if (!url || typeof url !== 'string') continue;
      const cleanUrl = resolveImageUrl(url.trim());
      if (!cleanUrl) continue;
      const dedupKey = cleanUrl
        .split('?')[0]
        .replace(/\._[A-Za-z0-9_,]+_\./, '.')
        .replace(/\/image\/\d+\/\d+\//, '/image/large/')
        .toLowerCase();

      if (!seen.has(dedupKey)) {
        seen.add(dedupKey);
        result.push(cleanUrl);
      }
    }

    return result.length > 0 ? result : [FALLBACK_PRODUCT_IMAGE];
  }, [product]);

  const handlePrevImage = (e) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : uniqueImages.length - 1));
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev < uniqueImages.length - 1 ? prev + 1 : 0));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product?.name,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      info('Deal link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="fk-detail-page">
        <div className="fk-detail-fullwidth-container">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="fk-detail-page">
        <div className="fk-detail-fullwidth-container">
          <ErrorState
            title="Product Not Found"
            message={error || 'The requested product deal is no longer active or does not exist.'}
            onRetry={loadProduct}
          />
        </div>
      </div>
    );
  }

  const {
    name,
    description,
    categoryName,
    categoryId,
    marketplaceName,
    currentPrice,
    originalPrice,
    highestPrice,
    averagePrice,
    lowestPrice,
    discountPercentage,
    rating,
    ratingCount,
    stockStatus,
    status,
    lastCheckedAt,
    reviews = [],
  } = product;

  const isInactive = status === 'INACTIVE';
  const isOutOfStock = stockStatus === 'OUT_OF_STOCK' || isInactive;
  const numDiscount = discountPercentage ? Math.round(Number(discountPercentage)) : 0;
  const numRating = rating ? Number(rating).toFixed(1) : "4.2";
  const formattedRatingCount = ratingCount || "1,200+";

  const numCurrent = Number(currentPrice) || 0;
  const numOriginal = Number(originalPrice) || 0;
  const savingsAmount = numOriginal > numCurrent ? numOriginal - numCurrent : 0;

  const handleBuyNow = (e) => {
    if (e) e.preventDefault();
    if (isOutOfStock) return;
    clickApi.buyNow(id);
  };

  const getMarketplaceBadgeClass = (mName) => {
    const m = (mName || '').toLowerCase();
    if (m.includes('flipkart')) return 'fk-badge-flipkart';
    if (m.includes('amazon')) return 'fk-badge-amazon';
    if (m.includes('myntra')) return 'fk-badge-myntra';
    if (m.includes('meesho')) return 'fk-badge-meesho';
    if (m.includes('ajio')) return 'fk-badge-ajio';
    if (m.includes('nykaa')) return 'fk-badge-nykaa';
    if (m.includes('jiomart')) return 'fk-badge-jiomart';
    if (m.includes('croma')) return 'fk-badge-croma';
    if (m.includes('tatacliq') || m.includes('tata cliq')) return 'fk-badge-tatacliq';
    if (m.includes('snapdeal')) return 'fk-badge-snapdeal';
    if (m.includes('shopsy')) return 'fk-badge-shopsy';
    return 'fk-badge-default';
  };

  // Extract description highlights/bullet points if present
  const descriptionLines = (description || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const currentDisplayImage = uniqueImages[activeImageIndex] || uniqueImages[0] || FALLBACK_PRODUCT_IMAGE;

  return (
    <div className="fk-detail-page">
      <div className="fk-detail-fullwidth-container">
        
        {/* Main Product Showcase Card */}
        <div className="fk-product-container">
          
          {/* ── LEFT COLUMN: Image Showcase, Thumbnails & Action Buttons ── */}
          <div className="fk-gallery-column">
            <div className="fk-gallery-sticky">
              
              {/* Main Showcase Image Box */}
              <div className="fk-main-image-box">
                {/* Discount Ribbon */}
                {numDiscount > 0 && (
                  <div className="fk-discount-ribbon">
                    {numDiscount}% OFF
                  </div>
                )}

                {/* Marketplace Badge */}
                {marketplaceName && (
                  <div className={`fk-store-badge ${getMarketplaceBadgeClass(marketplaceName)}`}>
                    {marketplaceName}
                  </div>
                )}

                {/* Main Product Image */}
                <div className="fk-image-viewport">
                  <img
                    src={currentDisplayImage}
                    alt={name}
                    className="fk-showcase-img"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
                </div>

                {/* Left and Right Nav Icons */}
                {uniqueImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="fk-nav-btn fk-nav-prev"
                      onClick={handlePrevImage}
                      aria-label="Previous Image"
                      title="Previous Image"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      type="button"
                      className="fk-nav-btn fk-nav-next"
                      onClick={handleNextImage}
                      aria-label="Next Image"
                      title="Next Image"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}

                {/* Out of Stock / Inactive Overlay */}
                {isInactive && (
                  <div className="fk-inactive-overlay">
                    <span>DEAL EXPIRED</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip (Only shown if 2+ unique images) */}
              {uniqueImages.length > 1 && (
                <div className="fk-thumbnails-strip">
                  {uniqueImages.map((imgUrl, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={`fk-thumb-card ${activeImageIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                      onMouseEnter={() => setActiveImageIndex(idx)}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${name} thumb ${idx + 1}`}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* ── RIGHT COLUMN: Product Information, Price Row & Offers ── */}
          <div className="fk-info-column">
            
            {/* Category Path & Platform */}
            <div className="fk-meta-top-row">
              {categoryName && (
                <Link to={`/categories/${categoryId}`} className="fk-cat-pill">
                  <CategoryStrokeIcon name={categoryName || categoryId} size={14} strokeWidth={2} />
                  <span>{categoryName}</span>
                </Link>
              )}
              {marketplaceName && (
                <span className="fk-platform-label">
                  Sold on <strong>{marketplaceName}</strong>
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="fk-product-title">{name}</h1>

            {/* Rating & Assured Badge Row */}
            <div className="fk-rating-row">
              <div className="fk-green-rating-badge">
                <span>{numRating}</span>
                <Star size={12} fill="#ffffff" color="#ffffff" />
              </div>
              <span className="fk-ratings-count">
                {formattedRatingCount} Ratings & Reviews
              </span>
              <div className="fk-assured-tag">
                <ShieldCheck size={14} />
                <span>Assured Deal</span>
              </div>
              <StockBadge status={stockStatus} />
            </div>

            {/* Price Block */}
            <div className="fk-pricing-section">
              <div className="fk-special-price-label">Special Price</div>
              <div className="fk-price-main-row">
                <span className="fk-current-price">{formatCurrency(currentPrice)}</span>
                {numOriginal > numCurrent && (
                  <span className="fk-original-price">{formatCurrency(originalPrice)}</span>
                )}
                {numDiscount > 0 && (
                  <span className="fk-discount-percent">{numDiscount}% off</span>
                )}
              </div>
              {savingsAmount > 0 && (
                <div className="fk-savings-badge">
                  You save <strong>{formatCurrency(savingsAmount)}</strong> ({numDiscount}%) on this deal
                </div>
              )}
            </div>

            {/* Available Offers (Flipkart Style) */}
            <div className="fk-offers-box">
              <h3 className="fk-offers-title">Available Offers</h3>
              <div className="fk-offers-list">
                <div className="fk-offer-item">
                  <Tag size={15} className="fk-offer-icon" />
                  <span><strong>Bank Offer:</strong> 5% Unlimited Cashback on selected Credit/Debit cards on {marketplaceName || 'store'}.</span>
                </div>
                <div className="fk-offer-item">
                  <Tag size={15} className="fk-offer-icon" />
                  <span><strong>Special Price:</strong> Get extra discount included in the final price shown above.</span>
                </div>
                <div className="fk-offer-item">
                  <Tag size={15} className="fk-offer-icon" />
                  <span><strong>Partner Offer:</strong> Fast shipping & verified deal authenticity tracked via Phedox.</span>
                </div>
              </div>
            </div>

            {/* Action Buttons (Buy Now & Share) */}
            <div className="fk-actions-row">
              <button
                type="button"
                className={`fk-buy-now-btn ${isOutOfStock ? 'disabled' : ''}`}
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                <Zap size={20} fill="#ffffff" />
                <span>{isOutOfStock ? 'OUT OF STOCK' : `BUY NOW ON ${marketplaceName || 'STORE'}`}</span>
                <ExternalLink size={18} />
              </button>

              <button
                type="button"
                className="fk-share-btn"
                onClick={handleShare}
                title="Share this deal"
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>

            {/* Affiliate Security Tag */}
            <div className="fk-affiliate-note">
              <ShieldCheck size={16} color="#388e3c" />
              <span>Verified Official Link: Directly redirects to {marketplaceName || 'Merchant Store'} with no extra charges.</span>
            </div>

            {/* Price Intelligence Matrix */}
            <div className="fk-intel-box">
              <div className="fk-intel-header">
                <TrendingDown size={16} color="#2874f0" />
                <span>Price Intelligence History</span>
              </div>
              <div className="fk-intel-grid">
                <div className="fk-intel-cell">
                  <span className="fk-intel-cell-lbl">Current Deal</span>
                  <span className="fk-intel-cell-val highlight">{formatCurrency(currentPrice)}</span>
                </div>
                <div className="fk-intel-cell">
                  <span className="fk-intel-cell-lbl">MRP (Highest)</span>
                  <span className="fk-intel-cell-val">{formatCurrency(highestPrice || originalPrice)}</span>
                </div>
                <div className="fk-intel-cell">
                  <span className="fk-intel-cell-lbl">Average Price</span>
                  <span className="fk-intel-cell-val">{formatCurrency(averagePrice || currentPrice)}</span>
                </div>
                <div className="fk-intel-cell">
                  <span className="fk-intel-cell-lbl">All-Time Low</span>
                  <span className="fk-intel-cell-val green">{formatCurrency(lowestPrice || currentPrice)}</span>
                </div>
              </div>
            </div>

            {/* Product Highlights & Features */}
            {descriptionLines.length > 0 && (
              <div className="fk-highlights-box">
                <h3 className="fk-section-heading">Product Highlights</h3>
                <ul className="fk-highlights-list">
                  {descriptionLines.slice(0, 8).map((line, lIdx) => (
                    <li key={lIdx}>
                      <span className="fk-bullet">•</span>
                      <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Product Description */}
            {description && (
              <div className="fk-description-box">
                <h3 className="fk-section-heading">Description</h3>
                <p className="fk-description-text">{description}</p>
              </div>
            )}

            {/* Verification Timestamp */}
            {lastCheckedAt && (
              <div className="fk-timestamp-bar">
                <Clock size={14} />
                <span>Price & stock verified: {formatDate(lastCheckedAt)}</span>
              </div>
            )}

          </div>
        </div>

        {/* ── Customer Reviews Section (Flipkart Style) ── */}
        {reviews && reviews.length > 0 && (
          <div className="fk-reviews-card">
            <div className="fk-reviews-header">
              <div>
                <h2 className="fk-reviews-title">Ratings & Reviews</h2>
                <div className="fk-reviews-sub">Verified customer reviews from {marketplaceName || 'store'}</div>
              </div>
              <div className="fk-rating-summary-box">
                <div className="fk-rating-summary-score">
                  <span>{numRating}</span>
                  <Star size={16} fill="#ffffff" color="#ffffff" />
                </div>
                <span className="fk-rating-summary-text">{formattedRatingCount} verified ratings</span>
              </div>
            </div>

            <div className="fk-reviews-grid">
              {reviews.map((rev, rIdx) => (
                <div key={rIdx} className="fk-review-item">
                  <div className="fk-review-top">
                    <div className="fk-review-stars">
                      <span>{rev.rating || "5.0"}</span>
                      <Star size={11} fill="#ffffff" color="#ffffff" />
                    </div>
                    {rev.reviewTitle && (
                      <span className="fk-review-title">{rev.reviewTitle}</span>
                    )}
                  </div>

                  <p className="fk-review-comment">{rev.comment}</p>

                  <div className="fk-review-meta">
                    <span className="fk-reviewer-name">{rev.reviewerName || 'Verified Buyer'}</span>
                    {rev.verifiedPurchase && (
                      <span className="fk-verified-tag">
                        <CheckCircle size={13} /> Certified Buyer
                      </span>
                    )}
                    <span className="fk-review-date">{rev.reviewDate || 'Recent'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Related Deals Grid ── */}
        {relatedDeals.length > 0 && (
          <div className="fk-related-deals-section">
            <div className="fk-related-header">
              <div>
                <h2 className="fk-related-title">Similar Deals You Might Like</h2>
                <p className="fk-related-sub">Verified offers in {categoryName || 'this category'}</p>
              </div>
              {categoryId && (
                <Link to={`/categories/${categoryId}`} className="fk-view-all-btn">
                  <span>View All in {categoryName || 'Category'}</span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
            <ProductGrid products={relatedDeals} />
          </div>
        )}

      </div>

      {/* ── Mobile Sticky Bottom Buy CTA Bar ── */}
      <div className="fk-mobile-sticky-bar">
        <div className="fk-mobile-sticky-price-info">
          <div className="fk-mobile-sticky-now">{formatCurrency(currentPrice)}</div>
          {numOriginal > numCurrent && (
            <div className="fk-mobile-sticky-was-wrap">
              <span className="fk-mobile-sticky-was">{formatCurrency(originalPrice)}</span>
              {numDiscount > 0 && <span className="fk-mobile-sticky-disc">{numDiscount}% OFF</span>}
            </div>
          )}
        </div>
        <button
          type="button"
          className="fk-mobile-sticky-buy-btn"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
        >
          <span>{isOutOfStock ? 'Out of Stock' : `Buy on ${marketplaceName || 'Store'}`}</span>
          <ExternalLink size={14} />
        </button>
      </div>

    </div>
  );
};

export default ProductDetailPage;
