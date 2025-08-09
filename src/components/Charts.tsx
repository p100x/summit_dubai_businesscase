"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
// Local type to avoid using `any` while matching Recharts Tooltip's shape
type WaterfallTooltipPayloadEntry = { payload: WaterfallData };
type WaterfallTooltipProps = {
  active?: boolean;
  payload?: WaterfallTooltipPayloadEntry[];
  label?: string | number;
};

export function RevenueCostBar({ data }: { data: { name: string; revenue: number; cost: number }[] }) {
  return (
    <div className="h-64 w-full rounded-xl border border-zinc-200 bg-white p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" tickFormatter={(v) => new Intl.NumberFormat("en-AE", { notation: "compact", maximumFractionDigits: 1 }).format(v)} />
          <Tooltip formatter={(v: unknown) => new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(typeof v === "number" ? v : Number(v ?? 0))} />
          <Legend />
          <Bar dataKey="revenue" fill="#34d399" name="Revenue" radius={[4, 4, 0, 0]} />
          <Bar dataKey="cost" fill="#f59e0b" name="Cost" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type WaterfallData = {
  name: string;
  value: number;
  cumulative: number;
  type: "positive" | "negative" | "total";
  isStart?: boolean;
  isEnd?: boolean;
};

export function WaterfallChart({ 
  revenueGroups, 
  costGroups, 
  ebitdaAED,
  currency = 'AED',
  exchangeRate = 1 
}: { 
  revenueGroups: Array<{ name: string; items: Array<{ name: string; amountAED: number }>; subtotalAED: number }>; 
  costGroups: Array<{ name: string; items: Array<{ name: string; amountAED: number }>; subtotalAED: number }>; 
  ebitdaAED: number; 
  currency?: 'EUR' | 'AED';
  exchangeRate?: number;
}) {
  // Safety checks
  if (!revenueGroups || !costGroups || typeof ebitdaAED !== 'number') {
    return <div className="h-80 w-full flex items-center justify-center text-zinc-500">No data available</div>;
  }

  // Helper function to convert AED amounts to selected currency
  const convertAmount = (amountAED: number) => {
    return currency === 'EUR' ? amountAED / exchangeRate : amountAED;
  };

  const formatCurrency = (value: number) => {
    const locale = currency === 'EUR' ? 'de-DE' : 'en-AE';
    return new Intl.NumberFormat(locale, { 
      style: "currency", 
      currency: currency, 
      maximumFractionDigits: 0,
      notation: "compact"
    }).format(value);
  };

  const data: (WaterfallData & { stackBase: number })[] = [];
  
  let runningTotal = 0;

  // Add revenue groups and their items
  (revenueGroups || []).forEach((group) => {
    if (!group || !group.items) return;
    // Add individual revenue items
    group.items.forEach((item) => {
      if (item && typeof item.amountAED === 'number' && item.amountAED > 0) {
        const convertedAmount = convertAmount(item.amountAED);
        data.push({
          name: item.name || 'Unnamed Revenue',
          value: convertedAmount,
          cumulative: runningTotal + convertedAmount,
          type: "positive",
          stackBase: runningTotal,
        });
        runningTotal += convertedAmount;
      }
    });
  });

  // Add cost groups and their items as negative contributions
  (costGroups || []).forEach((group) => {
    if (!group || !group.items) return;
    // Add individual cost items
    group.items.forEach((item) => {
      if (item && typeof item.amountAED === 'number' && item.amountAED > 0) {
        const convertedAmount = convertAmount(item.amountAED);
        data.push({
          name: item.name || 'Unnamed Cost',
          value: convertedAmount, // positive value for bar height
          cumulative: runningTotal - convertedAmount,
          type: "negative",
          stackBase: runningTotal - convertedAmount, // start the bar from the new running total
        });
        runningTotal -= convertedAmount;
      }
    });
  });

  // End with EBITDA (from 0 to EBITDA)
  const convertedEbitda = convertAmount(ebitdaAED || 0);
  data.push({
    name: "EBITDA",
    value: Math.abs(convertedEbitda),
    cumulative: convertedEbitda,
    type: convertedEbitda >= 0 ? "positive" : "negative",
    isEnd: true,
    stackBase: convertedEbitda >= 0 ? 0 : convertedEbitda,
  });

  const CustomTooltip: React.FC<WaterfallTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as WaterfallData;
      return (
        <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow">
          <p className="font-medium text-zinc-900">{label}</p>
          <p className="text-zinc-600">
            {data.type === "negative" ? "Cost: " : "Value: "}
            <span className={data.type === "negative" ? "text-rose-600" : "text-emerald-600"}>
              {formatCurrency(data.isStart || data.isEnd ? Math.abs(data.cumulative) : Math.abs(data.value))}
            </span>
          </p>
          <p className="text-zinc-600">
            Running total: <span className="text-zinc-900">{formatCurrency(data.cumulative)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate domain for Y-axis
  const maxValue = Math.max(runningTotal > 0 ? runningTotal : 100, Math.abs(ebitdaAED || 0));
  const minValue = Math.min(0, ebitdaAED || 0);

  // If no data, show empty state
  if (data.length <= 1) {
    return (
      <div className="h-80 w-full flex items-center justify-center text-zinc-500">
        <div className="text-center">
          <div className="text-lg">No revenue or cost data</div>
          <div className="text-sm">Add revenue and cost items to see the waterfall chart</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
        >
          <XAxis 
            dataKey="name" 
            stroke="#6b7280" 
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12}
            tickFormatter={formatCurrency}
            domain={[minValue * 1.1, maxValue * 1.1]}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Invisible bars to create the stacking effect */}
          <Bar dataKey="stackBase" fill="transparent" stackId="stack" />
          
          {/* Visible bars with proper colors */}
          <Bar dataKey="value" stackId="stack" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={
                  entry.isStart ? "#10b981" :
                  entry.isEnd ? (entry.cumulative >= 0 ? "#10b981" : "#ef4444") :
                  entry.type === "negative" ? "#ef4444" : "#10b981"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

