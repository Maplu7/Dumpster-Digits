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
  const [loginMode, setLoginMode] = useState("student");

  function pulseFire() {
    setFireBoost((n) => n + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    pulseFire();

    if (loginMode === "teacher") {
      setMsg("Logging in as teacher...");

      try {
        const { teacher } = await loginTeacher(userId, password);
        setMsg("");
        onTeacherLogin(teacher);
      } catch (error) {
        console.error("Teacher login failed:", error);
        setMsg(error.message || "Teacher login failed.");
      }
    } else {
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
  }

  return (
    <div className="login-page">
      <CampfireScene boost={fireBoost} />

      <div className="login-container">
        <h1 className="game-title">DUMPSTER DIGITS</h1>

        <div className="login-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="text"
                placeholder={loginMode === "teacher" ? "Teacher ID" : "Student ID"}
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

            <div className="button-row">
              <button
                type="submit"
                onClick={() => setLoginMode("student")}
                className={loginMode === "student" ? "active" : ""}
              >
                Student
              </button>

              <button
                type="submit"
                onClick={() => setLoginMode("teacher")}
                className={loginMode === "teacher" ? "active" : ""}
              >
                Teacher
              </button>
            </div>

            {msg && <p className="login-msg">{msg}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;