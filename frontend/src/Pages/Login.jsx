import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../css/Login.css";

function Login() {

  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
        alert("Username & password required");
        return;
      }

    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        username,
        password,
      });

      const { token, role, username: loggedInUser } = res.data;

          localStorage.setItem("token", token);
          localStorage.setItem("role", role);
          localStorage.setItem("username", loggedInUser);

          setMessage("Login successful");

          // 🔁 ROLE BASED REDIRECT
          if (role === "ADMIN") {
            navigate("/dashboard");
          }
          else if (role === "DOCTOR") {
            navigate("/Doctor/dashboard");
          }
          else if (role === "MACHINE_ADMIN") {
            navigate("/machine/dashboard");
          }
          else {
            navigate("/");
          }
          // 🔥 SUCCESS PART ENDS HERE

        } catch (err) {
          setMessage("Login failed");
        }
      };

  return (
    <div className="login-container">
        <div className="login-card">
          <h2>Admin Login</h2>

          <form onSubmit={handleLogin}>
            <input
              className="login-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
             <div className="password-wrapper"> {/* ✅ NEW */}
                        <input
                          className="login-input"
                          type={showPassword ? "text" : "password"} // ✅ CHANGE
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />

                        <span
                          className="toggle-password" // ✅ NEW
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>

                      <button className="login-button" type="submit">
                        Login
                      </button>
                    </form>
          {/* Forgot Password */}
                  <p
                    className="forgot-password"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot Password?
                  </p>

          <p className="login-message">{message}</p>
        </div>
      </div>
  );
}

export default Login;
