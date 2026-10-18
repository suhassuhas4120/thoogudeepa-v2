'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Armchair,
  User,
  UtensilsCrossed,
  Download,
  CheckCircle2,
  Smile,
  Meh,
  Frown,
  Angry,
  ChefHat,
  MessageCircle,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';

interface SettledReceipt {
  ticketNumber: string;
  totalAmount: number;
  mode: string;
  settledAt: number;
}

export default function CustomerReceiptPage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to profile
  useHardwareBack(`/seat/${chairId}/profile`);

  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;

  const [receipt, setReceipt] = useState<SettledReceipt | null>(null);
  const [selectedRating, setSelectedRating] = useState<string>('opt-1');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`thoogudeepa_settled_receipt_${chairId}`);
      if (stored) {
        setReceipt(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }
  }, [chairId]);

  const ratingOptions = [
    { id: 'opt-1', label: 'Excellent', icon: ChefHat },
    { id: 'opt-2', label: 'Good', icon: Smile },
    { id: 'opt-3', label: 'Okay', icon: Meh },
    { id: 'opt-4', label: 'Bad', icon: Frown },
    { id: 'opt-5', label: 'Terrible', icon: Angry },
  ];

  const totalAmount = receipt?.totalAmount || 0;
  const subtotal = totalAmount > 0 ? Math.round(totalAmount / 1.05) : 0;
  const totalTax = totalAmount - subtotal;
  const cgst = Math.round(totalTax / 2);
  const sgst = totalTax - cgst;
  const settleDate = receipt?.settledAt ? new Date(receipt.settledAt) : new Date();

  const formattedDate = `${String(settleDate.getDate()).padStart(2, '0')}/${String(
    settleDate.getMonth() + 1
  ).padStart(2, '0')}/${settleDate.getFullYear()}`;

  const formattedTime = settleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-12">
      {/* Scrollable Upper Content Container */}
      <div className="w-full flex flex-col gap-4">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between py-2 border-b border-zinc-200 pb-3">
          <Link
            href={`/seat/${chairId}/profile`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
            aria-label="Back to Profile"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="text-center flex flex-col items-center">
            <h1 className="text-sm font-black tracking-wider uppercase">
              Bill Details
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">
                Seat #{seatNumber}
              </span>
            </div>
          </div>

          <div className="w-10 h-10" />
        </header>

        {!receipt ? (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-zinc-300 rounded-3xl bg-zinc-50 p-6 my-4">
            <div className="w-14 h-14 rounded-full border-2 border-black bg-white flex items-center justify-center shadow-xs">
              <Receipt className="w-6 h-6 text-black" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-black uppercase text-zinc-950">
                No Paid Bills Found
              </h2>
              <p className="text-xs text-zinc-500 font-medium max-w-xs">
                There are no settled invoices on record for Seat #{seatNumber}.
              </p>
            </div>
            <Link
              href={`/seat/${chairId}/menu`}
              className="mt-2 px-5 py-2 rounded-xl bg-black text-white text-xs font-black uppercase tracking-wider"
            >
              Go to Menu
            </Link>
          </div>
        ) : (
          <>
            {/* Card 1: Restaurant Identity & Order Details Card */}
            <div className="w-full border-2 border-black rounded-3xl p-4 flex flex-col gap-3 bg-white shadow-xs">
              <div className="w-full flex items-center gap-3 pb-3 border-b border-zinc-200">
                <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center bg-white overflow-hidden shrink-0">
                  <img
                    src="/logo.jpg"
                    alt="Thoogudeepa"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-xs font-black uppercase tracking-wide">THOOGUDEEPA</span>
                  <span className="text-[10px] text-zinc-500 font-medium uppercase">Authentic Donne Biryani Mane</span>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date</span>
                    <span className="text-xs font-bold">{formattedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Time</span>
                    <span className="text-xs font-bold">{formattedTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center shrink-0">
                    <Armchair className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Seat</span>
                    <span className="text-xs font-bold">Seat #{seatNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Mode</span>
                    <span className="text-xs font-bold">Dine-In</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Items Description & Amount Breakdown */}
            <div className="w-full border-2 border-black rounded-3xl p-4 flex flex-col gap-3 bg-white shadow-xs">
              <div className="w-full flex items-center justify-between pb-2 border-b border-zinc-200 text-[11px] font-black uppercase tracking-wider text-zinc-600">
                <span>Item Description</span>
                <span>Amount</span>
              </div>

              <div className="w-full flex flex-col gap-2.5">
                <div className="w-full flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span>Military Dining (Ticket #{receipt.ticketNumber})</span>
                  </div>
                  <span>₹ {subtotal}</span>
                </div>
              </div>

              {/* Subtotals & Taxes */}
              <div className="w-full flex flex-col gap-2 pt-3 border-t border-zinc-200 text-xs font-semibold">
                <div className="w-full flex items-center justify-between text-zinc-600">
                  <span>Item Subtotal</span>
                  <span>₹ {subtotal}</span>
                </div>
                <div className="w-full flex items-center justify-between text-zinc-600">
                  <span>CGST (2.5%)</span>
                  <span>₹ {cgst}</span>
                </div>
                <div className="w-full flex items-center justify-between text-zinc-600">
                  <span>SGST (2.5%)</span>
                  <span>₹ {sgst}</span>
                </div>
              </div>

              {/* Grand Total Amount Paid */}
              <div className="w-full flex items-center justify-between pt-3 border-t-2 border-black text-sm font-black uppercase tracking-wider">
                <span>Total Amount Paid</span>
                <span className="text-base font-black">₹ {totalAmount}</span>
              </div>
            </div>

            {/* Card 3: Payment Method & Settlement Status */}
            <div className="w-full border-2 border-black rounded-3xl p-3.5 px-4 flex items-center justify-between bg-white shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-black flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black uppercase tracking-wide">Paid via {receipt.mode}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Invoice #{receipt.ticketNumber}</span>
                </div>
              </div>

              <div className="border border-emerald-600 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Settled</span>
              </div>
            </div>
          </>
        )}

        {/* Customer Feedback Card */}
        <div className="w-full border-2 border-black rounded-3xl p-4 flex flex-col gap-3 bg-white shadow-xs">
          <div className="w-full flex items-center justify-between pb-1 border-b border-zinc-200">
            <span className="text-xs font-black uppercase tracking-wider">
              Rate Dining Experience
            </span>
          </div>

          <div className="w-full grid grid-cols-5 gap-1.5 pt-1">
            {ratingOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedRating === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedRating(opt.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-black bg-black text-white shadow-2xs'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
