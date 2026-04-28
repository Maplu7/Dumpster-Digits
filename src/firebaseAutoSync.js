import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

function normalizeProblem(problem) {
  if (!problem || typeof problem !== "object") return null;

  const question = String(problem.question ?? "").trim();
  const answer = Number(problem.answer);

  if (!question || Number.isNaN(answer)) return null;

  return { question, answer };
}

function dedupeProblems(problems = []) {
  const seen = new Map();

  (Array.isArray(problems) ? problems : []).forEach((problem) => {
    const normalized = normalizeProblem(problem);
    if (!normalized) return;

    seen.set(`${normalized.question}::${normalized.answer}`, normalized);
  });

  return [...seen.values()];
}

function normalizeGrade(value) {
  const raw = String(value ?? "").toLowerCase().trim();

  if (["1", "grade 1", "1st", "first"].includes(raw)) return "1";
  if (["2", "grade 2", "2nd", "second"].includes(raw)) return "2";

  return raw;
}

function gameGrade(gameKey) {
  if (String(gameKey).startsWith("1st_")) return "1";
  if (String(gameKey).startsWith("2nd_")) return "2";
  return "";
}

function classroomMatchesStudent(classData, student, gameKey) {
  const studentId = String(student?.id || student?.studentId || "").trim();
  const studentGrade = normalizeGrade(student?.grade);
  const targetGrade = gameGrade(gameKey);

  if (!classData) return false;

  if (studentId && classData.studentAssignments?.[studentId]) return true;

  if (
    studentId &&
    Array.isArray(classData.studentIDs) &&
    classData.studentIDs.map(String).includes(studentId)
  ) {
    return true;
  }

  if (
    studentId &&
    Array.isArray(classData.studentID) &&
    classData.studentID.map(String).includes(studentId)
  ) {
    return true;
  }

  if (studentId && Array.isArray(classData.students)) {
    const found = classData.students.some((entry) => {
      if (typeof entry === "string") return entry === studentId;

      return (
        String(entry?.id || "") === studentId ||
        String(entry?.studentId || "") === studentId ||
        String(entry?.studentID || "") === studentId
      );
    });

    if (found) return true;
  }

  const classGrade = normalizeGrade(
    classData.grade ||
      classData.classGrade ||
      classData.gradeLevel ||
      classData.selectedGrade
  );

  if (classGrade && studentGrade && classGrade === studentGrade) return true;
  if (classGrade && targetGrade && classGrade === targetGrade) return true;

  return false;
}

function buildProblems(classData, gameKey, fallbackProblems = []) {
  const fallback = dedupeProblems(fallbackProblems);
  const config = classData?.assignmentEditor?.[gameKey];

  if (!config) return fallback;
  if (config.liveSyncEnabled === false) return fallback;

  const selectedBuiltInProblems = Array.isArray(config.selectedBuiltInProblems)
    ? config.selectedBuiltInProblems
    : [];

  const customProblems = Array.isArray(config.customProblems)
    ? config.customProblems
    : [];

  const problems = dedupeProblems([
    ...selectedBuiltInProblems,
    ...customProblems,
  ]);

  return problems.length > 0 ? problems : fallback;
}

export function subscribeAutoSyncedProblems({
  student,
  gameKey,
  fallbackProblems = [],
  onProblems,
  onError,
}) {
  const studentId = String(student?.id || sessionStorage.getItem("studentId") || "").trim();
  const classId = String(
    student?.classId ||
      student?.classID ||
      student?.classroomId ||
      student?.classroomID ||
      ""
  ).trim();

  if (!gameKey) {
    onProblems?.(dedupeProblems(fallbackProblems));
    return () => {};
  }

  if (classId) {
    return onSnapshot(
      doc(db, "classrooms", classId),
      (snap) => {
        if (!snap.exists()) {
          onProblems?.(dedupeProblems(fallbackProblems));
          return;
        }

        onProblems?.(buildProblems(snap.data(), gameKey, fallbackProblems));
      },
      (error) => {
        console.error("Auto sync classroom error:", error);
        onError?.(error);
        onProblems?.(dedupeProblems(fallbackProblems));
      }
    );
  }

  let latestStudent = {
    ...student,
    id: studentId,
  };

  const unsubStudent = studentId
    ? onSnapshot(doc(db, "students", studentId), (snap) => {
        if (snap.exists()) {
          latestStudent = {
            id: studentId,
            ...snap.data(),
          };
        }
      })
    : null;

  const unsubClasses = onSnapshot(
    collection(db, "classrooms"),
    (snapshot) => {
      const matchingClass = snapshot.docs.find((classDoc) =>
        classroomMatchesStudent(classDoc.data(), latestStudent, gameKey)
      );

      if (!matchingClass) {
        console.warn("No matching classroom found for auto sync:", {
          studentId,
          gameKey,
          latestStudent,
        });

        onProblems?.(dedupeProblems(fallbackProblems));
        return;
      }

      onProblems?.(
        buildProblems(matchingClass.data(), gameKey, fallbackProblems)
      );
    },
    (error) => {
      console.error("Auto sync all-classrooms error:", error);
      onError?.(error);
      onProblems?.(dedupeProblems(fallbackProblems));
    }
  );

  return () => {
    unsubStudent?.();
    unsubClasses?.();
  };
}

export function startDeployUpdateWatcher() {
  if (import.meta.env.DEV) return () => {};

  let stopped = false;

  const checkForUpdate = async () => {
    if (stopped) return;

    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();
      const newVersion = String(data.version || "").trim();
      const oldVersion = localStorage.getItem("appVersion");

      if (!oldVersion && newVersion) {
        localStorage.setItem("appVersion", newVersion);
        return;
      }

      if (newVersion && oldVersion && newVersion !== oldVersion) {
        localStorage.setItem("appVersion", newVersion);
        window.location.reload();
      }
    } catch (error) {
      console.warn("Deploy update check failed:", error);
    }
  };

  checkForUpdate();
  const interval = window.setInterval(checkForUpdate, 30000);

  return () => {
    stopped = true;
    window.clearInterval(interval);
  };
}