// src/utils/liveAssignments.js

import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getProblemBankForGame } from "../data/assignmentProblemBanks";

function normalizeProblem(problem) {
  const question = String(problem?.question ?? "").trim();
  const answer = Number(problem?.answer);

  if (!question) return null;
  if (Number.isNaN(answer)) return null;

  return { question, answer };
}

function problemKey(problem) {
  return `${String(problem?.question ?? "").trim()}::${Number(problem?.answer)}`;
}

function dedupeProblems(list = []) {
  const map = new Map();

  list.forEach((item) => {
    const normalized = normalizeProblem(item);
    if (!normalized) return;
    map.set(problemKey(normalized), normalized);
  });

  return [...map.values()];
}

export function buildResolvedProblemSet({
  gameKey,
  classroomData,
  fallbackProblems = [],
}) {
  const gameBank = getProblemBankForGame(gameKey);
  const editorConfig = classroomData?.assignmentEditor?.[gameKey] || {};

  const liveSyncEnabled = editorConfig?.liveSyncEnabled !== false;

  if (!liveSyncEnabled) {
    return dedupeProblems(fallbackProblems);
  }

  const selectedPresetIds = Array.isArray(editorConfig.selectedPresetIds)
    ? editorConfig.selectedPresetIds
    : [];

  const selectedBuiltInProblems = Array.isArray(editorConfig.selectedBuiltInProblems)
    ? editorConfig.selectedBuiltInProblems
    : [];

  const customProblems = Array.isArray(editorConfig.customProblems)
    ? editorConfig.customProblems
    : [];

  const selectedPresetProblems = (gameBank?.presets || [])
    .filter((preset) => selectedPresetIds.includes(preset.id))
    .flatMap((preset) => Array.isArray(preset.problems) ? preset.problems : []);

  const merged = dedupeProblems([
    ...selectedPresetProblems,
    ...selectedBuiltInProblems,
    ...customProblems,
  ]);

  if (merged.length > 0) return merged;

  return dedupeProblems(fallbackProblems);
}

export async function loadTeacherAssignmentProblems({
  classId,
  gameKey,
  fallbackProblems = [],
}) {
  if (!classId || !gameKey) {
    return dedupeProblems(fallbackProblems);
  }

  const classRef = doc(db, "classrooms", String(classId));
  const classSnap = await getDoc(classRef);

  if (!classSnap.exists()) {
    return dedupeProblems(fallbackProblems);
  }

  return buildResolvedProblemSet({
    gameKey,
    classroomData: classSnap.data(),
    fallbackProblems,
  });
}

export function watchTeacherAssignmentProblems({
  classId,
  gameKey,
  fallbackProblems = [],
  onChange,
  onError,
}) {
  if (!classId || !gameKey || typeof onChange !== "function") {
    onChange?.(dedupeProblems(fallbackProblems));
    return () => {};
  }

  const classRef = doc(db, "classrooms", String(classId));

  const unsubscribe = onSnapshot(
    classRef,
    (classSnap) => {
      const classroomData = classSnap.exists() ? classSnap.data() : null;

      const problems = buildResolvedProblemSet({
        gameKey,
        classroomData,
        fallbackProblems,
      });

      onChange(problems);
    },
    (error) => {
      console.error("Error watching teacher assignment problems:", error);
      if (typeof onError === "function") onError(error);
      onChange(dedupeProblems(fallbackProblems));
    }
  );

  return unsubscribe;
}