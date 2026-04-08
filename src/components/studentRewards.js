import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export function getRandomCoinReward(min = 8, max = 20) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function rewardStudentCoins(studentId, amount) {
  if (!studentId || !amount) return 0;

  const studentRef = doc(db, "students", String(studentId));

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(studentRef);

    if (!snap.exists()) {
      transaction.set(studentRef, {
        coins: amount,
        ownedItems: [],
        equippedItemId: null,
        updatedAt: serverTimestamp(),
      });
      return;
    }

    const data = snap.data();
    const currentCoins = Number(data.coins || 0);

    transaction.update(studentRef, {
      coins: currentCoins + amount,
      updatedAt: serverTimestamp(),
    });
  });

  return amount;
}