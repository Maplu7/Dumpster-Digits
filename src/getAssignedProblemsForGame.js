import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { getProblemBankForGame } from "./data/assignmentProblemBanks";

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

  if (!raw) return "";

  if (raw === "1" || raw === "grade 1" || raw === "1st" || raw === "first") {
    return "1";
  }

  if (raw === "2" || raw === "grade 2" || raw === "2nd" || raw === "second") {
    return "2";
  }

  return raw;
}

function getGameGrade(gameKey) {
  if (String(gameKey || "").startsWith("1st_")) return "1";
  if (String(gameKey || "").startsWith("2nd_")) return "2";
  return "";
}

function buildAssignedProblemsFromClassData(
  classData,
  gameKey,
  fallbackProblems = []
) {
  const safeFallback = dedupeProblems(fallbackProblems);

  if (!classData || !gameKey) return safeFallback;

  const editorConfig = classData?.assignmentEditor?.[gameKey];

  if (!editorConfig) return safeFallback;

  if (editorConfig.liveSyncEnabled === false) return safeFallback;

  const bank = getProblemBankForGame(gameKey);

  const selectedPresetIds = Array.isArray(editorConfig.selectedPresetIds)
    ? editorConfig.selectedPresetIds
    : [];

  const selectedPresetProblems = (bank?.presets || [])
    .filter((preset) => selectedPresetIds.includes(preset.id))
    .flatMap((preset) => (Array.isArray(preset.problems) ? preset.problems : []));

  const selectedBuiltInProblems = Array.isArray(
    editorConfig.selectedBuiltInProblems
  )
    ? editorConfig.selectedBuiltInProblems
    : [];

  const customProblems = Array.isArray(editorConfig.customProblems)
    ? editorConfig.customProblems
    : [];

  const merged = dedupeProblems([
    ...selectedPresetProblems,
    ...selectedBuiltInProblems,
    ...customProblems,
  ]);

  console.log("🔴 LIVE SYNC assigned problems", {
    gameKey,
    selectedPresetIds,
    selectedPresetCount: selectedPresetProblems.length,
    selectedBuiltInCount: selectedBuiltInProblems.length,
    customCount: customProblems.length,
    finalCount: merged.length,
    problems: merged,
  });

  return merged.length > 0 ? merged : safeFallback;
}

function classroomHasStudent(classData, student) {
  const studentId = String(student?.id || student?.studentId || "").trim();
  const studentGrade = normalizeGrade(student?.grade);
  const gameGrade = normalizeGrade(student?.gameGrade);

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
    const foundStudent = classData.students.some((entry) => {
      if (typeof entry === "string") return entry === studentId;

      return (
        String(entry?.id || "") === studentId ||
        String(entry?.studentId || "") === studentId ||
        String(entry?.studentID || "") === studentId
      );
    });

    if (foundStudent) return true;
  }

  const classGrade = normalizeGrade(
    classData.grade ||
      classData.classGrade ||
      classData.gradeLevel ||
      classData.selectedGrade
  );

  if (classGrade && studentGrade && classGrade === studentGrade) return true;
  if (classGrade && gameGrade && classGrade === gameGrade) return true;

  return false;
}

async function getStudentProfile(studentId) {
  const safeStudentId = String(studentId || "").trim();
  if (!safeStudentId) return null;

  try {
    const snap = await getDoc(doc(db, "students", safeStudentId));
    if (!snap.exists()) return { id: safeStudentId };

    return {
      id: safeStudentId,
      ...snap.data(),
    };
  } catch (error) {
    console.error("Could not load student profile for sync:", error);
    return { id: safeStudentId };
  }
}

export async function getAssignedProblemsForGame({
  classId,
  studentId,
  studentGrade,
  gameKey,
  fallbackProblems = [],
}) {
  const safeFallback = dedupeProblems(fallbackProblems);
  const safeClassId = String(classId || "").trim();
  const safeStudentId = String(studentId || "").trim();

  if (!gameKey) return safeFallback;

  try {
    if (safeClassId) {
      const classSnap = await getDoc(doc(db, "classrooms", safeClassId));

      if (!classSnap.exists()) return safeFallback;

      return buildAssignedProblemsFromClassData(
        classSnap.data(),
        gameKey,
        safeFallback
      );
    }

    const studentProfile = await getStudentProfile(safeStudentId);

    const studentForMatch = {
      ...(studentProfile || {}),
      id: safeStudentId,
      grade: studentProfile?.grade || studentGrade,
      gameGrade: getGameGrade(gameKey),
    };

    const classroomsSnap = await getDocs(collection(db, "classrooms"));

    const matchingClassDoc = classroomsSnap.docs.find((classDoc) =>
      classroomHasStudent(classDoc.data(), studentForMatch)
    );

    if (!matchingClassDoc) {
      console.warn("⚠️ No classroom found for student/grade:", studentForMatch);
      return safeFallback;
    }

    console.log("✅ Found classroom for live sync:", {
      studentId: safeStudentId,
      studentGrade: studentForMatch.grade,
      gameKey,
      classId: matchingClassDoc.id,
    });

    return buildAssignedProblemsFromClassData(
      matchingClassDoc.data(),
      gameKey,
      safeFallback
    );
  } catch (error) {
    console.error("Error loading assigned problems for game:", error);
    return safeFallback;
  }
}

export function subscribeAssignedProblemsForGame(
  { classId, studentId, studentGrade, gameKey, fallbackProblems = [] },
  onValue,
  onError
) {
  const safeFallback = dedupeProblems(fallbackProblems);
  const safeClassId = String(classId || "").trim();
  const safeStudentId = String(studentId || "").trim();

  if (!gameKey) {
    onValue?.(safeFallback);
    return () => {};
  }

  if (safeClassId) {
    return onSnapshot(
      doc(db, "classrooms", safeClassId),
      (snap) => {
        if (!snap.exists()) {
          onValue?.(safeFallback);
          return;
        }

        console.log("✅ Live watching classroom:", safeClassId);

        onValue?.(
          buildAssignedProblemsFromClassData(
            snap.data(),
            gameKey,
            safeFallback
          )
        );
      },
      (error) => {
        console.error("Error watching classroom assignment editor:", error);
        onError?.(error);
        onValue?.(safeFallback);
      }
    );
  }

  let latestStudentProfile = {
    id: safeStudentId,
    grade: studentGrade,
    gameGrade: getGameGrade(gameKey),
  };

  const unsubscribeStudent =
    safeStudentId
      ? onSnapshot(
          doc(db, "students", safeStudentId),
          (snap) => {
            if (snap.exists()) {
              latestStudentProfile = {
                id: safeStudentId,
                ...snap.data(),
                grade: snap.data()?.grade || studentGrade,
                gameGrade: getGameGrade(gameKey),
              };
            }
          },
          (error) => {
            console.error("Error watching student profile for sync:", error);
          }
        )
      : null;

  const unsubscribeClassrooms = onSnapshot(
    collection(db, "classrooms"),
    (snapshot) => {
      const matchingClassDoc = snapshot.docs.find((classDoc) =>
        classroomHasStudent(classDoc.data(), latestStudentProfile)
      );

      if (!matchingClassDoc) {
        console.warn("⚠️ No live classroom match for:", latestStudentProfile);
        onValue?.(safeFallback);
        return;
      }

      console.log("✅ Live sync matched classroom:", {
        studentId: safeStudentId,
        grade: latestStudentProfile.grade,
        gameKey,
        classId: matchingClassDoc.id,
      });

      onValue?.(
        buildAssignedProblemsFromClassData(
          matchingClassDoc.data(),
          gameKey,
          safeFallback
        )
      );
    },
    (error) => {
      console.error("Error watching classrooms for student/grade:", error);
      onError?.(error);
      onValue?.(safeFallback);
    }
  );

  return () => {
    if (typeof unsubscribeStudent === "function") unsubscribeStudent();
    if (typeof unsubscribeClassrooms === "function") unsubscribeClassrooms();
  };
}