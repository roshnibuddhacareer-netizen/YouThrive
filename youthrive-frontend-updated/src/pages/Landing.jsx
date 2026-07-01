import { Link, Navigate } from "react-router-dom";
import { Flame, CheckCircle2, ArrowRight, Sun, Moon, Sparkles, BarChart3 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import OrbitingHabits from "../components/OrbitingHabits.jsx";
import Logo from "../components/Logo.jsx";

/* ── 3D tilt hook ── */
function use3DTilt(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(8px)`;
      el.style.boxShadow = `${-x * 18}px ${y * 18}px 40px rgba(139,22,43,0.18), 0 8px 32px rgba(139,22,43,0.12)`;
    };
    const onLeave = () => {
      el.style.transform = "perspective(700px) rotateY(0deg) rotateX(0deg) translateZ(0)";
      el.style.boxShadow = "";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);
}

/* ── Wobbly SVG blob ── */
function Blob({ color, style, className }) {
  return (
    <div className={`blob ${className || ""}`} style={{
      background: color,
      position: "absolute",
      borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
      ...style,
    }} />
  );
}

/* ── Decorative asterisk ── */
function Star({ color, size = 48, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ position: "absolute", ...style }} fill="none">
      {[0,45,90,135].map(a => (
        <rect key={a} x="21" y="4" width="6" height="40" rx="3" fill={color}
          transform={`rotate(${a} 24 24)`} />
      ))}
    </svg>
  );
}

/* ── Squiggle ── */
function Squiggle({ color, style }) {
  return (
    <svg width="60" height="120" viewBox="0 0 60 120" style={{ position: "absolute", ...style }} fill="none">
      <path d="M30 5 C55 20 5 40 30 60 C55 80 5 100 30 115" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Floating 3D habit card ── */
function HabitCard3D({ emoji, name, done, streak, delay }) {
  const ref = useRef();
  use3DTilt(ref);
  return (
    <div ref={ref} style={{
      display: "flex", alignItems: "center", gap: "0.75rem",
      padding: "0.75rem 1rem", borderRadius: "1rem",
      background: done ? "rgba(139,22,43,0.08)" : "rgba(255,255,255,0.8)",
      border: `2px solid ${done ? "rgba(139,22,43,0.25)" : "rgba(0,0,0,0.08)"}`,
      cursor: "default",
      transition: "transform 0.12s ease, box-shadow 0.12s ease",
      animation: `float-slow ${4 + delay * 0.5}s ease-in-out ${-delay}s infinite`,
    }}>
      <span style={{ fontSize: "1.2rem" }}>{emoji}</span>
      <span style={{ flex: 1, fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>{name}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.8rem", color: "var(--text-faint)" }}>
        <Flame size={11} style={{ color: "#F37521" }} />{streak}d
      </span>
      <span style={{
        width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: done ? "#8B162B" : "transparent",
        border: done ? "none" : "2px solid rgba(139,22,43,0.3)",
        color: "white",
      }}>
        {done && <CheckCircle2 size={14} />}
      </span>
    </div>
  );
}

const TICKER = ["✅ Daily tracking", "🔥 Streak recovery", "📊 Beautiful stats", "🧠 Weekly reports", "💧 Habit coaching", "⭐ 28-day streaks", "🏃 Morning runs", "📚 Read every day"];

const features = [
  { emoji: "✅", title: "Daily habit tracking", desc: "One-tap check-offs, progress rings, streaks, and a 90-day heatmap.", color: "#F9B6B8", dark: "#8B162B" },
  { emoji: "🧠", title: "Weekly insights",      desc: "Weekly reports on what worked, what struggled, and what to focus on next.", color: "#BAD2E8", dark: "#1a4a6e" },
  { emoji: "🔥", title: "Streak recovery",      desc: "When a streak breaks, get a gentle 3-day comeback plan to get back on track.", color: "#F6F3CF", dark: "#7a6800" },
  { emoji: "📊", title: "Beautiful statistics", desc: "See patterns across days, weeks and categories, with a smart chat built right in.", color: "#C6B63B22", dark: "#5a5200" },
];

export default function Landing() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const heroRef = useRef();
  const ctaRef  = useRef();
  use3DTilt(heroRef);
  use3DTilt(ctaRef);
  if (user) return <Navigate to="/dashboard" replace />;

  const tickerItems = [...TICKER, ...TICKER];

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-sans)", overflowX: "hidden" }}>

      {/* ── ANNOUNCEMENT BAR ── */}
      <div style={{ background: "#8B162B", color: "white", textAlign: "center", padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em" }}>
        🎉 SMALL DAILY WINS BUILD THE LIFE YOU WANT
      </div>

      {/* ── HEADER ── */}
      <header style={{ background: "rgba(246,243,207,0.92)", borderBottom: "2px solid rgba(139,22,43,0.12)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--text)", fontWeight: 900, letterSpacing: "-0.02em" }}>
              YouThrive
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <button onClick={toggle} className="btn-ghost p-2.5" aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="btn-ghost" style={{ fontSize: "1rem" }}>Log in</Link>
            <Link to="/register" className="btn-primary" style={{ fontSize: "0.95rem" }}>Join YouThrive ✨</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: "relative", padding: "5rem 1.5rem 4rem", overflow: "hidden" }}>
        {/* Decorative blobs */}
        <Blob color="#F9B6B8" style={{ width: 280, height: 280, top: -60, left: -80, opacity: 0.5 }} />
        <Blob color="#BAD2E8" style={{ width: 200, height: 200, top: 40, right: -60, opacity: 0.45 }} className="blob-b" />
        <Blob color="#C6B63B" style={{ width: 140, height: 140, bottom: 20, left: "30%", opacity: 0.25 }} />
        <Star color="#F9B6B8" size={56} style={{ top: 60, right: "12%", opacity: 0.7, animation: "wiggle 3s ease-in-out infinite" }} />
        <Star color="#BAD2E8" size={36} style={{ bottom: 80, left: "8%", opacity: 0.6, animation: "wiggle 4s ease-in-out 1s infinite" }} />
        <Squiggle color="#F9B6B8" style={{ left: "5%", top: "20%", opacity: 0.6, animation: "wiggle 5s ease-in-out infinite" }} />

        <div className="max-w-5xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>

            {/* Left copy */}
            <div style={{ animation: "fade-in 0.6s ease-out" }}>
              <div className="chip" style={{ marginBottom: "1.5rem", fontSize: "0.9rem", background: "#F9B6B8", color: "#8B162B", border: "2px solid #8B162B" }}>
                <Sparkles size={13} /> Your habits. Your way.
              </div>
              <h1 className="display-xl" style={{ color: "var(--text)", marginBottom: "1.5rem" }}>
                Build habits
                <br />
                that{" "}
                <em style={{ color: "#8B162B", fontStyle: "italic", textDecoration: "underline", textDecorationColor: "#F9B6B8", textDecorationThickness: 4 }}>actually</em>
                <br />
                stick.
              </h1>
              <p style={{ fontSize: "1.15rem", lineHeight: 1.7, color: "var(--text-muted)", maxWidth: 400, marginBottom: "2rem", fontWeight: 500 }}>
                Track what matters, watch your streaks grow, and get encouragement that's built around your real progress, not generic advice.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link to="/register" className="btn-primary" style={{ fontSize: "1.05rem", padding: "0.875rem 1.75rem" }}>
                  Build my first habit <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn-secondary" style={{ fontSize: "1.05rem", padding: "0.875rem 1.75rem" }}>
                  I have an account
                </Link>
              </div>
            </div>

            {/* Right: 3D orbiting widget */}
            <div style={{ display: "flex", justifyContent: "center", animation: "fade-in 0.8s ease-out 0.2s both" }}>
              <OrbitingHabits />
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER BAND ── */}
      <div className="band" style={{ background: "#8B162B", color: "white" }}>
        <div className="marquee-track" style={{ display: "inline-flex", gap: "3rem", paddingRight: "3rem" }}>
          {tickerItems.map((t, i) => (
            <span key={i} style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── PREVIEW CARDS ── */}
      <section style={{ padding: "5rem 1.5rem", position: "relative", overflow: "hidden" }}>
        <Blob color="#BAD2E8" style={{ width: 220, height: 220, top: 0, right: -40, opacity: 0.35 }} className="blob-b" />

        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8B162B", marginBottom: "0.75rem" }}>
              see it in action
            </p>
            <h2 className="display-lg" style={{ color: "var(--text)", margin: 0 }}>
              Your whole day,<br />
              <em style={{ color: "#8B162B" }}>at a glance.</em>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

            {/* Today card — 3D tilt */}
            <div ref={heroRef} className="card card-3d" style={{ padding: "1.75rem", transition: "transform 0.12s ease, box-shadow 0.12s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#8B162B" }} />
                <p style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", margin: 0 }}>Today</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  { emoji: "💧", name: "Drink 2L water",   done: true,  streak: 12, delay: 0 },
                  { emoji: "📚", name: "Read 20 minutes",  done: true,  streak: 7,  delay: 1 },
                  { emoji: "🏃", name: "Morning run",      done: false, streak: 3,  delay: 2 },
                  { emoji: "🧘", name: "5-min meditation", done: false, streak: 1,  delay: 3 },
                ].map(h => <HabitCard3D key={h.name} {...h} />)}
              </div>
              <div style={{ marginTop: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 8, fontWeight: 700 }}>
                  <span style={{ color: "var(--text-muted)" }}>Daily progress</span>
                  <span style={{ color: "#8B162B" }}>50%</span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: "rgba(139,22,43,0.12)", overflow: "hidden" }}>
                  <div style={{ width: "50%", height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #F9B6B8, #8B162B)" }} />
                </div>
              </div>
            </div>

            {/* Report card */}
            <div className="card" style={{ padding: "1.75rem", background: "#8B162B", border: "2px solid #5c0f1d", color: "white" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={15} style={{ color: "#F9B6B8" }} />
                </div>
                <p style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F9B6B8", margin: 0 }}>
                  Weekly report
                </p>
              </div>
              <div style={{ padding: "1rem", borderRadius: "1rem", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)", marginBottom: "1.25rem" }}>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.65, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                  Big week for hydration, <strong style={{ color: "#F6F3CF" }}>7/7 on 💧 water!</strong> Your morning runs
                  slipped to 3/5. You tend to be strongest Mon through Wed. Try prepping your
                  shoes by the door tonight. <span style={{ color: "#F9B6B8", fontWeight: 700 }}>Proud of you! 🌟</span>
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                {[
                  { label: "Active streaks", value: "4",   emoji: "🔥" },
                  { label: "This week",      value: "86%", emoji: "📈" },
                  { label: "Best streak",    value: "28d", emoji: "⭐" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center", padding: "0.75rem 0.5rem", borderRadius: "0.875rem", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
                    <div style={{ fontSize: "1.1rem", marginBottom: 3 }}>{s.emoji}</div>
                    <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#F6F3CF" }}>{s.value}</div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECOND TICKER — opposite direction ── */}
      <div className="band" style={{ background: "#C6B63B" }}>
        <div style={{ display: "inline-flex", gap: "3rem", paddingRight: "3rem", animation: "marquee 22s linear infinite reverse" }}>
          {[...["🌟 Start today", "💪 Build momentum", "📅 Track weekly", "🎯 Hit your goals", "❤️ Love your habits", "✨ Feel the progress", "🏆 Celebrate wins", "🌱 Grow every day"], ...["🌟 Start today", "💪 Build momentum", "📅 Track weekly", "🎯 Hit your goals", "❤️ Love your habits", "✨ Feel the progress", "🏆 Celebrate wins", "🌱 Grow every day"]].map((t, i) => (
            <span key={i} style={{ fontSize: "0.95rem", fontWeight: 800, letterSpacing: "0.04em", whiteSpace: "nowrap", color: "#2a1a00" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ padding: "5rem 1.5rem", position: "relative", overflow: "hidden" }}>
        <Blob color="#F37521" style={{ width: 180, height: 180, bottom: 20, left: -40, opacity: 0.18 }} />
        <Squiggle color="#C6B63B" style={{ right: "3%", top: "15%", opacity: 0.5 }} />

        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8B162B", marginBottom: "0.75rem" }}>
              what you get
            </p>
            <h2 className="display-lg" style={{ color: "var(--text)", margin: 0 }}>
              Everything you need,
              <br />
              <em style={{ color: "#8B162B" }}>nothing you don't.</em>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {features.map((f, i) => {
              const ref = useRef();
              use3DTilt(ref);
              return (
                <div key={f.title} ref={ref} className="card card-3d"
                  style={{ padding: "2rem", background: f.color, border: `2px solid ${f.dark}22`, cursor: "default",
                    animation: `slide-up 0.5s ease-out ${i * 0.08}s both` }}>
                  <div style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>{f.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem", color: f.dark, marginBottom: "0.6rem" }}>{f.title}</div>
                  <div style={{ fontSize: "0.95rem", lineHeight: 1.6, color: f.dark, opacity: 0.8 }}>{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "4rem 1.5rem 6rem", position: "relative", overflow: "hidden" }}>
        <Blob color="#F9B6B8" style={{ width: 300, height: 300, top: -60, right: -80, opacity: 0.4 }} />
        <Star color="#C6B63B" size={64} style={{ bottom: 40, left: "5%", opacity: 0.5, animation: "wiggle 4s ease-in-out infinite" }} />

        <div className="max-w-5xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
          <div ref={ctaRef} className="card" style={{
            padding: "4rem 3rem",
            textAlign: "center",
            background: "#F6F3CF",
            border: "3px solid #8B162B",
            boxShadow: "8px 8px 0 #8B162B",
            borderRadius: "2rem",
            transition: "transform 0.12s ease, box-shadow 0.12s ease",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
            <h2 className="display-md" style={{ color: "var(--text)", marginBottom: "1rem", lineHeight: 1.1 }}>
              Your first streak is{" "}
              <em style={{ color: "#8B162B" }}>3 clicks away.</em>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "2rem", maxWidth: 420, margin: "0 auto 2rem", fontWeight: 500, lineHeight: 1.6 }}>
              Create your account, add a habit, check it off. That's all it takes to get moving.
            </p>
            <Link to="/register" className="btn-primary" style={{ fontSize: "1.1rem", padding: "1rem 2.5rem" }}>
              Create my account <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#8B162B", color: "white", padding: "2.5rem 1.5rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
          <Logo size={28} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 900, color: "#F6F3CF" }}>YouThrive</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "1rem" }}>
          <Link to="/login" style={{ color: "#F9B6B8", fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" }}>Log in</Link>
          <Link to="/register" style={{ color: "#F9B6B8", fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" }}>Sign up</Link>
        </div>
        <p style={{ fontSize: "0.8rem", color: "rgba(249,182,184,0.65)", margin: 0 }}>
          © {new Date().getFullYear()} YouThrive. Built with care. 🌱
        </p>
      </footer>
    </div>
  );
}
