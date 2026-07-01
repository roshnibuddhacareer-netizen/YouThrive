import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useTheme } from "../context/ThemeContext.jsx";

export default function MonthlyBarChart({ data }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const grid   = isDark ? "rgba(249,182,184,0.10)" : "rgba(139,22,43,0.08)";
  const tick   = isDark ? "#d4908e" : "#7a3030";

  return (
    <div className="card p-5">
      <div className="text-sm font-medium mb-3">Last 30 days</div>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <defs>
              <linearGradient id="monbar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#F9B6B8" />
                <stop offset="50%"  stopColor="#8B162B" />
                <stop offset="100%" stopColor="#5c0f1d" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fontSize: 12, fill: tick }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: isDark ? "rgba(249,182,184,0.06)" : "rgba(139,22,43,0.04)" }}
              contentStyle={{
                background: isDark ? "rgba(26,5,8,0.97)" : "rgba(255,255,255,0.97)",
                border: `1px solid ${grid}`,
                borderRadius: 12,
                fontSize: 12,
                color: isDark ? "#F6F3CF" : "#2a0808",
                backdropFilter: "blur(12px)",
              }}
            />
            <Bar dataKey="count" fill="url(#monbar)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
