"use client";
import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { yaml as yamlLang } from "@codemirror/lang-yaml";

export function YamlEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur shadow-sm">
      <CodeMirror
        value={value}
        height="420px"
        extensions={[yamlLang()]}
        theme="dark"
        onChange={(v) => onChange(v)}
      />
    </div>
  );
}

