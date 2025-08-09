"use client";
import { useModelStore } from "@/store/modelStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonKpiCard } from "@/components/ComparisonKpiCard";
import { CollapsibleTable } from "@/components/CollapsibleTable";
import { WaterfallChart } from "@/components/Charts";
import { CollapsibleModelEditor } from "@/components/CollapsibleModelEditor";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { BusinessCaseManager } from "@/components/BusinessCaseManager";
import { RealtimeToggle } from "@/components/RealtimeToggle";
import RoomCalculator from "@/components/RoomCalculator";

function formatCurrency(n: number, currencyCode: 'EUR' | 'AED') {
  const locale = currencyCode === 'EUR' ? 'de-DE' : 'en-AE';
  return new Intl.NumberFormat(locale, { 
    style: "currency", 
    currency: currencyCode, 
    maximumFractionDigits: 0 
  }).format(n);
}

export default function Home() {
  const { evaluation, model, currency, realtimeComparison, isLoadingRealtime } = useModelStore();
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-emerald-50/20 text-zinc-900">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
              FELS Wealth Summit 2025
            </h1>
            <p className="text-zinc-500">Integrated Business Case Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <BusinessCaseManager />
            <RealtimeToggle />
            <CurrencySwitcher />
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              EUR/AED: {fx.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ComparisonKpiCard 
            label="Gross Revenue" 
            planValue={convertAmount(evaluation.revenueAED)} 
            actualValue={realtimeComparison?.realtimeData ? convertAmount(realtimeComparison.realtimeData.revenueAED) : null}
            variance={realtimeComparison?.variance ? convertAmount(realtimeComparison.variance.revenueAED) : null}
            variancePercent={realtimeComparison?.variance?.revenuePercent ?? null}
            format="currency" 
            currency={currency}
            icon={<span>💰</span>} 
            isLoading={isLoadingRealtime}
          />
          <ComparisonKpiCard 
            label="Total Cost" 
            planValue={convertAmount(evaluation.costAED)} 
            actualValue={realtimeComparison?.realtimeData ? convertAmount(realtimeComparison.realtimeData.costAED) : null}
            variance={realtimeComparison?.variance ? convertAmount(realtimeComparison.variance.costAED) : null}
            variancePercent={realtimeComparison?.variance?.costPercent ?? null}
            format="currency" 
            currency={currency}
            icon={<span>🧾</span>} 
            isLoading={isLoadingRealtime}
          />
          <ComparisonKpiCard 
            label="EBITDA" 
            planValue={convertAmount(evaluation.ebitdaAED)} 
            actualValue={realtimeComparison?.realtimeData ? convertAmount(realtimeComparison.realtimeData.ebitdaAED) : null}
            variance={realtimeComparison?.variance ? convertAmount(realtimeComparison.variance.ebitdaAED) : null}
            variancePercent={realtimeComparison?.variance?.ebitdaPercent ?? null}
            format="currency" 
            currency={currency}
            icon={<span>📈</span>} 
            isLoading={isLoadingRealtime}
          />
          <ComparisonKpiCard 
            label="EBITDA Margin" 
            planValue={evaluation.ebitdaMargin} 
            actualValue={realtimeComparison?.realtimeData?.ebitdaMargin ?? null}
            variance={realtimeComparison?.variance?.ebitdaMarginPoints !== null && realtimeComparison?.variance?.ebitdaMarginPoints !== undefined ? realtimeComparison.variance.ebitdaMarginPoints / 100 : null}
            variancePercent={realtimeComparison?.variance?.ebitdaMarginPoints ?? null}
            format="percent" 
            icon={<span>➗</span>} 
            isLoading={isLoadingRealtime}
          />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Revenue to EBITDA Waterfall</h2>
          <WaterfallChart
            revenueGroups={evaluation.revenueGroups}
            costGroups={evaluation.costGroups}
            ebitdaAED={evaluation.ebitdaAED}
            currency={currency}
            exchangeRate={fx}
          />
        </div>

        <RoomCalculator />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Revenue Details</h2>
            <CollapsibleTable 
              columns={[{ key: "name", label: "Item" }, { key: "amount", label: currency, align: "right" }]} 
              groups={evaluation.revenueGroups.map((g, gi) => ({
                name: g.name,
                subtotal: currency_format(g.subtotalAED),
                items: g.items.map((item, ii) => {
                  const originalItem = model.model.revenues[gi]?.items[ii];
                  let details = "";
                  if (originalItem) {
                    const parts = [];
                    if (originalItem.units) parts.push(`${originalItem.units} Einheiten`);
                    if (originalItem.price_eur) parts.push(`€${originalItem.price_eur}`);
                    if (originalItem.price_aed) parts.push(`${originalItem.price_aed} AED`);
                    if (originalItem.margin_eur) parts.push(`Marge: €${originalItem.margin_eur}`);
                    if (originalItem.margin_aed) parts.push(`Marge: ${originalItem.margin_aed} AED`);
                    if (originalItem.value && "formula" in originalItem.value) parts.push(`Formel: ${originalItem.value.formula}`);
                    details = parts.join(" • ");
                  }
                  return {
                    name: item.name,
                    amount: currency_format(item.amountAED),
                    details
                  };
                })
              }))}
            />
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Cost Details</h2>
            <CollapsibleTable 
              columns={[{ key: "name", label: "Item" }, { key: "amount", label: currency, align: "right" }]} 
              groups={evaluation.costGroups.map((g, gi) => ({
                name: g.name,
                subtotal: currency_format(g.subtotalAED),
                items: g.items.map((item, ii) => {
                  const originalItem = model.model.costs[gi]?.items[ii];
                  let details = "";
                  if (originalItem) {
                    const parts = [];
                    if (originalItem.value && "formula" in originalItem.value) {
                      parts.push(`Formel: ${originalItem.value.formula}`);
                    } else if (originalItem.value && "amount" in originalItem.value) {
                      parts.push(`Betrag: ${originalItem.value.amount} AED`);
                    }
                    if (originalItem.inputs) {
                      const inputs = Object.entries(originalItem.inputs).map(([key, value]) => `${key}=${value}`);
                      if (inputs.length > 0) parts.push(`Eingaben: ${inputs.join(", ")}`);
                    }
                    details = parts.join(" • ");
                  }
                  return {
                    name: item.name,
                    amount: currency_format(item.amountAED),
                    details
                  };
                })
              }))}
            />
          </div>
        </div>

        <CollapsibleModelEditor />
      </div>
    </div>
  );
}
