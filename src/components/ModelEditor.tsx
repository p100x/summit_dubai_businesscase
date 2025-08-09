"use client";

import React, { useMemo } from "react";
import { useModelStore } from "@/store/modelStore";
import {
  CashflowEntry,
  CostGroup,
  CostItem,
  FormulaField,
  Kpi,
  Model,
  RevenueGroup,
  RevenueItem,
  Risk,
  Scenario,
} from "@/lib/model/schema";

type ChangeHandler<T> = (updater: (prev: T) => T) => void;

function Section({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/40 placeholder:text-white/40 transition-colors hover:bg-white/15"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function NumberInput({ value, onChange, placeholder }: { value: number | undefined | null; onChange: (v: number | undefined) => void; placeholder?: string }) {
  const str = value ?? value === 0 ? String(value) : "";
  return (
    <input
      className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/40 placeholder:text-white/40 transition-colors hover:bg-white/15"
      inputMode="decimal"
      value={str}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value.trim();
        if (v === "") onChange(undefined);
        else onChange(Number(v));
      }}
    />
  );
}

function Select<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <select
      className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/40 transition-colors hover:bg-white/15"
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-zinc-900">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-sm ${
        checked ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/80"
      }`}
      onClick={() => onChange(!checked)}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${checked ? "bg-emerald-400" : "bg-white/40"}`} />
      {label ?? (checked ? "On" : "Off")}
    </button>
  );
}

function IconButton({ label, onClick, tone = "neutral" }: { label: string; onClick: () => void; tone?: "neutral" | "danger" | "success" }) {
  const toneCls =
    tone === "danger"
      ? "bg-rose-500/20 text-rose-200 hover:bg-rose-500/25"
      : tone === "success"
      ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/25"
      : "bg-white/10 text-white/80 hover:bg-white/15";
  return (
    <button type="button" className={`rounded-md border border-white/10 px-3 py-1.5 text-sm ${toneCls}`} onClick={onClick}>
      {label}
    </button>
  );
}

function Row({ children, cols = 3 }: { children: React.ReactNode; cols?: 2 | 3 | 4 | 5 | 6 }) {
  const gridCols =
    cols === 2
      ? "md:grid-cols-2"
      : cols === 3
      ? "md:grid-cols-3"
      : cols === 4
      ? "md:grid-cols-4"
      : cols === 5
      ? "md:grid-cols-5"
      : "md:grid-cols-6";
  return <div className={`grid grid-cols-1 ${gridCols} gap-2`}>{children}</div>;
}

// -------- Helpers for union FormulaField --------
type FormulaMode = "none" | "amount" | "formula";
function detectFormulaMode(value: FormulaField | undefined): FormulaMode {
  if (!value) return "none";
  if ("amount" in value) return "amount";
  if ("formula" in value) return "formula";
  return "none";
}

function FormulaFieldEditor({
  value,
  onChange,
  label,
}: {
  value: FormulaField | undefined;
  onChange: (v: FormulaField | undefined) => void;
  label: string;
}) {
  const mode = detectFormulaMode(value);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/70 w-24">{label}</span>
        <Select
          value={mode}
          onChange={(m) => {
            if (m === "none") onChange(undefined);
            else if (m === "amount") onChange({ amount: 0 });
            else onChange({ formula: "" });
          }}
          options={[
            { value: "none", label: "None" },
            { value: "amount", label: "Amount" },
            { value: "formula", label: "Formula" },
          ]}
        />
      </div>
      {mode === "amount" && (
        <NumberInput value={(value as { amount?: number })?.amount} onChange={(n) => onChange(n == null ? undefined : { amount: n })} placeholder="Amount in AED" />
      )}
      {mode === "formula" && (
        <TextInput value={(value as { formula?: string })?.formula ?? ""} onChange={(t) => onChange(t ? { formula: t } : undefined)} placeholder="e.g. 5000 * eur_to_aed" />
      )}
    </div>
  );
}

// -------- Key/Value Editors --------
function NumberRecordEditor({
  record,
  onChange,
  addLabel = "Add",
}: {
  record: Record<string, number> | undefined;
  onChange: (next: Record<string, number> | undefined) => void;
  addLabel?: string;
}) {
  const entries = Object.entries(record ?? {});
  return (
    <div className="space-y-2">
      {entries.length === 0 && <div className="text-sm text-white/60">No entries</div>}
      {entries.map(([k, v]) => (
        <Row key={k} cols={4}>
          <div>
            <TextInput value={k} onChange={(nk) => {
              const clone = { ...(record ?? {}) };
              delete clone[k];
              if (nk) clone[nk] = v;
              onChange(Object.keys(clone).length ? clone : undefined);
            }} />
          </div>
          <div>
            <NumberInput value={v} onChange={(nv) => {
              const clone = { ...(record ?? {}) };
              if (nv == null) delete clone[k];
              else clone[k] = nv;
              onChange(Object.keys(clone).length ? clone : undefined);
            }} />
          </div>
          <div className="col-span-2 flex items-center">
            <IconButton label="Remove" tone="danger" onClick={() => {
              const clone = { ...(record ?? {}) };
              delete clone[k];
              onChange(Object.keys(clone).length ? clone : undefined);
            }} />
          </div>
        </Row>
      ))}
      <IconButton
        label={addLabel}
        onClick={() => {
          const clone = { ...(record ?? {}) };
          let i = 1;
          let key = `key_${i}`;
          while (clone[key] !== undefined) {
            i += 1;
            key = `key_${i}`;
          }
          clone[key] = 0;
          onChange(clone);
        }}
      />
    </div>
  );
}

type AssumptionValue = number | string | boolean;
function AssumptionsEditor({
  value,
  onChange,
}: {
  value: Record<string, AssumptionValue>;
  onChange: (next: Record<string, AssumptionValue>) => void;
}) {
  const entries = Object.entries(value ?? {});
  return (
    <div className="space-y-2">
      {entries.length === 0 && <div className="text-sm text-white/60">No assumptions</div>}
      {entries.map(([k, v]) => {
        const type: "number" | "string" | "boolean" = typeof v === "number" ? "number" : typeof v === "boolean" ? "boolean" : "string";
        return (
          <Row key={k} cols={6}>
            <div className="col-span-2">
              <TextInput value={k} onChange={(nk) => {
                const clone: Record<string, AssumptionValue> = { ...(value ?? {}) };
                const val = clone[k];
                delete clone[k];
                if (nk) clone[nk] = val;
                onChange(clone);
              }} />
            </div>
            <div>
              <Select
                value={type}
                onChange={(t) => {
                  const clone: Record<string, AssumptionValue> = { ...(value ?? {}) };
                  if (t === "number") clone[k] = Number(v) || 0;
                  else if (t === "boolean") clone[k] = Boolean(v);
                  else clone[k] = String(v ?? "");
                  onChange(clone);
                }}
                options={[
                  { value: "number", label: "Number" },
                  { value: "string", label: "String" },
                  { value: "boolean", label: "Boolean" },
                ]}
              />
            </div>
            <div className="col-span-2">
              {type === "number" && (
                <NumberInput value={typeof v === "number" ? v : Number(v)} onChange={(nv) => {
                  const clone: Record<string, AssumptionValue> = { ...(value ?? {}) };
                  if (nv == null) delete clone[k];
                  else clone[k] = nv;
                  onChange(clone);
                }} />
              )}
              {type === "string" && (
                <TextInput value={String(v ?? "")} onChange={(sv) => {
                  const clone: Record<string, AssumptionValue> = { ...(value ?? {}) };
                  clone[k] = sv;
                  onChange(clone);
                }} />
              )}
              {type === "boolean" && (
                <div className="flex items-center h-full">
                  <Toggle checked={Boolean(v)} onChange={(bv) => {
                    const clone: Record<string, AssumptionValue> = { ...(value ?? {}) };
                    clone[k] = bv;
                    onChange(clone);
                  }} />
                </div>
              )}
            </div>
            <div className="flex items-center">
              <IconButton label="Remove" tone="danger" onClick={() => {
                const clone: Record<string, AssumptionValue> = { ...(value ?? {}) };
                delete clone[k];
                onChange(clone);
              }} />
            </div>
          </Row>
        );
      })}
      <IconButton
        label="Add assumption"
        onClick={() => {
          const clone: Record<string, AssumptionValue> = { ...(value ?? {}) };
          let i = 1;
          let key = `assumption_${i}`;
          while (clone[key] !== undefined) {
            i += 1;
            key = `assumption_${i}`;
          }
          clone[key] = 0;
          onChange(clone);
        }}
      />
    </div>
  );
}

function RevenueItemEditor({ item, onChange, onRemove }: { item: RevenueItem; onChange: (next: RevenueItem) => void; onRemove: () => void }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
      <Row cols={6}>
        <div className="col-span-2">
          <TextInput value={item.name} onChange={(v) => onChange({ ...item, name: v })} placeholder="Item name" />
        </div>
        <div>
          <NumberInput value={item.units} onChange={(v) => onChange({ ...item, units: v })} placeholder="Units" />
        </div>
        <div>
          <NumberInput value={item.price_eur} onChange={(v) => onChange({ ...item, price_eur: v })} placeholder="Price EUR" />
        </div>
        <div>
          <NumberInput value={item.price_aed} onChange={(v) => onChange({ ...item, price_aed: v })} placeholder="Price AED" />
        </div>
        <div className="flex items-center">
          <IconButton label="Remove" tone="danger" onClick={onRemove} />
        </div>
      </Row>
      <Row cols={5}>
        <div>
          <NumberInput value={item.margin_eur} onChange={(v) => onChange({ ...item, margin_eur: v })} placeholder="Margin EUR" />
        </div>
        <div>
          <NumberInput value={item.margin_aed} onChange={(v) => onChange({ ...item, margin_aed: v })} placeholder="Margin AED" />
        </div>
        <div className="col-span-3">
          <FormulaFieldEditor value={item.value} onChange={(v) => onChange({ ...item, value: v })} label="Direct value" />
        </div>
      </Row>
    </div>
  );
}

function RevenueGroupEditor({ group, onChange, onRemove }: { group: RevenueGroup; onChange: (next: RevenueGroup) => void; onRemove: () => void }) {
  return (
    <div className="space-y-2">
      <Row cols={4}>
        <div className="col-span-3">
          <TextInput value={group.name} onChange={(v) => onChange({ ...group, name: v })} placeholder="Group name" />
        </div>
        <div className="flex items-center justify-end">
          <IconButton label="Remove group" tone="danger" onClick={onRemove} />
        </div>
      </Row>
      <div className="space-y-2">
        {group.items.map((it, idx) => (
          <RevenueItemEditor
            key={idx}
            item={it}
            onChange={(next) => {
              const items = group.items.map((x, i) => (i === idx ? next : x));
              onChange({ ...group, items });
            }}
            onRemove={() => {
              const items = group.items.filter((_, i) => i !== idx);
              onChange({ ...group, items });
            }}
          />
        ))}
        <IconButton
          label="Add item"
          onClick={() => onChange({ ...group, items: [...group.items, { name: "", units: 0 }] as RevenueItem[] })}
          tone="success"
        />
      </div>
    </div>
  );
}

function CostItemEditor({ item, onChange, onRemove }: { item: CostItem; onChange: (next: CostItem) => void; onRemove: () => void }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
      <Row cols={6}>
        <div className="col-span-3">
          <TextInput value={item.name} onChange={(v) => onChange({ ...item, name: v })} placeholder="Item name" />
        </div>
        <div className="col-span-3">
          <FormulaFieldEditor value={item.value} onChange={(v) => onChange({ ...item, value: v })} label="Value" />
        </div>
      </Row>
      <div>
        <div className="text-sm text-white/70 mb-1">Inputs (available to formula)</div>
        <NumberRecordEditor record={item.inputs} onChange={(rec) => onChange({ ...item, inputs: rec })} addLabel="Add input" />
      </div>
      <div className="flex">
        <IconButton label="Remove" tone="danger" onClick={onRemove} />
      </div>
    </div>
  );
}

function CostGroupEditor({ group, onChange, onRemove }: { group: CostGroup; onChange: (next: CostGroup) => void; onRemove: () => void }) {
  return (
    <div className="space-y-2">
      <Row cols={4}>
        <div className="col-span-3">
          <TextInput value={group.cluster} onChange={(v) => onChange({ ...group, cluster: v })} placeholder="Cluster name" />
        </div>
        <div className="flex items-center justify-end">
          <IconButton label="Remove group" tone="danger" onClick={onRemove} />
        </div>
      </Row>
      <div className="space-y-2">
        {group.items.map((it, idx) => (
          <CostItemEditor
            key={idx}
            item={it}
            onChange={(next) => {
              const items = group.items.map((x, i) => (i === idx ? next : x));
              onChange({ ...group, items });
            }}
            onRemove={() => {
              const items = group.items.filter((_, i) => i !== idx);
              onChange({ ...group, items });
            }}
          />
        ))}
        <IconButton
          label="Add item"
          onClick={() => onChange({ ...group, items: [...group.items, { name: "", value: { amount: 0 } }] as CostItem[] })}
          tone="success"
        />
      </div>
    </div>
  );
}

function CashflowEntryEditor({ entry, onChange, onRemove }: { entry: CashflowEntry; onChange: (next: CashflowEntry) => void; onRemove: () => void }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
      <Row cols={6}>
        <div>
          <input
            type="date"
            className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/40"
            value={entry.date}
            onChange={(e) => onChange({ ...entry, date: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <TextInput value={entry.label ?? ""} onChange={(v) => onChange({ ...entry, label: v })} placeholder="Label" />
        </div>
        <div className="col-span-3">
          <Row cols={2}>
            <FormulaFieldEditor value={entry.inflow} onChange={(v) => onChange({ ...entry, inflow: v })} label="Inflow" />
            <FormulaFieldEditor value={entry.outflow} onChange={(v) => onChange({ ...entry, outflow: v })} label="Outflow" />
          </Row>
        </div>
      </Row>
      <div className="flex">
        <IconButton label="Remove" tone="danger" onClick={onRemove} />
      </div>
    </div>
  );
}

function RiskEditor({ risk, onChange, onRemove }: { risk: Risk; onChange: (next: Risk) => void; onRemove: () => void }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
      <Row cols={5}>
        <div className="col-span-2">
          <TextInput value={risk.risk} onChange={(v) => onChange({ ...risk, risk: v })} placeholder="Risk" />
        </div>
        <div>
          <TextInput value={risk.severity} onChange={(v) => onChange({ ...risk, severity: v })} placeholder="Severity (Low/Med/High)" />
        </div>
        <div className="col-span-2">
          <TextInput value={risk.mitigation} onChange={(v) => onChange({ ...risk, mitigation: v })} placeholder="Mitigation" />
        </div>
      </Row>
      <div className="flex">
        <IconButton label="Remove" tone="danger" onClick={onRemove} />
      </div>
    </div>
  );
}

function KpiEditor({ kpi, onChange, onRemove }: { kpi: Kpi; onChange: (next: Kpi) => void; onRemove: () => void }) {
  const fmt = kpi.format ?? "number";
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
      <Row cols={6}>
        <div className="col-span-2">
          <TextInput value={kpi.label} onChange={(v) => onChange({ ...kpi, label: v })} placeholder="Label" />
        </div>
        <div>
          <NumberInput value={kpi.target ?? undefined} onChange={(nv) => onChange({ ...kpi, target: nv ?? null })} placeholder="Target" />
        </div>
        <div>
          <NumberInput value={kpi.value ?? undefined} onChange={(nv) => onChange({ ...kpi, value: nv ?? null })} placeholder="Value" />
        </div>
        <div>
          <Select value={fmt} onChange={(f) => onChange({ ...kpi, format: f })} options={[{ value: "number", label: "Number" }, { value: "currency", label: "Currency" }, { value: "percent", label: "Percent" }]} />
        </div>
        <div>
          <TextInput value={kpi.unit ?? ""} onChange={(v) => onChange({ ...kpi, unit: v || undefined })} placeholder="Unit (optional)" />
        </div>
      </Row>
      <div className="flex">
        <IconButton label="Remove" tone="danger" onClick={onRemove} />
      </div>
    </div>
  );
}

function ScenarioEditor({ scenario, onChange, onRemove }: { scenario: Scenario; onChange: (next: Scenario) => void; onRemove: () => void }) {
  const multiplyKeysString = useMemo(() => (scenario.mutations.multiplyKeys ?? []).join(", "), [scenario.mutations.multiplyKeys]);
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
      <Row cols={6}>
        <div>
          <TextInput value={scenario.id} onChange={(v) => onChange({ ...scenario, id: v })} placeholder="ID" />
        </div>
        <div className="col-span-2">
          <TextInput value={scenario.label} onChange={(v) => onChange({ ...scenario, label: v })} placeholder="Label" />
        </div>
        <div className="col-span-3">
          <TextInput
            value={multiplyKeysString}
            onChange={(v) => {
              const arr = v
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              onChange({ ...scenario, mutations: { ...scenario.mutations, multiplyKeys: arr.length ? arr : undefined } });
            }}
            placeholder="multiplyKeys (comma-separated)"
          />
        </div>
      </Row>
      <div>
        <div className="text-sm text-white/70 mb-1">multiplyAssumptions</div>
        <NumberRecordEditor
          record={scenario.mutations.multiplyAssumptions}
          onChange={(rec) => onChange({ ...scenario, mutations: { ...scenario.mutations, multiplyAssumptions: rec } })}
          addLabel="Add assumption key"
        />
      </div>
      <div className="flex">
        <IconButton label="Remove" tone="danger" onClick={onRemove} />
      </div>
    </div>
  );
}

export function ModelEditor() {
  const { model, setModel, error } = useModelStore();

  const updateModel: ChangeHandler<Model> = (updater) => setModel((prev) => updater(prev));

  return (
    <div className="space-y-6">
      {error && <div className="text-sm text-amber-400">{error}</div>}

      <Section title="Assumptions">
        <AssumptionsEditor value={model.assumptions} onChange={(next) => updateModel((m) => ({ ...m, assumptions: next }))} />
      </Section>

      <Section
        title="Revenue"
        actions={<IconButton label="Add group" tone="success" onClick={() => updateModel((m) => ({ ...m, model: { ...m.model, revenues: [...m.model.revenues, { name: "", items: [] } as RevenueGroup] } }))} />}
      >
        <div className="space-y-3">
          {model.model.revenues.map((g, gi) => (
            <RevenueGroupEditor
              key={gi}
              group={g}
              onChange={(next) =>
                updateModel((m) => ({ ...m, model: { ...m.model, revenues: m.model.revenues.map((x, i) => (i === gi ? next : x)) } }))
              }
              onRemove={() => updateModel((m) => ({ ...m, model: { ...m.model, revenues: m.model.revenues.filter((_, i) => i !== gi) } }))}
            />
          ))}
          {model.model.revenues.length === 0 && <div className="text-sm text-white/60">No revenue groups</div>}
        </div>
      </Section>

      <Section
        title="Costs"
        actions={<IconButton label="Add group" tone="success" onClick={() => updateModel((m) => ({ ...m, model: { ...m.model, costs: [...m.model.costs, { cluster: "", items: [] } as CostGroup] } }))} />}
      >
        <div className="space-y-3">
          {model.model.costs.map((g, gi) => (
            <CostGroupEditor
              key={gi}
              group={g}
              onChange={(next) => updateModel((m) => ({ ...m, model: { ...m.model, costs: m.model.costs.map((x, i) => (i === gi ? next : x)) } }))}
              onRemove={() => updateModel((m) => ({ ...m, model: { ...m.model, costs: m.model.costs.filter((_, i) => i !== gi) } }))}
            />
          ))}
          {model.model.costs.length === 0 && <div className="text-sm text-white/60">No cost groups</div>}
        </div>
      </Section>

      <Section
        title="Cashflow"
        actions={<IconButton label="Add entry" tone="success" onClick={() => updateModel((m) => ({ ...m, cashflow: [...m.cashflow, { date: new Date().toISOString().slice(0, 10) } as CashflowEntry] }))} />}
      >
        <div className="space-y-3">
          {model.cashflow.map((c, ci) => (
            <CashflowEntryEditor
              key={ci}
              entry={c}
              onChange={(next) => updateModel((m) => ({ ...m, cashflow: m.cashflow.map((x, i) => (i === ci ? next : x)) }))}
              onRemove={() => updateModel((m) => ({ ...m, cashflow: m.cashflow.filter((_, i) => i !== ci) }))}
            />
          ))}
          {model.cashflow.length === 0 && <div className="text-sm text-white/60">No cashflow entries</div>}
        </div>
      </Section>

      <Section
        title="Risks"
        actions={<IconButton label="Add risk" tone="success" onClick={() => updateModel((m) => ({ ...m, risks: [...m.risks, { risk: "", severity: "Low", mitigation: "" } as Risk] }))} />}
      >
        <div className="space-y-3">
          {model.risks.map((r, ri) => (
            <RiskEditor key={ri} risk={r} onChange={(next) => updateModel((m) => ({ ...m, risks: m.risks.map((x, i) => (i === ri ? next : x)) }))} onRemove={() => updateModel((m) => ({ ...m, risks: m.risks.filter((_, i) => i !== ri) }))} />
          ))}
          {model.risks.length === 0 && <div className="text-sm text-white/60">No risks</div>}
        </div>
      </Section>

      <Section
        title="KPIs"
        actions={<IconButton label="Add KPI" tone="success" onClick={() => updateModel((m) => ({ ...m, kpis: [...m.kpis, { label: "", target: null, value: null, format: "number" } as Kpi] }))} />}
      >
        <div className="space-y-3">
          {model.kpis.map((k, ki) => (
            <KpiEditor key={ki} kpi={k} onChange={(next) => updateModel((m) => ({ ...m, kpis: m.kpis.map((x, i) => (i === ki ? next : x)) }))} onRemove={() => updateModel((m) => ({ ...m, kpis: m.kpis.filter((_, i) => i !== ki) }))} />
          ))}
          {model.kpis.length === 0 && <div className="text-sm text-white/60">No KPIs</div>}
        </div>
      </Section>

      <Section
        title="Scenarios"
        actions={<IconButton label="Add scenario" tone="success" onClick={() => updateModel((m) => ({ ...m, scenarios: [...m.scenarios, { id: "", label: "", mutations: {} } as Scenario] }))} />}
      >
        <div className="space-y-3">
          {model.scenarios.map((s, si) => (
            <ScenarioEditor key={si} scenario={s} onChange={(next) => updateModel((m) => ({ ...m, scenarios: m.scenarios.map((x, i) => (i === si ? next : x)) }))} onRemove={() => updateModel((m) => ({ ...m, scenarios: m.scenarios.filter((_, i) => i !== si) }))} />
          ))}
          {model.scenarios.length === 0 && <div className="text-sm text-white/60">No scenarios</div>}
        </div>
      </Section>
    </div>
  );
}

export default ModelEditor;

