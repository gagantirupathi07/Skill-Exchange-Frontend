import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [imageFailed, setImageFailed] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "My Profile", path: "/profile" },
    { name: "Skills", path: "/skills" },
    { name: "Matches", path: "/matches" },
    { name: "Exchanges", path: "/exchange-requests" },
    { name: "My Exchanges", path: "/my-exchanges" },
    { name: "Credits", path: "/credits" },
  ];

  const displayName =
    user?.firstName?.trim() ||
    user?.username?.trim() ||
    "User";

  const avatarInitial = displayName.charAt(0).toUpperCase();

  const profilePicture =
    typeof user?.profilePicture === "string"
      ? user.profilePicture.trim()
      : "";

  // Reset the fallback whenever the profile picture changes.
  useEffect(() => {
    setImageFailed(false);
  }, [profilePicture]);

  const getProfilePictureUrl = (picture) => {
    if (!picture) {
      return "";
    }

    // Already an absolute URL.
    if (/^https?:\/\//i.test(picture)) {
      return picture;
    }

    // Optional environment variable, e.g. http://localhost:8080/api
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    if (apiBaseUrl) {
      try {
        const baseUrl = new URL(
          apiBaseUrl,
          window.location.origin
        );

        return new URL(picture, baseUrl.origin).href;
      } catch (error) {
        console.error(
          "Invalid API base URL:",
          error
        );
      }
    }

    // If Vite proxies /uploads to Spring Boot, use the path directly.
    return picture.startsWith("/")
      ? picture
      : `/${picture}`;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogoClick = () => {
    navigate("/dashboard");
  };

  return (
    <nav className="app-navbar">
      {/* Logo */}
      <div
        className="app-logo"
        onClick={handleLogoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            handleLogoClick();
          }
        }}
      >
        <img
          src="/favicon.svg"
          alt="Skill Exchange"
          className="app-logo-mark"
        />

        <div className="app-logo-content">
          <span className="app-logo-text">
            Skill Exchange
          </span>

          <span className="app-logo-subtitle">
            Learn • Teach • Exchange
          </span>
        </div>
      </div>

      {/* Navigation links */}
      <div className="navbar-navigation">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* User actions */}
      <div className="navbar-actions">
        <button
          type="button"
          className="navbar-profile"
          onClick={() => navigate("/profile")}
          aria-label={`Open ${displayName}'s profile`}
        >
          {profilePicture && !imageFailed ? (
            <img
              key={profilePicture}
              src={getProfilePictureUrl(profilePicture)}
              alt={`${displayName}'s profile`}
              className="navbar-profile-image"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span
              className="navbar-profile-icon"
              aria-hidden="true"
            >
              {avatarInitial}
            </span>
          )}

          <span className="navbar-profile-name">
            {displayName}
          </span>
        </button>

        <button
          type="button"
          className="navbar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;