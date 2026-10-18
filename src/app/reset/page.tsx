'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, CheckCircle2, RotateCcw, ChefHat, UtensilsCrossed, QrCode } from 'lucide-react';
import { realtimeBridge } from '@/lib/supabase';

export default function ResetPage() {
  const [cleared, setCleared] = useState(false);
  const [loading, setLoading] = useState(false);

  const performReset = async () => {
    setLoading(true);
    await realtimeBridge.clearAllOrders();
    setCleared(true);
    setLoading(false);
  };

  useEffect(() => {
    // Automatically trigger on page load for convenience
    performReset();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-zinc-200 p-6 sm:p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          {cleared ? (
            <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-in zoom-in" />
          ) : (
            <RotateCcw className="w-8 h-8 text-emerald-600 animate-spin" />
          )}
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black tracking-widest text-emerald-700 uppercase bg-emerald-100/80 px-3 py-1 rounded-full">
            SYSTEM RESET STATUS
          </span>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            {cleared ? 'Clean Slate Ready!' : 'Purging All Orders...'}
          </h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            All active tickets, carts, table occupancy locks, and customer dining sessions have been cleared.
          </p>
        </div>

        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 text-left space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-zinc-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">Kitchen Display System queue wiped</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">Seats 01-100 occupancy unlocked</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">Active customer carts &amp; device tokens reset</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">Dual-engine realtime sync notified</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/kitchen"
            className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900 text-white font-black text-sm tracking-wide uppercase hover:bg-zinc-800 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span>Open Kitchen Display (KDS)</span>
          </Link>

          <Link
            href="/seat/04/menu"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#00875a] text-white font-black text-sm tracking-wide uppercase hover:bg-[#00704a] transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4 text-white" />
            <span>Order from Seat 04</span>
          </Link>

          <Link
            href="/qrs"
            className="w-full py-3 px-4 rounded-2xl bg-white border border-zinc-300 text-zinc-700 font-bold text-xs tracking-wider uppercase hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4 text-zinc-600" />
            <span>View 100 Table QR Codes</span>
          </Link>

          <button
            type="button"
            onClick={performReset}
            disabled={loading}
            className="mt-2 text-xs font-semibold text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
