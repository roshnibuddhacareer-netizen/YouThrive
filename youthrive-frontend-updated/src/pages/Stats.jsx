import { useEffect, useMemo, useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import api from "../api/axios.js";
import HabitStatsCard from "../components/HabitStatsCard.jsx";
import WeeklyBarChart from "../components/WeeklyBarChart.jsx";
import MonthlyBarChart from "../components/MonthlyBarChart.jsx";
import CategoryPieChart from "../components/CategoryPieChart.jsx";
import AIChat from "../components/AIChat.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { Trophy, Flame, TrendingDown } from "lucide-react";

export default function Stats() {
  const [stats, setStats]     = useState(null);
  const [habits, setHabits]   = useState([]);
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [statsRes, habitsRes] = await Promise.all([
          api.get("/logs/stats"),
          api.get("/habits"),
        ]);
        setStats(statsRes.data);
        setHabits(habitsRes.data);
        const end   = new Date();
        const start = subDays(end, 29);
        const rangeRes = await api.get("/logs/range", {
          params: {
            start: format(start, "yyyy-MM-dd"),
            end:   format(end,   "yyyy-MM-dd"),
          },
        });
        setLogs(rangeRes.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const monthly = useMemo(() => {
    const end = new Date();
    const byDate = {};
    for (let i = 29; i >= 0; i--) {
      const key = format(subDays(end, i), "yyyy-MM-dd");
      byDate[key] = 0;
    }
    for (const l of logs) if (byDate[l.completedDate] !== undefined) byDate[l.completedDate] += 1;
    return Object.entries(byDate).map(([k, v]) => ({ label: format(parseISO(k), "MMM d"), count: v }));
  }, [logs]);

  const weekly = useMemo(() => {
    const end = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d   = subDays(end, 6 - i);
      const key = format(d, "yyyy-MM-dd");
      return { label: format(d, "EEE"), count: logs.filter((l) => l.completedDate === key).length };
    });
  }, [logs]);

  const categoryData = useMemo(() => {
    if (!stats) return [];
    const map = {};
    for (const h of habits) map[h._id] = h.category;
    const counts = {};
    for (const l of logs) {
      const cat = map[l.habitId];
      if (!cat) continue;
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [stats, logs, habits]);

  if (loading || !stats) return <LoadingSpinner full />;

  const sortedByStreak  = [...stats.perHabit].sort((a, b) => b.currentStreak  - a.currentStreak);
  const best            = sortedByStreak[0];
  const longestLongest  = [...stats.perHabit].sort((a, b) => b.longestStreak   - a.longestStreak)[0];
  const sortedByComp    = [...stats.perHabit].sort((a, b) => b.completions30d  - a.completions30d);
  const worst           = [...stats.perHabit]
    .filter((s) => s.completions30d < 30)
    .sort((a, b) => a.completions30d - b.completions30d)[0];

  /* Highlight card helper */
  const HighlightCard = ({ icon: Icon, iconColor, iconBg, label, stat, detail }) => (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: iconColor }}>
        <Icon size={14} style={{ color: iconColor }} />
        {label}
      </div>
      <div className="flex items-center gap-3">
        <span
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: iconBg }}
        >
          {stat.icon}
        </span>
        <div>
          <div className="font-semibold">{stat.name}</div>
          <div className="text-sm text-muted">{detail}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Statistics
        </h1>
        <p className="text-sm text-muted mt-0.5">Deep insights from your habit data.</p>
      </div>

      {stats.perHabit.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">📊</div>
          <div className="font-medium">No data yet</div>
          <div className="text-sm text-muted mt-1">Create a habit and check it off a few times to unlock statistics.</div>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            {best && (
              <HighlightCard
                icon={Flame}
                iconColor="#F37521"
                iconBg="rgba(243,117,33,0.15)"
                label="Best streak"
                stat={best}
                detail={`${best.currentStreak} day${best.currentStreak === 1 ? "" : "s"} running`}
              />
            )}
            {longestLongest && (
              <HighlightCard
                icon={Trophy}
                iconColor="#C6B63B"
                iconBg="rgba(198,182,59,0.18)"
                label="Longest ever"
                stat={longestLongest}
                detail={`${longestLongest.longestStreak} day record`}
              />
            )}
            {worst && (
              <HighlightCard
                icon={TrendingDown}
                iconColor="#8B162B"
                iconBg="rgba(139,22,43,0.10)"
                label="Needs attention"
                stat={worst}
                detail={`${worst.completions30d}/30 in the last 30 days`}
              />
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <WeeklyBarChart data={weekly} title="Completions this week" />
            <MonthlyBarChart data={monthly} />
          </div>

          <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
            <CategoryPieChart data={categoryData} />
            <div className="card p-5">
              <div className="text-sm font-medium mb-3">Top habits by completion (30d)</div>
              <div className="space-y-3">
                {sortedByComp.slice(0, 5).map((s) => {
                  const pct = Math.round((s.completions30d / 30) * 100);
                  return (
                    <div key={s.habitId}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg shrink-0">{s.icon}</span>
                          <span className="truncate">{s.name}</span>
                        </div>
                        <span className="text-muted text-xs">{s.completions30d}/30 · {pct}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(139,22,43,0.10)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: "linear-gradient(90deg,#F9B6B8,#8B162B)",
                            boxShadow: pct === 100 ? "0 0 12px rgba(139,22,43,0.45)" : "none",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">All habits</div>
            {stats.perHabit.map((s) => (
              <HabitStatsCard key={s.habitId} stat={s} />
            ))}
          </div>
        </>
      )}

      <AIChat />
    </div>
  );
}
