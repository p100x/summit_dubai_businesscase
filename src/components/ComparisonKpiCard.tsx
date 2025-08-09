"use client";
import { clsx } from "clsx";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/20/solid";

type Props = {
  label: string;
  planValue: number;
  actualValue?: number | null;
  variance?: number | null;
  variancePercent?: number | null;
  format?: "number" | "currency" | "percent";
  currency?: "AED" | "EUR";
  icon?: React.ReactNode;
  isLoading?: boolean;
};

function formatValue(value: number | null | undefined, format: Props["format"], currency?: Props["currency"]) {
  if (value === null || value === undefined) return "—";
  if (format === "percent") return `${(value * 100).toFixed(1)}%`;
  if (format === "currency") return new Intl.NumberFormat("en-AE", { style: "currency", currency: currency ?? "AED", maximumFractionDigits: 0 }).format(value);
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 2 }).format(value);
}

function formatVariance(variance: number | null | undefined, format: Props["format"], currency?: Props["currency"]) {
  if (variance === null || variance === undefined) return "";
  const prefix = variance >= 0 ? "+" : "";
  if (format === "percent") return `${prefix}${variance.toFixed(1)}pp`;
  if (format === "currency") return `${prefix}${new Intl.NumberFormat("en-AE", { style: "currency", currency: currency ?? "AED", maximumFractionDigits: 0 }).format(variance)}`;
  return `${prefix}${new Intl.NumberFormat("en-AE", { maximumFractionDigits: 2 }).format(variance)}`;
}

export function ComparisonKpiCard({ 
  label, 
  planValue, 
  actualValue, 
  variance, 
  variancePercent,
  format = "number", 
  currency = "AED", 
  icon,
  isLoading
}: Props) {
  const hasActual = actualValue !== null && actualValue !== undefined;
  const isPositiveVariance = variance !== null && variance !== undefined && variance >= 0;
  const isSignificantVariance = variancePercent !== null && variancePercent !== undefined && Math.abs(variancePercent) >= 2;
  
  return (
    <div
      className={clsx(
        "group relative min-w-[200px] rounded-xl border bg-gradient-to-br p-4 shadow-sm transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5",
        hasActual && isSignificantVariance 
          ? isPositiveVariance 
            ? "border-emerald-200 from-emerald-50/30 to-white" 
            : "border-rose-200 from-rose-50/30 to-white"
          : "border-zinc-200 from-white to-zinc-50",
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
      
      <div className="mt-2 space-y-3">
        {/* Plan Value */}
        <div className="rounded-lg bg-blue-50/80 border border-blue-200 p-3">
          <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
            📋 Plan
          </div>
          <div className="text-lg font-bold text-blue-900">
            {formatValue(planValue, format, currency)}
          </div>
        </div>
        
        {/* Actual Value */}
        {isLoading ? (
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 rounded-full border-2 border-zinc-300 border-t-emerald-500"></div>
              <span className="text-sm text-zinc-500">Loading real-time data...</span>
            </div>
          </div>
        ) : hasActual ? (
          <div className={clsx(
            "rounded-lg border p-3",
            isPositiveVariance 
              ? "bg-emerald-50/80 border-emerald-200" 
              : "bg-rose-50/80 border-rose-200"
          )}>
            <div className={clsx(
              "text-xs font-medium uppercase tracking-wide mb-1",
              isPositiveVariance ? "text-emerald-600" : "text-rose-600"
            )}>
              ⚡ Echtzeit
            </div>
            <div className={clsx(
              "text-xl font-bold tracking-tight animate-in fade-in duration-500",
              isPositiveVariance ? "text-emerald-900" : "text-rose-900"
            )}>
              {formatValue(actualValue, format, currency)}
            </div>
            
            {variance !== null && variancePercent !== null && (
              <div className={clsx(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium mt-2",
                isPositiveVariance 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-rose-100 text-rose-700"
              )}>
                {isPositiveVariance ? (
                  <ArrowTrendingUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3" />
                )}
                <span>
                  Δ {formatVariance(variance, format, currency)} ({variancePercent >= 0 ? "+" : ""}{variancePercent.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
              ⚡ Echtzeit
            </div>
            <div className="text-lg font-medium text-zinc-400">
              Keine Daten verfügbar
            </div>
          </div>
        )}
      </div>
    </div>
  );
}