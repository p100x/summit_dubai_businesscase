"use client";
import { clsx } from "clsx";

type Props = {
  label: string;
  value: number | null | undefined;
  target?: number | null;
  format?: "number" | "currency" | "percent";
  currency?: "AED" | "EUR";
  icon?: React.ReactNode;
};

function formatValue(value: number | null | undefined, format: Props["format"], currency?: Props["currency"]) {
  if (value === null || value === undefined) return "—";
  if (format === "percent") return `${(value * 100).toFixed(1)}%`;
  if (format === "currency") return new Intl.NumberFormat("en-AE", { style: "currency", currency: currency ?? "AED", maximumFractionDigits: 0 }).format(value);
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 2 }).format(value);
}

export function KpiCard({ label, value, target, format = "number", currency = "AED", icon }: Props) {
  const ok = target == null || value == null ? undefined : value >= target;
  return (
    <div
      className={clsx(
        "group relative min-w-[200px] rounded-xl border bg-white/5 p-4 shadow-sm backdrop-blur transition",
        "hover:bg-white/10 hover:shadow-md",
        ok == null ? "border-white/10" : ok ? "border-emerald-400/30" : "border-amber-400/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-white/70">{label}</div>
        {icon && (
          <div className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-base">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-1 text-3xl font-semibold tracking-tight">{formatValue(value, format, currency)}</div>
      {target != null && (
        <div className={clsx("mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
          ok ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300")}
        >
          Target: {formatValue(target, format, currency)}
        </div>
      )}
    </div>
  );
}

