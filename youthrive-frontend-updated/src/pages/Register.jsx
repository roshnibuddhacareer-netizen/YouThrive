import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Logo from "../components/Logo.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const { theme, toggle }  = useTheme();
  const navigate = useNavigate();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr]           = useState("");
  const [loading, setLoading]   = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await register(name, email, password); navigate("/dashboard", { replace: true }); }
    catch (e) { setErr(e.response?.data?.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-base)" }}>
      <div style={{ position: "fixed", top: -80, right: -80, width: 260, height: 260, borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%", background: "#BAD2E8", opacity: 0.35, zIndex: 0, animation: "blob-morph 9s ease-in-out infinite" }} />
      <div style={{ position: "fixed", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", background: "#F9B6B8", opacity: 0.3, zIndex: 0, animation: "blob-morph 12s ease-in-out 1s infinite reverse" }} />

      <button onClick={toggle} className="fixed top-4 right-4 p-2.5 rounded-xl glass" style={{ zIndex: 10 }}>
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: "2rem", textDecoration: "none" }}>
          <Logo size={40} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--text)", fontWeight: 900, letterSpacing: "-0.02em" }}>YouThrive</span>
        </Link>
        <div className="card" style={{ padding: "2.5rem", border: "3px solid rgba(139,22,43,0.18)", boxShadow: "6px 6px 0 rgba(139,22,43,0.12)" }}>
          <h1 className="display-md" style={{ color: "var(--text)", marginBottom: 6 }}>Start your journey 🌱</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "1.75rem", fontWeight: 500 }}>Create your account and build your first habit today.</p>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="label">Your name</label>
              <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" required autoFocus />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a strong password" required />
            </div>
            {err && <div style={{ fontSize: "0.9rem", color: "#8B162B", background: "#fef2f2", border: "2px solid #F9B6B8", borderRadius: "1rem", padding: "0.75rem 1rem", fontWeight: 600 }}>{err}</div>}
            <button type="submit" className="btn-primary" style={{ padding: "0.875rem", marginTop: 4 }} disabled={loading}>
              {loading ? "Creating account…" : "Create my account 🎉"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#8B162B", fontWeight: 800, textDecoration: "none" }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
