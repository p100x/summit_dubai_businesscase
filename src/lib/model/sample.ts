import { Model } from "./schema";

export const sampleModel: Model = {
  assumptions: {
    eur_to_aed: 4.3,
    pax_total: 60,
    nights_included: 3,
    room_commitment: 265,
    day_delegate_rate: 300,
    guaranteed_pax: 100,
    dinner_cost_pp: 500,
    fx_lock_pct: 0.7,
  },
  model: {
    revenues: [
      {
        name: "Tickets",
        items: [
          { name: "All-Inclusive Full", units: 5, price_eur: 5997 },
          { name: "All-Inclusive 1K", units: 35, price_eur: 4997 },
          { name: "All-Inclusive P10X", units: 15, price_eur: 2997 },
          { name: "Conference-Only / Local", units: 5, price_eur: 0 },
        ],
      },
      {
        name: "Upsells",
        items: [
          { name: "Extra nights margin", units: 96, margin_eur: 80 },
        ],
      },
    ],
    costs: [
      {
        cluster: "Hotel – Rooms & Meetings",
        items: [
          { name: "Rooms commitment", value: { amount: 535_725 } },
          { name: "Tourism Dirham", value: { formula: "room_commitment * 20 / 1" } },
          { name: "Day Delegate", value: { amount: 90_000 } },
          { name: "Room-drop amenity", value: { formula: "room_commitment * 30" } },
        ],
      },
      {
        cluster: "Operating",
        items: [
          { name: "F&B Group Dinners", value: { formula: "pax_total * 3 * dinner_cost_pp" } },
          { name: "VIP Airport Transfers", value: { amount: 36_000 } },
          { name: "Videographer (4k€)", value: { formula: "4000 * eur_to_aed" } },
          { name: "Team hotel rooms", value: { amount: 20_000 } },
          { name: "Team car rental", value: { amount: 2_500 } },
          { name: "Permit fee (10k€)", value: { formula: "10000 * eur_to_aed" } },
          { name: "General expenses (5k€)", value: { formula: "5000 * eur_to_aed" } },
        ],
      },
    ],
  },
  cashflow: [
    { date: "2025-07-10", label: "Hotel deposit 10%", outflow: { amount: 61_073 } },
    { date: "2025-07-10", label: "Early-bird cash <25 tix", inflow: { amount: 400_000 } },
    { date: "2025-08-10", label: "Hotel milestone", outflow: { amount: 61_073 } },
    { date: "2025-08-10", label: ">50 tickets", inflow: { amount: 700_000 } },
    { date: "2025-09-10", label: "Hotel milestone", outflow: { amount: 183_218 } },
    { date: "2025-09-10", label: "Full", inflow: { amount: 900_000 } },
    { date: "2025-10-10", label: "Hotel milestone", outflow: { amount: 305_363 } },
    { date: "2025-11-15", label: "On-site costs", outflow: { amount: 258_248 } },
    { date: "2025-11-17", label: "Upsell nights", inflow: { amount: 33_024 } },
  ],
  risks: [
    { risk: "Attrition < 90%", severity: "High", mitigation: "Over-sell 10% contingency; dynamic re-marketing" },
    { risk: "Late ticketing vs deposits", severity: "Med", mitigation: "Escalators; invoice corporates net 14d" },
    { risk: "FX volatility EUR/AED", severity: "Med", mitigation: "Lock 70% via forward by Sep" },
  ],
  kpis: [
    { label: "Tickets sold", target: 60, value: 22, format: "number" },
    { label: "Cash cover vs deposits", target: 1.4, value: 2.0, format: "number", unit: "x" },
    { label: "Gross margin", target: 0.2, value: 0.215, format: "percent" },
  ],
  scenarios: [
    { id: "base", label: "Base", mutations: {} },
    { id: "price_up_10", label: "+10% Price", mutations: { multiplyKeys: ["price_eur", "price_aed"], multiplyAssumptions: {} } },
    { id: "price_down_10", label: "-10% Price", mutations: { multiplyKeys: ["price_eur", "price_aed"], multiplyAssumptions: {} } },
  ],
};

