import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/ForgotPassword.css";
import { validateField } from "../utils/validation";

export default function ForgotPassword() {
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState("SEND"); // SEND | VERIFY
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();

  /* ================= EMAIL (UNCHANGED) ================= */
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError(validateField("email", value));
  };

  const handleEmailBlur = () => {
    setTouched(true);
    setError(validateField("email", email));
  };

  /* ================= MOBILE ================= */
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setMobile(value);
    setError(value.length !== 10 ? "Enter valid mobile number" : "");
  };

  const handleMobileBlur = () => {
    setTouched(true);
    setError(mobile.length !== 10 ? "Enter valid mobile number" : "");
  };

  /* ================= SEND OTP / EMAIL ================= */
  const submit = async () => {
    try {
      setLoading(true);

      if (method === "email") {
        const err = validateField("email", email);
        if (err) {
          setError(err);
          setTouched(true);
          return;
        }

        await axios.post("http://localhost:8080/api/auth/forgot-password", {
          email,
        });

        alert("Reset password link sent to your email");
        navigate("/login");
      }

      // MOBILE OTP SEND
      else {
        if (mobile.length !== 10) {
          setError("Enter valid mobile number");
          return;
        }

        await axios.post(
          "http://localhost:8080/api/auth/forgot-password/mobile",
          { mobile }
        );

        setStep("VERIFY");
        setCooldown(60);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
    try {
      setLoading(true);

      await axios.post("http://localhost:8080/api/auth/verify-otp", {
        mobile,
        otp,
      });

      navigate("/reset-password-mobile", { state: { mobile } });
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const resendOtp = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/resend-otp", {
        mobile,
      });
      setCooldown(60);
    } catch (err) {
      alert(err.response?.data?.message || "Please wait");
    }
  };

  /* ================= COOLDOWN TIMER ================= */
  useEffect(() => {
    if (cooldown > 0) {
      const t = setInterval(() => {
        setCooldown((c) => c - 1);
      }, 1000);
      return () => clearInterval(t);
    }
  }, [cooldown]);

  /* ================= UI ================= */
  return (
    <div className="auth-card">
      <h2>Forgot Password</h2>

      {/* METHOD TOGGLE */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <button
          className={method === "email" ? "active" : ""}
          onClick={() => {
            setMethod("email");
            setStep("SEND");
          }}
        >
          Email
        </button>
        <button
          className={method === "mobile" ? "active" : ""}
          onClick={() => {
            setMethod("mobile");
            setStep("SEND");
          }}
        >
          Mobile
        </button>
      </div>

      {/* EMAIL INPUT */}
      {method === "email" && (
        <input
          type="email"
          placeholder="Registered email"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
        />
      )}

      {/* MOBILE INPUT */}
      {method === "mobile" && step === "SEND" && (
        <input
          type="tel"
          className="mobile-input"
          placeholder="Registered mobile number"
          value={mobile}
          onChange={handleMobileChange}
          onBlur={handleMobileBlur}
        />
      )}

      {/* OTP INPUT */}
      {method === "mobile" && step === "VERIFY" && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />

          <button onClick={verifyOtp} disabled={loading || otp.length !== 6}>
            Verify OTP
          </button>

          <button
            onClick={resendOtp}
            disabled={cooldown > 0}
            style={{ marginTop: "10px" }}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
          </button>
        </>
      )}

      {touched && error && <p className="error-text">{error}</p>}

      {/* SEND BUTTON */}
      {step === "SEND" && (
        <button
          onClick={submit}
          disabled={loading || !!error || (!email && !mobile)}
        >
          {loading
            ? "Sending..."
            : method === "email"
            ? "Send Reset Link"
            : "Send OTP"}
        </button>
      )}
    </div>
  );
}
