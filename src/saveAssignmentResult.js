import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

    const studentAnswer =
      item?.studentAnswer ??
      item?.finalAnswer ??
      item?.selectedAnswer ??
      item?.droppedAnswer ??
      item?.answerChosen ??
      correctAnswer;

    const wrongTries = Number(item?.numGuess ?? 0);
    const isCorrect = String(studentAnswer) === String(correctAnswer);

    problemBreakdown[`${problem}=${correctAnswer}`] = wrongTries;

    answers.push({
      problem,
      correctAnswer,
      studentAnswer,
      isCorrect,
      wrongTries,
    });
  }

  await addDoc(
    collection(db, "students", String(studentId), "assignmentResults"),
    {
      assignmentTitle: assignmentTitle || gameKey,
      gameKey,
      totalWrongGuesses: totalWrongGuesses ?? 0,
      completedAt: serverTimestamp(),
      problemBreakdown,
      answers,
    }
  );
}