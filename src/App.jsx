import { useState } from "react";
import Login from "./components/Login.jsx";
import Welcome from "./components/Welcome.jsx";
import Assignments from "./components/Assignments.jsx";
import GamePage from "./components/GamePage.jsx";
import TeacherDash from "./components/TeacherDash.jsx";
import Shop from "./components/Shop.jsx";
import "./App.css";

export default function App() {
  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [screen, setScreen] = useState("login");
  const [currentGameKey, setCurrentGameKey] = useState(null);

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
        onBack={() => setScreen("assignments")}
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
    return <Shop onBack={() => setScreen("welcome")} />;
  }

  return (
    <Welcome
      student={student}
      onPlayGame={() => handleOpenGame("1st_addition")}
      onOpenAssignments={handleOpenAssignments}
      onOpenShop={handleOpenShop}
      onLogout={handleLogout}
    />
  );
}