import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await loginUser(formData);

      login(response.token, response.user);

      if (response.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your username and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <section className="auth-brand-section">
        <div className="auth-brand-content">

          <h1 className="auth-brand-title">
            <span>Learn.</span>
            <span>Teach.</span>
            <span className="accent">Exchange.</span>
          </h1>

          <p className="auth-brand-description">
            Skill Exchange is a collaborative learning platform where
            people can <strong>share what they know</strong>, discover
            new skills, and connect with others who want to learn.
            Instead of traditional one-sided learning, the platform
            creates a space where every member can be both a learner
            and a teacher.
          </p>

          <p className="auth-brand-secondary">
            Find people with complementary skills, build meaningful
            exchanges, schedule learning sessions, and use your earned
            credits to continue growing. Whether you want to improve
            your technical abilities, explore a creative skill, or
            simply share your experience with someone else, Skill
            Exchange makes learning more personal, practical, and
            community-driven.
          </p>

        </div>
      </section>

      <section className="auth-form-section">

        <div className="auth-card">

          <h2 className="auth-title">
            Welcome back
          </h2>

          <p className="auth-subtitle">
            Login to continue your learning journey.
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
                Username
              </label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="auth-input"
              />
            </div>

            <div className="auth-forgot">
              <Link
                to="/forgot-password"
                className="auth-link"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <p className="auth-footer">
            <span>Don't have an account?</span>

            <Link
              to="/register"
              className="auth-link"
            >
              Register
            </Link>
          </p>

        </div>

      </section>

    </div>
  );
}

export default Login;