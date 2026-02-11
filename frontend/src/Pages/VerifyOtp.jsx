import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/ForgotPassword.css";
import "../css/OtpInput.css";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const mobile = location.state?.mobile;

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);

  if (!mobile) {
    return <p style={{ color: "white" }}>Invalid access</p>;
  }

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // 👉 auto move to next box
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const verifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      alert("Enter complete OTP");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:8080/api/auth/verify-otp", {
        mobile,
        otp: finalOtp
      });

      navigate("/reset-password-mobile", { state: { mobile } });
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Verify OTP</h2>

      <div className="otp-container">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            maxLength="1"
            className="otp-box"
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </div>

      <button
        onClick={verifyOtp}
        disabled={loading || otp.join("").length !== 6}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
}
