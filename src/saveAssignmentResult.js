import { db } from "./firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

function getCoinRewardForPlay(playCount, perfectRun = false) {
  if (playCount <= 1) return perfectRun ? 80 : 60;
  if (playCount === 2) return 35;
  if (playCount === 3) return 20;
  if (playCount === 4) return 10;
  return 5;
}

function getAttemptPercentFromAnswers(answers) {
  if (!Array.isArray(answers) || answers.length === 0) return 0;

  const total = answers.reduce((sum, answer) => {
    const wrongTries = Number(answer?.wrongTries || 0);
    return sum + Math.max(0, 100 - wrongTries * 25);
  }, 0);

  return Math.round(total / answers.length);
}

function isPerfectRun(totalWrongGuesses, answers) {
  if (Number(totalWrongGuesses || 0) === 0) return true;

  return Array.isArray(answers)
    ? answers.every((answer) => Number(answer?.wrongTries || 0) === 0)
    : false;
}

function getResetVersionFromStudent(data) {
  return Number(data?.resetVersion || 0);
}

function buildAttemptData({
  gameKey,
  assignmentTitle,
  totalWrongGuesses,
  numGuessesPerAnswer,
  nextPlayCount,
  coinReward,
}) {
  const problemBreakdown = {};
  const answers = [];

  for (const item of numGuessesPerAnswer || []) {
    const problemData = item?.guessedAnswer;
    if (!problemData) continue;

    const problem = String(problemData.question ?? "");
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

  const numericWrongGuesses = Number(totalWrongGuesses ?? 0);
  const percentCorrect = getAttemptPercentFromAnswers(answers);
  const perfectRun = isPerfectRun(numericWrongGuesses, answers);

  return {
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
  };
}

export async function saveAssignmentResult({
  studentId,
  gameKey,
  assignmentTitle,
  totalWrongGuesses,
  numGuessesPerAnswer,
  startedAt = 0,
}) {
  const safeStudentId = String(studentId || "").trim();
  const safeGameKey = String(gameKey || "").trim();

  if (!safeStudentId || !safeGameKey) {
    return {
      coinReward: 0,
      playCount: 0,
      newCoinTotal: 0,
      skipped: true,
      reason: "Missing studentId or gameKey.",
    };
  }

  const studentRef = doc(db, "students", safeStudentId);

  const gameSummaryRef = doc(
    db,
    "students",
    safeStudentId,
    "assignmentGameSummary",
    safeGameKey
  );

  const attemptsCollectionRef = collection(
    db,
    "students",
    safeStudentId,
    "assignmentResults"
  );

  const [studentSnap, gameSummarySnap] = await Promise.all([
    getDoc(studentRef),
    getDoc(gameSummaryRef),
  ]);

  const studentData = studentSnap.exists() ? studentSnap.data() : {};
  const resetVersion = getResetVersionFromStudent(studentData);
  const safeStartedAt = Number(startedAt || 0);

  if (resetVersion && safeStartedAt && resetVersion > safeStartedAt) {
    return {
      coinReward: 0,
      playCount: 0,
      newCoinTotal: Number(studentData?.coins || 0),
      skipped: true,
      skippedBecauseReset: true,
      reason: "Game was reset while this attempt was running.",
    };
  }

  const currentCoins = Number(studentData?.coins || 0);

  const previousPlayCount = gameSummarySnap.exists()
    ? Number(gameSummarySnap.data()?.playCount || 0)
    : 0;

  const previousTotalCoinsEarnedFromGame = gameSummarySnap.exists()
    ? Number(gameSummarySnap.data()?.totalCoinsEarnedFromGame || 0)
    : 0;

  const nextPlayCount = previousPlayCount + 1;

  const previewAnswers = [];
  for (const item of numGuessesPerAnswer || []) {
    const problemData = item?.guessedAnswer;
    if (!problemData) continue;

    previewAnswers.push({
      wrongTries: Number(item?.numGuess ?? 0),
    });
  }

  const numericWrongGuesses = Number(totalWrongGuesses ?? 0);
  const perfectRun = isPerfectRun(numericWrongGuesses, previewAnswers);
  const coinReward = getCoinRewardForPlay(nextPlayCount, perfectRun);
  const newCoinTotal = currentCoins + coinReward;

  const attemptData = buildAttemptData({
    gameKey: safeGameKey,
    assignmentTitle,
    totalWrongGuesses,
    numGuessesPerAnswer,
    nextPlayCount,
    coinReward,
  });

  const attemptDocRef = await addDoc(attemptsCollectionRef, attemptData);

  await setDoc(
    gameSummaryRef,
    {
      assignmentTitle: assignmentTitle || safeGameKey,
      gameKey: safeGameKey,
      totalWrongGuesses: attemptData.totalWrongGuesses,
      completedAt: serverTimestamp(),
      lastAttemptId: attemptDocRef.id,
      latestProblemBreakdown: attemptData.problemBreakdown,
      latestAnswers: attemptData.answers,
      completed: true,
      playCount: nextPlayCount,
      lastCoinReward: coinReward,
      totalCoinsEarnedFromGame: previousTotalCoinsEarnedFromGame + coinReward,
      percentCorrect: attemptData.percentCorrect,
      perfectRun: attemptData.perfectRun,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  if (studentSnap.exists()) {
    await updateDoc(studentRef, {
      coins: increment(coinReward),
      lastPlayedAt: serverTimestamp(),
      lastGameKey: safeGameKey,
    });
  } else {
    await setDoc(
      studentRef,
      {
        coins: newCoinTotal,
        lastPlayedAt: serverTimestamp(),
        lastGameKey: safeGameKey,
      },
      { merge: true }
    );
  }

  return {
    coinReward,
    playCount: nextPlayCount,
    newCoinTotal,
    attemptId: attemptDocRef.id,
    percentCorrect: attemptData.percentCorrect,
    perfectRun: attemptData.perfectRun,
    skipped: false,
  };
}