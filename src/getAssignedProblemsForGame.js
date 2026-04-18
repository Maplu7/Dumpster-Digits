import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function normalizeProblem(problem) {
  if (!problem || typeof problem !== "object") return null;

  const question = String(problem.question ?? "").trim();
  const answer = Number(problem.answer);

  if (!question || Number.isNaN(answer)) return null;

  return { question, answer };
}

function dedupeProblems(problems) {
  const seen = new Set();

  return problems.filter((problem) => {
    const key = `${problem.question}::${problem.answer}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getAssignedProblemsForGame({
  classId,
  gameKey,
  fallbackProblems = [],
}) {
  const safeFallback = Array.isArray(fallbackProblems)
    ? fallbackProblems.map(normalizeProblem).filter(Boolean)
    : [];

  if (!classId || !gameKey) {
    return safeFallback;
  }

  try {
    const classRef = doc(db, "classrooms", String(classId));
    const classSnap = await getDoc(classRef);

    if (!classSnap.exists()) {
      return safeFallback;
    }

    const classData = classSnap.data();
    const editorConfig = classData?.assignmentEditor?.[gameKey];

    if (!editorConfig) {
      return safeFallback;
    }

    const selectedBuiltInProblems = Array.isArray(editorConfig.selectedBuiltInProblems)
      ? editorConfig.selectedBuiltInProblems.map(normalizeProblem).filter(Boolean)
      : [];

    const customProblems = Array.isArray(editorConfig.customProblems)
      ? editorConfig.customProblems.map(normalizeProblem).filter(Boolean)
      : [];

    const merged = dedupeProblems([
      ...selectedBuiltInProblems,
      ...customProblems,
    ]);

    return merged.length > 0 ? merged : safeFallback;
  } catch (error) {
    console.error("Error loading assigned problems for game:", error);
    return safeFallback;
  }
}