import React, { useRef } from "react";
import "./ProductCarousel.css";
import { ChevronLeft, ChevronRight, ArrowRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "./Skeleton";

export const ProductCarousel = ({
  title,
  icon: Icon = Flame,
  showIcon = true,
  products = [],
  loading = false,
  viewAllLink,
  skeletonCount = 6,
  theme = "default",
}) => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(".product-card")?.offsetWidth || 220;
    el.scrollBy({ left: dir * (cardWidth + 16) * 2, behavior: "smooth" });
  };

  const items = loading
    ? Array.from({ length: skeletonCount }).map((_, i) => ({ _skeleton: true, id: `sk-${i}` }))
    : products;

  if (!loading && !products.length) return null;

  return (
    <div className={`product-carousel-section theme-${theme}`}>
      <div className="carousel-header">
        <h2 className="carousel-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {showIcon && Icon && <Icon size={20} strokeWidth={2} style={{ color: theme === "red" ? "#dc2626" : "var(--primary)" }} />}
          <span>{title}</span>
        </h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="carousel-view-all">
            View All <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <div className="carousel-wrapper">
        <button type="button" className="carousel-arrow carousel-left" onClick={() => scroll(-1)} aria-label="Scroll left">
          <ChevronLeft size={20} />
        </button>
        <div className="carousel-track" ref={scrollRef}>
          {items.map((p) =>
            p._skeleton
              ? <div key={p.id} className="carousel-item"><ProductCardSkeleton /></div>
              : <div key={p.id} className="carousel-item"><ProductCard product={p} /></div>
          )}
        </div>
        <button type="button" className="carousel-arrow carousel-right" onClick={() => scroll(1)} aria-label="Scroll right">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProductCarousel;
