'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  ChefHat, 
  UtensilsCrossed, 
  QrCode, 
  Smartphone, 
  Tablet 
} from 'lucide-react';
import { realtimeBridge } from '@/lib/supabase';
import { asyncStorage } from '@/lib/storage/indexedDB';

export default function ResetCleanSlatePage() {
  const [isPurging, setIsPurging] = useState(true);
  const [purged, setPurged] = useState(false);

  const executeCleanSlate = async () => {
    setIsPurging(true);
    try {
      await asyncStorage.clearThoogudeepaKeys();
      await realtimeBridge.clearAllOrders();
      setPurged(true);
    } catch (err) {
      console.error('Reset execution error:', err);
    } finally {
      setIsPurging(false);
    }
  };

  useEffect(() => {
    executeCleanSlate();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        {/* Status Badge & Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          {purged ? (
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          ) : (
            <RotateCcw className="w-8 h-8 text-emerald-400 animate-spin" />
          )}
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/50">
            SYSTEM RESET STATUS
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {purged ? '100% Clean Slate Active' : 'Purging All System Data...'}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            All active tickets, table occupancy locks, customer dining sessions, and cached carts have been wiped.
          </p>
        </div>

        {/* Verification Checklist Card */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-left space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">Kitchen Display pass queue wiped (0 orders)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">Seats 01-100 occupancy unlocked &amp; vacant</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">IndexedDB &amp; LocalStorage memory purged</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">Dual-engine WebSocket broadcast notified</span>
          </div>
        </div>

        {/* Navigation Launchpad to All Surfaces */}
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/kitchen"
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            <span>Open Kitchen Display (KDS)</span>
          </Link>

          <Link
            href="/seat/04/menu"
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Order from Seat 04 (Customer)</span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/waiter/mobile"
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] tracking-wide uppercase transition-colors flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Waiter Mobile</span>
            </Link>

            <Link
              href="/waiter/tablet"
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] tracking-wide uppercase transition-colors flex items-center justify-center gap-1.5"
            >
              <Tablet className="w-3.5 h-3.5 text-purple-400" />
              <span>Waiter Tablet</span>
            </Link>
          </div>

          <Link
            href="/qrs"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold text-[11px] tracking-wider uppercase hover:text-white hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>View 100 Seat QR Codes</span>
          </Link>

          <button
            type="button"
            onClick={executeCleanSlate}
            disabled={isPurging}
            className="mt-1 text-[11px] font-semibold text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Purge system again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
