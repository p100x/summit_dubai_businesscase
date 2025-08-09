"use client";
import { useModelStore } from "@/store/modelStore";
import { clsx } from "clsx";

export function RealtimeToggle() {
  const { realtimeEnabled, isLoadingRealtime, toggleRealtimeData } = useModelStore();

  return (
    <button
      onClick={toggleRealtimeData}
      disabled={isLoadingRealtime}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition-all duration-200",
        "hover:scale-105 active:scale-95",
        realtimeEnabled 
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
        isLoadingRealtime && "opacity-50 cursor-not-allowed"
      )}
    >
      <span 
        className={clsx(
          "h-2 w-2 rounded-full transition-colors",
          isLoadingRealtime ? "animate-pulse bg-yellow-500" : 
          realtimeEnabled ? "bg-emerald-500" : "bg-zinc-400"
        )} 
      />
      {isLoadingRealtime ? "Loading..." : 
       realtimeEnabled ? "Live Data" : "Enable Live Data"}
    </button>
  );
}