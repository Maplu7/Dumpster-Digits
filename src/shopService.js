import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function buyShopItem(studentId, item) {
  if (!studentId || !item?.id || !item?.price) {
    throw new Error("Missing student or item info.");
  }

  const studentRef = doc(db, "students", String(studentId));

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(studentRef);

    if (!snap.exists()) {
      throw new Error("Student not found.");
    }

    const data = snap.data();
    const currentCoins = Number(data.coins || 0);
    const ownedItems = Array.isArray(data.ownedItems) ? data.ownedItems : [];

    if (ownedItems.includes(item.id)) {
      transaction.update(studentRef, {
        equippedItemId: item.id,
        updatedAt: serverTimestamp(),
      });
      return;
    }

    if (currentCoins < item.price) {
      throw new Error("Not enough coins.");
    }

    transaction.update(studentRef, {
      coins: currentCoins - item.price,
      ownedItems: [...ownedItems, item.id],
      equippedItemId: item.id,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function equipShopItem(studentId, itemId) {
  if (!studentId || !itemId) return;

  const studentRef = doc(db, "students", String(studentId));

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(studentRef);

    if (!snap.exists()) {
      throw new Error("Student not found.");
    }

    const data = snap.data();
    const ownedItems = Array.isArray(data.ownedItems) ? data.ownedItems : [];

    if (!ownedItems.includes(itemId)) {
      throw new Error("Item not owned.");
    }

    transaction.update(studentRef, {
      equippedItemId: itemId,
      updatedAt: serverTimestamp(),
    });
  });
}