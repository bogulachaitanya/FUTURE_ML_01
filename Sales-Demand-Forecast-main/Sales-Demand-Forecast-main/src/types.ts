/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface MetricSummary {
  mae: number;
  rmse: number;
  r2: number;
  mape: number;
}

export interface PreprocessingStep {
  name: string;
  description: string;
  count: number;
  status: 'info' | 'success' | 'warning';
}

export interface PreprocessedData {
  headers: string[];
  rows: Record<string, any>[];
  summary: {
    totalRows: number;
    cleanedRows: number;
    duplicatesRemoved: number;
    missingValuesImputed: number;
    outliersDetected: number;
  };
  preprocessingSteps: PreprocessingStep[];
}

export interface DataRow {
  date: string;
  salesQuantity: number;
  revenue: number;
  productName?: string;
  region?: string;
  category?: string;
}

export interface ForecastPoint {
  date: string;
  actual: number | null;
  predicted: number;
  isForecast: boolean;
  weekend: boolean;
  dayOfWeek: string;
  month: string;
  quarter: number;
}

export interface ModelComparison {
  name: string;
  mae: number;
  rmse: number;
  r2: number;
  mape: number;
  rank: number;
}

export interface AIInsights {
  executiveSummary: string;
  highDemandPeriods: string[];
  lowPerformingMonths: string[];
  inventoryRecommendations: string[];
  staffingSuggestions: string[];
  revenueOpportunities: string[];
  demandFluctAnalysis: string;
}

export interface ForecastResultResponse {
  id: string;
  datasetName: string;
  forecastDays: number;
  modelName: string;
  metrics: MetricSummary;
  predictions: ForecastPoint[];
  modelComparison: ModelComparison[];
  bestModelName: string;
  historicalPreamble: DataRow[];
  insights?: AIInsights;
  createdAt: string;
}
