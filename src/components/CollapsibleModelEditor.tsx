"use client";

import React, { useState } from "react";
import { useModelStore } from "@/store/modelStore";
import { ChevronDownIcon, ChevronRightIcon, CodeBracketIcon, ViewColumnsIcon } from "@heroicons/react/20/solid";
import { ModelEditor } from "./ModelEditor";

export function CollapsibleModelEditor() {
  const [view, setView] = useState<"visual" | "yaml">("visual");
  const [yamlContent, setYamlContent] = useState("");
  const { error, updateYaml } = useModelStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleYamlChange = (value: string) => {
    setYamlContent(value);
    updateYaml(value);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-zinc-50 to-zinc-100 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-lg font-semibold hover:text-emerald-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )}
            Model Configuration
          </button>
          {error && (
            <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
              {error}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("visual")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === "visual"
                ? "bg-emerald-100 text-emerald-700 shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <ViewColumnsIcon className="h-4 w-4" />
            Visual Editor
          </button>
          <button
            onClick={() => setView("yaml")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === "yaml"
                ? "bg-emerald-100 text-emerald-700 shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <CodeBracketIcon className="h-4 w-4" />
            YAML Editor
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 animate-in slide-in-from-top duration-200">
          {view === "visual" ? (
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <ModelEditor />
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={yamlContent}
                onChange={(e) => handleYamlChange(e.target.value)}
                className="w-full h-[500px] font-mono text-sm p-4 border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all resize-y"
                placeholder="Enter your YAML configuration here..."
                spellCheck={false}
              />
              <div className="absolute top-2 right-2 text-xs text-zinc-400 bg-white px-2 py-1 rounded">
                YAML Format
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}