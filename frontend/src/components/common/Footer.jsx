import React from 'react';
import "./Footer.css";
import { Link } from 'react-router-dom';
import {
  Mail,
  ShieldCheck,
  Heart,
  Send,
  Sparkles,
  Zap,
  TrendingDown,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import phedoxLogoWhite from '../../assets/phedox-logo-white.png';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        
        {/* ── 1. Top Value & Trust Highlights Strip ── */}
        <div className="footer-trust-strip">
          <div className="footer-trust-item">
            <div className="footer-trust-icon">
              <Zap size={18} color="#D90000" />
            </div>
            <div className="footer-trust-text">
              <div className="footer-trust-title">50% to 90% Discounts</div>
              <div className="footer-trust-desc">Only verified high-discount loot offers</div>
            </div>
          </div>

          <div className="footer-trust-item">
            <div className="footer-trust-icon">
              <ShieldCheck size={18} color="#8DB355" />
            </div>
            <div className="footer-trust-text">
              <div className="footer-trust-title">100% Verified Links</div>
              <div className="footer-trust-desc">Direct official merchant checkout</div>
            </div>
          </div>

          <div className="footer-trust-item">
            <div className="footer-trust-icon">
              <TrendingDown size={18} color="#FFEA93" />
            </div>
            <div className="footer-trust-text">
              <div className="footer-trust-title">Live Price Audits</div>
              <div className="footer-trust-desc">Hourly scraping removes dead deals</div>
            </div>
          </div>

          <div className="footer-trust-item">
            <div className="footer-trust-icon">
              <Sparkles size={18} color="#D90000" />
            </div>
            <div className="footer-trust-text">
              <div className="footer-trust-title">Top Marketplaces</div>
              <div className="footer-trust-desc">Amazon, Flipkart, Myntra & Meesho</div>
            </div>
          </div>
        </div>

        {/* ── 2. Main Footer Multi-Column Grid ── */}
        <div className="footer-main-grid">
          
          {/* Column 1: Brand Info & Identity */}
          <div className="footer-col footer-col-brand">
            <Link to="/" className="footer-brand-link" aria-label="Phedox Home">
              <img src={phedoxLogoWhite} alt="Phedox - Hunt Less. Save More." className="footer-logo-img" />
            </Link>
            <p className="footer-brand-desc">
              India's premier automated deal-discovery engine. We continuously track, verify, and curate exclusive 50%+ discount offers across major online retailers so you can shop smarter.
            </p>
            <div className="footer-verified-badge">
              <CheckCircle2 size={15} color="#8DB355" />
              <span>Real-Time Automated Price Verification</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/deals" className="footer-link">Explore 50%+ Deals</Link></li>
              <li><Link to="/deals?minDiscount=80" className="footer-link">80%+ Mega Loot Deals</Link></li>
              <li><Link to="/categories" className="footer-link">Browse Categories</Link></li>
              <li><Link to="/about" className="footer-link">How Phedox Works</Link></li>
            </ul>
          </div>

          {/* Column 3: Top Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">Top Categories</h4>
            <ul className="footer-links-list">
              <li><Link to="/categories/electronics" className="footer-link">Electronics & Gadgets</Link></li>
              <li><Link to="/categories/fashion" className="footer-link">Fashion & Apparel</Link></li>
              <li><Link to="/categories/mobiles" className="footer-link">Mobiles & Accessories</Link></li>
              <li><Link to="/categories/home" className="footer-link">Home & Kitchen</Link></li>
              <li><Link to="/categories/beauty" className="footer-link">Beauty & Grooming</Link></li>
            </ul>
          </div>

          {/* Column 4: Support & Connect */}
          <div className="footer-col">
            <h4 className="footer-col-title">Support & Connect</h4>
            <p className="footer-support-desc">
              Have questions or feedback? Connect with our team or join our Telegram channel for instant deal alerts.
            </p>
            
            <div className="footer-contact-items">
              <a href="mailto:support@phedox.local" className="footer-contact-item">
                <div className="footer-contact-icon">
                  <Mail size={15} />
                </div>
                <span>support@phedox.local</span>
              </a>

              <a
                href="#telegram"
                className="footer-contact-item"
              >
                <div className="footer-contact-icon telegram-icon">
                  <Send size={14} />
                </div>
                <span>Telegram: @PhedoxDeals</span>
              </a>
            </div>
          </div>

        </div>

        {/* ── 3. Compliance & Affiliate Disclosure ── */}
        <div className="footer-disclosure-box">
          <span className="footer-disclosure-label">Affiliate Transparency:</span> Phedox is an independent deal discovery and price aggregation platform. When you click on links to merchants on this website and make a purchase, this may result in Phedox earning an affiliate commission at zero additional cost to you. All product prices, stock availability, discounts, and merchant policies are governed directly by the respective retailers (Amazon.in, Flipkart.com, Myntra.com, Meesho.com).
        </div>

        {/* ── 4. Bottom Copyright Bar ── */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            &copy; {currentYear} <strong>Phedox Platform</strong>. All rights reserved.
          </div>

          <div className="footer-legal-links">
            <Link to="/about" className="footer-legal-link">About Us</Link>
            <span className="footer-legal-dot">•</span>
            <Link to="/contact" className="footer-legal-link">Contact Us</Link>
            <span className="footer-legal-dot">•</span>
            <Link to="/deals" className="footer-legal-link">All Deals</Link>
          </div>

          <div className="footer-made-with">
            <span>Built for genuine deal hunters</span>
            <Heart size={14} color="#D90000" fill="#D90000" />
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
