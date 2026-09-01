import React, { useState, useEffect, useMemo } from "react";
import "./HomePage.css";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Zap } from "lucide-react";
import { productApi } from "../../api/products";
import ProductGrid from "../../components/common/ProductGrid";
import BannerCarousel from "../../components/common/BannerCarousel";
import ErrorState from "../../components/common/ErrorState";

/* ── Promotional banner slides ──────────────────────────────── */
const HOME_BANNERS = [
  {
    title: "Mega Fashion Deals",
    subtitle: "Up to 80% off on top brands — verified & live",
    tag: "Limited Time",
    cta: "Shop Fashion",
    ctaLink: "/deals",
    bg: "linear-gradient(135deg,#1e40af 0%,#3b82f6 60%,#06b6d4 100%)",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Smartphone Festival",
    subtitle: "Latest 5G phones — verified 50%+ off",
    tag: "Flash Sale",
    cta: "Explore Mobiles",
    ctaLink: "/deals",
    bg: "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%)",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Electronics Savings",
    subtitle: "Laptops, TVs, Audio — Guaranteed 50% OFF",
    tag: "Best Deals",
    cta: "View Electronics",
    ctaLink: "/deals",
    bg: "linear-gradient(135deg,#ea580c 0%,#f97316 60%,#fbbf24 100%)",
    image: "https://images.unsplash.com/photo-1593640408182-31c228e05dc8?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Beauty & Skincare Offers",
    subtitle: "Premium brands at prices you will love",
    tag: "New Arrivals",
    cta: "Shop Beauty",
    ctaLink: "/deals",
    bg: "linear-gradient(135deg,#9d174d 0%,#ec4899 60%,#f9a8d4 100%)",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Home Makeover Sale",
    subtitle: "Furniture, decor & more — starting at 50% off",
    tag: "Trending Now",
    cta: "Explore Home",
    ctaLink: "/deals",
    bg: "linear-gradient(135deg,#064e3b 0%,#047857 60%,#34d399 100%)",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
  },
];

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      setRecentSearches(Array.isArray(stored) ? stored : []);
    } catch { /* ignore */ }

    // Fetch products
    (async () => {
      try {
        const prods = await productApi.getProducts();
        setProducts(Array.isArray(prods) ? prods : []);
      } catch (err) {
        setError(err.message || "Failed to connect to server");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter products with 80%+ discount
  const top80Deals = useMemo(() => {
    return products.filter((p) => {
      const discount = Number(p.discountPercentage);
      if (!isNaN(discount) && discount >= 80) return true;
      if (p.originalPrice && p.currentPrice) {
        const orig = Number(p.originalPrice);
        const curr = Number(p.currentPrice);
        if (orig > 0 && curr < orig) {
          const calcDisc = Math.round(((orig - curr) / orig) * 100);
          return calcDisc >= 80;
        }
      }
      return false;
    });
  }, [products]);

  return (
    <div className="mp-page">

      {/* 1 ── Hero Promotional Banners */}
      <section className="mp-section">
        <BannerCarousel banners={HOME_BANNERS} />
      </section>

      {/* 2 ── Recent Searches (shown only if exists) */}
      {recentSearches.length > 0 && (
        <section className="mp-section mp-section-pad">
          <div className="recent-searches-bar">
            <span className="recent-label">Recent:</span>
            {recentSearches.slice(0, 8).map((q, i) => (
              <Link key={i} to={`/search?q=${encodeURIComponent(q)}`} className="recent-chip">{q}</Link>
            ))}
          </div>
        </section>
      )}

      {/* Error notice */}
      {error && (
        <div className="mp-section mp-section-pad">
          <ErrorState title="Connection Notice" message={error} onRetry={() => window.location.reload()} />
        </div>
      )}

      {/* 3 ── Top Deals — 80%+ OFF (Vertical Grid) */}
      <section className="mp-section mp-section-pad">
        <div className="mp-section-header">
          <h2 className="mp-section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#dc2626" }}>
            <Flame size={20} strokeWidth={2} style={{ color: "#dc2626" }} />
            <span>Top Deals — 80%+ OFF</span>
          </h2>
          <Link to="/deals?minDiscount=80" className="mp-view-all">
            View All 80%+ Deals <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid
          products={top80Deals}
          loading={loading}
          skeletonCount={4}
          emptyTitle="No 80%+ Deals Currently Available"
          emptyDescription="Check back soon for exclusive 80%+ mega discount offers."
        />
      </section>

      {/* 4 ── All Products Vertical Grid */}
      {products.length > 0 && (
        <section className="mp-section mp-section-pad">
          <div className="mp-section-header">
            <h2 className="mp-section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Zap size={20} strokeWidth={2} style={{ color: "var(--primary)" }} />
              <span>All Products</span>
            </h2>
            <Link to="/deals?sort=newest" className="mp-view-all">
              View All Deals <ArrowRight size={14} />
            </Link>
          </div>
          <ProductGrid
            products={products}
            loading={loading}
            skeletonCount={8}
          />
        </section>
      )}

    </div>
  );
};

export default HomePage;