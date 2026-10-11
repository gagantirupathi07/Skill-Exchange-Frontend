import { Link } from "react-router-dom";

function AuthTest() {
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
            Find people with complementary skills, build meaningful exchanges,
            schedule learning sessions, and use your earned credits to
            continue growing. Whether you want to improve your technical
            abilities, explore a creative skill, or share your experience with
            someone else, Skill Exchange makes learning more personal,
            practical, and community-driven.
          </p>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card">
          <h2 className="auth-title">
            Authentication Pages
          </h2>

          <p className="auth-subtitle">
            Explore the available authentication pages.
          </p>

          <div className="auth-test-links">
            <Link to="/login" className="auth-button">
              Login
            </Link>

            <Link to="/register" className="auth-secondary-button">
              Register
            </Link>

            <Link to="/forgot-password" className="auth-secondary-button">
              Forgot Password
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AuthTest;