import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListChecks, CalendarDays, Brain, BarChart3, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Logo from "./Logo.jsx";

export default function MobileNav() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  return (
    <>
      <div className="md:hidden sticky top-0 z-20 glass border-b divider px-4 py-3 flex items-center justify-between">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo size={28} />
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--text)", fontSize: "1rem" }}>YouThrive</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="p-2 rounded-lg text-soft hover:bg-[var(--surface-hover)]">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#8B162B", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem" }}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <button onClick={logout} className="p-2 rounded-lg text-soft hover:bg-[var(--surface-hover)]">
            <LogOut size={16} />
          </button>
        </div>
      </div>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 glass border-t divider flex justify-around py-2">
        {[
          { to: "/dashboard", label: "Home",    icon: LayoutDashboard },
          { to: "/habits",    label: "Habits",  icon: ListChecks },
          { to: "/weekly",    label: "Weekly",  icon: CalendarDays },
          { to: "/insights",  label: "Insights",icon: Brain },
          { to: "/stats",     label: "Stats",   icon: BarChart3 },
        ].map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs ${isActive ? "font-semibold" : "text-faint"}`}
            style={({ isActive }) => isActive ? { color: "#8B162B" } : {}}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
