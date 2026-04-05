import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

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
      id: "grade2-multiplication",
      title: "2nd Grade Multiplication",
      description: "Practice multiplication by dragging trash to the correct can.",
      grade: 2,
      gameKey: "2nd_multiplication",
      enabled: true,
      order: 1,
    },
  ],
};

export async function getAssignmentsForGrade(gradeRaw) {
  const grade = Number(gradeRaw);

  if (!grade) return [];

  try {
    const snap = await getDocs(collection(db, "assignments"));

    const items = snap.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      .filter((item) => Number(item.grade) === grade)
      .filter((item) => item.enabled !== false)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    if (items.length > 0) {
      return items;
    }

    return FALLBACK_ASSIGNMENTS[grade] ?? [];
  } catch (error) {
    console.error("Error loading assignments:", error);
    return FALLBACK_ASSIGNMENTS[grade] ?? [];
  }
}