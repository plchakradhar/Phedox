import React, { useEffect, useState } from "react";
import "./CategoryNav.css";
import { useNavigate, useLocation } from "react-router-dom";
import { categoryApi } from "../../api/categories";
import CategoryStrokeIcon from "./CategoryStrokeIcon";

export const FIXED_CATEGORIES = [
  { id: "for-you",     label: "For You",           iconKey: "for-you" },
  { id: "all-deals",   label: "All Deals",          iconKey: "deals" },
  { id: "electronics", label: "Electronics",        iconKey: "electronics" },
  { id: "fashion",     label: "Fashion",            iconKey: "fashion" },
  { id: "mobiles",     label: "Mobiles",            iconKey: "mobiles" },
  { id: "home",        label: "Home",               iconKey: "home" },
  { id: "beauty",      label: "Beauty",             iconKey: "beauty" },
  { id: "appliances",  label: "Appliances",         iconKey: "appliances" },
  { id: "toys",        label: "Toys, Baby & Kids",  iconKey: "toys" },
  { id: "food",        label: "Food & Health",      iconKey: "food" },
  { id: "auto",        label: "Auto Acc.",           iconKey: "auto" },
  { id: "sports",      label: "Sports & Fitness",   iconKey: "sports" },
  { id: "furniture",   label: "Furniture",          iconKey: "furniture" },
  { id: "books",       label: "Books & Stationery", iconKey: "books" },
  
];

export const CategoryNav = () => {
  const [backendCats, setBackendCats] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    categoryApi.getCategories()
      .then(data => { if (Array.isArray(data)) setBackendCats(data.filter(c => c.active !== false)); })
      .catch(() => {});
  }, []);

  const matchBackend = (label) => {
    if (!backendCats.length) return null;
    const words = label.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
    return backendCats.find(bc => {
      const bcName = (bc.name || "").toLowerCase();
      return words.some(w => w.length > 2 && bcName.includes(w));
    });
  };

  const handleClick = (cat) => {
    if (cat.id === "for-you") {
      navigate("/");
      return;
    }
    if (cat.id === "all-deals") {
      navigate("/deals?sort=newest");
      return;
    }
    const matched = matchBackend(cat.label);
    if (matched) {
      navigate(`/categories/${matched.id}`);
      return;
    }
    navigate(`/categories/${cat.id}`);
  };

  const isActive = (cat) => {
    if (cat.id === "for-you") return location.pathname === "/";
    if (cat.id === "all-deals") return location.pathname === "/deals";
    const path = location.pathname.toLowerCase();
    if (path === `/categories/${cat.id}`) return true;
    const matched = matchBackend(cat.label);
    if (matched && path === `/categories/${matched.id}`) return true;
    return false;
  };

  return (
    <nav className="cat-nav-bar" aria-label="Shop by category">
      <div className="cat-nav-inner">
        {FIXED_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`cat-nav-item${isActive(cat) ? " cat-nav-active" : ""}`}
            onClick={() => handleClick(cat)}
            title={cat.label}
          >
            <span className="cat-nav-icon-wrap">
              <CategoryStrokeIcon
                name={cat.iconKey || cat.id}
                size={22}
                strokeWidth={1.85}
                className="cat-nav-stroke-icon"
              />
            </span>
            <span className="cat-nav-label">{cat.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default CategoryNav;