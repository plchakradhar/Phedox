import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import phedoxLogo from "../../assets/phedox-logo-trans.png";

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync search input with URL when on search page
  useEffect(() => {
    if (location.pathname === "/search") {
      const q = new URLSearchParams(location.search).get("q") || "";
      setSearchQuery(q);
    }
  }, [location]);

  // Close mobile menu on route change
  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" aria-label="Phedox Home">
          <img src={phedoxLogo} alt="Phedox - Hunt Less. Save More." className="brand-logo-img" />
          {/* <span className="brand-badge">50%+ OFF</span> */}
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="header-search">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search deals, products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="header-actions">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer">
          <Link to="/" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/deals" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>All Deals</Link>
          <Link to="/categories" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Categories</Link>
          <Link to="/about" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          <Link to="/contact" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;