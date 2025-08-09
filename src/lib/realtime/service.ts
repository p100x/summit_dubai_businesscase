import { RealtimeData, RealtimeComparison } from './types';
import { EvaluationResult } from '../model/engine';

// Simulate real-time data fetching
export async function fetchRealtimeData(): Promise<RealtimeData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Real-time data: 0 revenue, 61,073 AED costs
  const realtimeRevenueAED = 0;
  const realtimeCostAED = 61073;
  const realtimeEbitdaAED = realtimeRevenueAED - realtimeCostAED;
  const realtimeEbitdaMargin = realtimeRevenueAED > 0 ? realtimeEbitdaAED / realtimeRevenueAED : null;
  
  return {
    revenueAED: realtimeRevenueAED,
    costAED: realtimeCostAED,
    ebitdaAED: realtimeEbitdaAED,
    ebitdaMargin: realtimeEbitdaMargin,
    timestamp: new Date().toISOString(),
    revenueGroups: [
      {
        name: "Tickets",
        subtotalAED: 0,
        items: [
          { name: "All-Inclusive Full", amountAED: 0, units: 0 },
          { name: "All-Inclusive 1K", amountAED: 0, units: 0 },
          { name: "All-Inclusive P10X", amountAED: 0, units: 0 },
          { name: "Conference-Only / Local", amountAED: 0, units: 0 }
        ]
      },
      {
        name: "Upsells",
        subtotalAED: 0,
        items: [
          { name: "Extra nights margin", amountAED: 0, units: 0 }
        ]
      }
    ],
    costGroups: [
      {
        name: "Hotel – Rooms & Meetings",
        subtotalAED: 61073,
        items: [
          { name: "Hotel deposit", amountAED: 61073 }
        ]
      }
    ]
  };
}

export function calculateComparison(
  realtimeData: RealtimeData | null,
  planData: EvaluationResult
): RealtimeComparison {
  if (!realtimeData) {
    return {
      realtimeData: null,
      planData: {
        revenueAED: planData.revenueAED,
        costAED: planData.costAED,
        ebitdaAED: planData.ebitdaAED,
        ebitdaMargin: planData.ebitdaMargin,
      },
      variance: null,
    };
  }

  const revenueVariance = realtimeData.revenueAED - planData.revenueAED;
  const costVariance = realtimeData.costAED - planData.costAED;
  const ebitdaVariance = realtimeData.ebitdaAED - planData.ebitdaAED;
  const ebitdaMarginVariance = realtimeData.ebitdaMargin !== null ? 
    (realtimeData.ebitdaMargin - planData.ebitdaMargin) * 100 : null;

  return {
    realtimeData,
    planData: {
      revenueAED: planData.revenueAED,
      costAED: planData.costAED,
      ebitdaAED: planData.ebitdaAED,
      ebitdaMargin: planData.ebitdaMargin,
    },
    variance: {
      revenueAED: revenueVariance,
      revenuePercent: planData.revenueAED ? (revenueVariance / planData.revenueAED) * 100 : 0,
      costAED: costVariance,
      costPercent: planData.costAED ? (costVariance / planData.costAED) * 100 : 0,
      ebitdaAED: ebitdaVariance,
      ebitdaPercent: planData.ebitdaAED ? (ebitdaVariance / planData.ebitdaAED) * 100 : 0,
      ebitdaMarginPoints: ebitdaMarginVariance, // Already in percentage points
    },
  };
}