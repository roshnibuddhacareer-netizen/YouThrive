import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, RefreshCw, Brain, Trophy, CalendarRange,
  Activity, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { format, subDays } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../api/axios.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Markdown from "../components/Markdown.jsx";
import { weekKeysFor, streakFromKeys } from "../utils/dateHelpers.js";
import { useTheme } from "../context/ThemeContext.jsx";

// Brand-harmonised palette for pie chart
const PIE_COLORS = [
  "#8B162B", "#F37521", "#C6B63B", "#BAD2E8",
  "#F9B6B8", "#5c0f1d", "#d9863a", "#8a9bb8", "#e8c46b",
];

const REPORT_CACHE_KEY = (weekStart) => `weekly-report-${weekStart}`;

export default function Insights() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const grid = isDark ? "rgba(249,182,184,0.10)" : "rgba(139,22,43,0.08)";
  const tick = isDark ? "#d4908e" : "#7a3030";
  const tooltipStyle = {
    background: isDark ? "rgba(26,5,8,0.97)" : "rgba(255,255,255,0.97)",
    border: `1px solid ${isDark ? "rgba(249,182,184,0.15)" : "rgba(139,22,43,0.18)"}`,
    borderRadius: 12,
    fontSize: 12,
    color: isDark ? "#F6F3CF" : "#2a0808",
    backdropFilter: "blur(12px)",
  };

  const [habits, setHabits] = useState([]);
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  const [report, setReport]                   = useState("");
  const [reportGeneratedAt, setReportGeneratedAt] = useState(null);
  const [reportLoading, setReportLoading]     = useState(false);

  const thisWeek = useMemo(() => weekKeysFor(new Date()), []);
  const lastWeek = useMemo(() => weekKeysFor(subDays(new Date(), 7)), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const start = lastWeek[0].key;
        const end   = thisWeek[6].key;
        const [habitsRes, logsRes] = await Promise.all([
          api.get("/habits"),
          api.get("/logs/range", { params: { start, end } }),
        ]);
        setHabits(habitsRes.data);
        setLogs(logsRes.data);
        const cached = localStorage.getItem(REPORT_CACHE_KEY(thisWeek[0].key));
        if (cached) {
          try {
            const { content, generatedAt } = JSON.parse(cached);
            setReport(content);
            setReportGeneratedAt(new Date(generatedAt));
          } catch {}
        } else {
          generateReport();
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const res = await api.get("/ai/weekly-report");
      setReport(res.data.content);
      const now = new Date();
      setReportGeneratedAt(now);
      localStorage.setItem(
        REPORT_CACHE_KEY(thisWeek[0].key),
        JSON.stringify({ content: res.data.content, generatedAt: now })
      );
    } catch {
      setReport("Failed to generate the report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  const thisWeekKeys  = useMemo(() => new Set(thisWeek.map((d) => d.key)), [thisWeek]);
  const thisWeekLogs  = useMemo(() => logs.filter((l) => thisWeekKeys.has(l.completedDate)),  [logs, thisWeekKeys]);
  const lastWeekLogs  = useMemo(() => logs.filter((l) => !thisWeekKeys.has(l.completedDate)), [logs, thisWeekKeys]);

  const totalSlots     = habits.length * 7;
  const totalDone      = thisWeekLogs.length;
  const totalLast      = lastWeekLogs.length;
  const completionRate = totalSlots ? Math.round((totalDone / totalSlots) * 100) : 0;
  const delta          = totalDone - totalLast;
  const deltaPct       = totalLast
    ? Math.round(((totalDone - totalLast) / totalLast) * 100)
    : totalDone > 0 ? 100 : 0;

  const dailyData   = thisWeek.map((d) => ({
    label: d.label,
    count: thisWeekLogs.filter((l) => l.completedDate === d.key).length,
  }));
  const compareData = thisWeek.map((d, idx) => ({
    label: d.label,
    "This week": thisWeekLogs.filter((l) => l.completedDate === d.key).length,
    "Last week": lastWeekLogs.filter((l) => l.completedDate === lastWeek[idx].key).length,
  }));

  const bestDay = [...dailyData].sort((a, b) => b.count - a.count)[0];

  const perHabit = useMemo(() =>
    habits.filter((h) => !h.isArchived).map((h) => {
      const done   = thisWeekLogs.filter((l) => String(l.habitId) === String(h._id)).length;
      const target = h.targetDays || 7;
      return { habit: h, done, target, pct: Math.min(100, Math.round((done / Math.max(1, target)) * 100)) };
    }).sort((a, b) => b.pct - a.pct),
    [habits, thisWeekLogs]
  );

  const topHabit = perHabit[0];

  const categoryData = useMemo(() => {
    const map = {};
    for (const h of habits) map[h._id] = h.category;
    const counts = {};
    for (const l of thisWeekLogs) {
      const cat = map[l.habitId];
      if (!cat) continue;
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [habits, thisWeekLogs]);

  const streakBoard  = useMemo(() => {
    const out = {};
    for (const h of habits) {
      const keys = logs.filter((l) => String(l.habitId) === String(h._id))
        .map((l) => l.completedDate).sort().reverse();
      out[h._id] = streakFromKeys(keys);
    }
    return out;
  }, [habits, logs]);

  const activeStreaks = Object.values(streakBoard).filter((s) => s.current > 0).length;

  if (loading) return <LoadingSpinner full />;

  const DeltaPill = () => {
    const Icon  = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
    const color = delta > 0
      ? "color:#C6B63B;background:rgba(198,182,59,0.15)"
      : delta < 0
      ? "color:#F37521;background:rgba(243,117,33,0.12)"
      : "color:var(--text-faint);background:var(--chip-bg)";
    const label = delta === 0 ? "no change" : `${delta > 0 ? "+" : ""}${delta} (${deltaPct > 0 ? "+" : ""}${deltaPct}%)`;
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={Object.fromEntries(color.split(";").map(p => p.split(":")))}>
        <Icon size={12} /> {label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Weekly insights
          </h1>
          <p className="text-sm text-muted mt-0.5 inline-flex items-center gap-2">
            <CalendarRange size={14} />
            {format(thisWeek[0].date, "MMM d")} to {format(thisWeek[6].date, "MMM d, yyyy")}
          </p>
        </div>
        <button onClick={generateReport} className="btn-secondary" disabled={reportLoading}>
          <RefreshCw size={14} className={reportLoading ? "animate-spin" : ""} />
          Regenerate report
        </button>
      </div>

      {/* AI report card — brand gradient */}
      <div className="card p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 0% 0%, rgba(249,182,184,0.25), transparent 55%), radial-gradient(circle at 100% 100%, rgba(198,182,59,0.15), transparent 55%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #F9B6B8, #8B162B)", boxShadow: "0 4px 16px rgba(139,22,43,0.30)" }}>
              <Sparkles size={18} style={{ color: "#F6F3CF" }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Weekly Report</div>
              <div className="text-xs text-muted">
                {reportGeneratedAt
                  ? `Generated ${reportGeneratedAt.toLocaleString()}`
                  : "Personalised review of your last 7 days"}
              </div>
            </div>
          </div>

          {reportLoading && !report && (
            <div className="flex items-center gap-2 text-sm text-soft py-6">
              <RefreshCw size={14} className="animate-spin" />
              Analysing your week...
            </div>
          )}

          {report && (
            <Markdown className="glass rounded-xl p-4 text-sm">{report}</Markdown>
          )}

          {!report && !reportLoading && (
            <button onClick={generateReport} className="btn-primary">
              <Sparkles size={14} /> Generate report
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Activity,     label: "Completions",    main: totalDone,         sub: "vs last week",    pill: true  },
          { icon: TrendingUp,   label: "Completion rate",main: `${completionRate}%`, sub: `${totalDone}/${totalSlots} slots` },
          { icon: CalendarRange,label: "Best day",       main: bestDay?.count ? bestDay.label : "N/A", sub: bestDay?.count ? `${bestDay.count} habit${bestDay.count===1?"":"s"}` : "no data" },
          { icon: Trophy,       label: "Top habit",      main: topHabit?.done ? topHabit.habit.name : "N/A", sub: topHabit?.done ? `${topHabit.done}/${topHabit.target} this week` : "no completions", emoji: topHabit?.done ? topHabit.habit.icon : null },
        ].map(({ icon: Icon, label, main, sub, pill, emoji }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted">
              <Icon size={14} style={{ color: "#8B162B" }} /> {label}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              {emoji && <span className="text-xl">{emoji}</span>}
              <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "#8B162B" }}>
                {emoji ? "" : main}
              </div>
              {pill && <DeltaPill />}
            </div>
            {emoji && <div className="font-medium truncate text-sm">{main}</div>}
            <div className="text-xs text-muted mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="text-sm font-medium mb-3">Completions by day</div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={dailyData}>
                <defs>
                  <linearGradient id="day-bar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#F9B6B8" />
                    <stop offset="100%" stopColor="#8B162B" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: tick }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: tick }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: isDark ? "rgba(249,182,184,0.06)" : "rgba(139,22,43,0.04)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="url(#day-bar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-sm font-medium mb-3">This week vs last week</div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={compareData}>
                <defs>
                  <linearGradient id="cmp-this" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#F9B6B8" />
                    <stop offset="100%" stopColor="#8B162B" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: tick }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: tick }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: tick }} iconType="circle" iconSize={8} />
                <Bar dataKey="Last week" fill={isDark ? "rgba(249,182,184,0.25)" : "rgba(139,22,43,0.15)"} radius={[4, 4, 0, 0]} />
                <Bar dataKey="This week" fill="url(#cmp-this)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
        <div className="card p-5">
          <div className="text-sm font-medium mb-3">By category</div>
          {!categoryData.length ? (
            <div className="text-sm text-muted py-10 text-center">No completions yet this week.</div>
          ) : (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke={isDark ? "rgba(26,5,8,0.4)" : "#F6F3CF"}
                    strokeWidth={2}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: tick }} iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Habit performance</div>
            <div className="text-xs text-muted">vs target this week</div>
          </div>
          {!perHabit.length ? (
            <div className="text-sm text-muted py-10 text-center">No active habits.</div>
          ) : (
            <div className="space-y-3">
              {perHabit.map(({ habit, done, target, pct }) => (
                <div key={habit._id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{habit.icon}</span>
                      <span className="truncate">{habit.name}</span>
                    </div>
                    <span className="text-muted text-xs">{done}/{target} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(139,22,43,0.10)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: pct === 100
                          ? "linear-gradient(90deg,#F9B6B8,#8B162B)"
                          : `linear-gradient(90deg,rgba(249,182,184,0.7),#8B162B)`,
                        boxShadow: pct === 100 ? "0 0 12px rgba(139,22,43,0.45)" : "none",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Streak board */}
      {!!habits.filter((h) => !h.isArchived).length && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Active streaks</div>
            <div className="text-xs text-muted">
              {activeStreaks} of {habits.filter((h) => !h.isArchived).length}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {habits.filter((h) => !h.isArchived).map((h) => {
              const cur = streakBoard[h._id]?.current || 0;
              return (
                <div key={h._id} className="rounded-xl glass p-3 flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{ background: "rgba(139,22,43,0.10)", color: "#8B162B" }}
                  >
                    {h.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate">{h.name}</div>
                    <div className="text-xs font-medium" style={{ color: cur > 0 ? "#F37521" : "var(--text-faint)" }}>
                      🔥 {cur} day{cur === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
