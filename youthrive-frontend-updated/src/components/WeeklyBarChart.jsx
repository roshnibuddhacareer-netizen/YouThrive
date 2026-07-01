import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useTheme } from "../context/ThemeContext.jsx";

export default function WeeklyBarChart({ data, title = "Last 7 days" }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const grid   = isDark ? "rgba(249,182,184,0.10)" : "rgba(139,22,43,0.08)";
  const tick   = isDark ? "#d4908e" : "#7a3030";
  const tooltipBg     = isDark ? "rgba(26,5,8,0.97)"    : "rgba(255,255,255,0.97)";
  const tooltipBorder = isDark ? "rgba(249,182,184,0.15)" : "rgba(139,22,43,0.18)";

  return (
    <div className="card p-5">
      <div className="text-sm font-medium mb-3">{title}</div>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <defs>
              <linearGradient id="wkbar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#F9B6B8" />
                <stop offset="100%" stopColor="#8B162B" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: tick }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: tick }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: isDark ? "rgba(249,182,184,0.06)" : "rgba(139,22,43,0.04)" }}
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: 12,
                fontSize: 12,
                color: isDark ? "#F6F3CF" : "#2a0808",
                backdropFilter: "blur(12px)",
              }}
            />
            <Bar dataKey="count" fill="url(#wkbar)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
