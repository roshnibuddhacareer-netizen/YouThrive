export default function Logo({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F6F3CF" />
          <stop offset="40%" stopColor="#F9B6B8" />
          <stop offset="100%" stopColor="#8B162B" />
        </linearGradient>
        <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B162B" />
          <stop offset="100%" stopColor="#5c0f1d" />
        </linearGradient>
        <radialGradient id="logoShine" cx="35%" cy="25%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      {/* Rounded square bg */}
      <rect x="1" y="1" width="34" height="34" rx="10" fill="url(#logoGrad2)" />
      <rect x="1" y="1" width="34" height="34" rx="10" fill="url(#logoShine)" />

      {/* Stylised "Y" made of a rising stem + two open arms — the YouThrive mark */}
      {/* Left arm */}
      <path d="M9 8 L18 19" stroke="#F9B6B8" strokeWidth="3.2" strokeLinecap="round" />
      {/* Right arm */}
      <path d="M27 8 L18 19" stroke="#F6F3CF" strokeWidth="3.2" strokeLinecap="round" />
      {/* Stem down */}
      <path d="M18 19 L18 28" stroke="white" strokeWidth="3.2" strokeLinecap="round" />

      {/* Small spark / star at the fork — the "thrive" moment */}
      <circle cx="18" cy="19" r="2.6" fill="#C6B63B" />
      <circle cx="18" cy="19" r="1.4" fill="white" />
    </svg>
  );
}
