import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { saveAssignmentResult } from "./saveAssignmentResult";
import { getRandomCoinReward, rewardStudentCoins } from "./studentRewards";

export async function finishGameWithRewards({
  studentId,
  gameKey,
  assignmentTitle,
  totalWrongGuesses,
  numGuessesPerAnswer,
}) {
  if (!studentId || !gameKey) return 0;

  const resultRef = doc(
    db,
    "students",
    String(studentId),
    "assignmentResults",
    gameKey
  );

  const existing = await getDoc(resultRef);
  const alreadyCompleted = existing.exists();

  await saveAssignmentResult({
    studentId,
    gameKey,
    assignmentTitle,
    totalWrongGuesses,
    numGuessesPerAnswer,
  });

  let reward = 0;

  if (!alreadyCompleted) {
    reward = getRandomCoinReward(8, 20);
    await rewardStudentCoins(studentId, reward);
  }

  return reward;
}