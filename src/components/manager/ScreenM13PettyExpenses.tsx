'use client';

import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Receipt,
  IndianRupee,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';
import { PettyExpense } from './types';

const INITIAL_EXPENSES: PettyExpense[] = [
  { id: 'pe-1', voucherNumber: 'V-101', description: 'Fresh Mint & Coriander leaves rush supply', category: 'Kitchen Supplies', amount: 350, paidTo: 'Kalpashree Veg Mart', paidBy: 'Ramesh (Cashier)', time: '11:45 AM' },
  { id: 'pe-2', voucherNumber: 'V-102', description: 'Crystal Ice blocks (2 bags) for beverage counter', category: 'Dairy & Fresh', amount: 200, paidTo: 'City Ice Supplies', paidBy: 'Ramesh (Cashier)', time: '12:30 PM' },
  { id: 'pe-3', voucherNumber: 'V-103', description: 'Emergency Gas cylinder delivery tipping', category: 'Fuel/Gas', amount: 150, paidTo: 'HP Gas Agency Boy', paidBy: 'Manjunath (GM)', time: '01:15 PM' },
];

interface ScreenM13PettyExpensesProps {
  openingFloat: number;
}

export function ScreenM13PettyExpenses({ openingFloat }: ScreenM13PettyExpensesProps) {
  const [expenses, setExpenses] = useState<PettyExpense[]>(INITIAL_EXPENSES);
  const [desc, setDesc] = useState<string>('');
  const [category, setCategory] = useState<PettyExpense['category']>('Dairy & Fresh');
  const [amount, setAmount] = useState<string>('');
  const [paidTo, setPaidTo] = useState<string>('');
  const [isCounterLocked, setIsCounterLocked] = useState<boolean>(false);
  const [showLockSuccess, setShowLockSuccess] = useState<boolean>(false);

  const morningCash = openingFloat || 50000;
  const totalOutflow = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currentCashInDrawer = morningCash - totalOutflow;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;
    if (isCounterLocked) {
      alert('Cash counter is currently LOCKED! Unlock to record new vouchers.');
      return;
    }
    const numAmt = parseFloat(amount) || 0;
    if (numAmt <= 0) return;

    const now = new Date();
    const newVoucher: PettyExpense = {
      id: `pe-${Date.now()}`,
      voucherNumber: `V-${100 + expenses.length + 1}`,
      description: desc.trim(),
      category,
      amount: numAmt,
      paidTo: paidTo.trim() || 'Vendor',
      paidBy: 'Manager',
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setExpenses((prev) => [newVoucher, ...prev]);
    setDesc('');
    setAmount('');
    setPaidTo('');
  };

  const handleToggleLockCounter = () => {
    if (!isCounterLocked) {
      setIsCounterLocked(true);
      setShowLockSuccess(true);
      setTimeout(() => setShowLockSuccess(false), 3000);
    } else {
      setIsCounterLocked(false);
    }
  };

  return (
    <div className="w-full mx-auto p-1 space-y-4 font-mono">
      {/* Top Header Banner */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9C3D1E] text-white shadow-sm">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-100 rounded px-1.5 py-0.5">
              CASH EXPENSES &amp; VAULT
            </span>
            <h1 className="text-base sm:text-lg font-black font-mono text-slate-900 mt-1">
              Petty Expenses &amp; Cash Counter
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleLockCounter}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isCounterLocked
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
            }`}
          >
            {isCounterLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            <span>{isCounterLocked ? 'COUNTER VAULT LOCKED' : 'COUNTER VAULT OPEN'}</span>
          </button>
        </div>
      </div>

      {showLockSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Cash drawer safe locked! Shift balances sealed for handover audit.</span>
        </div>
      )}

      {/* 2-Column Split Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Balances & Voucher Form (~50% / lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-200 pb-2.5">
            Drawer Balance &amp; New Expense Voucher
          </h3>

          <div className="grid grid-cols-3 gap-3 p-3 bg-[#FAF8F5] border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Opening Float:</span>
              <span className="font-black text-slate-900 font-mono text-sm">₹{morningCash}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Total Outflow:</span>
              <span className="font-black text-rose-600 font-mono text-sm">-₹{totalOutflow}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Remaining in Till:</span>
              <span className="font-black text-emerald-700 font-mono text-sm">₹{currentCashInDrawer}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 bg-[#FAF8F5] border border-slate-200 rounded-xl p-4">
            <span className="text-xs font-bold text-slate-700 block">Record New Cash Voucher:</span>

            <div>
              <input
                type="text"
                placeholder="Voucher description (e.g. Mint leaves supply)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-mono"
              >
                <option value="Dairy & Fresh">Dairy &amp; Fresh</option>
                <option value="Kitchen Supplies">Kitchen Supplies</option>
                <option value="Fuel/Gas">Fuel / Gas</option>
                <option value="Emergency Maintenance">Emergency Maintenance</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>

              <input
                type="number"
                placeholder="₹ Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-400 font-mono"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Paid To / Vendor Name"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <button
              type="submit"
              disabled={isCounterLocked}
              className="w-full py-2 bg-[#9C3D1E] text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition disabled:opacity-40 cursor-pointer"
            >
              Record Voucher &amp; Deduct From Till
            </button>
          </form>
        </div>

        {/* Right Column: Vouchers List (~50% / lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-xs font-black uppercase text-slate-900">
              Shift Petty Vouchers ({expenses.length})
            </h3>
            <span className="font-mono text-xs font-bold text-rose-600">
              Total: -₹{totalOutflow}
            </span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto no-scrollbar">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3 bg-[#FAF8F5] border border-slate-200 rounded-xl space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{exp.voucherNumber}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-[#9C3D1E] font-bold">
                      {exp.category}
                    </span>
                  </div>
                  <span className="font-black font-mono text-rose-600 text-sm">-₹{exp.amount}</span>
                </div>

                <p className="text-slate-700">{exp.description}</p>

                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Paid To: {exp.paidTo}</span>
                  <span className="font-mono">{exp.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
