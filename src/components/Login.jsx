import React, { useState } from "react";
import "./Login.css";
import { FaUser, FaLock } from "react-icons/fa";
import { loginStudent } from "../authService";

const Login = ({ onLogin }) => {
  const [studentId, setStudentId] = useState("");
  const [birthday, setBirthday] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("Logging in...");

    try {
      const { student } = await loginStudent(studentId, birthday);
      setMsg("");
      onLogin(student);
    } catch (error) {
      console.error("Login failed:", error);
      setMsg("Student ID or password incorrect. Have the teacher check ID/password.");
    }
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <form onSubmit={handleSubmit}>
          <h1 className="login-title">Login</h1>

          <div className="input-box">
            <input
              type="text"
              placeholder="ID number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Birthday (MMDD)"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
              inputMode="numeric"
              maxLength={4}
            />
            <FaLock className="icon" />
          </div>

          <button type="submit">Let's Play!</button>

          {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;