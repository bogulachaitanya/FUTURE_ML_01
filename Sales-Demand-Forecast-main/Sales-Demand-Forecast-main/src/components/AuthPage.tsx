/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { User } from '../types';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: User) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please check your inputs.');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Network error connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-page-container" className="min-h-screen bg-[#0A0B0D] flex flex-col items-center justify-center p-4 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-[#0A0B0D] to-[#0A0B0D] pointer-events-none" />
      
      {/* Container Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#13151A] border border-[#22252E] rounded-2xl overflow-hidden shadow-2xl relative z-10"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10 mb-3">
              <TrendingUp className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold font-sans text-white tracking-tight text-center">
              Sales & Demand Forecasting
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 text-center max-w-[280px]">
              AI-driven operations research, regression engineering, and predictive supply modeling.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Company / User Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1A1D24] text-white text-sm pl-10 pr-4 py-2.5 rounded-lg border border-[#2B2F3A] focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-sans">Business Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1A1D24] text-white text-sm pl-10 pr-4 py-2.5 rounded-lg border border-[#2B2F3A] focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 font-sans">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1A1D24] text-white text-sm pl-10 pr-4 py-2.5 rounded-lg border border-[#2B2F3A] focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-2 hover:shadow-lg hover:shadow-amber-500/10"
            >
              {loading ? (
                <span>Authenticating parameters...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Workspace' : 'Create Business Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle state */}
          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
            >
              {isLogin ? "Need a company dashboard? Register here" : "Already registered? Sign In to corporate instance"}
            </button>
          </div>
        </div>

        {/* Brand foot border */}
        <div className="bg-[#191C23] px-8 py-4 border-t border-[#22252E] flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" /> AES-256 Auth</span>
          <span className="flex items-center"><Database className="w-3.5 h-3.5 mr-1 text-amber-500" /> Persistent Storage</span>
        </div>
      </motion.div>
    </div>
  );
}
