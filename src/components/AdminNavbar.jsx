import { NavLink, useNavigate } from "react-router-dom";

const AdminNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <nav className="admin-navbar">
            <div
                className="admin-navbar-brand"
                onClick={() => navigate("/admin/dashboard")}
            >
                <img
                    src="/favicon.svg"
                    alt="Skill Exchange"
                    className="admin-navbar-logo"
                />

                <div className="admin-navbar-brand-text">
                    <span className="admin-navbar-title">
                        Skill Exchange
                    </span>

                    <span className="admin-navbar-subtitle">
                        Admin Panel
                    </span>
                </div>
            </div>

            <div className="admin-navbar-navigation">
                <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                        `admin-navbar-link ${isActive ? "active" : ""}`
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/skills"
                    className={({ isActive }) =>
                        `admin-navbar-link ${isActive ? "active" : ""}`
                    }
                >
                    Skills
                </NavLink>

                <NavLink
                    to="/admin/exchanges"
                    className={({ isActive }) =>
                        `admin-navbar-link ${isActive ? "active" : ""}`
                    }
                >
                    Exchanges
                </NavLink>
            </div>

            <div className="admin-navbar-actions">
                <button
                    type="button"
                    className="admin-navbar-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default AdminNavbar;