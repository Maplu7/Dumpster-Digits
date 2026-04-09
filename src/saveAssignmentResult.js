import { db } from "./firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export async function saveAssignmentResult({
  studentId,
  gameKey,
  assignmentTitle,
  totalWrongGuesses,
  numGuessesPerAnswer,
}) {
  if (!studentId || !gameKey) return;

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

  await setDoc(
    doc(db, "students", String(studentId), "assignmentResults", String(gameKey)),
    {
      assignmentTitle: assignmentTitle || gameKey,
      gameKey,
      totalWrongGuesses: totalWrongGuesses ?? 0,
      completedAt: serverTimestamp(),
      problemBreakdown,
      answers,
      completed: true,
    },
    { merge: true }
  );
}
