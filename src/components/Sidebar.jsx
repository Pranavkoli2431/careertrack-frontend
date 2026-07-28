import {
  Award,
  BriefcaseBusiness,
  Building2,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigationItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/applications", label: "Applications", icon: BriefcaseBusiness },
  { path: "/profile", label: "Profile", icon: UserRound },
  { path: "/skills", label: "Skills", icon: Wrench },
  { path: "/education", label: "Education", icon: GraduationCap },
  { path: "/experiences", label: "Experience", icon: Building2 },
  { path: "/projects", label: "Projects", icon: FolderKanban },
  { path: "/certifications", label: "Certifications", icon: Award },
];

function Sidebar({ open, onClose, onLogout }) {
  const { user } = useAuth();

  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-header">
        <div>
          <div className="sidebar-brand">CareerTrack</div>
          <p>Career management platform</p>
        </div>

        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={22} />
        </button>
      </div>

      <nav className="sidebar-navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <strong>{user?.fullName || "User"}</strong>
            <span>{user?.email || ""}</span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
