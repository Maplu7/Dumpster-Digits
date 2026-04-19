import { db } from "./firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

function normalizeProblem(problem) {
  if (!problem || typeof problem !== "object") return null;

  const question = String(problem.question ?? "").trim();
  const answer = Number(problem.answer);

  if (!question || Number.isNaN(answer)) return null;

  return { question, answer };
}

function dedupeProblems(problems = []) {
  const seen = new Set();

  return problems.filter((problem) => {
    const normalized = normalizeProblem(problem);
    if (!normalized) return false;

    const key = `${normalized.question}::${normalized.answer}`;
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  }).map((problem) => normalizeProblem(problem));
}

function buildAssignedProblemsFromClassData(
  classData,
  gameKey,
  fallbackProblems = []
) {
  const safeFallback = Array.isArray(fallbackProblems)
    ? dedupeProblems(fallbackProblems)
    : [];

  if (!classData || !gameKey) {
    return safeFallback;
  }

  const editorConfig = classData?.assignmentEditor?.[gameKey];

  if (!editorConfig) {
    return safeFallback;
  }

  const liveSyncEnabled = editorConfig?.liveSyncEnabled !== false;

  if (!liveSyncEnabled) {
    return safeFallback;
  }

  const selectedBuiltInProblems = Array.isArray(
    editorConfig.selectedBuiltInProblems
  )
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
}

export async function getAssignedProblemsForGame({
  classId,
  gameKey,
  fallbackProblems = [],
}) {
  const safeFallback = Array.isArray(fallbackProblems)
    ? dedupeProblems(fallbackProblems)
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

    return buildAssignedProblemsFromClassData(
      classSnap.data(),
      gameKey,
      safeFallback
    );
  } catch (error) {
    console.error("Error loading assigned problems for game:", error);
    return safeFallback;
  }
}

export function subscribeAssignedProblemsForGame(
  { classId, gameKey, fallbackProblems = [] },
  onValue,
  onError
) {
  const safeFallback = Array.isArray(fallbackProblems)
    ? dedupeProblems(fallbackProblems)
    : [];

  if (!classId || !gameKey) {
    onValue?.(safeFallback);
    return () => {};
  }

  const classRef = doc(db, "classrooms", String(classId));

  return onSnapshot(
    classRef,
    (snap) => {
      if (!snap.exists()) {
        onValue?.(safeFallback);
        return;
      }

      onValue?.(
        buildAssignedProblemsFromClassData(
          snap.data(),
          gameKey,
          safeFallback
        )
      );
    },
    (error) => {
      console.error("Error watching assigned problems for game:", error);
      onError?.(error);
      onValue?.(safeFallback);
    }
  );
}