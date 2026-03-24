// src/App.jsx
import { useState } from "react";
import Login from "./components/Login.jsx";
import Welcome from "./components/Welcome.jsx";
import GamePage from "./components/GamePage.jsx";
import "./App.css";

export default function App() {
  const [student, setStudent] = useState(null);
  const [screen, setScreen] = useState("login"); // login | welcome | game

  function handleLogin(s) {
    setStudent(s);
    setScreen("welcome");
  }

  function handleLogout() {
    setStudent(null);
    setScreen("login");
  }

  // not logged in yet
  if (!student) {
    return <Login onLogin={handleLogin} />;
  }

  // logged in, playing the game
  if (screen === "game") {
    return <GamePage onBack={() => setScreen("welcome")} />;
  }

  // logged in, on welcome screen
  return (
    <Welcome
      student={student}
      onPlayGame={() => setScreen("game")}
      onLogout={handleLogout}
    />
  );
}
