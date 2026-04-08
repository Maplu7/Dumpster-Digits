import { useEffect, useMemo, useState } from "react";
import Login from "./components/Login.jsx";
import Welcome from "./components/Welcome.jsx";
import Assignments from "./components/Assignments.jsx";
import GamePage from "./components/GamePage.jsx";
import TeacherDash from "./components/TeacherDash.jsx";
import Shop from "./components/Shop.jsx";
import "./App.css";

import { db } from "./firebase";
import { getAssignmentsForGrade } from "./assignmentService";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

export default function App() {
  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [screen, setScreen] = useState("login");
  const [currentGameKey, setCurrentGameKey] = useState(null);

  const [studentAssignments, setStudentAssignments] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [lockMap, setLockMap] = useState({});

  function handleStudentLogin(studentData) {
    setStudent(studentData);
    setTeacher(null);
    setScreen("welcome");
    setCurrentGameKey(null);
    sessionStorage.setItem("studentId", studentData.id);
  }

  function handleTeacherLogin(teacherData) {
    setTeacher(teacherData);
    setStudent(null);
    setScreen("teacher");
    setCurrentGameKey(null);
  }

  function handleLogout() {
    setStudent(null);
    setTeacher(null);
    setScreen("login");
    setCurrentGameKey(null);
    setStudentAssignments([]);
    setCompletedMap({});
    setLockMap({});
    sessionStorage.removeItem("studentId");
  }

  function handleOpenAssignments() {
    setScreen("assignments");
  }

  function handleOpenGame(gameKey) {
    setCurrentGameKey(gameKey);
    setScreen("game");
  }

  function handleOpenShop() {
    setScreen("shop");
  }

  useEffect(() => {
    if (!student?.id) return;

    const studentRef = doc(db, "students", String(student.id));

    return onSnapshot(
      studentRef,
      (snap) => {
        if (!snap.exists()) return;
        setStudent((prev) => ({
          ...(prev || {}),
          id: String(student.id),
          ...snap.data(),
        }));
      },
      (error) => {
        console.error("Error watching student document:", error);
      }
    );
  }, [student?.id]);

  useEffect(() => {
    let unsubscribeResults = null;
    let unsubscribeClassroom = null;

    async function loadStudentAssignmentState() {
      setStudentAssignments([]);
      setCompletedMap({});
      setLockMap({});

      if (!student?.grade) return;

      const items = await getAssignmentsForGrade(student.grade);
      setStudentAssignments(items);

      if (!student?.id) return;

      const resultsRef = collection(
        db,
        "students",
        String(student.id),
        "assignmentResults"
      );

      unsubscribeResults = onSnapshot(
        resultsRef,
        (snapshot) => {
          const completed = {};
          snapshot.forEach((docSnap) => {
            const gameKey = docSnap.data()?.gameKey;
            if (gameKey) completed[gameKey] = true;
          });
          setCompletedMap(completed);
        },
        (error) => {
          console.error("Error watching completed assignments:", error);
        }
      );

      const classQ = query(
        collection(db, "classrooms"),
        where("studentID", "array-contains", String(student.id))
      );

      unsubscribeClassroom = onSnapshot(
        classQ,
        (snapshot) => {
          if (!snapshot.empty) {
            const classData = snapshot.docs[0].data();
            const studentLocks =
              classData?.studentAssignments?.[String(student.id)] || {};
            setLockMap(studentLocks);
          } else {
            setLockMap({});
          }
        },
        (error) => {
          console.error("Error watching classroom locks:", error);
        }
      );
    }

    if (student) {
      loadStudentAssignmentState();
    }

    return () => {
      if (unsubscribeResults) unsubscribeResults();
      if (unsubscribeClassroom) unsubscribeClassroom();
    };
  }, [student?.id, student?.grade]);

  const nextAssignment = useMemo(() => {
    if (!studentAssignments.length) return null;

    const firstUnlockedNotCompleted = studentAssignments.find((assignment) => {
      const isLocked = lockMap[assignment.gameKey] === true;
      const isCompleted = completedMap[assignment.gameKey] === true;
      return !isLocked && !isCompleted;
    });

    if (firstUnlockedNotCompleted) return firstUnlockedNotCompleted;

    const firstUnlocked = studentAssignments.find((assignment) => {
      const isLocked = lockMap[assignment.gameKey] === true;
      return !isLocked;
    });

    return firstUnlocked || null;
  }, [studentAssignments, lockMap, completedMap]);

  function handlePlayNextGame() {
    if (!nextAssignment) {
      setScreen("assignments");
      return;
    }

    setCurrentGameKey(nextAssignment.gameKey);
    setScreen("game");
  }

  if (!student && !teacher) {
    return (
      <Login
        onLogin={handleStudentLogin}
        onTeacherLogin={handleTeacherLogin}
      />
    );
  }

  if (teacher) {
    return <TeacherDash teacher={teacher} onLogout={handleLogout} />;
  }

  if (screen === "game") {
    return (
      <GamePage
        gameKey={currentGameKey}
        onFinishReturn={() => {
          setCurrentGameKey(null);
          setScreen("welcome");
        }}
      />
    );
  }

  if (screen === "assignments") {
    return (
      <Assignments
        student={student}
        onBack={() => setScreen("welcome")}
        onOpenGame={handleOpenGame}
      />
    );
  }

  if (screen === "shop") {
    return <Shop student={student} onBack={() => setScreen("welcome")} />;
  }

  return (
    <Welcome
      student={student}
      onPlayGame={handlePlayNextGame}
      onOpenAssignments={handleOpenAssignments}
      onOpenShop={handleOpenShop}
      onLogout={handleLogout}
      nextAssignmentTitle={nextAssignment?.title || null}
      nextAssignmentKey={nextAssignment?.gameKey || null}
    />
  );
}
