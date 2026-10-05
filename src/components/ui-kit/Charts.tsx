import { useId } from "react";

export interface Slice {
  label: string;
  value: number;
  color: string;
}

export function Donut({
  slices,
  size = 140,
  thickness = 16,
  centerLabel,
  centerSub,
}: {
  slices: Slice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = 50 - thickness / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth={thickness} />
        {total > 0 &&
          slices.map((s) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={s.label}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      {centerLabel ? (
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-lg font-semibold leading-none">{centerLabel}</p>
            {centerSub ? <p className="mt-1 text-[10px] text-mute">{centerSub}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function BarChart({
  bars,
  height = 120,
  unit = "",
}: {
  bars: { label: string; value: number; muted?: boolean }[];
  height?: number;
  unit?: string;
}) {
  const id = useId();
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {bars.map((b, i) => (
          <div key={`${id}-${i}`} className="flex min-w-0 flex-1 flex-col justify-end">
            <div
              title={`${b.label}: ${b.value}${unit}`}
              className="w-full rounded-t-md transition-[height] duration-700 ease-out"
              style={{
                height: `${Math.max(2, (b.value / max) * 100)}%`,
                background: b.muted
                  ? "color-mix(in oklab, var(--primary) 30%, transparent)"
                  : "linear-gradient(to top, var(--accent2), var(--primary))",
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        {bars.map((b, i) => (
          <span
            key={`${id}-l-${i}`}
            className="min-w-0 flex-1 truncate text-center text-[10px] text-mute"
          >
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StackedBar({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="flex h-2 overflow-hidden rounded-full veil">
      {slices.map((s) => (
        <span
          key={s.label}
          style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
          title={`${s.label}`}
        />
      ))}
    </div>
  );
}
