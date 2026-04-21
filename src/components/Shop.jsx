import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { buyShopItem, equipShopItem } from "../shopService";
import LayeredSkyScene from "../components/LayeredSkyScene";
import "./Shop.css";
import useAmbience from "../hooks/useAmbience";

const PRICES = [200, 175, 70, 175, 200, 100, 130, 150, 70, 120, 160, 110];
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
  "/raccacoonies/blush.jpeg",
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
  "Blush Raccacoonie",
];

const pfpItems = IMAGES.map((image, index) => ({
  id: index + 1,
  name: NAMES[index],
  price: PRICES[index],
  image,
  category: "pfp",
}));

const outfitItems = [
  {
    id: "outfit-chef",
    name: "Chef Racco",
    price: 1500,
    image: "/raccacoonies/CHEF_RACCO.png",
    category: "outfit",
  },
  {
    id: "outfit-argg",
    name: "Pirate",
    price: 1500,
    image: "/raccacoonies/ARGG.png",
    category: "outfit",
  },

  {
    id: "knight",
    name: "Knight",
    image: "/raccacoonies/knight.png",
    price: 1500,
    category: "outfit",
  },

  {
    id: "fairy",
    name: "Fairy",
    image: "/raccacoonies/fairy.png",
    price: 1500,
    category: "outfit",
  },
  {
    id: "sleepy",
    name: "Sleepy Raccacoonie",
    image: "/raccacoonies/eepy.png",
    price: 1500,
    category: "outfit",
  },

];

const FALLBACK_IMAGE = "/raccacoonies/what.jpeg";

const Shop = ({ student, onBack }) => {
  const [coins, setCoins] = useState(0);
  const [ownedItems, setOwnedItems] = useState([]);
  const [equippedItemId, setEquippedItemId] = useState(null);
  const [equippedItemCategory, setEquippedItemCategory] = useState("pfp");
  const [equippedItemImage, setEquippedItemImage] = useState(FALLBACK_IMAGE);
  const [busyItemId, setBusyItemId] = useState(null);
  const [activeTab, setActiveTab] = useState("outfits");

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
      setEquippedItemCategory(data.equippedItemCategory || "pfp");
      setEquippedItemImage(data.equippedItemImage || FALLBACK_IMAGE);
    });

    return () => unsubscribe();
  }, [student]);

  const defaultPfp = pfpItems.find((item) => item.name === "What Raccacoonie") || pfpItems[0];
  const defaultOutfit = outfitItems[0];

  const equippedItem =
    equippedItemCategory === "customize"
      ? outfitItems.find((item) => item.id === equippedItemId) || defaultOutfit
      : pfpItems.find((item) => item.id === equippedItemId) || defaultPfp;

  async function handleItemClick(item) {
    if (!student?.id) return;

    try {
      setBusyItemId(item.id);

      if (item.price === 0 || ownedItems.includes(item.id)) {
        await equipShopItem(student.id, item.id, item.image, item.category);
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
    const isOwned = ownedItems.includes(item.id) || item.price === 0;
    const isEquipped =
      equippedItemId === item.id && equippedItemCategory === item.category;

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

        <button className="shop-back-btn" onClick={onBack} type="button">
          Back
        </button>
      </div>

      <div className="shop-layout">
        <div className="shop-left">
          <div className="shop-tabs">
            <button
              className={`shop-tab ${activeTab === "outfits" ? "active" : ""}`}
              onClick={() => setActiveTab("outfits")}
              type="button"
            >
              Outfits
            </button>

            <button
              className={`shop-tab ${activeTab === "pfps" ? "active" : ""}`}
              onClick={() => setActiveTab("pfps")}
              type="button"
            >
              Pfps
            </button>
          </div>

          {activeTab === "outfits" ? (
            <div className="shop-grid shop-grid--outfits">
              {outfitItems.map((item) => {
                const isOwned = ownedItems.includes(item.id) || item.price === 0;
                const isEquipped =
                  equippedItemId === item.id &&
                  equippedItemCategory === item.category;

                return (
                  <div key={item.id} className="shop-card shop-card--outfit">
                    <div className="shop-item-art shop-item-art--image shop-item-art--outfit">
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>

                    <h3>{item.name}</h3>

                    <p>
                      {item.price === 0 ? (
                        "Free"
                      ) : (
                        <>
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
                        </>
                      )}
                    </p>

                    <button
                      disabled={
                        busyItemId === item.id ||
                        (!isOwned && coins < item.price) ||
                        isEquipped
                      }
                      onClick={() => handleItemClick(item)}
                      type="button"
                    >
                      {getButtonLabel(item)}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="shop-grid">
              {pfpItems.map((item) => {
                const isOwned = ownedItems.includes(item.id);
                const isEquipped =
                  equippedItemId === item.id &&
                  equippedItemCategory === item.category;

                return (
                  <div key={item.id} className="shop-card">
                    <div className="shop-item-art shop-item-art--image">
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
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
                      type="button"
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

              <div
                className={`preview-character ${
                  activeTab === "outfits"
                    ? "preview-character--customize"
                    : "preview-character--pfp"
                }`}
              >
                {activeTab === "outfits" ? (
                  <img
                    src={
                      equippedItemCategory === "customize"
                        ? equippedItemImage || defaultOutfit.image
                        : defaultOutfit.image
                    }
                    alt="Outfit preview"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                ) : (
                  <img
                    src={equippedItemImage || FALLBACK_IMAGE}
                    alt="Raccacoonie preview"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                )}
              </div>

              <div className="equipped-label">
                {activeTab === "outfits"
                  ? `Outfit: ${
                      equippedItemCategory === "customize"
                        ? equippedItem.name
                        : defaultOutfit.name
                    }`
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