import React from 'react';
import "./AboutPage.css";
import {
  Flame,
  ShieldCheck,
  Zap,
  TrendingDown,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  Send,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="container" style={{ paddingTop: '1rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', margin: '2rem auto 3.5rem', maxWidth: '780px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Discover the Phedox Standard
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: 1.2 }}>
          We Guarantee 50%+ Savings on Every Single Deal
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Phedox is India's dedicated automated deal discovery engine designed to filter through the noise. Hunt Less, Save More. We ingest deals directly from verified channels, scrape and verify authentic live prices, and discard any offer that doesn't meet our strict 50% discount threshold.
        </p>
      </section>

      {/* 4 Feature Pillars (PDF Sec 20.9) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <div className="step-card">
          <div className="step-icon"><Send size={22} color="var(--primary)" /></div>
          <h3 className="step-title">1. Telegram Ingestion</h3>
          <p className="step-desc">
            Our platform connects to high-volume ExtraPe Telegram channels, instantly capturing newly published deals and preserving the verified affiliate tracking link.
          </p>
        </div>

        <div className="step-card">
          <div className="step-icon"><TrendingDown size={22} color="#ef4444" /></div>
          <h3 className="step-title">2. Strict 50%+ Filter</h3>
          <p className="step-desc">
            We scrape Amazon, Flipkart, Myntra and merchant product pages in real-time. If the discount is below 50%, the backend automatically rejects the deal.
          </p>
        </div>

        <div className="step-card">
          <div className="step-icon"><Clock size={22} color="#f59e0b" /></div>
          <h3 className="step-title">3. Hourly Schedulers</h3>
          <p className="step-desc">
            Automated schedulers re-verify live prices, dead links, and out-of-stock items every hour, ensuring only valid active deals remain visible to shoppers.
          </p>
        </div>

        <div className="step-card">
          <div className="step-icon"><Lock size={22} color="#10b981" /></div>
          <h3 className="step-title">4. Direct Merchant Redirect</h3>
          <p className="step-desc">
            When you click Buy Now, you are directed directly to the merchant without any altered URLs, saving you money directly at checkout.
          </p>
        </div>
      </section>

      {/* Process Flow Graphic */}
      <section
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          marginBottom: '4rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem' }}>
          The End-to-End Deal Processing Architecture
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Step 1</div>
            <div style={{ fontWeight: 700 }}>Telegram Channel</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ExtraPe Offer Post</div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Step 2</div>
            <div style={{ fontWeight: 700 }}>Spring Boot Backend</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jsoup Scraper & Parser</div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Step 3</div>
            <div style={{ fontWeight: 700 }}>Validation Engine</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>50%+ Discount Audit</div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Step 4</div>
            <div style={{ fontWeight: 700 }}>React UI Catalog</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instant Customer Browse</div>
          </div>
        </div>
      </section>

      {/* Affiliate & Legal Disclosure */}
      <section
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          marginBottom: '4rem',
        }}
      >
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Affiliate Compliance & Transparency
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Phedox participates in affiliate advertising programs designed to provide a means for sites to earn advertising fees by advertising and linking to participating retailers including Amazon.in, Flipkart.com, Myntra.com, and Meesho.com. All product prices, stock availability, and merchant terms are governed by the respective store.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
