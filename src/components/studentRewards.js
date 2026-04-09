import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export function getCoinRewardForWrongGuesses(totalWrongGuesses = 0) {
  const wrong = Math.max(0, Number(totalWrongGuesses || 0));
  if (wrong === 0) return 60;
  if (wrong === 1) return 45;
  if (wrong === 2) return 35;
  if (wrong === 3) return 25;
  if (wrong === 4) return 18;
  return 12;
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
        equippedItemImage: null,
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
