import Logo from "./Logo.jsx";
import {
  FaDroplet, FaPersonRunning, FaBookOpen, FaDumbbell, FaPenNib, FaBullseye,
} from "react-icons/fa6";
import { GiMeditation } from "react-icons/gi";

const HABITS = [
  { Icon: FaDroplet, color: "#0ea5e9", orbit: "outer", delay: 0 },
  { Icon: FaPersonRunning, color: "#ef4444", orbit: "outer", delay: -10 },
  { Icon: FaBookOpen, color: "#6366f1", orbit: "outer", delay: -20 },
  { Icon: GiMeditation, color: "#8b5cf6", orbit: "middle", delay: -4, reverse: true },
  { Icon: FaDumbbell, color: "#f59e0b", orbit: "middle", delay: -16, reverse: true },
  { Icon: FaPenNib, color: "#ec4899", orbit: "inner", delay: -2 },
  { Icon: FaBullseye, color: "#10b981", orbit: "inner", delay: -10 },
];

const ORBITS = {
  outer: { inset: "0%", duration: 32, planet: 52 },
  middle: { inset: "18%", duration: 24, planet: 46 },
  inner: { inset: "36%", duration: 18, planet: 40 },
};

const SPARKLES = Array.from({ length: 10 }).map((_, i) => ({
  top: `${10 + Math.round((i * 73) % 80)}%`,
  left: `${5 + Math.round((i * 61) % 88)}%`,
  size: 3 + (i % 3),
  delay: -(i * 0.7),
}));

export default function OrbitingHabits() {
  return (
    <div className="relative mx-auto w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px]">
      {/* Twinkling dots */}
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: ["#F9B6B8","#8B162B","#BAD2E8","#F37521"][i % 4],
            opacity: 0.6,
            animation: `twinkle ${2.5 + (i % 3)}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Orbit rings */}
      {Object.entries(ORBITS).map(([k, o]) => (
        <div
          key={k}
          className="absolute rounded-full"
          style={{
            inset: o.inset,
            border: "1.5px dashed rgba(139,22,43,0.25)",
          }}
        />
      ))}

      {/* Pulsing halo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "38%",
          height: "38%",
          background: "radial-gradient(circle, rgba(249,182,184,0.35), transparent 70%)",
          animation: "pulse-ring 4s ease-in-out infinite",
        }}
      />

      {/* Central logo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
        style={{
          width: "22%",
          height: "22%",
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 6px 24px rgba(139,22,43,0.25), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "2px solid rgba(139,22,43,0.3)",
        }}
      >
        <Logo size={36} />
      </div>

      {/* Orbiting habit icons */}
      {HABITS.map((h, i) => {
        const o = ORBITS[h.orbit];
        const Icon = h.Icon;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              inset: o.inset,
              animation: `${h.reverse ? "orbit-reverse" : "orbit"} ${o.duration}s linear ${h.delay}s infinite`,
            }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl flex items-center justify-center"
              style={{
                width: o.planet,
                height: o.planet,
                background: `rgba(255,255,255,0.9)`,
                border: `2px solid ${h.color}40`,
                boxShadow: `0 4px 16px ${h.color}40`,
                color: h.color,
                animation: `${h.reverse ? "orbit" : "orbit-reverse"} ${o.duration}s linear ${h.delay}s infinite`,
                backdropFilter: "blur(8px)",
              }}
            >
              <Icon size={o.planet * 0.42} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
