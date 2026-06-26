/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  Area
} from 'recharts';
import { ForecastPoint } from '../types';
import { Calendar, Eye, EyeOff } from 'lucide-react';

interface ForecastChartProps {
  data: ForecastPoint[];
  forecastStartDate: string;
}

export default function ForecastChart({ data, forecastStartDate }: ForecastChartProps) {
  const [viewType, setViewType] = useState<'quantity' | 'revenue'>('quantity');
  const [showActualsLine, setShowActualsLine] = useState(true);

  // Map data for Recharts to avoid issues and format numbers
  const chartData = data.map(item => ({
    ...item,
    formattedDate: formatDateLabel(item.date),
    quantityActual: item.isForecast ? null : item.actual,
    quantityPredicted: item.predicted,
    revenueActual: item.isForecast ? null : (item.actual ? item.actual * 25.0 : null),
    revenuePredicted: item.predicted * 25.0
  }));

  // Find start of forecasting block index to place dividing guide line
  const forecastIndex = chartData.findIndex(item => item.isForecast);
  const dividerDate = forecastIndex !== -1 ? chartData[forecastIndex]?.formattedDate : '';

  function formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  }

  // Calculate customized tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload as ForecastPoint;
      const isProjected = pData.isForecast;

      const actVal = viewType === 'quantity' ? pData.actual : (pData.actual ? pData.actual * 25.0 : null);
      const predVal = viewType === 'quantity' ? pData.predicted : pData.predicted * 25.0;

      return (
        <div className="bg-[#13151D] border border-[#272B3A] p-3 rounded-lg shadow-xl text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-1.5 font-sans font-bold text-slate-100 border-b border-[#252836] pb-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>{pData.date} ({pData.dayOfWeek.substring(0, 3)})</span>
          </div>
          
          <div className="space-y-1">
            {!isProjected && (
              <div className="flex justify-between space-x-6">
                <span className="text-slate-400">Actual:</span>
                <span className="font-bold text-white">
                  {actVal !== null ? (viewType === 'quantity' ? `${Math.round(actVal)} units` : `$${Math.round(actVal).toLocaleString()}`) : 'N/A'}
                </span>
              </div>
            )}
            
            <div className="flex justify-between space-x-6">
              <span className="text-amber-400 font-medium">Model Predicted:</span>
              <span className="font-bold text-amber-300">
                {viewType === 'quantity' ? `${Math.round(predVal)} units` : `$${Math.round(predVal).toLocaleString()}`}
              </span>
            </div>

            {isProjected && (
              <div className="text-[10px] text-amber-500/80 font-sans italic pt-1 border-t border-[#252836] mt-1 text-center">
                🔮 Future forecast projection
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="recharts-visualizer-card" className="bg-[#12141A] border border-[#1E212E] rounded-xl p-5 relative overflow-hidden">
      {/* Chart Headers */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-slate-100">
            Interactive Forecast Projection Curve
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Compare model fitted validation levels against physical sales outcomes.
          </p>
        </div>

        {/* View Selection Controls */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Legend options */}
          <button
            onClick={() => setShowActualsLine(!showActualsLine)}
            className={`px-2.5 py-1 rounded border text-[10px] font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
              showActualsLine 
                ? 'bg-slate-800 text-slate-200 border-slate-700' 
                : 'bg-transparent text-slate-500 border-[#232737]'
            }`}
          >
            {showActualsLine ? (
              <>
                <Eye className="w-3 h-3 text-emerald-400" />
                <span>Showing Actuals</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                <span>Hidden Actuals</span>
              </>
            )}
          </button>

          <div className="p-0.5 bg-[#1C1E26] rounded-lg border border-[#2C3146] flex">
            <button
              onClick={() => setViewType('quantity')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewType === 'quantity' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sales Units
            </button>
            <button
              onClick={() => setViewType('revenue')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewType === 'revenue' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Estimated Value
            </button>
          </div>
        </div>
      </div>

      {/* Actual Chart canvas */}
      <div className="h-[360px] w-full font-mono text-[10px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            {/* Grids */}
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2235" vertical={false} />
            
            {/* Horizontal & Vertical Axes */}
            <XAxis 
              dataKey="formattedDate" 
              stroke="#5D6A8E"
              tickLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#5D6A8E"
              tickLine={false}
              dx={-5}
              tickFormatter={(val) => viewType === 'quantity' ? val : `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Shaded Areas to highlight forecast area */}
            <Area
              type="monotone"
              dataKey={viewType === 'quantity' ? "quantityPredicted" : "revenuePredicted"}
              fill="url(#forecastGradient)"
              stroke="none"
              legendType="none"
            />

            {/* Definitions */}
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DF9F28" stopOpacity={0.06}/>
                <stop offset="95%" stopColor="#DF9F28" stopOpacity={0}/>
              </linearGradient>
            </defs>

            {/* Solid Actuals Sales Curve */}
            {showActualsLine && (
              <Line
                type="monotone"
                dataKey={viewType === 'quantity' ? "quantityActual" : "revenueActual"}
                stroke="#10B981"
                strokeWidth={2.5}
                dot={false}
                name="Actual Historical Sales"
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            )}

            {/* Intertwined Predictions dotted line */}
            <Line
              type="monotone"
              dataKey={viewType === 'quantity' ? "quantityPredicted" : "revenuePredicted"}
              stroke="#DF9F28"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name={showActualsLine ? "Model Fit & Forecast" : "Projected Trend"}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />

            {/* Separating Vertical Line to indicate forecast start date */}
            {dividerDate && (
              <ReferenceLine 
                x={dividerDate} 
                stroke="#6B593C" 
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{ 
                  value: 'Forecast Block  ➡️', 
                  position: 'top', 
                  fill: '#DF9F28', 
                  fontSize: 10,
                  fontFamily: 'sans-serif',
                  fontWeight: 'bold',
                  dy: -10,
                  dx: 45
                }} 
              />
            )}
            
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="plainline" 
              wrapperStyle={{ paddingTop: '15px', color: '#8892B0' }} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Floating Info tag */}
      <div className="absolute top-24 right-6 bg-[#1A1E29] border border-[#2D3346]/60 rounded px-2.5 py-1 text-[9px] text-[#A0AEC0] flex items-center space-x-1 select-none pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono text-emerald-400">Actual: Emerald</span>
        <span className="text-slate-500">|</span>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span className="font-mono text-amber-400">Forecast: Gold</span>
      </div>
    </div>
  );
}
