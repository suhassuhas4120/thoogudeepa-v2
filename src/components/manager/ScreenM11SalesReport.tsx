'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  CreditCard,
  QrCode,
  Banknote,
  Search,
  Printer,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';

type TimeFilter = 'TODAY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

const SAMPLE_SETTLED_TRANSACTIONS = [
  { id: 'tx-1', invoice: 'INV-1092', table: 'Seat 17', amount: 840, time: '12:45 PM', method: 'UPI', waiter: 'Ramesh Kumar' },
  { id: 'tx-2', invoice: 'INV-1091', table: 'Seat 04', amount: 1250, time: '12:38 PM', method: 'CASH', waiter: 'Suresh M' },
  { id: 'tx-3', invoice: 'INV-1090', table: 'Seat 22', amount: 620, time: '12:20 PM', method: 'UPI', waiter: 'Anand Kumar' },
  { id: 'tx-4', invoice: 'INV-1089', table: 'Seat 41', amount: 980, time: '12:10 PM', method: 'CARD', waiter: 'Deepa Naik' },
  { id: 'tx-5', invoice: 'INV-1088', table: 'Seat 10', amount: 1540, time: '11:55 AM', method: 'UPI', waiter: 'Ramesh Kumar' },
  { id: 'tx-6', invoice: 'INV-1087', table: 'Seat 03', amount: 730, time: '11:42 AM', method: 'CASH', waiter: 'Ramesh Kumar' },
];

export function ScreenM11SalesReport() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('TODAY');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const baseSales = 24850;
  const totalSales = activeFilter === 'WEEKLY' ? baseSales * 7 : activeFilter === 'MONTHLY' ? baseSales * 30 : baseSales;
  const upiSales = Math.round(totalSales * 0.62);
  const cashSales = Math.round(totalSales * 0.32);
  const cardSales = totalSales - upiSales - cashSales;
  const billsCount = activeFilter === 'WEEKLY' ? 196 : activeFilter === 'MONTHLY' ? 840 : 28;
  const aov = Math.round(totalSales / billsCount);

  const filteredTxs = SAMPLE_SETTLED_TRANSACTIONS.filter((tx) =>
    tx.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.waiter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full mx-auto p-1 space-y-4 font-mono">
      {/* Top Header Banner */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9C3D1E] text-white shadow-sm">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-100 rounded px-1.5 py-0.5">
              FINANCIAL AUDIT
            </span>
            <h1 className="text-base sm:text-lg font-black font-mono text-slate-900 mt-1">
              Sales Report &amp; Analytics
            </h1>
          </div>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 border border-slate-200 rounded-xl">
          {(['TODAY', 'WEEKLY', 'MONTHLY', 'CUSTOM'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeFilter === f
                  ? 'bg-[#9C3D1E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-black hover:bg-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Gross Revenue</div>
          <div className="text-xl md:text-2xl font-black font-mono text-emerald-700 mt-1">
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Verified Gross Turnover</div>
        </div>

        <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
            <span>UPI / QR Net</span>
            <QrCode className="h-3.5 w-3.5 text-sky-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 mt-1">
            ₹{upiSales.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">62% of tender volume</div>
        </div>

        <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
            <span>Cash Desk Net</span>
            <Banknote className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 mt-1">
            ₹{cashSales.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">32% of tender volume</div>
        </div>

        <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Settled Bills / AOV</div>
          <div className="text-xl md:text-2xl font-black font-mono text-[#9C3D1E] mt-1">
            {billsCount} <span className="text-sm text-slate-500 font-bold">Bills</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-bold">AOV: ₹{aov} / table</div>
        </div>
      </div>

      {/* 2-Column Section: Category Distribution & Settled Invoices Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Category Revenue Distribution (~40% / lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs space-y-3.5">
          <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-200 pb-2.5">
            Category Turnover Contribution
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { name: 'Donne Biryani & Rice', pct: 68, val: Math.round(totalSales * 0.68), color: 'bg-[#9C3D1E]' },
              { name: 'Starters & Kebabs', pct: 22, val: Math.round(totalSales * 0.22), color: 'bg-amber-500' },
              { name: 'Sides, Curds & Extras', pct: 7, val: Math.round(totalSales * 0.07), color: 'bg-emerald-600' },
              { name: 'Sunday Specials & Soups', pct: 3, val: Math.round(totalSales * 0.03), color: 'bg-sky-600' },
            ].map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800">{cat.name}</span>
                  <span className="text-slate-900 font-mono">₹{cat.val.toLocaleString('en-IN')} ({cat.pct}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Settled Invoices Ledger (~60% / lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-xs font-black uppercase text-slate-900">
              Settled Invoices Ledger
            </h3>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#FAF8F5] border border-slate-300 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-400 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            {filteredTxs.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-slate-200 rounded-xl text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{tx.invoice} • {tx.table}</div>
                  <div className="text-[10px] text-slate-500">{tx.waiter} • {tx.time}</div>
                </div>
                <div className="text-right">
                  <div className="font-black font-mono text-emerald-700 text-sm">₹{tx.amount}</div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                    {tx.method}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
