import { db } from "./firebase";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

function getCoinRewardForPlay(playCount) {
  if (playCount <= 1) return 60;
  if (playCount === 2) return 35;
  if (playCount === 3) return 20;
  if (playCount === 4) return 10;
  return 5;
}

export async function saveAssignmentResult({
  studentId,
  gameKey,
  assignmentTitle,
  totalWrongGuesses,
  numGuessesPerAnswer,
}) {
  if (!studentId || !gameKey) {
    return { coinReward: 0, playCount: 0, newCoinTotal: 0 };
  }

  const studentRef = doc(db, "students", String(studentId));
  const resultRef = doc(
    db,
    "students",
    String(studentId),
    "assignmentResults",
    String(gameKey)
  );

  const problemBreakdown = {};
  const answers = [];

  for (const item of numGuessesPerAnswer || []) {
    const problemData = item?.guessedAnswer;
    if (!problemData) continue;

    const problem = problemData.question ?? "";
    const correctAnswer = problemData.answer ?? "";
    const wrongTries = Number(item?.numGuess ?? 0);

    problemBreakdown[`${problem}=${correctAnswer}`] = wrongTries;

    answers.push({
      problem,
      correctAnswer,
      studentAnswer: correctAnswer,
      isCorrect: true,
      wrongTries,
    });
  }

  const [studentSnap, resultSnap] = await Promise.all([
    getDoc(studentRef),
    getDoc(resultRef),
  ]);

  const currentCoins = studentSnap.exists()
    ? Number(studentSnap.data()?.coins || 0)
    : 0;

  const previousPlayCount = resultSnap.exists()
    ? Number(resultSnap.data()?.playCount || 0)
    : 0;

  const previousTotalCoinsEarnedFromGame = resultSnap.exists()
    ? Number(resultSnap.data()?.totalCoinsEarnedFromGame || 0)
    : 0;

  const nextPlayCount = previousPlayCount + 1;
  const coinReward = getCoinRewardForPlay(nextPlayCount);
  const newCoinTotal = currentCoins + coinReward;

  await setDoc(
    resultRef,
    {
      assignmentTitle: assignmentTitle || gameKey,
      gameKey,
      totalWrongGuesses: Number(totalWrongGuesses ?? 0),
      completedAt: serverTimestamp(),
      problemBreakdown,
      answers,
      completed: true,
      playCount: nextPlayCount,
      lastCoinReward: coinReward,
      totalCoinsEarnedFromGame:
        previousTotalCoinsEarnedFromGame + coinReward,
    },
    { merge: true }
  );

  if (studentSnap.exists()) {
    await updateDoc(studentRef, {
      coins: newCoinTotal,
    });
  } else {
    await setDoc(
      studentRef,
      {
        coins: newCoinTotal,
      },
      { merge: true }
    );
  }

  return {
    coinReward,
    playCount: nextPlayCount,
    newCoinTotal,
  };
}