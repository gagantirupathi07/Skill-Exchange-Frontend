import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/authApi";
import "../../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
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
      const response = await registerUser(formData);

      console.log("Registration response:", response);

      localStorage.setItem("pendingEmail", formData.email);

      navigate("/verify-otp");
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData?.errors) {
        setError(
          Object.values(responseData.errors).join(", ")
        );
      } else {
        setError(
          responseData?.message ||
            "Registration failed. Please check your details."
        );
      }
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
            Create your account and become part of a community where everyone
            has something valuable to teach and something new to learn.
            Connect with people who share your interests, exchange skills,
            schedule learning sessions, and turn your knowledge into
            meaningful learning experiences.
          </p>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card auth-card-wide">
          <h1 className="auth-title">
            Create your account
          </h1>

          <p className="auth-subtitle">
            Join Skill Exchange and start learning from the community.
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
                placeholder="Enter username"
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                First Name
              </label>

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter first name"
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Last Name
              </label>

              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter last name"
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Bio
              </label>

              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Tell us something about yourself"
                className="auth-textarea"
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
                placeholder="Create password"
                className="auth-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?

            <Link
              to="/login"
              className="auth-link"
            >
              Login
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Register;