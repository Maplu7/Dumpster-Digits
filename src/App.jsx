import { useState } from "react";
import Login from "./components/Login.jsx";
import Welcome from "./components/Welcome.jsx";
import GamePage from "./components/GamePage.jsx";
import TeacherDash from "./components/TeacherDash.jsx";
import "./App.css";

export default function App() {
  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [screen, setScreen] = useState("login");

  function handleStudentLogin(studentData) {
    setStudent(studentData);
    setTeacher(null);
    setScreen("welcome");
  }

  function handleTeacherLogin(teacherData) {
    setTeacher(teacherData);
    setStudent(null);
    setScreen("teacher");
  }

  function handleLogout() {
    setStudent(null);
    setTeacher(null);
    setScreen("login");
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
    return <GamePage onBack={() => setScreen("welcome")} />;
  }

  return (
    <Welcome
      student={student}
      onPlayGame={() => setScreen("game")}
      onLogout={handleLogout}
    />
  );
}
