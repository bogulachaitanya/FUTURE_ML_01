/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Info, Play, RefreshCw, X } from 'lucide-react';
import { sampleDatasets } from '../data/samples';
import { PreprocessedData } from '../types';

interface UploadModalProps {
  onUploadSuccess: (filename: string, preprocessed: PreprocessedData, rawCsv: string) => void;
  onClose?: () => void;
}

export default function UploadModal({ onUploadSuccess, onClose }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [previewData, setPreviewData] = useState<PreprocessedData | null>(null);
  const [selectedFilename, setSelectedFilename] = useState<string>('');
  const [rawCsvText, setRawCsvText] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Unsupported format. Please upload a structured .CSV file.');
      return;
    }

    setError(null);
    setLoading(true);
    setSelectedFilename(file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        setRawCsvText(text);
        
        // Post content to server to run server-side cleanser
        const res = await fetch('/api/forecast/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('forecasting_jwt_token') || ''}`
          },
          body: JSON.stringify({ csvContent: text })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Server rejected CSV structure.');
        }

        setPreviewData(data);
      } catch (err: any) {
        setError(err.message || 'Error occurred while preprocessing CSV logs.');
        setPreviewData(null);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSelectSample = async (sampleIdx: number) => {
    setError(null);
    setLoading(true);
    const sample = sampleDatasets[sampleIdx];
    setSelectedFilename(sample.name);
    setRawCsvText(sample.csvContent);

    try {
      const res = await fetch('/api/forecast/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('forecasting_jwt_token') || ''}`
        },
        body: JSON.stringify({ csvContent: sample.csvContent })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      setPreviewData(data);
    } catch (err: any) {
      setError(err.message || 'Failed loading demonstration dataset.');
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDataset = () => {
    if (previewData) {
      onUploadSuccess(selectedFilename, previewData, rawCsvText);
    }
  };

  return (
    <div id="upload-module-container" className="h-full flex flex-col justify-between selection:bg-amber-500/20 text-white">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Dataset Upload Module</h2>
            <p className="text-xs text-slate-400 mt-1">
              Feed historical daily business transactions to our machine learning pipelines.
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded bg-[#1A1D24] text-slate-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* DRAG DROP / CONSOLE AREA */}
        {!previewData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Drag Drop */}
            <div className="lg:col-span-2">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  dragActive ? 'border-amber-500 bg-amber-500/5' : 'border-[#2D313F] bg-[#12141A] hover:border-amber-500/55'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-full bg-[#1A1D24] border border-[#2D313F] flex items-center justify-center mb-4 transition-transform hover:scale-110">
                  <UploadCloud className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-sm font-semibold">Upload Local Sales CSV</h3>
                <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                  Drag and drop your spreadsheet here, or click to browse files. Accepts standard comma-separated sequences.
                </p>
                <div className="flex space-x-3 mt-4 text-[10px] text-slate-500 font-mono">
                  <span>• Date (YYYY-MM-DD)</span>
                  <span>• Sales Quantity</span>
                  <span>• Revenue</span>
                </div>
              </div>
            </div>

            {/* Preloaded Samples Selector */}
            <div className="bg-[#12141A] border border-[#1F222F] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold tracking-wider text-amber-400 uppercase mb-3">
                  Demonstration Datasets
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Do not have a sales .csv file ready? Quickly select high-fidelity pre-compiled datasets to explore forecasting models immediately.
                </p>
              </div>
              <div className="space-y-2.5">
                {sampleDatasets.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(idx)}
                    className="w-full text-left bg-[#1A1D24] hover:bg-[#222630] border border-[#2B2F3E] hover:border-amber-500/30 p-2.5 rounded-lg transition-all text-xs group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 text-amber-100 group-hover:text-amber-400 font-semibold mb-1">
                      <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                      <span>{sample.name.split(' (')[0]}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ERROR BOX */}
        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="border border-[#2D313F] bg-[#12141A] rounded-xl p-16 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <h3 className="text-sm font-semibold">Running Data Cleansing Algorithms...</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
              Standardizing date parameters, locating sales quantities, imputing missing data points, and smoothing outliers via Z-scoring.
            </p>
          </div>
        )}

        {/* PREVIEW COMPONENT AND PROCESSING REPORTS */}
        {previewData && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header file stats */}
            <div className="bg-[#12141A] border border-[#1F222F] rounded-xl p-4 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">File Loaded Successfully</div>
                  <div className="text-sm font-bold text-slate-100">{selectedFilename}</div>
                </div>
              </div>
              
              <div className="flex space-x-6 text-center text-xs border-l border-[#1F222F] pl-6">
                <div>
                  <div className="text-[10px] text-slate-400">Total Rows Detected</div>
                  <div className="text-sm font-mono text-white font-bold">{previewData.summary.totalRows} Lines</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Aggregated Dates</div>
                  <div className="text-sm font-mono text-amber-400 font-bold">{previewData.summary.cleanedRows} Days</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Outliers Softened</div>
                  <div className="text-sm font-mono text-rose-400 font-bold">{previewData.summary.outliersDetected}</div>
                </div>
              </div>
            </div>

            {/* Two Column Layout: Cleansing Steps & Data Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Left Column: Visual Steps */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
                  Data Cleaning & Preprocessing Report
                </h3>
                <div className="space-y-2.5">
                  {previewData.preprocessingSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-[#12141A] border border-[#1E212E] rounded-lg p-3.5 flex items-start space-x-3 text-xs"
                    >
                      <div className="mt-0.5">
                        {step.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : step.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Info className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">{step.name}</div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                        {step.count > 0 && (
                          <div className="text-[9px] font-mono mt-1 text-slate-500">
                            Affected rows: {step.count}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Mini Spreadsheet Preview */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
                  Preprocessed Dataset Preview (First 5 Rows)
                </h3>
                <div className="bg-[#12141A] border border-[#1E212E] rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1A1D27] border-b border-[#242A3A] text-[10px] font-mono text-slate-400 select-none">
                        <th className="p-3">Date</th>
                        <th className="p-3 text-right">Sales Units</th>
                        <th className="p-3 text-right">Revenue ($)</th>
                        <th className="p-3">Product</th>
                        <th className="p-3">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1D212E] font-mono">
                      {previewData.rows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#1C1F2B]">
                          <td className="p-3 text-slate-200">{row.date}</td>
                          <td className="p-3 text-right text-amber-300 font-bold">{Math.round(row.salesQuantity)}</td>
                          <td className="p-3 text-right text-emerald-400">${Math.round(row.revenue).toLocaleString()}</td>
                          <td className="p-3 text-slate-300 max-w-[100px] truncate">{row.productName}</td>
                          <td className="p-3 text-slate-400">{row.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-[#161822] p-2 text-center text-[10px] font-mono text-slate-500 border-t border-[#1E212E]">
                    Showing top 5 of {previewData.rows.length} total rows. Standardized into structured JSON arrays.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Buttons foot */}
      {previewData && !loading && (
        <div className="mt-8 pt-4 border-t border-[#1F222F] flex justify-between">
          <button
            onClick={() => {
              setPreviewData(null);
              setSelectedFilename('');
              setRawCsvText('');
            }}
            className="px-5 py-2 rounded-lg bg-[#1A1D24] text-xs font-medium hover:bg-[#252A36] text-slate-300 transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Dataset</span>
          </button>
          
          <button
            onClick={handleConfirmDataset}
            className="px-6 py-2 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <span>Proceed to Forecasting Engine</span>
            <Play className="w-3.5 h-3.5 fill-black" />
          </button>
        </div>
      )}
    </div>
  );
}
