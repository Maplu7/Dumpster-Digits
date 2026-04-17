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
  "/raccacoonies/angy.jpeg",
  "/raccacoonies/crying.jpeg",
  "/raccacoonies/E6F5A42F-2434-43C6-9A81-E276C38D97BC_1_105_c.jpeg",
  "/raccacoonies/bleh.jpeg",
  "/raccacoonies/thinking.jpeg",
  "/raccacoonies/confused.jpeg",
  "/raccacoonies/bleh_2.jpeg",
  "/raccacoonies/what.jpeg",
  "/raccacoonies/playing_dead.jpeg",
  "/raccacoonies/furious.jpeg",
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

const pfpItems = IMAGES.map((image, index) => ({
  id: index + 1,
  name: NAMES[index],
  price: PRICES[index],
  image,
  category: "pfp",
}));

const Shop = ({ student, onBack }) => {
  const [coins, setCoins] = useState(0);
  const [ownedItems, setOwnedItems] = useState([]);
  const [equippedItemId, setEquippedItemId] = useState(null);
  const [busyItemId, setBusyItemId] = useState(null);
  const [activeTab, setActiveTab] = useState("customize");

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
    pfpItems.find((item) => item.id === equippedItemId) || pfpItems[0];

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
          <div className="shop-tabs">
            <button
              className={`shop-tab ${activeTab === "customize" ? "active" : ""}`}
              onClick={() => setActiveTab("customize")}
            >
              Customize
            </button>

            <button
              className={`shop-tab ${activeTab === "pfps" ? "active" : ""}`}
              onClick={() => setActiveTab("pfps")}
            >
              PFPs
            </button>
          </div>

          {activeTab === "customize" ? (
            <div className="shop-customize-panel">
              <div className="shop-customize-card">
                <h2>Customize Your Raccacoonie</h2>
                <p>
                  This tab is for the customizable raccoon.
                </p>
                <p>
                  Right now it shows your base character, and later you can add
                  hats, accessories, outfits, and more here.
                </p>
              </div>
            </div>
          ) : (
            <div className="shop-grid">
              {pfpItems.map((item) => {
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
          )}
        </div>

        <div className="shop-right">
          <div className="mirror-frame">
            <div className="mirror-glow" />

            <div className="stand-area">
              <div className="stand-base" />

              <div className="preview-character preview-character--shop-image">
                {activeTab === "customize" ? (
                  <img
                    src="/shop_raccacoonie.jpg"
                    alt="Customizable Raccacoonie preview"
                  />
                ) : (
                  <img
                    src={equippedItem.image}
                    alt="Raccacoonie preview"
                  />
                )}
              </div>

              <div className="equipped-label">
                {activeTab === "customize"
                  ? "Customize Mode"
                  : `Wearing: ${equippedItem.name}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;