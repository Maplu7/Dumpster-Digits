import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function buyShopItem(studentId, item) {
  const studentRef = doc(db, "students", String(studentId));
  const snap = await getDoc(studentRef);

  if (!snap.exists()) {
    throw new Error("Student not found.");
  }

  const data = snap.data();
  const currentCoins = Number(data.coins || 0);
  const ownedItems = Array.isArray(data.ownedItems) ? data.ownedItems : [];

  if (ownedItems.includes(item.id)) {
    await equipShopItem(studentId, item.id, item.image, item.category);
    return;
  }

  if (currentCoins < item.price) {
    throw new Error("Not enough coins.");
  }

  await updateDoc(studentRef, {
    coins: currentCoins - item.price,
    ownedItems: [...ownedItems, item.id],
    equippedItemId: item.id,
    equippedItemImage: item.image,
    equippedItemCategory: item.category || "pfp",
  });
}

export async function equipShopItem(
  studentId,
  itemId,
  itemImage,
  itemCategory = "pfp"
) {
  const studentRef = doc(db, "students", String(studentId));

  await updateDoc(studentRef, {
    equippedItemId: itemId,
    equippedItemImage: itemImage,
    equippedItemCategory: itemCategory,
  });
}