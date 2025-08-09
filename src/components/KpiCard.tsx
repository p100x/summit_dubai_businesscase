"use client";
import { clsx } from "clsx";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/20/solid";

type Props = {
  label: string;
  value: number | null | undefined;
  target?: number | null;
  format?: "number" | "currency" | "percent";
  currency?: "AED" | "EUR";
  icon?: React.ReactNode;
  previousValue?: number | null;
};

function formatValue(value: number | null | undefined, format: Props["format"], currency?: Props["currency"]) {
  if (value === null || value === undefined) return "—";
  if (format === "percent") return `${(value * 100).toFixed(1)}%`;
  if (format === "currency") return new Intl.NumberFormat("en-AE", { style: "currency", currency: currency ?? "AED", maximumFractionDigits: 0 }).format(value);
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 2 }).format(value);
}

export function KpiCard({ label, value, target, format = "number", currency = "AED", icon, previousValue }: Props) {
  const ok = target == null || value == null ? undefined : value >= target;
  const trend = previousValue != null && value != null ? value - previousValue : null;
  const trendPercent = previousValue && trend ? (trend / previousValue) * 100 : null;
  
  return (
    <div
      className={clsx(
        "group relative min-w-[200px] rounded-xl border bg-gradient-to-br p-4 shadow-sm transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5",
        ok == null ? "border-zinc-200 from-white to-zinc-50" : ok ? "border-emerald-200 from-emerald-50/30 to-white" : "border-amber-200 from-amber-50/30 to-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-zinc-600">{label}</div>
        {icon && (
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-50 text-base transition-transform group-hover:scale-110">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 animate-in fade-in duration-500">
        {formatValue(value, format, currency)}
      </div>
      
      {trend !== null && (
        <div className={clsx(
          "mt-2 inline-flex items-center gap-1 text-xs font-medium",
          trend >= 0 ? "text-emerald-600" : "text-rose-600"
        )}>
          {trend >= 0 ? (
            <ArrowTrendingUpIcon className="h-3 w-3" />
          ) : (
            <ArrowTrendingDownIcon className="h-3 w-3" />
          )}
          {trendPercent && (
            <span>{Math.abs(trendPercent).toFixed(1)}%</span>
          )}
        </div>
      )}
      
      {target != null && (
        <div className={clsx(
          "mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
          ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        )}>
          <span className={clsx("h-1.5 w-1.5 rounded-full", ok ? "bg-emerald-500" : "bg-amber-500")} />
          Target: {formatValue(target, format, currency)}
        </div>
      )}
    </div>
  );
}

