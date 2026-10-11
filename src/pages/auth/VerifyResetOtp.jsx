import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyResetOtp } from "../../api/authApi";
import "../../styles/auth.css";

function VerifyResetOtp() {
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await verifyResetOtp({
        email,
        otp,
      });

      localStorage.setItem("resetOtp", otp);

      navigate("/reset-password");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
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
            Protect your Skill Exchange account and get back to learning.
            Verify your identity using the OTP sent to your registered email
            address, then create a new password and continue your learning
            journey securely.
          </p>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card">
          <h1 className="auth-title">
            Verify Reset OTP
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

          <form
            onSubmit={handleSubmit}
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
        </div>
      </section>
    </div>
  );
}

export default VerifyResetOtp;