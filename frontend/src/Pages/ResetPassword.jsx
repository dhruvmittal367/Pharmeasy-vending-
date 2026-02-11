import { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../css/ResetPassword.css";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const resetPassword = async () => {

    // 🔴 EMPTY CHECK
    if (!password) {
      alert("Password required");
      return;
    }

    // 🔐 STRONG PASSWORD VALIDATION
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,20}$/;

    if (!passwordRegex.test(password)) {
      alert(
        "Password must be 8+ characters and include uppercase, lowercase, number & special character"
      );
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:8080/api/auth/reset-password", {
        token,
        newPassword: password
      });

      alert("Password reset successful");
      navigate("/login");

    } catch (err) {
      alert("Invalid or expired reset link");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-card">
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={resetPassword} disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </div>
  );
}
