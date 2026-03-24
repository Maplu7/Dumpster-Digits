import { auth, db } from "./firebase";
import { signInAnonymously, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export async function loginStudent(studentIdRaw, birthdayRaw) {
  const studentId = String(studentIdRaw).trim();
  const birthday = String(birthdayRaw).trim();

  if (!studentId) throw new Error("Student ID is required.");
  if (!/^\d{4}$/.test(birthday)) {
    throw new Error("Birthday must be MMDD (4 digits), like 0224.");
  }

  // Sign in first so Firestore rules can require auth
  const cred = await signInAnonymously(auth);

  try {
    const snap = await getDoc(doc(db, "students", studentId));
    if (!snap.exists()) throw new Error("Student ID not found.");

    const data = snap.data();

    if (data.birthday !== birthday) {
      throw new Error("Birthday password is incorrect.");
    }

    // Return student info (includes name) so you can display it later
    return {
      user: cred.user,
      student: {
        id: studentId,
        name: data.name ?? "Student",
        grade: data.grade ?? null,
      },
    };
  } catch (err) {
    await signOut(auth);
    throw err;
  }
}