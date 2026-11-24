export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-label="AmplaQuest">
      <defs>
        <linearGradient id="aqg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
      </defs>
      <rect x="3" y="5" width="42" height="38" rx="12" fill="url(#aqg)" />
      <path d="M24 12 L34 34 H14 Z" fill="#fff" opacity="0.95" />
      <circle cx="24" cy="27" r="3.6" fill="#FBBF24" />
    </svg>
  );
}
