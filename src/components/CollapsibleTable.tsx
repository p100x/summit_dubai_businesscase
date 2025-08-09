"use client";
import React, { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";


interface CollapsibleTableProps {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  groups: {
    name: string;
    subtotal: React.ReactNode;
    items: { name: string; amount: React.ReactNode; details?: string }[];
  }[];
}

export function CollapsibleTable({ columns, groups }: CollapsibleTableProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="w-full text-sm text-zinc-800">
        <thead className="bg-zinc-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-3 py-2 font-medium text-zinc-500 ${c.align === "right" ? "text-right" : "text-left"}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group, groupIndex) => {
            const isCollapsed = collapsedCategories.has(group.name);
            return (
              <React.Fragment key={groupIndex}>
                <tr
                  className="border-t border-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-100 cursor-pointer hover:from-zinc-100 hover:to-zinc-150 transition-all"
                  onClick={() => toggleCategory(group.name)}
                >
                  <td className="px-3 py-2.5 font-medium text-zinc-700">
                    <div className="flex items-center gap-1.5">
                      {isCollapsed ? (
                        <ChevronRightIcon className="h-4 w-4 text-zinc-400" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
                      )}
                      <span>{group.name}</span>
                      <span className="ml-2 text-xs text-zinc-500">({group.items.length} items)</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold">
                    {group.subtotal}
                  </td>
                </tr>
                {!isCollapsed && group.items.map((item, itemIndex) => (
                  <tr
                    key={`${groupIndex}-${itemIndex}`}
                    className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors animate-in fade-in duration-200"
                  >
                    <td className="px-3 py-2 pl-10 text-zinc-600">
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        {item.details && (
                          <span className="text-xs text-zinc-400 mt-0.5">{item.details}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-zinc-700">
                      {item.amount}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}