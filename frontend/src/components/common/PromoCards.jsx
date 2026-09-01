import React from "react";
import "./PromoCards.css";
import { Link } from "react-router-dom";

export const PromoCards = ({ cards = [] }) => {
  if (!cards.length) return null;
  return (
    <div className="promo-cards-row">
      {cards.map((card, i) => (
        <Link
          key={i}
          to={card.link || "/deals"}
          className="promo-card"
          style={{ "--promo-bg": card.bg || "#f0f4ff" }}
        >
          <div className="promo-card-inner" style={{ background: card.bg || "#f0f4ff" }}>
            {card.image && (
              <div className="promo-card-img">
                <img src={card.image} alt={card.title} />
              </div>
            )}
            <div className="promo-card-text">
              {card.tag && <span className="promo-card-tag">{card.tag}</span>}
              <h3 className="promo-card-title">{card.title}</h3>
              {card.subtitle && <p className="promo-card-subtitle">{card.subtitle}</p>}
              {card.cta && <span className="promo-card-cta">{card.cta} ?</span>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PromoCards;
