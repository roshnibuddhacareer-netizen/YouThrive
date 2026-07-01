import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListChecks, CalendarDays, Brain, BarChart3, LogOut, Settings, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Modal from "./Modal.jsx";
import Logo from "./Logo.jsx";
import api from "../api/axios.js";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/habits",    label: "Habits",    icon: ListChecks },
  { to: "/weekly",    label: "Weekly",    icon: CalendarDays },
  { to: "/insights",  label: "Insights",  icon: Brain },
  { to: "/stats",     label: "Statistics",icon: BarChart3 },
];

export default function Navbar() {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggle } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [morning, setMorning] = useState(user?.morningMotivation || false);
  const [name, setName]       = useState(user?.name || "");
  const [saving, setSaving]   = useState(false);

  const save = async () => {
  setSaving(true);
  try {
    const res = await api.put("/auth/update-profile", { name, morningMotivation: morning });
    const { token, ...userData } = res.data;
    updateUser(res.data);
    setSettingsOpen(false);
  } finally { setSaving(false); }
};

  return (
    <header className="hidden md:block fixed inset-x-0 top-0 z-30 glass border-b divider">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Logo size={32} />
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1.15rem", color: "var(--text)" }}>
            YouThrive
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                  isActive ? "text-white" : "text-soft hover:bg-[var(--surface-hover)]"
                }`
              }
              style={({ isActive }) => isActive ? { background: "#8B162B" } : {}}
            >
              <Icon size={15} />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
          <button onClick={toggle} className="btn-ghost p-2.5" title={theme === "dark" ? "Light mode" : "Dark mode"}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn-ghost p-2.5" onClick={() => setSettingsOpen(true)} title="Settings">
            <Settings size={16} />
          </button>
          <div style={{ width: 1, height: 24, background: "var(--divider)", margin: "0 4px" }} />
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#8B162B", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <button onClick={logout} className="btn-ghost p-2.5" title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Settings">
        <div className="space-y-4">
          <div>
            <label className="label">Display name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <label className="flex items-start gap-3 p-3 rounded-xl glass cursor-pointer hover:bg-[var(--surface-hover)]">
            <input type="checkbox" checked={morning} onChange={(e) => setMorning(e.target.checked)} className="mt-1 accent-brand-600" />
            <div>
              <div className="text-sm font-medium">Morning motivation</div>
              <div className="text-xs text-faint">Show a short motivational message every morning on the dashboard.</div>
            </div>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setSettingsOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
