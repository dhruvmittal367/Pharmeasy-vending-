import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/ForgotPassword.css"; // same UI reuse

export default function ResetPasswordMobile() {
  const navigate = useNavigate();
  const location = useLocation();

  const mobile = location.state?.mobile;

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔴 SAFETY CHECK
  if (!mobile) {
    return <p style={{ color: "white" }}>Invalid access</p>;
  }

  const submit = async () => {
    try {
      setLoading(true);
      await axios.post(
        "http://localhost:8080/api/auth/reset-password/mobile",
        {
          mobile,
          newPassword: password
        }
      );
      alert("Password reset successful");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
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
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={submit} disabled={loading || !password}>
        {loading ? "Updating..." : "Reset Password"}
      </button>
    </div>
  );
}
