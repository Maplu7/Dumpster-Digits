import { auth, db } from "./firebase";
import { signInAnonymously, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function loginStudent(studentIdRaw, birthdayRaw) {
  const studentId = String(studentIdRaw).trim();
  const birthday = String(birthdayRaw).trim();

  if (!studentId) throw new Error("Student ID is required.");
  if (!/^\d{4}$/.test(birthday)) {
    throw new Error("Birthday must be MMDD (4 digits), like 0224.");
  }

  const cred = await signInAnonymously(auth);

  try {
    const studentRef = doc(db, "students", studentId);
    const snap = await getDoc(studentRef);

    if (!snap.exists()) throw new Error("Student ID not found.");

    const data = snap.data();

    if (data.birthday !== birthday) {
      throw new Error("Birthday password is incorrect.");
    }

    await setDoc(
      studentRef,
      {
        authUid: cred.user.uid,
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return {
      user: cred.user,
      student: {
        id: studentId,
        name: data.name ?? "Student",
        grade: data.grade ?? null,
        classId: data.classId ?? data.classID ?? data.classroomId ?? data.classroomID ?? null,
        authUid: cred.user.uid,
      },
    };
  } catch (err) {
    await signOut(auth);
    throw err;
  }
}

export async function loginTeacher(teacherIdRaw, passwordRaw) {
  const teacherId = String(teacherIdRaw).trim();
  const password = String(passwordRaw).trim();

  if (!teacherId) throw new Error("Teacher ID is required.");
  if (!password) throw new Error("Teacher password is required.");

  const cred = await signInAnonymously(auth);

  try {
    const teacherRef = doc(db, "teachers", teacherId);
    const snap = await getDoc(teacherRef);

    if (!snap.exists()) throw new Error("Teacher ID not found.");

    const data = snap.data();

    if (data.password !== password) {
      throw new Error("Teacher password is incorrect.");
    }

    await setDoc(
      teacherRef,
      {
        authUid: cred.user.uid,
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return {
      user: cred.user,
      teacher: {
        id: teacherId,
        name: data.name ?? "Teacher",
        classId: data.classId ?? null,
        authUid: cred.user.uid,
      },
    };
  } catch (err) {
    await signOut(auth);
    throw err;
  }
}