import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "../context/ThemeContext.jsx";

// Brand-harmonised palette: crimson family + accent pops
const COLORS = [
  "#8B162B", // crimson
  "#F37521", // burnt sienna
  "#C6B63B", // neon pear
  "#BAD2E8", // arctic blue
  "#F9B6B8", // dusty rose
  "#5c0f1d", // deep crimson
  "#d9863a", // warm amber
  "#8a9bb8", // muted blue
  "#e8c46b", // golden
];

export default function CategoryPieChart({ data }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="card p-5">
      <div className="text-sm font-medium mb-3">Completions by category</div>
      {!data?.length ? (
        <div className="text-sm text-muted py-10 text-center">No data yet.</div>
      ) : (
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                stroke={isDark ? "rgba(26,5,8,0.4)" : "#F6F3CF"}
                strokeWidth={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: isDark ? "rgba(26,5,8,0.97)" : "rgba(255,255,255,0.97)",
                  border: `1px solid ${isDark ? "rgba(249,182,184,0.15)" : "rgba(139,22,43,0.18)"}`,
                  borderRadius: 12,
                  fontSize: 12,
                  color: isDark ? "#F6F3CF" : "#2a0808",
                  backdropFilter: "blur(12px)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: isDark ? "#d4908e" : "#7a3030" }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
