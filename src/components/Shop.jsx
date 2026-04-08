import React, { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { buyShopItem, equipShopItem } from "../shopService";
import "./Shop.css";

const shopItems = [
  {
    id: 1,
    name: "Happy Raccacoonie",
    price: 20,
    image: "/raccacoonies/E9D4CA22-965B-43B3-9E3A-AA2EC31DFEE2_1_105_c.jpeg",
  },
  {
    id: 2,
    name: "Angy Raccacoonie",
    price: 25,
    image: "/raccacoonies/7E32B860-A05B-49B7-AB3B-208B26385CA8_1_105_c.jpeg",
  },
  {
    id: 3,
    name: "Crying Raccacoonie",
    price: 15,
    image: "/raccacoonies/23676FF1-6D12-4B24-A576-990E2E736642_1_102_o.jpeg",
  },
  {
    id: 4,
    name: "Woah Raccacoonie",
    price: 30,
    image: "/raccacoonies/E6F5A42F-2434-43C6-9A81-E276C38D97BC_1_105_c.jpeg",
  },
  {
    id: 5,
    name: "Bleh Raccacoonie",
    price: 18,
    image: "/raccacoonies/WhatsApp_Image_2026-03-26_at_10.50.00.jpeg",
  },
  {
    id: 6,
    name: "Curious Raccacoonie",
    price: 24,
    image: "/raccacoonies/1AFCAC26-4B70-4834-97D9-94C2C973CE13_1_105_c.jpeg",
  },
  {
    id: 7,
    name: "Confused Raccacoonie",
    price: 28,
    image: "/raccacoonies/E221DD6D-0233-4593-BD69-5AD781ED443C_1_105_c.jpeg",
  },
  {
    id: 8,
    name: "Bleh Raccacoonie 2",
    price: 18,
    image: "/raccacoonies/WhatsApp_Image_2026-03-26_at_10.49.59.jpeg",
  },
  {
    id: 9,
    name: "What Raccacoonie",
    price: 22,
    image: "/raccacoonies/61B48BF2-CD54-4014-8323-24A334CDA1B1_1_105_c.jpeg",
  },
  {
    id: 10,
    name: "Playing Dead Raccacoonie",
    price: 26,
    image: "/raccacoonies/D645C719-A1F7-4A08-A446-789F0E13EE88_1_105_c.jpeg",
  },
  {
    id: 11,
    name: "Furious Raccacoonie",
    price: 16,
    image: "/raccacoonies/508D1861-E43D-4454-8284-A36067C53306_1_102_o.jpeg",
  },
];

const Shop = ({ student, onBack }) => {
  const [coins, setCoins] = useState(0);
  const [ownedItems, setOwnedItems] = useState([]);
  const [equippedItemId, setEquippedItemId] = useState(null);
  const [busyItemId, setBusyItemId] = useState(null);

  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 55}%`,
      size: `${Math.random() * 3.5 + 1.5}px`,
      delay: `${Math.random() * 7}s`,
      duration: `${Math.random() * 5 + 3.5}s`,
    }));
  }, []);

  useEffect(() => {
    if (!student?.id) return;

    const studentRef = doc(db, "students", String(student.id));

    const unsubscribe = onSnapshot(studentRef, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      setCoins(Number(data.coins || 0));
      setOwnedItems(Array.isArray(data.ownedItems) ? data.ownedItems : []);
      setEquippedItemId(data.equippedItemId ?? null);
    });

    return () => unsubscribe();
  }, [student]);

  const equippedItem =
    shopItems.find((item) => item.id === equippedItemId) || shopItems[0];

  async function handleItemClick(item) {
    if (!student?.id) return;

    try {
      setBusyItemId(item.id);

      if (ownedItems.includes(item.id)) {
        await equipShopItem(student.id, item.id);
      } else {
        await buyShopItem(student.id, item);
      }
    } catch (error) {
      alert(error.message || "Something went wrong.");
    } finally {
      setBusyItemId(null);
    }
  }

  function getButtonLabel(item) {
    const isOwned = ownedItems.includes(item.id);
    const isEquipped = equippedItemId === item.id;

    if (busyItemId === item.id) return "Saving...";
    if (isEquipped) return "Wearing";
    if (isOwned) return "Wear";
    if (coins < item.price) return "Not enough";
    return "Buy";
  }

  return (
    <div className="shop-page">
      <div className="shop-stars">
        {stars.map((star) => (
          <span
            key={star.id}
            className="shop-star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <div className="shop-page-glow" />

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
            {shopItems.map((item) => {
              const isOwned = ownedItems.includes(item.id);
              const isEquipped = equippedItemId === item.id;

              return (
                <div key={item.id} className="shop-card">
                  <div className="shop-item-art shop-item-art--image">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <h3>{item.name}</h3>
                  <p>{item.price} coins</p>

                  <button
                    disabled={
                      busyItemId === item.id ||
                      (!isOwned && coins < item.price) ||
                      isEquipped
                    }
                    onClick={() => handleItemClick(item)}
                  >
                    {getButtonLabel(item)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="shop-right">
          <div className="mirror-frame">
            <div className="mirror-glow" />

            <div className="stand-area">
              <div className="stand-base" />

              <div className="preview-character preview-character--shop-image">
                <img
                  src={equippedItem.image}
                  alt="Raccacoonie preview"
                />
              </div>

              <div className="equipped-label">
                Wearing: {equippedItem.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;