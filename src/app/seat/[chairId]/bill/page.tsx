'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Bell, ArrowLeft, Ticket, Banknote, Scan, Receipt, ArrowRight } from 'lucide-react';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';
import { getActiveDiningSession, ActiveDiningSession } from '../../../../lib/session/diningSession';

export default function OrderSummaryBillPage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to live tracking
  useHardwareBack(`/seat/${chairId}/tracking`);

  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;

  const [session, setSession] = useState<ActiveDiningSession | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [selectedTip, setSelectedTip] = useState<string>('None');
  const [showWaiterModal, setShowWaiterModal] = useState<boolean>(false);
  const [waiterCalled, setWaiterCalled] = useState<boolean>(false);
  const [selectedPaymentSubMode, setSelectedPaymentSubMode] = useState<'scan' | 'cash'>('cash');

  useEffect(() => {
    const s = getActiveDiningSession();
    if (s && s.seatId === chairId && s.paymentStatus === 'unpaid') {
      setSession(s);
    }
  }, [chairId]);

  const tipOptions = ['None', '₹ 30', '₹ 50', '₹ 100'];

  const billTotal = session?.totalAmount || 0;
  const subtotal = billTotal > 0 ? Math.round(billTotal / 1.05) : 0;
  const gstAmount = billTotal - subtotal;
  const tipAmount = selectedTip === '₹ 30' ? 30 : selectedTip === '₹ 50' ? 50 : selectedTip === '₹ 100' ? 100 : 0;
  const grandPayable = billTotal + tipAmount;

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-28">
      {/* Scrollable Content Container */}
      <div className="w-full flex flex-col gap-5">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between py-2 border-b border-zinc-200 pb-3">
          <Link
            href={`/seat/${chairId}/tracking`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70"
            aria-label="Back to Tracking"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="text-center flex flex-col items-center">
            <span className="text-xs font-black tracking-widest uppercase">
              Order Summary
            </span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">
              Seat #{seatNumber}
            </span>
          </div>

          <Link
            href={`/seat/${chairId}/assistant?from=${encodeURIComponent(`/seat/${chairId}/bill`)}`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
            aria-label="Assistant & Call Waiter"
          >
            <Bell className="w-5 h-5" />
          </Link>
        </header>

        {/* Card 1: Items & Price Breakdown Section */}
        <div className="w-full border-2 border-black rounded-2xl p-4 flex flex-col gap-4 bg-white shadow-sm">
          {!session ? (
            <div className="w-full py-8 flex flex-col items-center justify-center text-center gap-2">
              <Receipt className="w-8 h-8 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-500">
                No active unsettled bill for Seat #{seatNumber}.
              </span>
              <Link
                href={`/seat/${chairId}/menu`}
                className="mt-1 px-4 py-1.5 rounded-lg bg-black text-white text-[11px] font-black uppercase tracking-wider"
              >
                Order Dishes First
              </Link>
            </div>
          ) : (
            <>
              {/* Section Header */}
              <div className="w-full flex items-center justify-between border-b border-zinc-200 pb-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  Ticket #{session.ticketNumber}
                </span>
                <span className="text-[10px] font-bold border border-black px-2 py-0.5 rounded-full uppercase bg-zinc-100">
                  Dine-In
                </span>
              </div>

              {/* Real Order Breakdown */}
              {session.items && session.items.length > 0 ? (
                <div className="w-full flex flex-col gap-2.5 py-1">
                  {session.items.map((it, idx) => (
                    <div key={idx} className="w-full flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-900 truncate pr-2">
                        {it.quantity} &times; {it.title}
                      </span>
                      <span className="font-bold text-zinc-950 shrink-0">
                        ₹ {it.price * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full flex flex-col gap-2 py-1">
                  <div className="w-full flex items-center justify-between text-xs font-bold">
                    <span>Authentic Military Dining Order</span>
                    <span>₹ {subtotal}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium">
                    Steamed donne biryani &amp; military starters steamed in traditional herbal spices.
                  </div>
                </div>
              )}

              {/* Subtotal & Taxes Breakdown */}
              <div className="w-full border-t border-zinc-200 pt-3 flex flex-col gap-1.5 text-xs text-zinc-700">
                <div className="w-full flex items-center justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-bold">₹ {subtotal}</span>
                </div>
                <div className="w-full flex items-center justify-between">
                  <span>Taxes &amp; Charges (5% GST)</span>
                  <span className="font-bold">₹ {gstAmount}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="w-full flex items-center justify-between text-emerald-800 font-bold">
                    <span>Staff Tip</span>
                    <span>₹ {tipAmount}</span>
                  </div>
                )}
              </div>

              {/* Total Payable Box */}
              <div className="w-full border-t-2 border-black pt-3 flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-wider">
                  Total Payable
                </span>
                <span className="text-lg font-black">
                  ₹ {grandPayable}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Promo Code Section */}
        {session && (
          <div className="w-full border-2 border-black rounded-2xl p-2 flex items-center justify-between gap-2 bg-white shadow-sm">
            <div className="flex items-center gap-2 pl-2 flex-1">
              <Ticket className="w-4 h-4 text-zinc-600 shrink-0" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo Code"
                className="w-full text-xs font-bold outline-none bg-transparent text-black uppercase placeholder:normal-case placeholder:font-normal"
              />
            </div>
            <button
              type="button"
              className="px-4 py-2 border border-black bg-black text-white text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer active:opacity-80"
            >
              Apply
            </button>
          </div>
        )}

        {/* Card 2: Add Tip Section */}
        {session && (
          <div className="w-full border-2 border-black rounded-2xl p-4 flex flex-col gap-3 bg-white shadow-sm">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider">
                Add Tip for Staff
              </span>
              <span className="text-[11px] font-bold text-zinc-600">
                {selectedTip}
              </span>
            </div>

            <div className="w-full grid grid-cols-4 gap-2 mt-1">
              {tipOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedTip(opt)}
                  className={`py-2 text-xs font-bold rounded-xl border border-black cursor-pointer transition-all ${
                    selectedTip === opt
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-zinc-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Payment Actions */}
      {session && (
        <div className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-sm pt-2 pb-2 flex flex-col gap-2.5 border-t border-zinc-200">
          <div className="w-full grid grid-cols-2 gap-3">
            {/* Pay via Waiter */}
            <button
              type="button"
              onClick={() => setShowWaiterModal(true)}
              className={`w-full border-2 border-black py-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center cursor-pointer active:opacity-75 transition-opacity shadow-sm text-center ${
                waiterCalled ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              Pay via Waiter
            </button>

            {/* Self Pay */}
            {waiterCalled ? (
              <button
                type="button"
                disabled
                className="w-full border-2 border-zinc-300 bg-zinc-200 text-zinc-500 py-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center cursor-not-allowed shadow-none text-center opacity-60"
              >
                Self Pay
              </button>
            ) : (
              <Link
                href={`/seat/${chairId}/payment?amount=${grandPayable}`}
                className="w-full border-2 border-black bg-black text-white py-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center cursor-pointer active:opacity-80 transition-opacity shadow-sm text-center"
              >
                Self Pay
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pay via Waiter Confirmation Modal */}
      {showWaiterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center px-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white border-2 border-black rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative">
            <h2 className="text-base font-black tracking-tight mb-2 mt-2">
              Call Floor Captain for Payment?
            </h2>
            <div className="w-8 h-0.5 bg-black my-2" />
            <p className="text-xs text-zinc-600 mb-1">
              Are you sure you want to call the Floor Captain for payment at
            </p>
            <p className="text-sm font-black text-black mb-1">
              Seat #{seatNumber}
            </p>
            <p className="text-[11px] text-zinc-500 mb-6">
              A captain will visit your seat with the payment terminal and QR scanner.
            </p>

            <div className="w-full grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setWaiterCalled(false);
                  setShowWaiterModal(false);
                }}
                className="w-full border-2 border-black bg-white text-black py-3 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:opacity-75 transition-opacity"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>No, Go Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWaiterCalled(true);
                  setShowWaiterModal(false);
                }}
                className="w-full border-2 border-black bg-black text-white py-3 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:opacity-80 transition-opacity"
              >
                <span>Yes, Call Captain</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
