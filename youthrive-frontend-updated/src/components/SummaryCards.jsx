import { ListChecks, Flame, Trophy, TrendingUp } from "lucide-react";

const Card = ({ icon: Icon, label, value, iconBg, iconFg, accent }) => (
  <div className="card p-4 flex items-center gap-3 overflow-hidden relative">
    {/* subtle tinted stripe */}
    <div style={{ position:"absolute", inset:0, background: `linear-gradient(135deg, ${iconBg} 0%, transparent 60%)`, opacity:0.35, borderRadius:"inherit", pointerEvents:"none" }} />
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: iconBg, color: iconFg }}
    >
      <Icon size={18} />
    </div>
    <div>
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="text-xl font-semibold" style={{ color: accent }}>{value}</div>
    </div>
  </div>
);

export default function SummaryCards({ totalHabits, activeStreaks, bestStreak, weekRate }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card
        icon={ListChecks}
        label="Total habits"
        value={totalHabits}
        iconBg="rgba(186,210,232,0.35)"
        iconFg="#1a4a6e"
        accent="var(--text)"
      />
      <Card
        icon={Flame}
        label="Active streaks"
        value={activeStreaks}
        iconBg="rgba(243,117,33,0.18)"
        iconFg="#F37521"
        accent="#F37521"
      />
      <Card
        icon={Trophy}
        label="Best streak"
        value={bestStreak}
        iconBg="rgba(198,182,59,0.22)"
        iconFg="#8a7800"
        accent="#8a7800"
      />
      <Card
        icon={TrendingUp}
        label="This week"
        value={`${weekRate}%`}
        iconBg="rgba(139,22,43,0.12)"
        iconFg="#8B162B"
        accent="#8B162B"
      />
    </div>
  );
}
