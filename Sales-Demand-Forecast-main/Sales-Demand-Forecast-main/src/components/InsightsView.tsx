/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Boxes, 
  Users, 
  TrendingUp, 
  Scale, 
  MessageSquare, 
  Send, 
  ArrowRight, 
  Bot, 
  User as UserIcon, 
  RefreshCw 
} from 'lucide-react';
import { AIInsights, ForecastPoint } from '../types';

interface InsightsViewProps {
  insights: AIInsights;
  predictions: ForecastPoint[];
  datasetName: string;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function InsightsView({ insights, predictions, datasetName }: InsightsViewProps) {
  const [activeTab, setActiveTab] = useState<'exec' | 'inventory' | 'staff' | 'revenue' | 'volatility'>('exec');
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello! I am your AI Business Intelligence Assistant. I am fully synchronized with the "${datasetName}" forecast parameters. Ask me any operations planning, bulk ordering, or growth strategy questions based on our predictive sales curve!`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatOpen]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userText = chatMessage.trim();
    setChatMessage('');
    
    const userMsg: Message = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      // Create summary context to feed to LLM chat endpoint
      const actualPoints = predictions.filter(p => !p.isForecast);
      const forecastPoints = predictions.filter(p => p.isForecast);
      const avgActual = actualPoints.reduce((sum, p) => sum + (p.actual || 0), 0) / (actualPoints.length || 1);
      const avgPredicted = forecastPoints.reduce((sum, p) => sum + p.predicted, 0) / (forecastPoints.length || 1);

      const requestBody = {
        prompt: userText,
        context: {
          datasetName,
          averageActualSales: Math.round(avgActual),
          averageForecastSales: Math.round(avgPredicted),
          forecastHorizonDays: forecastPoints.length,
          insightsSummary: insights.executiveSummary,
          rules: {
            inventory: insights.inventoryRecommendations.join('; '),
            staffing: insights.staffingSuggestions.join('; '),
            volatility: insights.demandFluctAnalysis
          }
        },
        chatHistory: messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      };

      const token = localStorage.getItem('forecasting_jwt_token');
      const res = await fetch('/api/forecast/assistant-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Connection timed out.');
      }

      const replyMsg: Message = {
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, replyMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: `Consultation Service: I suffered a temporary transmission glitch. [Reason: ${err.message || 'Key limit reached'}]. Let me know if you would like me to try answering again!`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div id="ai-business-insights-module" className="grid grid-cols-1 lg:grid-cols-3 gap-6 selection:bg-amber-500/20">
      
      {/* LEFT: Structured Insights Tabs (take up 2 cols on wide display) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-[#12141A] border border-[#1E212E] rounded-xl overflow-hidden p-5">
          <h3 className="text-sm font-semibold tracking-wide text-white mb-4 flex items-center space-x-2">
            <Bot className="w-5 h-5 text-amber-500" />
            <span>AI-Generated Strategic Executive Plan</span>
          </h3>

          {/* Navigation deck */}
          <div className="flex flex-wrap border-b border-[#222533] pb-px mb-5 gap-1.5">
            {[
              { id: 'exec', label: 'Overview', icon: FileText },
              { id: 'inventory', label: 'Supply & Stocks', icon: Boxes },
              { id: 'staff', label: 'Staff Allocations', icon: Users },
              { id: 'revenue', label: 'Revenue Slopes', icon: TrendingUp },
              { id: 'volatility', label: 'Model Volatility', icon: Scale },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-t-lg font-semibold text-xs transition-all flex items-center space-x-1.5 border-b-2 cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-amber-500 bg-[#1A1D27] text-white'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-[#151720]'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content panel */}
          <div className="min-h-[180px] text-xs text-slate-300 leading-relaxed font-sans">
            <AnimatePresence mode="wait">
              {activeTab === 'exec' && (
                <motion.div
                  key="exec"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <p className="border-l-2 border-amber-500 pl-3 italic text-neutral-300 bg-amber-500/[0.02] py-1.5">
                    "{insights.executiveSummary}"
                  </p>
                  <div>
                    <h4 className="text-amber-400 font-bold tracking-tight mb-2">Primary Strategic Objective:</h4>
                    <p className="text-slate-400">
                      This corporate forecast outline is structured to prevent stockouts and inventory congestion. It translates the numerical linear autoregressor spikes directly into supply buffers, active staffing rotas, and business revenue paths.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'inventory' && (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-slate-400 mb-2">
                    Operational logistics guidelines designed to align with predictive sales curves. Ensure appropriate purchase lead times based on these findings:
                  </p>
                  <ul className="space-y-2">
                    {insights.inventoryRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span className="text-slate-200">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {activeTab === 'staff' && (
                <motion.div
                  key="staff"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-slate-400 mb-2">
                    Human capital allocation recommendations. Structure shift rotas to dynamically correlate with low and high volume cyclic dates:
                  </p>
                  <ul className="space-y-2">
                    {insights.staffingSuggestions.map((rec, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span className="text-slate-200">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {activeTab === 'revenue' && (
                <motion.div
                  key="revenue"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-slate-400 mb-2">
                    High-margin growth opportunities based on forecasting patterns (such as bundled product placements during peak cyclic times):
                  </p>
                  <ul className="space-y-2">
                    {insights.revenueOpportunities.map((rec, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span className="text-slate-200">{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#222533]">
                    <div className="bg-[#1A1E29] p-2.5 rounded-lg border border-[#2D3346]/40">
                      <div className="text-[10px] text-amber-500 uppercase font-sans font-bold">High Demand Windows</div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        {insights.highDemandPeriods[0] || 'Frequent peak activity spotted over weekend groups.'}
                      </p>
                    </div>
                    <div className="bg-[#1E1929] p-2.5 rounded-lg border border-[#302D46]/40">
                      <div className="text-[10px] text-purple-400 uppercase font-sans font-bold">Low Demand Soft Intervals</div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        {insights.lowPerformingMonths[0] || 'Early-week demand slowdown requires discount offers.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'volatility' && (
                <motion.div
                  key="volatility"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <p className="text-slate-400 leading-relaxed">
                    Statistical evaluation of model volatility borders, residuals tracking, and prediction fidelity limits:
                  </p>
                  <div className="p-3.5 bg-[#171A21] rounded-lg border border-[#2A2E3D] text-slate-300 flex items-start space-x-3">
                    <Scale className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white font-sans block mb-1">Fidelity Confidence Analysis</span>
                      <p className="text-[11px] leading-relaxed text-slate-400">
                        {insights.demandFluctAnalysis}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT: Chatbot interactive assistant */}
      <div className="lg:col-span-1">
        <div className="bg-[#12141A] border border-[#1E212E] rounded-xl overflow-hidden h-[360px] flex flex-col justify-between p-4 relative">
          
          {/* Assist Header */}
          <div className="flex items-center justify-between border-b border-[#222533] pb-3 mb-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 border border-amber-500/20">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Forecasting Copilot</h4>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-slate-400 font-medium">Interactive Session Active</span>
                </div>
              </div>
            </div>
            
            {/* Clear button */}
            <button
              onClick={() => setMessages([
                {
                  sender: 'assistant',
                  text: 'Corporate Copilot reset. The active forecast boundaries are still fully loaded. Ask me anything!',
                  timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }
              ])}
              title="Reset conversation"
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages timeline */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin text-[11px]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-5 h-5 rounded-full bg-[#1A1D27] flex items-center justify-center border border-amber-500/20 shrink-0 text-amber-500 mt-1">
                    <Bot className="w-3 h-3" />
                  </div>
                )}
                
                <div
                  className={`p-2.5 rounded-xl max-w-[80%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-black font-medium rounded-br-none'
                      : 'bg-[#1C1E26] border border-[#272B3C] text-slate-300 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[8px] block text-right mt-1 font-mono ${
                    msg.sender === 'user' ? 'text-black/60' : 'text-slate-500'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 shrink-0 text-amber-500 mt-1">
                    <UserIcon className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex space-x-2 justify-start items-center text-slate-500 text-[10px] pl-7 italic">
                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Forecasting Copilot is computing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input messaging */}
          <form onSubmit={handleSendChat} className="mt-3 flex items-center space-x-2">
            <input
              type="text"
              disabled={chatLoading}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask me: What safety buffer should I buy?"
              className="flex-1 bg-[#1A1D28] text-white text-xs px-3 py-2 rounded-lg border border-[#2C3146] focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-slate-500 disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={!chatMessage.trim() || chatLoading}
              className="bg-amber-500 hover:bg-amber-400 text-black p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 fill-black" />
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
