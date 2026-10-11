import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../../api/authApi";
import "../../styles/auth.css";

function VerifyOtp() {
  const navigate = useNavigate();

  const email = localStorage.getItem("pendingEmail");

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await verifyOtp({
        email,
        otp,
      });

      localStorage.removeItem("pendingEmail");

      setMessage("Email verified successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");

    try {
      await resendOtp({ email });

      setMessage(
        "A new OTP has been sent to your email."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to resend OTP."
      );
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-brand-section">
        <div className="auth-brand-content">
          <h1 className="auth-brand-heading">
            <span>Learn.</span>
            <span>Teach.</span>
            <span className="auth-brand-gradient">Exchange.</span>
          </h1>

          <p className="auth-brand-description">
            Skill Exchange is a collaborative learning platform where people
            can share what they know, discover new skills, and connect with
            others who want to learn. Instead of traditional one-sided
            learning, the platform creates a space where every member can be
            both a learner and a teacher.
          </p>

          <p className="auth-brand-secondary">
            Your account is almost ready. Verify your email address to safely
            join the Skill Exchange community and start discovering people,
            exchanging knowledge, scheduling learning sessions, and building
            new skills through meaningful connections.
          </p>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card">
          <h1 className="auth-title">
            Verify Email
          </h1>

          <p className="auth-subtitle">
            Enter the OTP sent to
            <br />
            <span className="auth-email">
              {email}
            </span>
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          <form
            onSubmit={handleVerify}
            className="auth-form"
          >
            <div className="auth-field">
              <label className="auth-label">
                OTP
              </label>

              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="auth-input auth-otp-input"
                placeholder="Enter OTP"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <button
            onClick={handleResend}
            className="auth-secondary-button"
          >
            Resend OTP
          </button>
        </div>
      </section>
    </div>
  );
}

export default VerifyOtp;