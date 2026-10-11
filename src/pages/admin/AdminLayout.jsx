import { Outlet } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin.css";

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <AdminNavbar />

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;