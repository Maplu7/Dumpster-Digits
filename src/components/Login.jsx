import React, { useState } from "react";
import "./Login.css";
import { FaUser, FaLock } from "react-icons/fa";
import { loginStudent, loginTeacher } from "../authService";

const Login = ({ onLogin, onTeacherLogin }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleStudentSubmit(e) {
    e.preventDefault();
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

  async function handleTeacherSubmit() {
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

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <form onSubmit={handleStudentSubmit}>
          <h1 className="login-title">Login</h1>

          <div className="input-box">
            <input
              type="text"
              placeholder="Student ID or Teacher ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Birthday (MMDD) or Teacher Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FaLock className="icon" />
          </div>

          <button type="submit" style={{ marginBottom: "12px" }}>
            Student Login
          </button>

          <button type="button" onClick={handleTeacherSubmit}>
            Teacher Login
          </button>

          {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;