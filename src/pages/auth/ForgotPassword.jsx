import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../../api/authApi";
import "../../styles/auth.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await forgotPassword({ email });

      localStorage.setItem("resetEmail", email);

      navigate("/verify-reset-otp");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to process request."
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
            Keep your learning journey moving forward by reconnecting with
            your account. Recover your access securely and continue
            discovering people, exchanging knowledge, and developing the
            skills that matter to you.
          </p>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card">
          <h1 className="auth-title">
            Forgot Password
          </h1>

          <p className="auth-subtitle">
            Enter your email to reset your password.
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
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          <p className="auth-footer">
            <Link
              to="/login"
              className="auth-link"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;