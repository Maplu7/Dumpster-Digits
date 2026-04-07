import React, { useState } from "react";
import "./Shop.css";
import raccacoonie from "./images/raccacoonie.jpeg";

const items = [
  { id: 1, name: "Pirate Hat", price: 20, category: "Hat" },
  { id: 2, name: "Chef Hat", price: 50, category: "Hat" },
  { id: 3, name: "Cowboy Hat", price: 30, category: "Hat" },
  { id: 4, name: "Crown", price: 40, category: "Hat" },
  { id: 5, name: "Bow", price: 25, category: "Accessory" },
  { id: 6, name: "Scarf", price: 35, category: "Accessory" },
  { id: 7, name: "Cape", price: 45, category: "Outfit" },
  { id: 8, name: "Apron", price: 30, category: "Outfit" },
];

const Shop = ({ coins = 100, onBack }) => {
  const [equippedItem, setEquippedItem] = useState(null);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div>
          <h1>Shop</h1>
          <p>Coins: {coins}</p>
        </div>
        <button className="shop-back-btn" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="shop-layout">
        <div className="shop-left">
          <div className="shop-grid">
            {items.map((item) => (
              <div key={item.id} className="shop-card">
                <div className="shop-item-art">{item.category}</div>
                <h3>{item.name}</h3>
                <p>{item.price} coins</p>
                <button
                  disabled={coins < item.price}
                  onClick={() => setEquippedItem(item)}
                >
                  {coins < item.price ? "Not enough" : "Try On"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="shop-right">
          <div className="mirror-frame">
            <div className="mirror-glow" />

            <div className="stand-area">
              <div className="stand-base" />
              <div className="preview-character">
                <img src={raccacoonie} alt="Raccacoonie preview" />
              </div>

              {equippedItem && (
                <div className="equipped-label">
                  Wearing: {equippedItem.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;