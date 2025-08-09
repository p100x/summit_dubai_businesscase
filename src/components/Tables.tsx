"use client";
import React from "react";

export function SimpleTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, React.ReactNode>[];
}) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.06]">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-3 py-2 font-medium ${c.align === "right" ? "text-right" : "text-left"}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-white/10 even:bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-2 ${c.align === "right" ? "text-right" : "text-left"}`}>
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

