"use client";
import { useModelStore } from "@/store/modelStore";
import { KpiCard } from "@/components/KpiCard";
import { SimpleTable } from "@/components/Tables";
import { WaterfallChart } from "@/components/Charts";
import ModelEditor from "@/components/ModelEditor";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { BusinessCaseManager } from "@/components/BusinessCaseManager";

function formatCurrency(n: number, currencyCode: 'EUR' | 'AED') {
  const locale = currencyCode === 'EUR' ? 'de-DE' : 'en-AE';
  return new Intl.NumberFormat(locale, { 
    style: "currency", 
    currency: currencyCode, 
    maximumFractionDigits: 0 
  }).format(n);
}

export default function Home() {
  const { evaluation, error, model, currency } = useModelStore();
  const fxAssumption = (model.assumptions as Record<string, unknown>)["eur_to_aed"];
  const fx = typeof fxAssumption === "number" ? fxAssumption : Number(fxAssumption ?? 0);

  // Helper function to convert AED amounts to EUR when needed
  const convertAmount = (amountAED: number) => {
    return currency === 'EUR' ? amountAED / fx : amountAED;
  };

  // Helper function to format amounts in selected currency
  const currency_format = (amountAED: number) => {
    const convertedAmount = convertAmount(amountAED);
    return formatCurrency(convertedAmount, currency);
  };

  const revenueRows = evaluation.revenueGroups.flatMap((g) => [
    { name: `— ${g.name}`, amount: <span className="font-medium">{currency_format(g.subtotalAED)}</span> },
    ...g.items.map((it) => ({ name: it.name, amount: currency_format(it.amountAED) })),
  ]);
  const costRows = evaluation.costGroups.flatMap((g) => [
    { name: `— ${g.name}`, amount: <span className="font-medium">{currency_format(g.subtotalAED)}</span> },
    ...g.items.map((it) => ({ name: it.name, amount: currency_format(it.amountAED) })),
  ]);

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
              FELS Wealth Summit 2025
            </h1>
            <p className="text-white/60">Integrated Business Case Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <BusinessCaseManager />
            <CurrencySwitcher />
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              EUR/AED: {fx.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <KpiCard 
            label="Gross Revenue" 
            value={convertAmount(evaluation.revenueAED)} 
            format="currency" 
            currency={currency}
            icon={<span>💰</span>} 
          />
          <KpiCard 
            label="Total Cost" 
            value={convertAmount(evaluation.costAED)} 
            format="currency" 
            currency={currency}
            icon={<span>🧾</span>} 
          />
          <KpiCard 
            label="EBITDA" 
            value={convertAmount(evaluation.ebitdaAED)} 
            format="currency" 
            currency={currency}
            icon={<span>📈</span>} 
          />
          <KpiCard 
            label="EBITDA Margin" 
            value={evaluation.ebitdaMargin} 
            format="percent" 
            icon={<span>➗</span>} 
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Revenue to EBITDA Waterfall</h2>
          <WaterfallChart
            revenueGroups={evaluation.revenueGroups}
            costGroups={evaluation.costGroups}
            ebitdaAED={evaluation.ebitdaAED}
            currency={currency}
            exchangeRate={fx}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">Revenue Details</h2>
            <SimpleTable columns={[{ key: "name", label: "Item" }, { key: "amount", label: currency, align: "right" }]} rows={revenueRows} />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">Cost Details</h2>
            <SimpleTable columns={[{ key: "name", label: "Item" }, { key: "amount", label: currency, align: "right" }]} rows={costRows} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Model Editor</h2>
            {error && <span className="text-sm text-amber-400">{error}</span>}
          </div>
          <ModelEditor />
        </div>
      </div>
    </div>
  );
}
