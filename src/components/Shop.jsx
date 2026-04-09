import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { buyShopItem, equipShopItem } from "../shopService";
import LayeredSkyScene from "../components/LayeredSkyScene";
import "./Shop.css";
import useAmbience from "../hooks/useAmbience";

const PRICES = [200, 175, 70, 175, 200, 100, 130, 150, 70, 120, 160];
const IMAGES = [
  "/raccacoonies/E9D4CA22-965B-43B3-9E3A-AA2EC31DFEE2_1_105_c.jpeg",
  "/raccacoonies/7E32B860-A05B-49B7-AB3B-208B26385CA8_1_105_c.jpeg",
  "/raccacoonies/23676FF1-6D12-4B24-A576-990E2E736642_1_102_o.jpeg",
  "/raccacoonies/E6F5A42F-2434-43C6-9A81-E276C38D97BC_1_105_c.jpeg",
  "/raccacoonies/WhatsApp_Image_2026-03-26_at_10.50.00.jpeg",
  "/raccacoonies/1AFCAC26-4B70-4834-97D9-94C2C973CE13_1_105_c.jpeg",
  "/raccacoonies/E221DD6D-0233-4593-BD69-5AD781ED443C_1_105_c.jpeg",
  "/raccacoonies/WhatsApp_Image_2026-03-26_at_10.49.59.jpeg",
  "/raccacoonies/61B48BF2-CD54-4014-8323-24A334CDA1B1_1_105_c.jpeg",
  "/raccacoonies/D645C719-A1F7-4A08-A446-789F0E13EE88_1_105_c.jpeg",
  "/raccacoonies/508D1861-E43D-4454-8284-A36067C53306_1_102_o.jpeg",
];

const NAMES = [
  "Happy Raccacoonie",
  "Angy Raccacoonie",
  "Crying Raccacoonie",
  "Woah Raccacoonie",
  "Bleh Raccacoonie",
  "Curious Raccacoonie",
  "Confused Raccacoonie",
  "Bleh Raccacoonie 2",
  "What Raccacoonie",
  "Playing Dead Raccacoonie",
  "Furious Raccacoonie",
];

const shopItems = IMAGES.map((image, index) => ({
  id: index + 1,
  name: NAMES[index],
  price: PRICES[index],
  image,
}));

const Shop = ({ student, onBack }) => {
  const [coins, setCoins] = useState(0);
  const [ownedItems, setOwnedItems] = useState([]);
  const [equippedItemId, setEquippedItemId] = useState(null);
  const [busyItemId, setBusyItemId] = useState(null);

  useAmbience("/sounds/camp-ambience.mp3", 0.15);

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
        await equipShopItem(student.id, item.id, item.image);
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
      <LayeredSkyScene variant="shop" />

      <div className="shop-header">
        <div>
          <h1>Shop</h1>
          <p>
            <img
              src="/ui-assets/raccacoin.png"
              alt="coin"
              className="shop-coin"
              style={{ width: 22, verticalAlign: "middle", marginRight: 8 }}
            />
            Coins: {coins}
          </p>
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

                  <p>
                    <img
                      src="/ui-assets/raccacoin.png"
                      alt="coin"
                      className="shop-coin"
                      style={{
                        width: 18,
                        verticalAlign: "middle",
                        marginRight: 6,
                      }}
                    />
                    {item.price}
                  </p>

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
                <img src={equippedItem.image} alt="Raccacoonie preview" />
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