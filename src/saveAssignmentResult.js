import { db } from "./firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

function getCoinRewardForPlay(playCount, perfectRun = false) {
  if (playCount <= 1) {
    return perfectRun ? 80 : 60;
  }

  if (playCount === 2) return 35;
  if (playCount === 3) return 20;
  if (playCount === 4) return 10;
  return 5;
}

function getAttemptPercentFromAnswers(answers) {
  if (!Array.isArray(answers) || answers.length === 0) return 0;

  const total = answers.reduce((sum, answer) => {
    const wrongTries = Number(answer?.wrongTries || 0);
    const answerPercent = Math.max(0, 100 - wrongTries * 25);
    return sum + answerPercent;
  }, 0);

  return Math.round(total / answers.length);
}

function isPerfectRun(totalWrongGuesses, answers) {
  if (Number(totalWrongGuesses || 0) === 0) return true;

  return Array.isArray(answers)
    ? answers.every((answer) => Number(answer?.wrongTries || 0) === 0)
    : false;
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

  const gameSummaryRef = doc(
    db,
    "students",
    String(studentId),
    "assignmentGameSummary",
    String(gameKey)
  );

  const attemptsCollectionRef = collection(
    db,
    "students",
    String(studentId),
    "assignmentResults"
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

  const [studentSnap, gameSummarySnap] = await Promise.all([
    getDoc(studentRef),
    getDoc(gameSummaryRef),
  ]);

  const currentCoins = studentSnap.exists()
    ? Number(studentSnap.data()?.coins || 0)
    : 0;

  const previousPlayCount = gameSummarySnap.exists()
    ? Number(gameSummarySnap.data()?.playCount || 0)
    : 0;

  const previousTotalCoinsEarnedFromGame = gameSummarySnap.exists()
    ? Number(gameSummarySnap.data()?.totalCoinsEarnedFromGame || 0)
    : 0;

  const nextPlayCount = previousPlayCount + 1;
  const numericWrongGuesses = Number(totalWrongGuesses ?? 0);
  const percentCorrect = getAttemptPercentFromAnswers(answers);
  const perfectRun = isPerfectRun(numericWrongGuesses, answers);
  const coinReward = getCoinRewardForPlay(nextPlayCount, perfectRun);
  const newCoinTotal = currentCoins + coinReward;

  const attemptDocRef = await addDoc(attemptsCollectionRef, {
    assignmentTitle: assignmentTitle || gameKey,
    gameKey,
    totalWrongGuesses: numericWrongGuesses,
    completedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    problemBreakdown,
    answers,
    completed: true,
    playCount: nextPlayCount,
    lastCoinReward: coinReward,
    percentCorrect,
    perfectRun,
  });

  await setDoc(
    gameSummaryRef,
    {
      assignmentTitle: assignmentTitle || gameKey,
      gameKey,
      totalWrongGuesses: numericWrongGuesses,
      completedAt: serverTimestamp(),
      lastAttemptId: attemptDocRef.id,
      latestProblemBreakdown: problemBreakdown,
      latestAnswers: answers,
      completed: true,
      playCount: nextPlayCount,
      lastCoinReward: coinReward,
      totalCoinsEarnedFromGame: previousTotalCoinsEarnedFromGame + coinReward,
      percentCorrect,
      perfectRun,
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
    attemptId: attemptDocRef.id,
    percentCorrect,
    perfectRun,
  };
}