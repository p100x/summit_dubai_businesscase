import { create } from "zustand";
import { Model } from "@/lib/model/schema";
import { sampleModel } from "@/lib/model/sample";
import { evaluateModel, EvaluationResult } from "@/lib/model/engine";
import { parseModelFromYaml, stringifyModelToYaml } from "@/lib/model/yaml";
import { RealtimeData, RealtimeComparison } from "@/lib/realtime/types";
import { fetchRealtimeData, calculateComparison } from "@/lib/realtime/service";

type Currency = 'EUR' | 'AED';

type BusinessCase = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type ModelState = {
  rawYaml: string;
  model: Model;
  evaluation: EvaluationResult;
  error?: string;
  currency: Currency;
  currentBusinessCaseId?: string;
  businessCases: BusinessCase[];
  isLoading: boolean;
  isSaving: boolean;
  realtimeData: RealtimeData | null;
  realtimeComparison: RealtimeComparison | null;
  isLoadingRealtime: boolean;
  realtimeEnabled: boolean;
  loadYaml: (yaml: string) => void;
  updateYaml: (yaml: string) => void;
  setModel: (updater: (m: Model) => Model) => void;
  exportYaml: () => string;
  setCurrency: (currency: Currency) => void;
  fetchBusinessCases: () => Promise<void>;
  loadBusinessCase: (id: string) => Promise<void>;
  saveBusinessCase: (name: string, description?: string) => Promise<void>;
  updateBusinessCase: (id: string, name: string, description?: string) => Promise<void>;
  deleteBusinessCase: (id: string) => Promise<void>;
  newBusinessCase: () => void;
  fetchRealtimeData: () => Promise<void>;
  toggleRealtimeData: () => void;
  startRealtimeUpdates: () => void;
  stopRealtimeUpdates: () => void;
};

function initialYaml(): string {
  return stringifyModelToYaml(sampleModel);
}

let realtimeInterval: NodeJS.Timeout | null = null;

export const useModelStore = create<ModelState>((set, get) => ({
  rawYaml: initialYaml(),
  model: sampleModel,
  evaluation: evaluateModel(sampleModel),
  error: undefined,
  currency: 'AED',
  currentBusinessCaseId: undefined,
  businessCases: [],
  isLoading: false,
  isSaving: false,
  realtimeData: null,
  realtimeComparison: null,
  isLoadingRealtime: false,
  realtimeEnabled: false,
  loadYaml: (yaml: string) => {
    try {
      const model = parseModelFromYaml(yaml);
      set({ rawYaml: yaml, model, evaluation: evaluateModel(model), error: undefined });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      set({ rawYaml: yaml, error: message });
    }
  },
  updateYaml: (yaml: string) => {
    try {
      const model = parseModelFromYaml(yaml);
      set({ rawYaml: yaml, model, evaluation: evaluateModel(model), error: undefined });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      // keep last valid model, but update text and show error
      set({ rawYaml: yaml, error: message });
    }
  },
  setModel: (updater) => {
    const next = updater(get().model);
    set({ model: next, evaluation: evaluateModel(next), rawYaml: stringifyModelToYaml(next), error: undefined });
  },
  exportYaml: () => stringifyModelToYaml(get().model),
  setCurrency: (currency) => set({ currency }),
  fetchBusinessCases: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/business-cases');
      if (!response.ok) throw new Error('Failed to fetch business cases');
      const businessCases = await response.json();
      set({ businessCases, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch business cases:', error);
      set({ isLoading: false });
    }
  },
  loadBusinessCase: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/business-cases/${id}`);
      if (!response.ok) throw new Error('Failed to load business case');
      const businessCase = await response.json();
      get().loadYaml(businessCase.modelYaml);
      set({ currentBusinessCaseId: id, isLoading: false });
    } catch (error) {
      console.error('Failed to load business case:', error);
      set({ isLoading: false, error: 'Failed to load business case' });
    }
  },
  saveBusinessCase: async (name: string, description?: string) => {
    set({ isSaving: true });
    try {
      const response = await fetch('/api/business-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          modelYaml: get().rawYaml,
        }),
      });
      if (!response.ok) throw new Error('Failed to save business case');
      const businessCase = await response.json();
      set({ currentBusinessCaseId: businessCase.id, isSaving: false });
      await get().fetchBusinessCases();
    } catch (error) {
      console.error('Failed to save business case:', error);
      set({ isSaving: false, error: 'Failed to save business case' });
    }
  },
  updateBusinessCase: async (id: string, name: string, description?: string) => {
    set({ isSaving: true });
    try {
      const response = await fetch(`/api/business-cases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          modelYaml: get().rawYaml,
        }),
      });
      if (!response.ok) throw new Error('Failed to update business case');
      set({ isSaving: false });
      await get().fetchBusinessCases();
    } catch (error) {
      console.error('Failed to update business case:', error);
      set({ isSaving: false, error: 'Failed to update business case' });
    }
  },
  deleteBusinessCase: async (id: string) => {
    try {
      const response = await fetch(`/api/business-cases/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete business case');
      if (get().currentBusinessCaseId === id) {
        set({ currentBusinessCaseId: undefined });
      }
      await get().fetchBusinessCases();
    } catch (error) {
      console.error('Failed to delete business case:', error);
      set({ error: 'Failed to delete business case' });
    }
  },
  newBusinessCase: () => {
    const yaml = initialYaml();
    get().loadYaml(yaml);
    set({ currentBusinessCaseId: undefined });
  },
  fetchRealtimeData: async () => {
    set({ isLoadingRealtime: true });
    try {
      const realtimeData = await fetchRealtimeData();
      const comparison = calculateComparison(realtimeData, get().evaluation);
      set({ 
        realtimeData, 
        realtimeComparison: comparison, 
        isLoadingRealtime: false 
      });
    } catch (error) {
      console.error('Failed to fetch realtime data:', error);
      set({ isLoadingRealtime: false });
    }
  },
  toggleRealtimeData: () => {
    const { realtimeEnabled } = get();
    if (realtimeEnabled) {
      get().stopRealtimeUpdates();
    } else {
      // Just fetch once, no auto-refresh
      get().fetchRealtimeData();
      set({ realtimeEnabled: true });
    }
  },
  startRealtimeUpdates: () => {
    // Only fetch once, no interval
    get().fetchRealtimeData();
  },
  stopRealtimeUpdates: () => {
    if (realtimeInterval) {
      clearInterval(realtimeInterval);
      realtimeInterval = null;
    }
    set({ 
      realtimeData: null, 
      realtimeComparison: null,
      isLoadingRealtime: false,
      realtimeEnabled: false
    });
  },
}));

