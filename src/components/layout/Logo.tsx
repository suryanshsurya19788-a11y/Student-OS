export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="StudentOS"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="so-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--accent2)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#so-logo)" />
      <path
        d="M16 8.5 25 13l-9 4.5L7 13l9-4.5Z"
        fill="var(--background)"
        fillOpacity="0.92"
      />
      <path
        d="M11 16.2v4.1c0 1.6 2.3 2.9 5 2.9s5-1.3 5-2.9v-4.1"
        stroke="var(--background)"
        strokeOpacity="0.92"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
