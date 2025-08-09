"use client";
import { useModelStore } from "@/store/modelStore";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useModelStore();

  return (
    <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white p-1">
      <button
        onClick={() => setCurrency('EUR')}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
          currency === 'EUR'
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'text-zinc-500 hover:text-zinc-700'
        }`}
      >
        EUR
      </button>
      <button
        onClick={() => setCurrency('AED')}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
          currency === 'AED'
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'text-zinc-500 hover:text-zinc-700'
        }`}
      >
        AED
      </button>
    </div>
  );
}