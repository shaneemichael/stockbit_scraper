import type { ButtonHTMLAttributes, ReactNode } from "react";

export const inputClass =
  "h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-colors";

export const thClass =
  "px-4 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap";

export const rowClass = "hover:bg-zinc-800/60 transition-colors";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white",
    secondary: "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-zinc-400">{description}</p>
    </header>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl ${className}`}>{children}</div>
  );
}

export function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  tone?: "default" | "up" | "down" | "accent";
}) {
  const tones = {
    default: "text-zinc-100",
    up: "text-emerald-400",
    down: "text-red-400",
    accent: "text-blue-400",
  };
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold tabular-nums ${tones[tone]}`}>{value}</p>
    </div>
  );
}

// Single-select pill group: popular symbols, categories, buy/sell, etc.
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { value: T; label: string; title?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      {label && <span className="text-xs text-zinc-500 mr-1">{label}</span>}
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            title={opt.title}
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`h-8 px-3 rounded-full text-xs font-medium cursor-pointer border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              active
                ? "bg-blue-500/15 border-blue-500/50 text-blue-300"
                : "bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const toIsoDate = (d: Date) => d.toISOString().split("T")[0];

export function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toIsoDate(d);
}

export const today = () => toIsoDate(new Date());

export function DateRange({
  startDate,
  endDate,
  onChange,
  presets,
}: {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  presets: { label: string; days: number }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        aria-label="Start date"
        value={startDate}
        onChange={(e) => onChange(e.target.value, endDate)}
        className={inputClass}
      />
      <span className="text-sm text-zinc-500">to</span>
      <input
        type="date"
        aria-label="End date"
        value={endDate}
        onChange={(e) => onChange(startDate, e.target.value)}
        className={inputClass}
      />
      <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
        {presets.map(({ label, days }) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(daysAgo(days), today())}
            className="h-10 px-3 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer border-r border-zinc-800 last:border-r-0 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="py-16 text-center text-sm text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "up" | "down" | "blue" | "purple" | "amber";
}) {
  const tones = {
    neutral: "bg-zinc-800 text-zinc-300",
    up: "bg-emerald-500/15 text-emerald-400",
    down: "bg-red-500/15 text-red-400",
    blue: "bg-blue-500/15 text-blue-400",
    purple: "bg-violet-500/15 text-violet-300",
    amber: "bg-amber-500/15 text-amber-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
