import React, { useState } from "react";
import "./SubCategoryGrid.css";
import { useNavigate } from "react-router-dom";
import CategoryStrokeIcon from "./CategoryStrokeIcon";

const SubCategoryTile = ({ cat, isSelected, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const iconLookupKey = cat.icon || cat.name || cat.id;

  return (
    <button
      type="button"
      className={`subcat-tile${isSelected ? " subcat-tile-active" : ""}`}
      onClick={() => onClick(cat)}
      title={`View ${cat.name}`}
    >
      <div className={`subcat-tile-img${isSelected ? " subcat-img-active" : ""}`}>
        {cat.imageUrl && !imgError ? (
          <img
            src={cat.imageUrl}
            alt={cat.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <CategoryStrokeIcon
            name={iconLookupKey}
            size={28}
            strokeWidth={1.85}
            className="subcat-stroke-icon"
          />
        )}
      </div>
      <span className={`subcat-tile-label${isSelected ? " subcat-label-active" : ""}`}>
        {cat.name}
      </span>
    </button>
  );
};

export const SubCategoryGrid = ({ categories = [], activeSub = null, onSelect, title, theme = "warm" }) => {
  const navigate = useNavigate();

  if (!categories || !categories.length) return null;

  const handleClick = (cat) => {
    if (onSelect) {
      onSelect(cat);
      return;
    }
    if (cat.link) {
      navigate(cat.link);
      return;
    }
    if (cat.name) {
      navigate(`?sub=${encodeURIComponent(cat.name)}`);
      return;
    }
    if (cat.id) navigate(`/categories/${cat.id}`);
  };

  return (
    <div className={`subcat-section theme-${theme}`}>
      {title && <h2 className="subcat-section-title">{title}</h2>}
      <div className="subcat-grid">
        {categories.map((cat, idx) => {
          const isSelected = activeSub && activeSub.toLowerCase() === (cat.name || "").toLowerCase();
          return (
            <SubCategoryTile
              key={cat.id || idx}
              cat={cat}
              isSelected={isSelected}
              onClick={handleClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SubCategoryGrid;