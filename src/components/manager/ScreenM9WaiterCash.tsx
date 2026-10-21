'use client';

import React, { useState } from 'react';
import {
  Banknote,
  Coins,
  Receipt,
  UserCheck,
  CheckCircle2,
  Check,
  Gift,
} from 'lucide-react';
import { StaffRosterMember } from './types';

const INITIAL_CASH_STAFF: StaffRosterMember[] = [
  { id: 'st-1', name: 'Captain Ramesh', role: 'Floor Captain', assignedSection: 'Zone 1 (01-25)', tablesCount: 4, status: 'ACTIVE', phone: '+91 98450 11223', cashCollected: 3850, cashHandedOver: 3850 },
  { id: 'st-2', name: 'Captain Suresh', role: 'Floor Captain', assignedSection: 'Zone 2 (26-50)', tablesCount: 3, status: 'ACTIVE', phone: '+91 98450 22334', cashCollected: 3000, cashHandedOver: 2000 },
  { id: 'st-3', name: 'Captain Anand', role: 'Floor Captain', assignedSection: 'Zone 3 (51-75)', tablesCount: 3, status: 'ACTIVE', phone: '+91 98450 33445', cashCollected: 5200, cashHandedOver: 5200 },
  { id: 'st-4', name: 'Captain Deepa', role: 'Floor Captain', assignedSection: 'Zone 4 (76-100)', tablesCount: 2, status: 'ACTIVE', phone: '+91 98450 77889', cashCollected: 2100, cashHandedOver: 1500 },
  { id: 'st-5', name: 'Kiran K.', role: 'Senior Waiter', assignedSection: 'Zone 1', tablesCount: 2, status: 'ACTIVE', phone: '+91 98450 44556', cashCollected: 1200, cashHandedOver: 1200 },
];

export function ScreenM9WaiterCash() {
  const [staffList, setStaffList] = useState<StaffRosterMember[]>(INITIAL_CASH_STAFF);
  const [handoverAmounts, setHandoverAmounts] = useState<Record<string, string>>({});
  const [captainTips, setCaptainTips] = useState<Record<string, number>>({
    'Captain Ramesh': 570,
    'Captain Suresh': 0,
    'Captain Anand': 300,
    'Captain Deepa': 420,
    'Kiran K.': 230,
  });

  const totalTipsToday = Object.values(captainTips).reduce((sum, val) => sum + val, 0);

  const handleHandoverSubmit = (staffId: string, staffName: string, cashCollected: number, cashHandedOver: number) => {
    const amountDue = Math.max(0, cashCollected - cashHandedOver);
    const amount = Number(handoverAmounts[staffId] ?? '');

    if (!Number.isFinite(amount) || amount <= 0 || amount > amountDue) {
      alert(`Enter an amount between ₹1 and ₹${amountDue.toLocaleString('en-IN')} for ${staffName}.`);
      return;
    }

    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, cashHandedOver: s.cashHandedOver + amount } : s))
    );
    setHandoverAmounts((cur) => ({ ...cur, [staffId]: '' }));
    alert(`₹${amount.toLocaleString('en-IN')} received from ${staffName} into Till Safe.`);
  };

  const handlePayTip = (captainName: string, amount: number) => {
    if (amount <= 0) return;
    setCaptainTips((prev) => ({
      ...prev,
      [captainName]: 0,
    }));
    alert(`₹${amount.toLocaleString('en-IN')} tip paid to ${captainName}!`);
  };

  return (
    <div className="w-full mx-auto p-1 space-y-4 font-mono">
      {/* Top Header Banner */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9C3D1E] text-white shadow-sm">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-100 rounded px-1.5 py-0.5">
              RECONCILIATION &amp; AUDIT
            </span>
            <h1 className="text-base sm:text-lg font-black font-mono text-slate-900 mt-1">
              Waiter Cash &amp; Tips
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-[#FAF8F5] border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Banknote className="h-4 w-4 text-emerald-600" />
            <span>Till Safe Active</span>
          </span>
        </div>
      </div>

      {/* 2-Column Split Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Waiter Cash Counter (~60% / lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#9C3D1E]" />
              <h3 className="font-mono text-xs font-black uppercase text-slate-900">
                Captain Cash Handover &amp; Till Audit
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {staffList.map((st) => {
              const amountDue = Math.max(0, st.cashCollected - st.cashHandedOver);
              return (
                <div
                  key={st.id}
                  className="p-3.5 bg-[#FAF8F5] border border-slate-200 rounded-xl space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-sm text-slate-900">{st.name}</span>
                      <span className="text-[11px] text-slate-500 block">{st.assignedSection}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        amountDue === 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {amountDue === 0 ? 'SETTLED' : `DUE: ₹${amountDue}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-200 pt-2 text-slate-600">
                    <div>Collected: <span className="font-black text-slate-900">₹{st.cashCollected}</span></div>
                    <div>Handed Over: <span className="font-black text-emerald-700">₹{st.cashHandedOver}</span></div>
                    <div>Due: <span className="font-black text-[#9C3D1E]">₹{amountDue}</span></div>
                  </div>

                  {amountDue > 0 && (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="number"
                        min="1"
                        max={amountDue}
                        placeholder={`Up to ₹${amountDue}`}
                        value={handoverAmounts[st.id] || ''}
                        onChange={(e) => setHandoverAmounts({ ...handoverAmounts, [st.id]: e.target.value })}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-orange-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleHandoverSubmit(st.id, st.name, st.cashCollected, st.cashHandedOver)}
                        className="px-3 py-1 bg-[#9C3D1E] text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition cursor-pointer"
                      >
                        Receive to Safe
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Individual Captain Tips (~40% / lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-[#9C3D1E]" />
              <h3 className="font-mono text-xs font-black uppercase text-slate-900">
                Captain Tips Distribution
              </h3>
            </div>
            <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Total Tips: ₹{totalTipsToday}
            </span>
          </div>

          <div className="space-y-2">
            {Object.entries(captainTips).map(([capName, tipAmt]) => (
              <div
                key={capName}
                className="flex items-center justify-between p-3 bg-[#FAF8F5] border border-slate-200 rounded-xl text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{capName}</span>
                  <span className="text-[10px] text-slate-500">Accumulated Shift Tips</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black font-mono text-slate-900 text-sm">₹{tipAmt}</span>
                  <button
                    type="button"
                    onClick={() => handlePayTip(capName, tipAmt)}
                    disabled={tipAmt === 0}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold disabled:opacity-40 hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Pay Tip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
