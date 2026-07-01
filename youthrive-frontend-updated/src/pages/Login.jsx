import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Logo from "../components/Logo.jsx";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../utils/demo.js";

export default function Login() {
  const { user, login } = useAuth();
  const { theme, toggle } = useTheme();
  const loc = useLocation();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await login(email, password); navigate(loc.state?.from || "/dashboard", { replace: true }); }
    catch (e) { setErr(e.response?.data?.message || "Login failed"); }
    finally { setLoading(false); }
  };

  const tryDemo = async () => {
    setErr(""); setDemoLoading(true);
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setErr("Couldn't load the demo. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-base)" }}>
      {/* Decorative blobs */}
      <div style={{ position: "fixed", top: -80, left: -80, width: 260, height: 260, borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%", background: "#F9B6B8", opacity: 0.35, zIndex: 0, animation: "blob-morph 8s ease-in-out infinite" }} />
      <div style={{ position: "fixed", bottom: -60, right: -60, width: 200, height: 200, borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", background: "#BAD2E8", opacity: 0.3, zIndex: 0, animation: "blob-morph 11s ease-in-out 2s infinite reverse" }} />

      <button onClick={toggle} className="fixed top-4 right-4 p-2.5 rounded-xl glass" style={{ zIndex: 10 }}>
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: "2rem", textDecoration: "none" }}>
          <Logo size={40} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--text)", fontWeight: 900, letterSpacing: "-0.02em" }}>YouThrive</span>
        </Link>
        <div className="card" style={{ padding: "2.5rem", border: "3px solid rgba(139,22,43,0.18)", boxShadow: "6px 6px 0 rgba(139,22,43,0.12)" }}>
          <h1 className="display-md" style={{ color: "var(--text)", marginBottom: 6 }}>Welcome back 👋</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "1.75rem", fontWeight: 500 }}>Log in to continue your streaks.</p>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {err && <div style={{ fontSize: "0.9rem", color: "#8B162B", background: "#fef2f2", border: "2px solid #F9B6B8", borderRadius: "1rem", padding: "0.75rem 1rem", fontWeight: 600 }}>{err}</div>}
            <button type="submit" className="btn-primary" style={{ padding: "0.875rem", marginTop: 4 }} disabled={loading || demoLoading}>
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(139,22,43,0.15)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(139,22,43,0.15)" }} />
          </div>

          <button
            type="button"
            onClick={tryDemo}
            className="btn-secondary"
            disabled={loading || demoLoading}
            style={{ width: "100%", padding: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <Sparkles size={16} />
            {demoLoading ? "Loading demo…" : "Try the demo"}
          </button>
          <p style={{ textAlign: "center", marginTop: "0.6rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            No sign-up needed — explore YouThrive with sample habits & streaks.
          </p>
          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#8B162B", fontWeight: 800, textDecoration: "none" }}>Create one ✨</Link>
          </p>
        </div>
      </div>
    </div>
  );
}