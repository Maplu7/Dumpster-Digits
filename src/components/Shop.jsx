import React, { useEffect, useMemo, useState } from "react";
import { arrayRemove, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { buyShopItem, equipShopItem } from "../shopService";
import LayeredSkyScene from "../components/LayeredSkyScene";
import useAmbience from "../hooks/useAmbience";
import "./Shop.css";

const PRICES = [200, 175, 70, 175, 200, 100, 130, 150, 70, 120, 160, 110];

const IMAGES = [
  "/raccacoonies/happy.png",
  "/raccacoonies/angy.png",
  "/raccacoonies/crying.jpeg",
  "/raccacoonies/woah.png",
  "/raccacoonies/bleh.jpeg",
  "/raccacoonies/thinking.jpeg",
  "/raccacoonies/confused.jpeg",
  "/raccacoonies/bleh_2.jpeg",
  "/raccacoonies/what.jpeg",
  "/raccacoonies/playing_dead.png",
  "/raccacoonies/furious.png",
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
    price: 1500,
    image: "/raccacoonies/knight.png",
    category: "outfit",
  },
  {
    id: "fairy",
    name: "Fairy",
    price: 1500,
    image: "/raccacoonies/fairy.png",
    category: "outfit",
  },
  {
    id: "princess",
    name: "Princess",
    price: 1500,
    image: "/raccacoonies/princess.png",
    category: "outfit",
  },
  {
    id: "sleepy",
    name: "Sleepy",
    price: 1500,
    image: "/raccacoonies/eppy.png",
    category: "outfit",
  },
  {
    id: "wizard",
    name: "Wizard",
    price: 1500,
    image: "/raccacoonies/wizard.png",
    category: "outfit",
  },
  {
    id: "sable",
    name: "Sable",
    price: 1500,
    image: "/raccacoonies/sable.png",
    category: "outfit",
  },
  {
    id: "dragon",
    name: "Dragon",
    price: 1500,
    image: "/raccacoonies/dragon.png",
    category: "outfit",
  },
];

const FALLBACK_IMAGE = "/raccacoonies/what.jpeg";

export default function Shop({ student, onBack }) {
  const [coins, setCoins] = useState(0);
  const [ownedItems, setOwnedItems] = useState([]);
  const [newUnlockedItems, setNewUnlockedItems] = useState([]);

  const [equippedPfp, setEquippedPfp] = useState("");
  const [equippedOutfit, setEquippedOutfit] = useState("");

  const [busyItemId, setBusyItemId] = useState(null);
  const [activeTab, setActiveTab] = useState("outfits");
  const [previewItem, setPreviewItem] = useState(null);

  useAmbience("/sounds/camp-ambience.mp3", 0.15);

  const defaultPfp =
    pfpItems.find((item) => item.name === "What Raccacoonie") || pfpItems[0];

  const defaultOutfit = outfitItems[0];

  const activeItems = activeTab === "outfits" ? outfitItems : pfpItems;

  const equippedOutfitItem =
    outfitItems.find((item) => item.id === equippedOutfit) || defaultOutfit;

  const equippedPfpItem =
    pfpItems.find((item) => item.id === equippedPfp) || defaultPfp;

  const previewDisplayItem = useMemo(() => {
    if (previewItem) return previewItem;
    return activeTab === "outfits" ? equippedOutfitItem : equippedPfpItem;
  }, [previewItem, activeTab, equippedOutfitItem, equippedPfpItem]);

  useEffect(() => {
    if (!student?.id) return;

    const studentRef = doc(db, "students", String(student.id));

    const unsubscribe = onSnapshot(studentRef, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();

      setCoins(Number(data.coins ?? 0));
      setOwnedItems(Array.isArray(data.ownedItems) ? data.ownedItems : []);
      setNewUnlockedItems(
        Array.isArray(data.newUnlockedItems) ? data.newUnlockedItems : []
      );

      setEquippedPfp(data.equippedPfp || "");
      setEquippedOutfit(data.equippedOutfit || "");
    });

    return () => unsubscribe();
  }, [student?.id]);

  function isOwned(item) {
    return item.price === 0 || ownedItems.includes(item.id);
  }

  function isEquipped(item) {
    if (item.category === "outfit") return equippedOutfit === item.id;
    return equippedPfp === item.id;
  }

  function getButtonLabel(item) {
    if (busyItemId === item.id) return "Saving...";
    if (isEquipped(item)) return "Wearing";
    if (isOwned(item)) return "Wear";
    if (coins < item.price) return "Not enough";
    return "Buy + Wear";
  }

  async function clearNewGlow(itemId) {
    if (!student?.id) return;
    if (!newUnlockedItems.includes(itemId)) return;

    await updateDoc(doc(db, "students", String(student.id)), {
      newUnlockedItems: arrayRemove(itemId),
    });
  }

  async function handleItemClick(item) {
    if (!student?.id) return;

    try {
      setBusyItemId(item.id);

      if (!isOwned(item)) {
        await buyShopItem(student.id, item);
        return;
      }

      await equipShopItem(student.id, item);
      await clearNewGlow(item.id);
    } catch (error) {
      alert(error.message || "Something went wrong.");
    } finally {
      setBusyItemId(null);
    }
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
              onClick={() => {
                setActiveTab("outfits");
                setPreviewItem(null);
              }}
              type="button"
            >
              Outfits
            </button>

            <button
              className={`shop-tab ${activeTab === "emotes" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("emotes");
                setPreviewItem(null);
              }}
              type="button"
            >
              Emotes
            </button>
          </div>

          <div
            className={`shop-grid ${
              activeTab === "outfits" ? "shop-grid--outfits" : ""
            }`}
          >
            {activeItems.map((item) => {
              const owned = isOwned(item);
              const equipped = isEquipped(item);
              const isNew = newUnlockedItems.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`shop-card ${
                    item.category === "outfit" ? "shop-card--outfit" : ""
                  } ${isNew ? "shop-card--new" : ""} ${
                    equipped ? "shop-card--equipped" : ""
                  }`}
                  onMouseEnter={() => setPreviewItem(item)}
                  onMouseLeave={() => setPreviewItem(null)}
                  onFocus={() => setPreviewItem(item)}
                  onBlur={() => setPreviewItem(null)}
                >
                  <div
                    className={`shop-item-art shop-item-art--image ${
                      item.category === "outfit"
                        ? "shop-item-art--outfit"
                        : ""
                    }`}
                  >
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
                      (!owned && coins < item.price) ||
                      equipped
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
                <img
                  src={previewDisplayItem?.image || FALLBACK_IMAGE}
                  alt="Preview"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              <div className="equipped-label">
                {previewItem
                  ? `Preview: ${previewItem.name}`
                  : activeTab === "outfits"
                  ? `Outfit: ${equippedOutfitItem.name}`
                  : `Wearing: ${equippedPfpItem.name}`}
              </div>

              {previewItem && !isEquipped(previewItem) && (
                <div className="equipped-label equipped-label--hint">
                  Click {isOwned(previewItem) ? "Wear" : "Buy + Wear"} to save it.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}