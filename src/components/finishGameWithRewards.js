import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { saveAssignmentResult } from "../saveAssignmentResult";
import {
  getCoinRewardForWrongGuesses,
  rewardStudentCoins,
} from "./studentRewards";

function buildSavedAnswers(numGuessesPerAnswer = [], gameKey, assignmentTitle) {
  return (Array.isArray(numGuessesPerAnswer) ? numGuessesPerAnswer : []).map(
    (entry) => {
      const trash =
        entry?.guessedAnswer ||
        entry?.trash ||
        entry?.problemData ||
        entry?.problem ||
        entry;

      const question =
        trash?.question ||
        entry?.question ||
        trash?.problemData?.question ||
        "";

      const answer =
        trash?.answer ??
        entry?.answer ??
        trash?.problemData?.answer ??
        "";

      const place =
        trash?.place ||
        trash?.placeValue ||
        trash?.placeName ||
        entry?.place ||
        entry?.placeValue ||
        entry?.placeName ||
        trash?.problemData?.place ||
        trash?.problemData?.placeValue ||
        "";

      return {
        question,
        answer,
        correctAnswer: answer,
        place,
        wrongTries: Number(entry?.numGuess ?? entry?.wrongTries ?? 0),
        gameKey,
        assignmentTitle,
      };
    }
  );
}

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

  const answers = buildSavedAnswers(
    numGuessesPerAnswer,
    gameKey,
    assignmentTitle
  );

  await saveAssignmentResult({
    studentId,
    gameKey,
    assignmentTitle,
    totalWrongGuesses,
    numGuessesPerAnswer,
    answers,
  });

  let reward = 0;

  if (!alreadyCompleted) {
    reward = getCoinRewardForWrongGuesses(totalWrongGuesses);
    await rewardStudentCoins(studentId, reward);
  }

  return reward;
}