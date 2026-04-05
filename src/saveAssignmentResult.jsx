import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function saveAssignmentResult({
  studentId,
  gameKey,
  assignmentTitle,
  totalWrongGuesses,
  numGuessesPerAnswer,
}) {
  if (!studentId || !gameKey) return;

  const problemBreakdown = {};

  for (const item of numGuessesPerAnswer || []) {
    const trash = item.guessedAnswer;
    if (!trash) continue;

    const label = `${trash.question}=${trash.answer}`;
    problemBreakdown[label] = item.numGuess ?? 0;
  }

  const resultRef = doc(
    db,
    "students",
    String(studentId),
    "assignmentResults",
    gameKey
  );

  await setDoc(
    resultRef,
    {
      assignmentTitle,
      gameKey,
      totalWrongGuesses: totalWrongGuesses ?? 0,
      completedAt: serverTimestamp(),
      problemBreakdown,
    },
    { merge: true }
  );
}