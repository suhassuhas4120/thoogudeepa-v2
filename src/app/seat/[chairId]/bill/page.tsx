'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Bell, ArrowLeft, Ticket, QrCode, Banknote, Scan } from 'lucide-react';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';

export default function OrderSummaryBillPage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to live tracking
  useHardwareBack(`/seat/${chairId}/tracking`);

  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;

  const [promoCode, setPromoCode] = useState<string>('');
  const [selectedTip, setSelectedTip] = useState<string>('None');
  const [showWaiterModal, setShowWaiterModal] = useState<boolean>(false);
  const [waiterCalled, setWaiterCalled] = useState<boolean>(false);
  const [selectedPaymentSubMode, setSelectedPaymentSubMode] = useState<'scan' | 'cash'>('cash');

  const tipOptions = ['None', '₹ 30', '₹ 50', '₹ 100'];

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-28">
      {/* Scrollable Content Container */}
      <div className="w-full flex flex-col gap-5">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between py-2 border-b border-zinc-200 pb-3">
          {/* Back Navigation Button to Live Tracking */}
          <Link
            href={`/seat/${chairId}/tracking`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70"
            aria-label="Back to Tracking"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Center Brand / Page Title */}
          <div className="text-center flex flex-col items-center">
            <span className="text-xs font-black tracking-widest uppercase">
              Order Summary
            </span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">
              Seat #{seatNumber}
            </span>
          </div>

          {/* Right Notification Bell */}
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
          {/* Section Header */}
          <div className="w-full flex items-center justify-between border-b border-zinc-200 pb-2">
            <span className="text-xs font-black uppercase tracking-wider">
              Items &amp; Price Breakdown
            </span>
            <span className="text-[10px] font-bold border border-black px-2 py-0.5 rounded-full">
              6 Dishes
            </span>
          </div>

          {/* Item Rows - Scrollable inside this section with scrollbar aligned flush to right edge */}
          <div className="w-full flex flex-col gap-3.5 max-h-64 overflow-y-auto -mr-4 pr-1">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="w-full flex items-center justify-between gap-3 pr-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center shrink-0 bg-white shadow-sm">
                    <span className="text-xs font-bold">Image</span>
                  </div>
                  <span className="text-xs font-bold truncate">
                    Item Title {num} &times; 1
                  </span>
                </div>
                <span className="text-xs font-bold shrink-0">
                  ₹ ---
                </span>
              </div>
            ))}
          </div>

          {/* Subtotal & Taxes Breakdown */}
          <div className="w-full border-t border-zinc-200 pt-3 flex flex-col gap-1.5 text-xs text-zinc-700">
            <div className="w-full flex items-center justify-between">
              <span>Item Subtotal</span>
              <span className="font-bold">₹ ---</span>
            </div>
            <div className="w-full flex items-center justify-between">
              <span>Taxes &amp; Charges (5% GST)</span>
              <span className="font-bold">₹ ---</span>
            </div>
          </div>

          {/* Total Payable Box */}
          <div className="w-full border-t-2 border-black pt-3 flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-wider">
              Total Payable
            </span>
            <span className="text-lg font-black">
              ₹ ---
            </span>
          </div>
        </div>

        {/* Promo Code Section - Placed above Add Tip for Staff */}
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

        {/* Card 2: Add Tip Section */}
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
      </div>

      {/* Bottom Sticky Payment Actions: Pay via Waiter and Self Pay Side-by-Side */}
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

          {/* Self Pay - Disabled when Waiter is called */}
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
              href={`/seat/${chairId}/payment`}
              className="w-full border-2 border-black bg-black text-white py-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center cursor-pointer active:opacity-80 transition-opacity shadow-sm text-center"
            >
              Self Pay
            </Link>
          )}
        </div>

        {/* Scan & Cash options enabled when Call Captain / Pay via Waiter is confirmed */}
        {waiterCalled && (
          <div className="w-full relative pt-2">
            {/* Continuous baseline running across the container */}
            <div className="absolute left-0 right-0 top-[3px] h-[2px] bg-black pointer-events-none" />

            <div className="relative w-full grid grid-cols-2 gap-4 items-center">
              {/* Scan Icon Option linking to scanning page */}
              <Link
                href={`/seat/${chairId}/scan`}
                onClick={() => setSelectedPaymentSubMode('scan')}
                className="relative flex items-center justify-center py-2 cursor-pointer transition-all"
                aria-label="Open Scanner"
              >
                {selectedPaymentSubMode === 'scan' && (
                  <svg
                    width="110"
                    height="54"
                    viewBox="0 0 110 54"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute -top-[9px] left-1/2 -translate-x-1/2 pointer-events-none"
                  >
                    {/* White mask clearing baseline */}
                    <path
                      d="M 0,10 C 22,10 32,50 55,50 C 78,50 88,10 110,10 L 110,0 L 0,0 Z"
                      fill="white"
                    />
                    {/* Smooth bulged contour line matching sketch */}
                    <path
                      d="M 0,10 C 22,10 32,50 55,50 C 78,50 88,10 110,10"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                <div
                  className={`relative z-10 w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center transition-all bg-white shadow-xs ${
                    selectedPaymentSubMode === 'scan'
                      ? 'translate-y-2 bg-black text-white border-black'
                      : 'bg-white text-black hover:bg-zinc-50'
                  }`}
                >
                  <Scan className="w-6 h-6 stroke-[2.2]" />
                </div>
              </Link>

              {/* Cash Button Option */}
              <button
                type="button"
                onClick={() => setSelectedPaymentSubMode('cash')}
                className="relative flex items-center justify-center py-2 cursor-pointer transition-all"
              >
                {selectedPaymentSubMode === 'cash' && (
                  <svg
                    width="110"
                    height="54"
                    viewBox="0 0 110 54"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute -top-[9px] left-1/2 -translate-x-1/2 pointer-events-none"
                  >
                    {/* White mask clearing baseline */}
                    <path
                      d="M 0,10 C 22,10 32,50 55,50 C 78,50 88,10 110,10 L 110,0 L 0,0 Z"
                      fill="white"
                    />
                    {/* Smooth bulged contour line matching sketch */}
                    <path
                      d="M 0,10 C 22,10 32,50 55,50 C 78,50 88,10 110,10"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                <div
                  className={`relative z-10 px-5 py-2.5 rounded-2xl border-2 border-black flex items-center justify-center transition-all bg-white shadow-xs ${
                    selectedPaymentSubMode === 'cash'
                      ? 'translate-y-2 bg-black text-white border-black font-black'
                      : 'bg-white text-black hover:bg-zinc-50 font-bold'
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider">CASH</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pay via Waiter Confirmation Modal / Popup Section */}
      {showWaiterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center px-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white border-2 border-black rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative">
            {/* Top Small Crest / Icon Placeholder */}
            <div className="w-12 h-6 flex items-center justify-center mb-1">
              <div className="w-6 h-3 border border-black rounded-t-full flex items-center justify-center">
                <span className="text-[8px] font-black">---</span>
              </div>
            </div>

            {/* Small Subtitle Line */}
            <span className="text-[9px] font-black tracking-widest uppercase text-zinc-500 mb-4">
              -- ------ &bull; --- --------
            </span>

            {/* Prominent Circular Emblem / Logo Placeholder */}
            <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center mb-4 bg-white shadow-sm">
              <div className="w-16 h-16 rounded-full border border-black flex items-center justify-center">
                <span className="text-sm font-black">Logo</span>
              </div>
            </div>

            {/* Main Question Heading */}
            <h2 className="text-base font-black tracking-tight mb-2">
              Call Floor Captain for Payment?
            </h2>

            {/* Small Divider */}
            <div className="w-8 h-0.5 bg-black my-2" />

            {/* Description Paragraph 1 */}
            <p className="text-xs text-zinc-600 mb-1">
              Are you sure you want to call the Floor Captain for payment at
            </p>

            {/* Seat & Table Highlight Badge */}
            <p className="text-sm font-black text-black mb-1">
              Seat #{seatNumber}
            </p>

            {/* Description Paragraph 2 */}
            <p className="text-[11px] text-zinc-500 mb-6">
              A captain will visit your seat with the payment terminal and QR scanner.
            </p>

            {/* Action Buttons Row */}
            <div className="w-full grid grid-cols-2 gap-3">
              {/* Back / Dismiss Button */}
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

              {/* Confirm / Call Captain Button */}
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
