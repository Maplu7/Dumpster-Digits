import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export async function buyShopItem(studentId, item) {
  const studentRef = doc(db, "students", String(studentId));
  const snap = await getDoc(studentRef);

  if (!snap.exists()) {
    throw new Error("Student not found.");
  }

  const data = snap.data();
  const currentCoins = Number(data.coins ?? 0);
  const ownedItems = Array.isArray(data.ownedItems) ? data.ownedItems : [];

  if (ownedItems.includes(item.id) || item.price === 0) {
    await equipShopItem(studentId, item);
    return;
  }

  if (currentCoins < item.price) {
    throw new Error("Not enough coins.");
  }

  const equipField = item.category === "outfit" ? "equippedOutfit" : "equippedPfp";

  await updateDoc(studentRef, {
    coins: currentCoins - Number(item.price || 0),
    ownedItems: arrayUnion(item.id),
    newUnlockedItems: arrayUnion(item.id),
    [equipField]: item.id,
    updatedAt: serverTimestamp(),
  });
}

export async function equipShopItem(studentId, item) {
  const studentRef = doc(db, "students", String(studentId));
  const snap = await getDoc(studentRef);

  if (!snap.exists()) {
    throw new Error("Student not found.");
  }

  const data = snap.data();
  const ownedItems = Array.isArray(data.ownedItems) ? data.ownedItems : [];

  if (item.price !== 0 && !ownedItems.includes(item.id)) {
    throw new Error("You need to buy this item before wearing it.");
  }

  const equipField = item.category === "outfit" ? "equippedOutfit" : "equippedPfp";

  await updateDoc(studentRef, {
    [equipField]: item.id,
    updatedAt: serverTimestamp(),
  });
}