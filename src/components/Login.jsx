import React, { useState } from "react";
import "./Login.css";
import { FaUser, FaLock } from "react-icons/fa";
import { loginStudent, loginTeacher } from "../authService";
import CampfireScene from "../components/CampfireScene";

const Login = ({ onLogin, onTeacherLogin }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const [loginMode, setLoginMode] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const [enterFlash, setEnterFlash] = useState(false);
  const [fireBoost, setFireBoost] = useState(0);

  function pulseFire(strength = 1) {
    setFireBoost((n) => n + strength);
  }

  function triggerEnterEffects() {
    setEnterFlash(true);
    pulseFire(2);

    window.clearTimeout(triggerEnterEffects._timer);
    triggerEnterEffects._timer = window.setTimeout(() => {
      setEnterFlash(false);
    }, 260);
  }

  async function handleStudentLogin() {
    if (isLoading) return;

    pulseFire();
    setMsg("Logging in as student...");
    setIsLoading(true);

    try {
      const { student } = await loginStudent(userId, password);
      setMsg("");
      onLogin(student);
    } catch (error) {
      console.error("Student login failed:", error);
      setMsg(error.message || "Student login failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTeacherLogin() {
    if (isLoading) return;

    pulseFire();
    setMsg("Logging in as teacher...");
    setIsLoading(true);

    try {
      const { teacher } = await loginTeacher(userId, password);
      setMsg("");
      onTeacherLogin(teacher);
    } catch (error) {
      console.error("Teacher login failed:", error);
      setMsg(error.message || "Teacher login failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;

    triggerEnterEffects();

    if (loginMode === "teacher") {
      await handleTeacherLogin();
    } else {
      await handleStudentLogin();
    }
  }

  function handleInputKeyDown(e) {
    if (e.key === "Enter") {
      handleSubmit(e);
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
                placeholder={
                  loginMode === "teacher" ? "Teacher ID" : "Student ID"
                }
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={handleInputKeyDown}
                required
                disabled={isLoading}
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
                onKeyDown={handleInputKeyDown}
                required
                disabled={isLoading}
              />
              <FaLock className="icon" />
            </div>

            <div className="button-row">
              <button
                type="button"
                onClick={async () => {
                  if (isLoading) return;
                  setLoginMode("student");
                  triggerEnterEffects();
                  await handleStudentLogin();
                }}
                className={[
                  loginMode === "student" ? "active" : "",
                  enterFlash && loginMode === "student" ? "enter-flash" : "",
                ]
                  .join(" ")
                  .trim()}
                disabled={isLoading}
              >
                Student
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (isLoading) return;
                  setLoginMode("teacher");
                  triggerEnterEffects();
                  await handleTeacherLogin();
                }}
                className={[
                  loginMode === "teacher" ? "active" : "",
                  enterFlash && loginMode === "teacher" ? "enter-flash" : "",
                ]
                  .join(" ")
                  .trim()}
                disabled={isLoading}
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