import React, { useState } from "react";
import "./Login.css";
import { FaUser, FaLock } from "react-icons/fa";
import { loginStudent, loginTeacher } from "../authService";
import CampfireScene from "../components/CampfireScene";

const Login = ({ onLogin, onTeacherLogin }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [fireBoost, setFireBoost] = useState(0);
  const [loginMode, setLoginMode] = useState("student"); // "student" | "teacher"

  function pulseFire() {
    setFireBoost((n) => n + 1);
  }

  async function handleStudentSubmit(e) {
    e?.preventDefault?.();
    pulseFire();
    setMsg("Logging in as student...");

    try {
      const { student } = await loginStudent(userId, password);
      setMsg("");
      onLogin(student);
    } catch (error) {
      console.error("Student login failed:", error);
      setMsg(error.message || "Student login failed.");
    }
  }

  async function handleTeacherSubmit(e) {
    e?.preventDefault?.();
    pulseFire();
    setMsg("Logging in as teacher...");

    try {
      const { teacher } = await loginTeacher(userId, password);
      setMsg("");
      onTeacherLogin(teacher);
    } catch (error) {
      console.error("Teacher login failed:", error);
      setMsg(error.message || "Teacher login failed.");
    }
  }

  async function handleFormSubmit(e) {
    if (loginMode === "teacher") {
      await handleTeacherSubmit(e);
    } else {
      await handleStudentSubmit(e);
    }
  }

  return (
    <div className="login-page">
      <CampfireScene boost={fireBoost} />

      <div className="login-wrapper">
        <form onSubmit={handleFormSubmit}>
          <h1 className="login-title">Login</h1>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "18px",
            }}
          >
            <button
              type="button"
              onClick={() => setLoginMode("student")}
              style={{
                flex: 1,
                opacity: loginMode === "student" ? 1 : 0.7,
                outline: loginMode === "student" ? "2px solid #ffe7b4" : "none",
              }}
            >
              Student
            </button>

            <button
              type="button"
              onClick={() => setLoginMode("teacher")}
              style={{
                flex: 1,
                opacity: loginMode === "teacher" ? 1 : 0.7,
                outline: loginMode === "teacher" ? "2px solid #ffe7b4" : "none",
              }}
            >
              Teacher
            </button>
          </div>

          <div className="input-box">
            <input
              type="text"
              placeholder={
                loginMode === "teacher" ? "Teacher ID" : "Student ID"
              }
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder={
                loginMode === "teacher"
                  ? "Teacher Password"
                  : "Birthday (MMDD)"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FaLock className="icon" />
          </div>

          <button type="submit" style={{ marginBottom: "12px" }}>
            {loginMode === "teacher" ? "Teacher Login" : "Student Login"}
          </button>

          {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;