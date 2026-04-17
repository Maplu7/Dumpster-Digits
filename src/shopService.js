import { db } from "./firebase";
import { doc, runTransaction } from "firebase/firestore";

export async function buyShopItem(studentId, item) {
  if (!studentId) {
    throw new Error("Missing student id.");
  }

  if (!item?.id || !item?.image) {
    throw new Error("Invalid shop item.");
  }

  const studentRef = doc(db, "students", String(studentId));

  await runTransaction(db, async (transaction) => {
    const studentSnap = await transaction.get(studentRef);

    if (!studentSnap.exists()) {
      throw new Error("Student not found.");
    }

    const data = studentSnap.data() || {};
    const coins = Number(data.coins || 0);
    const ownedItems = Array.isArray(data.ownedItems) ? data.ownedItems : [];

    if (ownedItems.includes(item.id)) {
      transaction.update(studentRef, {
        equippedItemId: item.id,
        profileImage: item.image,
      });
      return;
    }

    if (coins < Number(item.price || 0)) {
      throw new Error("Not enough coins.");
    }

    transaction.update(studentRef, {
      coins: coins - Number(item.price || 0),
      ownedItems: [...ownedItems, item.id],
      equippedItemId: item.id,
      profileImage: item.image,
    });
  });
}

export async function equipShopItem(studentId, itemId, image) {
  if (!studentId) {
    throw new Error("Missing student id.");
  }

  const studentRef = doc(db, "students", String(studentId));

  await runTransaction(db, async (transaction) => {
    const studentSnap = await transaction.get(studentRef);

    if (!studentSnap.exists()) {
      throw new Error("Student not found.");
    }

    const data = studentSnap.data() || {};
    const ownedItems = Array.isArray(data.ownedItems) ? data.ownedItems : [];

    if (!ownedItems.includes(itemId)) {
      throw new Error("Item is not owned yet.");
    }

    transaction.update(studentRef, {
      equippedItemId: itemId,
      profileImage: image,
    });
  });
}