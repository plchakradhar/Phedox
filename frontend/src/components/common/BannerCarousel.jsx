import React, { useState, useEffect, useCallback } from "react";
import "./BannerCarousel.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const BannerCarousel = ({ banners = [], autoPlay = true, interval = 4000 }) => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(i => (i + 1) % banners.length), [banners.length]);
  const prev = () => setCurrent(i => (i - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;
    const t = setInterval(next, interval);
    return () => clearInterval(t);
  }, [autoPlay, interval, next, banners.length]);

  if (!banners.length) return null;

  return (
    <div className="banner-carousel">
      <div
        className="banner-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b, i) => (
          <div
            key={i}
            className="banner-slide"
            style={{ background: b.bg || "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}
          >
            <div className="banner-content">
              {b.tag && <span className="banner-tag">{b.tag}</span>}
              <h2 className="banner-title">{b.title}</h2>
              {b.subtitle && <p className="banner-subtitle">{b.subtitle}</p>}
              {b.cta && (
                <a href={b.ctaLink || "#"} className="banner-cta">
                  {b.cta}
                </a>
              )}
            </div>
            {b.image && (
              <div className="banner-image-wrap">
                <img src={b.image} alt={b.title} />
              </div>
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button type="button" className="banner-arrow banner-prev" onClick={prev} aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="banner-arrow banner-next" onClick={next} aria-label="Next">
            <ChevronRight size={20} />
          </button>
          <div className="banner-dots">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`banner-dot${i === current ? " active" : ""}`}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;
