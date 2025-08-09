export type RealtimeData = {
  revenueAED: number;
  costAED: number;
  ebitdaAED: number;
  ebitdaMargin: number | null;
  timestamp: string;
  revenueGroups: RealtimeRevenueGroup[];
  costGroups: RealtimeCostGroup[];
};

export type RealtimeRevenueGroup = {
  name: string;
  subtotalAED: number;
  items: RealtimeRevenueItem[];
};

export type RealtimeRevenueItem = {
  name: string;
  amountAED: number;
  units?: number;
};

export type RealtimeCostGroup = {
  name: string;
  subtotalAED: number;
  items: RealtimeCostItem[];
};

export type RealtimeCostItem = {
  name: string;
  amountAED: number;
};

export type RealtimeComparison = {
  realtimeData: RealtimeData | null;
  planData: {
    revenueAED: number;
    costAED: number;
    ebitdaAED: number;
    ebitdaMargin: number;
  };
  variance: {
    revenueAED: number;
    revenuePercent: number;
    costAED: number;
    costPercent: number;
    ebitdaAED: number;
    ebitdaPercent: number;
    ebitdaMarginPoints: number | null;
  } | null;
};