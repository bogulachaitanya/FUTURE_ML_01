/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  User as UserIcon, 
  LogOut, 
  Upload, 
  Activity, 
  CheckCircle2, 
  FileSpreadsheet, 
  Calendar, 
  Cpu, 
  AlertCircle, 
  Trash2, 
  Download, 
  Printer, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Bot
} from 'lucide-react';
import AuthPage from './components/AuthPage';
import UploadModal from './components/UploadModal';
import ForecastChart from './components/ForecastChart';
import InsightsView from './components/InsightsView';
import { User, PreprocessedData, ForecastPoint, MetricSummary, ModelComparison, ForecastResultResponse } from './types';

export default function App() {
  // Authentication states
  const [token, setToken] = useState<string | null>(localStorage.getItem('forecasting_jwt_token'));
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active forecasting datasets
  const [activeFilename, setActiveFilename] = useState<string>('');
  const [preprocessedData, setPreprocessedData] = useState<PreprocessedData | null>(null);
  const [rawCsvText, setRawCsvText] = useState<string>('');
  
  // Predict execution states
  const [selectedModel, setSelectedModel] = useState<string>('Auto-Select');
  const [forecastDays, setForecastDays] = useState<number>(30);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Forecast results
  const [predictions, setPredictions] = useState<ForecastPoint[]>([]);
  const [metrics, setMetrics] = useState<MetricSummary | null>(null);
  const [modelComparison, setModelComparison] = useState<ModelComparison[]>([]);
  const [bestModelName, setBestModelName] = useState<string>('');
  const [insights, setInsights] = useState<any | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  // Operations run history
  const [history, setHistory] = useState<ForecastResultResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Uploader visibility
  const [showUploader, setShowUploader] = useState(false);

  // Check user session on boot
  useEffect(() => {
    checkUserSession();
  }, [token]);

  const checkUserSession = async () => {
    if (!token) {
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        loadHistory(token);
      } else {
        handleLogout();
      }
    } catch (e) {
      // Offline fallback profile matching token
      setUser({ id: 'u_id_1', email: 'user@company.com', name: 'Operations Lead', createdAt: new Date().toISOString() });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthSuccess = (newToken: string, authenticatedUser: User) => {
    localStorage.setItem('forecasting_jwt_token', newToken);
    setToken(newToken);
    setUser(authenticatedUser);
    loadHistory(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('forecasting_jwt_token');
    setToken(null);
    setUser(null);
    setPreprocessedData(null);
    setPredictions([]);
    setMetrics(null);
    setHistory([]);
  };

  // Load user's historic forecasting runs
  const loadHistory = async (activeToken: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/forecast/history', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        
        // Auto-load most recent run if exists to look stunning on initial load!
        if (data.length > 0 && !preprocessedData) {
          loadHistoryRun(data[0]);
        }
      }
    } catch (e) {
      console.error('Offline history load failed', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadHistoryRun = (run: ForecastResultResponse) => {
    setActiveRunId(run.id);
    setActiveFilename(run.datasetName);
    setForecastDays(run.forecastDays);
    
    // Simulate preprocessedData object from history for visual previews
    setPreprocessedData({
      headers: ['Date', 'Sales Quantity', 'Revenue', 'Product Name', 'Region', 'Category'],
      rows: run.historicalPreamble as any[],
      summary: {
        totalRows: run.historicalPreamble.length,
        cleanedRows: run.historicalPreamble.length,
        duplicatesRemoved: 0,
        missingValuesImputed: 0,
        outliersDetected: 0
      },
      preprocessingSteps: [
        { name: 'Database Reload', description: `Restored session parameters from forecasting executed ${new Date(run.createdAt).toLocaleString()}`, count: run.historicalPreamble.length, status: 'success' }
      ]
    });
    
    setPredictions(run.predictions);
    setMetrics(run.metrics);
    setModelComparison(run.modelComparison);
    setBestModelName(run.bestModelName);
    setInsights(run.insights);
    setSelectedModel(run.modelName.includes(' (Auto)') ? 'Auto-Select' : run.modelName);
    setShowUploader(false);
  };

  const handleDeleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this forecasting execution?')) return;

    try {
      const res = await fetch(`/api/forecast/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
        if (activeRunId === id) {
          // Clear active screen values
          setPreprocessedData(null);
          setPredictions([]);
          setMetrics(null);
          setActiveRunId(null);
        }
      }
    } catch (error) {
      alert('Network error occurs when removing historical parameter.');
    }
  };

  // Triggers the mathematical engine prediction run on the server
  const handleExecuteForecast = async () => {
    if (!preprocessedData || preprocessedData.rows.length === 0) return;

    setLoadingForecast(true);
    setErrorText(null);

    try {
      const response = await fetch('/api/forecast/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          datasetName: activeFilename,
          historicalData: preprocessedData.rows,
          forecastDays: forecastDays,
          selectedModel: selectedModel,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Computation failed.');
      }

      // Populate results
      setActiveRunId(data.id);
      setPredictions(data.predictions);
      setMetrics(data.metrics);
      setModelComparison(data.modelComparison);
      setBestModelName(data.bestModelName);
      setInsights(data.insights);

      // Refresh operations history sidebar list
      if (token) loadHistory(token);
    } catch (err: any) {
      setErrorText(err.message || 'Forecast calculation failed. Please inspect logs.');
    } finally {
      setLoadingForecast(false);
    }
  };

  // Download cleaned historical datasets
  const downloadCleanedDatasetCSV = () => {
    if (!preprocessedData) return;
    
    let csv = 'Date,Sales Quantity,Revenue,ProductName,Region,Category\n';
    preprocessedData.rows.forEach((row: any) => {
      csv += `${row.date},${row.salesQuantity},${row.revenue},"${row.productName || 'N/A'}","${row.region || 'N/A'}","${row.category || 'N/A'}"\n`;
    });

    triggerFileDownload(csv, `cleaned_${activeFilename.toLowerCase().replace(/\s+/g, '_')}`);
  };

  // Download forecasts
  const downloadPredictionsCSV = () => {
    if (predictions.length === 0) return;

    let csv = 'Date,Actual_Sales,Predicted_Sales,Predicted_Revenue_USD,IsForecast,DayOfWeek,Month,Quarter\n';
    predictions.forEach(p => {
      csv += `${p.date},${p.actual ?? ''},${p.predicted},${p.predicted * 25.0},${p.isForecast},${p.dayOfWeek},${p.month},Q${p.quarter}\n`;
    });

    triggerFileDownload(csv, `forecast_${activeFilename.toLowerCase().replace(/\s+/g, '_')}_${forecastDays}d.csv`);
  };

  const triggerFileDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSS print styling trigger
  const handlePrintReport = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0B0D] flex flex-col items-center justify-center font-sans">
        <TrendingUp className="w-8 h-8 text-amber-500 animate-pulse mb-3" />
        <span className="text-slate-400 text-xs tracking-widest uppercase">Securing Endpoint Crypts...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Calculate sum counts for KPI previews
  const totalHistoricSales = preprocessedData?.rows.reduce((sum, h) => sum + h.salesQuantity, 0) || 0;
  
  // Average forecast revenue based on standard product value multiplier ($25)
  const forecastedRevenueTotal = predictions
    .filter(p => p.isForecast)
    .reduce((sum, p) => sum + p.predicted * 25.0, 0) || 0;

  const currentRunRecommendedModel = bestModelName || 'Holt-Winters';

  return (
    <div id="full-stack-main-viewport" className="min-h-screen bg-[#0A0B0D] selection:bg-amber-500/25 Selection:text-amber-100 flex flex-col font-sans text-slate-200">
      
      {/* 1. PROFESSIONAL BLACK & GOLD TOPBAR */}
      <header className="bg-[#12141C] border-b border-[#1E2235] px-6 py-4 flex flex-wrap justify-between items-center gap-4 relative z-20 print:hidden">
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-lg flex items-center justify-center shadow shadow-amber-500/10">
            <TrendingUp className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[9px] text-amber-400 font-mono tracking-widest uppercase font-bold">Predictive Intelligence Sandbox</span>
            <h1 className="text-sm font-bold tracking-tight text-white font-display">Sales & Demand Forecasting Workspace</h1>
          </div>
        </div>

        {/* User profile with secure database badge */}
        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex items-center space-x-1 border-r border-[#1E2235] pr-6 text-[10px] text-emerald-400 bg-emerald-500/[0.03] px-2.5 py-1 rounded-full border border-emerald-500/10 font-mono select-none">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Database Secured & Operational</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-xs font-bold text-white block">{user.name}</span>
              <span className="text-[10px] text-slate-500 font-mono block">{user.email}</span>
            </div>
            
            <button
              onClick={handleLogout}
              title="Sign Out of session"
              className="p-1.5 rounded bg-[#1C1F2B] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. DUAL-SECTION MAIN BENTO BOARD */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 xl:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
        <div className="absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-[#251A07]/5 via-transparent to-transparent pointer-events-none" />

        {/* LEFT COLUMN: ACTIVE CONTROL DECK & OPERATIONS HISTORY */}
        <section className="lg:col-span-1 space-y-6 print:hidden">
          
          {/* CONTROL MODULE CARD */}
          <div className="bg-[#12141A] border border-[#1E212E] rounded-xl p-5 space-y-5">
            <div className="flex justify-between items-center border-b border-[#202434] pb-3">
              <h2 className="text-xs font-bold tracking-wider text-amber-400 uppercase font-sans">
                Forecasting Parameters
              </h2>
              <button
                onClick={() => setShowUploader(true)}
                className="text-[11px] font-semibold text-amber-500 hover:text-amber-400 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Dataset</span>
              </button>
            </div>

            {preprocessedData ? (
              <div className="space-y-4">
                {/* File Statistics Info */}
                <div className="bg-[#1C1F2C] border border-[#2B2F44] rounded-lg p-3 text-xs flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-5 h-5 text-amber-500" />
                    <div>
                      <span className="font-bold text-slate-100 line-clamp-1 max-w-[130px]">{activeFilename}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{preprocessedData.summary.cleanedRows} Days Logged</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUploader(true)}
                    className="p-1 rounded bg-[#25293A] hover:bg-amber-500 hover:text-black text-slate-300 transition-all cursor-pointer text-[10px] font-semibold"
                  >
                    Change
                  </button>
                </div>

                {/* Machine Learning Model selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Predictive Engine Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#181D29] border border-[#2B3145] rounded-lg text-xs px-3 py-2.5 text-slate-200 outline-none focus:border-amber-500/40"
                  >
                    <option value="Auto-Select">🤖 Auto-Select Best-Evaluated Model</option>
                    <option value="Holt-Winters">📈 Holt-Winters Additive Method</option>
                    <option value="Linear Model">📉 Linear Trend + Seasonality</option>
                    <option value="AR(p) Regression">📊 Autoregressive Lag-Based Model</option>
                  </select>
                </div>

                {/* Horizon days selections */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 block">Forecast Timeline Horizon</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { l: '7 Days', d: 7 },
                      { l: '30 Days', d: 30 },
                      { l: '3 Mos', d: 90 },
                      { l: '1 Year', d: 365 },
                    ].map((btn) => (
                      <button
                        key={btn.d}
                        onClick={() => setForecastDays(btn.d)}
                        className={`py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer border ${
                          forecastDays === btn.d
                            ? 'bg-amber-500 text-black font-bold border-amber-500'
                            : 'bg-transparent text-slate-400 border-[#252837] hover:border-slate-600'
                        }`}
                      >
                        {btn.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error warning parameters */}
                {errorText && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] text-rose-400 flex items-start space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{errorText}</span>
                  </div>
                )}

                {/* Run Prediction Button */}
                <button
                  onClick={handleExecuteForecast}
                  disabled={loadingForecast}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-3 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-1 hover:shadow-lg hover:shadow-amber-500/10"
                >
                  <Cpu className="w-4 h-4 fill-black text-black" />
                  <span>{loadingForecast ? 'Computing ML Coefficients...' : 'Execute Forecasting Engine'}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-6">
                <FileSpreadsheet className="w-10 h-10 text-slate-600 mb-3" />
                <h3 className="text-xs font-bold text-slate-300">No Sales Logs Imported</h3>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[180px] leading-relaxed">
                  Provide transaction CSV lines to active prediction pipelines.
                </p>
                <button
                  onClick={() => setShowUploader(true)}
                  className="px-4 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 hover:text-black text-[11px] font-bold text-amber-500 mt-4 transition-colors cursor-pointer"
                >
                  Import Dataset CSV
                </button>
              </div>
            )}
          </div>

          {/* HISTORICAL RUNS SIDEBAR LIST */}
          <div className="bg-[#12141A] border border-[#1E212E] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase font-sans border-b border-[#202434] pb-3">
              Operations Forecast History
            </h3>

            {loadingHistory ? (
              <div className="text-center py-4 text-[10px] text-slate-500">Loading forecast history database...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-4 text-[10px] text-slate-500 leading-normal">
                No past transactions found. Run a prediction to register records.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadHistoryRun(item)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs cursor-pointer flex justify-between items-start group ${
                      activeRunId === item.id
                        ? 'bg-[#1C1F2B] border-amber-500/50'
                        : 'bg-[#15171F] border-[#202331] hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <div className="font-semibold text-slate-200 line-clamp-1">{item.datasetName}</div>
                      <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 font-mono">
                        <span>{item.forecastDays}d Horizon</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-amber-500 font-bold">{item.bestModelName}</span>
                      </div>
                      <span className="text-[8px] text-slate-500 block font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </section>

        {/* RIGHT BOARD: RESULTS DASHBOARD AND WORKSPACE PREVIEWS */}
        <section className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* SCREEN 1: FILE IMPORT MODAL LAYER */}
            {showUploader ? (
              <motion.div
                key="uploader-module"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-[#12141A] border border-[#1E212E] rounded-xl p-6"
              >
                <UploadModal 
                  onUploadSuccess={(fname, pData, csv) => {
                    setActiveFilename(fname);
                    setPreprocessedData(pData);
                    setRawCsvText(csv);
                    setShowUploader(false);
                    setPredictions([]);
                    setMetrics(null);
                    setInsights(null);
                    setActiveRunId(null);
                  }}
                  onClose={() => {
                    if (preprocessedData) setShowUploader(false);
                  }}
                />
              </motion.div>
            ) : (
              
              // SCREEN 2: MAIN METRIC BOARD AND SUMMARY
              <motion.div
                key="dashboard-module"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {preprocessedData ? (
                  <>
                    {/* TOP ACTION BAR: print and export utilities */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-[#12141A] border border-[#1E212E] px-4 py-2.5 rounded-xl print:hidden">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span className="text-xs font-bold">Active Workspace:</span>
                        <span className="text-xs font-mono px-2 py-0.5 bg-[#1B1D28] text-amber-500 border border-amber-500/10 rounded font-semibold">
                          {activeFilename}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        {predictions.length > 0 && (
                          <>
                            <button
                              onClick={downloadCleanedDatasetCSV}
                              className="px-3 py-1.5 rounded-lg bg-[#1B1D28] hover:bg-[#252839] border border-[#25293A] text-slate-300 font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Cleaned CSV</span>
                            </button>
                            <button
                              onClick={downloadPredictionsCSV}
                              className="px-3 py-1.5 rounded-lg bg-[#1B1D28] hover:bg-[#252839] border border-[#25293A] text-slate-300 font-semibold transition-all cursor-pointer flex items-center space-x-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Forecast CSV</span>
                            </button>
                            <button
                              onClick={handlePrintReport}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all cursor-pointer flex items-center space-x-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Intelligence Report</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* STATISTICAL BUSINESS KPI CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      
                      {/* CARD 1: Historical Sales Volume sum */}
                      <div className="bg-[#12141A] border border-[#1E212E] rounded-xl p-4.5">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-xs font-bold text-slate-400 font-sans">Historical Gross Units</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-full font-mono">
                            Logs Cleaned
                          </span>
                        </div>
                        <div className="text-2xl font-bold font-display text-white tracking-tight">
                          {totalHistoricSales.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                          Aggregated over {preprocessedData.summary.cleanedRows} Days
                        </span>
                      </div>

                      {/* CARD 2: Predicted Future Sales Units Average */}
                      <div className="bg-[#12141A] border border-[#1E212E] rounded-xl p-4.5">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-xs font-bold text-slate-400 font-sans">Projected Sales Average</span>
                          <span className="text-[10px] text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded-full font-mono">
                            🔮 Forecast
                          </span>
                        </div>
                        <div className="text-2xl font-bold font-display text-amber-400 tracking-tight">
                          {predictions.length > 0 ? (
                            Math.round(
                              predictions.filter(p => p.isForecast).reduce((sum, p) => sum + p.predicted, 0) / forecastDays
                            ).toLocaleString()
                          ) : '---'} <span className="text-xs font-semibold text-slate-400 font-sans">units/day</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                          Computed {forecastDays}-day Operational Horizon
                        </span>
                      </div>

                      {/* CARD 3: Forecast Revenue Value (Avg) */}
                      <div className="bg-[#12141A] border border-[#1E212E] rounded-xl p-4.5">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-xs font-bold text-slate-400 font-sans">Estimated Future Revenue</span>
                          <span className="text-[10px] text-yellow-500 bg-yellow-500/5 px-2 py-0.5 rounded-full font-mono font-bold">
                            CFO Estimate
                          </span>
                        </div>
                        <div className="text-2xl font-bold font-display text-emerald-400 tracking-tight">
                          {forecastedRevenueTotal > 0 ? `$${Math.round(forecastedRevenueTotal).toLocaleString()}` : '$0.00'}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                          Valued at mean baseline $25 per unit
                        </span>
                      </div>

                      {/* CARD 4: Validation R2 Score */}
                      <div className="bg-[#12141A] border border-[#1E212E] rounded-xl p-4.5">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-xs font-bold text-slate-400 font-sans">Coefficient of Accuracy</span>
                          <span className="text-[10px] text-sky-400 bg-sky-500/5 px-2 py-0.5 rounded-full font-mono">
                            R² Score
                          </span>
                        </div>
                        <div className="text-2xl font-bold font-display text-sky-400 tracking-tight">
                          {metrics ? (metrics.r2 > 0 ? `${(metrics.r2 * 100).toFixed(1)}%` : '---') : '---'}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1 font-sans">
                          Recommended Model: <strong className="text-amber-400">{currentRunRecommendedModel}</strong>
                        </span>
                      </div>

                    </div>

                    {/* MAIN GRAPH VISUALS PANEL */}
                    {predictions.length > 0 ? (
                      <ForecastChart data={predictions} forecastStartDate={predictions.filter(p => p.isForecast)[0]?.date || ''} />
                    ) : (
                      <div className="bg-[#12141A] border border-[#1E212E] rounded-xl p-16 text-center">
                        <Cpu className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
                        <h3 className="text-sm font-semibold text-slate-200">Forecasting Model Ready</h3>
                        <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                          Click the <strong>"Execute Forecasting Engine"</strong> button on the left panel to execute advanced multi-model regression analysis and yield future demand trends.
                        </p>
                      </div>
                    )}

                    {/* MODEL ACCURACIES STATS BLOCK */}
                    {modelComparison.length > 0 && (
                      <div className="bg-[#12141A] border border-[#1E212E] rounded-xl p-5 print:break-inside-avoid">
                        <h3 className="text-xs font-bold tracking-wider text-amber-400 uppercase font-sans mb-4">
                          Operational Validation & Model Back-testing
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          
                          {/* Comparative Table */}
                          <div className="lg:col-span-3 overflow-hidden border border-[#1E212E] rounded-lg">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-[#1B1D27] border-b border-[#232737] text-[10px] font-mono text-slate-400">
                                  <th className="p-3">Forecasting Algorithm</th>
                                  <th className="p-3 text-right">MAE</th>
                                  <th className="p-3 text-right">RMSE</th>
                                  <th className="p-3 text-right">R² Score</th>
                                  <th className="p-3 text-right">MAPE</th>
                                  <th className="p-3 text-center">Back-test Recommendation Rank</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#1B1D27] font-mono text-slate-300">
                                {modelComparison.map((m) => (
                                  <tr key={m.name} className={`hover:bg-[#1C1F2B] ${m.name === bestModelName ? 'bg-amber-500/[0.02]' : ''}`}>
                                    <td className="p-3 font-semibold font-sans flex items-center space-x-2">
                                      <span className={`w-2 h-2 rounded-full ${m.name === bestModelName ? 'bg-amber-500' : 'bg-slate-700'}`} />
                                      <span>{m.name} {m.name === bestModelName ? '(Best Validated Model)' : ''}</span>
                                    </td>
                                    <td className="p-3 text-right">{m.mae}</td>
                                    <td className="p-3 text-right font-bold">{m.rmse}</td>
                                    <td className="p-3 text-right text-sky-400">{m.r2}</td>
                                    <td className="p-3 text-right text-amber-300">{m.mape}%</td>
                                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded font-bold ${
                                      m.rank === 1 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-[#1C1F2B] text-slate-400'
                                    }`}>RANK #{m.rank}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Recommendation explanation card */}
                          <div className="lg:col-span-1 bg-[#1A1C24] p-4.5 rounded-lg border border-[#2B2F42]/60 text-xs flex flex-col justify-between">
                            <div>
                              <h4 className="font-semibold text-slate-100 flex items-center space-x-1.5 mb-2 font-sans">
                                <span>Optimization Protocol</span>
                              </h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                Our validation pipeline split files to measure out-of-sample backtest scores. The <strong className="text-amber-400">{bestModelName}</strong> method produced the lowest RMSE error residual, optimizing forecasting accuracy by minimizing prediction deviations.
                              </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#242939] text-[10px] font-mono text-slate-500">
                              Computed metrics update after each forecast calculations run.
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* AI INSIGHTS VIEW COMPONENT */}
                    {insights && predictions.length > 0 && (
                      <InsightsView 
                        insights={insights}
                        predictions={predictions}
                        datasetName={activeFilename}
                      />
                    )}

                    {/* PRINT WRAPPER ONLY (Hidden in screen viewport, displays beautifully on printable layouts) */}
                    <div id="print-only-executive-report" className="hidden print:block font-serif text-black bg-white p-8">
                      <div className="border-b-2 border-black pb-4 mb-6">
                        <h1 className="text-3xl font-bold tracking-tight">Demand Intelligence Report</h1>
                        <span className="text-xs font-mono font-bold block uppercase mt-1">
                          Platform Compiled: {new Date().toLocaleDateString()} | Workspace: {activeFilename}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div>
                          <strong>Historical Sample Aggregate:</strong> {totalHistoricSales.toLocaleString()} Units
                        </div>
                        <div>
                          <strong>Forecast Evaluation Standard:</strong> {currentRunRecommendedModel} Algorithm
                        </div>
                        <div>
                          <strong>Expected Daily Future Velocity:</strong> {predictions.length > 0 ? (
                            Math.round(
                              predictions.filter(p => p.isForecast).reduce((sum, p) => sum + p.predicted, 0) / forecastDays
                            ).toLocaleString()
                          ) : '---'} Units/Day
                        </div>
                        <div>
                          <strong>Estimated Horizon Revenue Targets:</strong> {forecastedRevenueTotal > 0 ? `$${Math.round(forecastedRevenueTotal).toLocaleString()}` : '$0.00'} USD
                        </div>
                      </div>

                      {insights && (
                        <div className="space-y-4 text-sm leading-relaxed text-slate-900 border-t border-black pt-4">
                          <h2 className="text-lg font-bold">Executive Strategic Summary</h2>
                          <p className="italic mb-4">"{insights.executiveSummary}"</p>
                          
                          <h3 className="font-bold">Proposed Supply Safety Stock Buffers:</h3>
                          <ul className="list-disc pl-5">
                            {insights.inventoryRecommendations.map((t: string, i: number) => <li key={i}>{t}</li>)}
                          </ul>

                          <h3 className="font-bold">Staff Allocations Schedule Adjustments:</h3>
                          <ul className="list-disc pl-5">
                            {insights.staffingSuggestions.map((t: string, i: number) => <li key={i}>{t}</li>)}
                          </ul>

                          <h3 className="font-bold">Fidelity Confidence Residual Audit:</h3>
                          <p>{insights.demandFluctAnalysis}</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // SCREEN 3: LANDING HUB WHEN NO DATA ACTIVE
                  <div className="bg-[#12141A] border border-[#1E212E] rounded-xl p-16 text-center max-w-2xl mx-auto flex flex-col items-center justify-center space-y-6">
                    <div className="w-14 h-14 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10">
                      <TrendingUp className="text-black w-7 h-7" strokeWidth={2.5} />
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase font-bold">Machine Learning Operations Research</span>
                      <h2 className="text-2xl font-bold font-display text-white tracking-tight">AI-Powered Sales & Demand Analytics</h2>
                      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Optimize inventory overheads, schedule staffing shifts, and predict cash flow targets. Upload historical enterprise transaction logs or select samples to initialize predicting curves.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowUploader(true)}
                      className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/10 cursor-pointer hover:scale-102"
                    >
                      <Upload className="w-4 h-4 text-black" />
                      <span>Configure Operational Dataset</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
            
          </AnimatePresence>
        </section>

      </main>
      
      {/* 3. FOOTER PLATFORM BADGING */}
      <footer className="bg-[#0D0E14] border-t border-[#1E2235] px-6 py-4 flex flex-wrap justify-between items-center text-[10px] text-slate-500 font-mono mt-12 print:hidden z-10 relative">
        <div className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Fidelity Metrics Engine v1.4.0</span>
          <span className="text-slate-700 mx-2">|</span>
          <span>Google AI Studio Build</span>
        </div>
        <div>
          <span>© 120-Day Daily Sales - Electronics Retail Models Built Real-time</span>
        </div>
      </footer>

    </div>
  );
}
