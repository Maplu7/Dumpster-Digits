import React, { useState } from "react";
import "./Login.css";
import { FaUser, FaLock } from "react-icons/fa";
import { loginStudent, loginTeacher } from "../authService";

const Login = ({ onLogin, onTeacherLogin }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (isTeacher) {
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
      <div className="login-container">
        <h1 className="game-title">DUMPSTER DIGITS</h1>

        <div className="login-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="text"
                placeholder="ID Number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
              <FaUser className="icon" />
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock className="icon" />
            </div>

            <div className="button-row">
              <button
                type="submit"
                onClick={() => setIsTeacher(false)}
              >
                Student
              </button>

              <button
                type="submit"
                onClick={() => setIsTeacher(true)}
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