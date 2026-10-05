import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/* ------------------------------- Panel ---------------------------------- */

export function Panel({
  className,
  accent,
  children,
  delay,
  ...rest
}: {
  className?: string;
  accent?: boolean;
  children: ReactNode;
  delay?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      style={delay ? { animationDelay: `${delay}ms`, ...rest.style } : rest.style}
      className={cn(accent ? "panel-accent" : "panel", "rise p-5", className)}
    >
      {children}
    </div>
  );
}

export function PanelHeading({
  title,
  action,
  hint,
}: {
  title: string;
  action?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <h2 className="min-w-0 truncate font-display text-base font-semibold">{title}</h2>
      {action ?? (hint ? <span className="shrink-0 text-xs text-mute">{hint}</span> : null)}
    </div>
  );
}

/* ------------------------------ PageHeader ------------------------------ */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="rise grid grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-pretty font-display text-2xl font-semibold sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-mute">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 sm:justify-end">{actions}</div> : null}
    </header>
  );
}

/* ------------------------------- Button --------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent2";
type ButtonSize = "sm" | "md" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground ring-1 ring-primary shadow-[0_8px_24px_-12px_var(--primary)] hover:brightness-110",
  accent2:
    "bg-accent2 text-accent2-foreground ring-1 ring-accent2 hover:brightness-110",
  secondary: "veil text-ink ring-1 ring-line hover:text-ink hover:veil",
  ghost: "text-mute hover:veil hover:text-ink",
  danger: "bg-destructive text-destructive-foreground ring-1 ring-destructive hover:brightness-110",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-[13px]",
  icon: "size-9",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  }
>(function Button({ className, variant = "secondary", size = "md", ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={rest.type ?? "button"}
      {...rest}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold transition-all disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    />
  );
});

/* ------------------------------- Fields --------------------------------- */

const fieldBase =
  "w-full rounded-lg veil px-3 py-2 text-sm text-ink ring-1 ring-line placeholder:text-mute focus:ring-primary transition";

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-mute"
    >
      {children}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} {...rest} className={cn(fieldBase, "h-10", className)} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} rows={3} {...rest} className={cn(fieldBase, className)} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        {...rest}
        className={cn(fieldBase, "h-10 bg-panel appearance-none pr-8", className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23828da0' d='M1 1l5 5 5-5'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
        }}
      >
        {children}
      </select>
    );
  },
);

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-mute">{hint}</p>
      ) : null}
    </div>
  );
}

/* -------------------------------- Badge --------------------------------- */

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "accent2" | "danger" | "success" | "warning";
  className?: string;
}) {
  const tones = {
    neutral: "veil text-mute ring-line",
    primary: "bg-primary/15 text-primary ring-primary/30",
    accent2: "bg-accent2/15 text-accent2 ring-accent2/30",
    danger: "bg-destructive/15 text-destructive ring-destructive/30",
    success: "bg-success/15 text-success ring-success/30",
    warning: "bg-warning/15 text-warning ring-warning/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------ EmptyState ------------------------------ */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      {icon ? (
        <div className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/15 text-primary">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-sm font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-mute">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* ------------------------------- Progress ------------------------------- */

export function ProgressBar({
  value,
  className,
  color,
}: {
  value: number;
  className?: string;
  color?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full veil", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: color ?? "linear-gradient(to right, var(--primary), var(--accent2))",
        }}
      />
    </div>
  );
}

export function Ring({
  value,
  size = 64,
  stroke = 7,
  color = "var(--primary)",
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 50 - stroke / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      {label ? (
        <span className="absolute inset-0 grid place-items-center font-display text-xs font-semibold">
          {label}
        </span>
      ) : null}
    </div>
  );
}

/* --------------------------------- Tabs --------------------------------- */

export function Tabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "scrollbar-slim flex gap-1 overflow-x-auto rounded-xl veil p-1 ring-1 ring-line",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            value === o.value
              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
              : "text-mute hover:text-ink",
          )}
        >
          {o.label}
          {typeof o.count === "number" ? (
            <span className="ml-1.5 text-[10px] opacity-70">{o.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ SampleFlag ------------------------------ */

export function SampleFlag() {
  return (
    <Badge tone="warning" className="shrink-0">
      Sample
    </Badge>
  );
}
