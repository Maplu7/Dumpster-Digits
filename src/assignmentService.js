import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

const FALLBACK_ASSIGNMENTS = {
  1: [
    {
      id: "grade1-addition",
      title: "1st Grade Addition",
      description: "Practice addition by dragging trash to the correct can.",
      grade: 1,
      gameKey: "1st_addition",
      enabled: true,
      order: 1,
    },
    {
      id: "grade1-subtraction",
      title: "1st Grade Subtraction",
      description: "Practice subtraction by dragging trash to the correct can.",
      grade: 1,
      gameKey: "1st_subtraction",
      enabled: true,
      order: 2,
    },
  ],

  2: [
    {
      id: "grade2-addition",
      title: "2nd Grade Addition",
      description:
        "Practice bigger addition facts by dragging trash to the correct can.",
      grade: 2,
      gameKey: "2nd_addition",
      enabled: true,
      order: 1,
    },
    {
      id: "grade2-subtraction",
      title: "2nd Grade Subtraction",
      description: "Practice subtraction by dragging trash to the correct can.",
      grade: 2,
      gameKey: "2nd_subtraction",
      enabled: true,
      order: 2,
    },
    {
      id: "grade2-division",
      title: "2nd Grade Division",
      description: "Practice division by dragging trash to the correct can.",
      grade: 2,
      gameKey: "2nd_division",
      enabled: true,
      order: 3,
    },
    {
      id: "grade2-fill-blank",
      title: "2nd Grade Fill in the Blank",
      description:
        "Solve the missing number problem and drag trash to the right can.",
      grade: 2,
      gameKey: "2nd_fill_blank",
      enabled: true,
      order: 4,
    },
    {
      id: "grade2-place-value",
      title: "2nd Grade Place Value",
      description: "Match each number to the correct place value answer.",
      grade: 2,
      gameKey: "2nd_place_value",
      enabled: true,
      order: 5,
    },
    {
      id: "grade2-multiplication",
      title: "2nd Grade Multiplication",
      description:
        "Practice multiplication by dragging trash to the correct can.",
      grade: 2,
      gameKey: "2nd_multiplication",
      enabled: true,
      order: 6,
    },
  ],
};

const VALID_GAME_KEYS = new Set([
  "1st_addition",
  "1st_subtraction",
  "2nd_addition",
  "2nd_subtraction",
  "2nd_division",
  "2nd_fill_blank",
  "2nd_place_value",
  "2nd_multiplication",
]);

function getFallbackGameKey(docId, title, description, grade) {
  const text = `${docId || ""} ${title || ""} ${description || ""}`.toLowerCase();

  if (grade === 1) {
    if (text.includes("subtraction")) return "1st_subtraction";
    if (text.includes("addition")) return "1st_addition";
  }

  if (grade === 2) {
    if (text.includes("division")) {
      return "2nd_division";
    }

    if (
      text.includes("fill in the blank") ||
      text.includes("fill-blank") ||
      text.includes("missing number")
    ) {
      return "2nd_fill_blank";
    }

    if (
      text.includes("place value") ||
      text.includes("tens") ||
      text.includes("ones") ||
      text.includes("hundreds")
    ) {
      return "2nd_place_value";
    }

    if (text.includes("multiplication")) {
      return "2nd_multiplication";
    }

    if (text.includes("subtraction")) {
      return "2nd_subtraction";
    }

    if (text.includes("addition")) {
      return "2nd_addition";
    }
  }

  return null;
}

function mergeAssignmentsForGrade(grade, docs = []) {
  const dbItems = docs
    .map((docSnap) => {
      const data = docSnap.data() || {};
      const gradeValue = Number(data.grade);

      const fallbackGameKey = getFallbackGameKey(
        docSnap.id,
        data.title,
        data.description,
        gradeValue
      );

      const gameKey = VALID_GAME_KEYS.has(data.gameKey)
        ? data.gameKey
        : fallbackGameKey;

      return {
        id: docSnap.id,
        ...data,
        grade: gradeValue,
        gameKey,
      };
    })
    .filter((item) => item.grade === grade)
    .filter((item) => item.enabled !== false)
    .filter((item) => Boolean(item.gameKey));

  const merged = new Map();

  for (const item of FALLBACK_ASSIGNMENTS[grade] ?? []) {
    merged.set(item.gameKey, item);
  }

  for (const item of dbItems) {
    const fallbackMatch = (FALLBACK_ASSIGNMENTS[grade] || []).find(
      (fallbackItem) => fallbackItem.gameKey === item.gameKey
    );

    merged.set(item.gameKey, {
      ...(fallbackMatch || {}),
      ...item,
      gameKey: item.gameKey,
    });
  }

  return Array.from(merged.values()).sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  );
}

export function getAssignmentsForGrade(gradeRaw) {
  const grade = Number(gradeRaw);
  if (!grade) return Promise.resolve([]);

  return new Promise((resolve) => {
    const unsubscribe = subscribeAssignmentsForGrade(
      grade,
      (items) => {
        resolve(items);
        unsubscribe();
      },
      () => {
        resolve(FALLBACK_ASSIGNMENTS[grade] ?? []);
        unsubscribe();
      }
    );
  });
}

export function subscribeAssignmentsForGrade(gradeRaw, onValue, onError) {
  const grade = Number(gradeRaw);

  if (!grade) {
    onValue?.([]);
    return () => {};
  }

  return onSnapshot(
    collection(db, "assignments"),
    (snap) => {
      onValue?.(mergeAssignmentsForGrade(grade, snap.docs));
    },
    (error) => {
      console.error("Error loading assignments:", error);
      onError?.(error);
      onValue?.(FALLBACK_ASSIGNMENTS[grade] ?? []);
    }
  );
}