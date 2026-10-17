'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Bell, Plus } from 'lucide-react';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';

export default function CustomerSelfPaymentPage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to bill/order summary
  useHardwareBack(`/seat/${chairId}/bill`);

  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const cards = [
    {
      id: 'card1',
      title: 'CARD / PRIMARY',
      number: '•••• •••• •••• 2345',
      holder: 'Jonathan Smith',
      expiry: '02 / 21',
      logo: 'VISA',
    },
    {
      id: 'card2',
      title: 'CARD / SECONDARY',
      number: '•••• •••• •••• 8765',
      holder: 'Jonathan Smith',
      expiry: '09 / 29',
      logo: 'MASTERCARD',
    },
    {
      id: 'card3',
      title: 'CARD / UPI QR',
      number: '•••• •••• •••• 9901',
      holder: 'Jonathan Smith',
      expiry: '12 / 30',
      logo: 'RUPAY',
    },
  ];

  // Methods list representing the icon row
  const paymentMethods = [
    { id: 0, isAdd: true },
    { id: 1, label: 'Method 1' },
    { id: 2, label: 'Method 2' },
    { id: 3, label: 'Method 3' },
    { id: 4, label: 'Method 4' },
  ];

  // History / Order rounds items
  const historyItems = [
    { id: 1, title: 'Item Section 1', subtitle: 'Detail: 01', buttonLabel: 'Action 1' },
    { id: 2, title: 'Item Section 2', subtitle: 'Detail: 02', buttonLabel: 'Status' },
    { id: 3, title: 'Item Section 3', subtitle: 'Detail: 03', buttonLabel: 'Action 2' },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-28">
      {/* Scrollable Content Container */}
      <div className="w-full flex flex-col gap-6">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between py-2 border-b border-zinc-200 pb-3">
          {/* Back Navigation Button to Order Summary & Bill */}
          <Link
            href={`/seat/${chairId}/bill`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
            aria-label="Back to Bill"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Center Title */}
          <h1 className="text-base font-bold tracking-tight">Payment</h1>

          {/* Right Notification Bell */}
          <Link
            href={`/seat/${chairId}/assistant?from=${encodeURIComponent(`/seat/${chairId}/payment`)}`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
            aria-label="Assistant & Call Waiter"
          >
            <Bell className="w-5 h-5" />
          </Link>
        </header>

        {/* Horizontal Slidable Cards Carousel */}
        <div className="w-full overflow-x-auto no-scrollbar py-1 -mx-4 px-4 snap-x snap-mandatory">
          <div className="flex gap-4 w-max">
            {cards.map((card) => {
              const isSelected = selectedCardId === card.id;

              return (
                <div
                  key={card.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCardId(null);
                    } else {
                      setSelectedCardId(card.id);
                      setSelectedMethod(null);
                    }
                  }}
                  className={`w-[300px] border-2 border-black rounded-3xl p-5 flex flex-col justify-between h-44 shadow-sm shrink-0 snap-center cursor-pointer transition-all ${
                    isSelected ? 'bg-white ring-3 ring-black/80' : 'bg-zinc-50 hover:bg-white'
                  }`}
                >
                  {/* Top row inside card: Title & Brand / Logo Placeholder */}
                  <div className="w-full flex items-center justify-between">
                    <span className="text-sm font-black tracking-wide">{card.title}</span>
                    <div className="border border-black px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white">
                      {isSelected ? 'SELECTED' : card.logo}
                    </div>
                  </div>

                  {/* Middle row: Card Number / Identifier */}
                  <div className="text-base font-mono font-bold tracking-widest my-auto">
                    {card.number}
                  </div>

                  {/* Bottom row: Chip icon placeholder and Meta Details */}
                  <div className="w-full flex items-end justify-between">
                    <div className="w-8 h-6 border border-black rounded-md flex items-center justify-center bg-zinc-100">
                      <div className="w-4 h-3 border border-black rounded-xs" />
                    </div>
                    <div className="flex gap-6 text-right">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Detail 1</span>
                        <span className="text-xs font-bold">{card.holder}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Detail 2</span>
                        <span className="text-xs font-bold">{card.expiry}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Choose Method */}
        <div className="w-full flex flex-col gap-3">
          <span className="text-xs font-black uppercase tracking-wider">
            Choose Method
          </span>

          {/* Methods Horizontal Row */}
          <div className="w-full flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {paymentMethods.map((method) => {
              if (method.isAdd) {
                return (
                  <button
                    key="add"
                    type="button"
                    className="w-13 h-13 rounded-full border-2 border-black flex items-center justify-center shrink-0 cursor-pointer active:opacity-70 bg-white"
                    aria-label="Add Method"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                );
              }

              const isSelected = selectedMethod === method.id;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedMethod(null);
                    } else {
                      setSelectedMethod(method.id);
                      setSelectedCardId(null);
                    }
                  }}
                  className={`w-13 h-13 rounded-full border-2 border-black flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                    isSelected ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                  aria-label={method.label}
                >
                  <span className="text-[10px] font-black uppercase">
                    {isSelected ? '✓' : `M${method.id}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Items & Price Breakdown Section (Replacing History) */}
        <div className="w-full border-2 border-black rounded-2xl p-4 flex flex-col gap-4 bg-white shadow-sm">
          {/* Section Header */}
          <div className="w-full flex items-center justify-between border-b border-zinc-200 pb-2">
            <span className="text-xs font-black uppercase tracking-wider">
              Items &amp; Price Breakdown
            </span>
            <span className="text-[10px] font-bold border border-black px-2 py-0.5 rounded-full">
              3 Dishes
            </span>
          </div>

          {/* Item Rows */}
          <div className="w-full flex flex-col gap-3">
            {[1, 2, 3].map((num) => (
              <div key={num} className="w-full flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-18 h-18 rounded-full border-2 border-black flex items-center justify-center shrink-0 bg-white shadow-sm">
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
      </div>

      {/* Bottom Sticky Continue Button */}
      <div className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-sm pt-3 pb-4 border-t border-zinc-200">
        {selectedCardId ? (
          /* Card Selected -> Goes to Card Details */
          <Link
            href={`/seat/${chairId}/card-details?card=${selectedCardId}`}
            className="w-full border-2 border-black bg-black text-white py-3.5 px-4 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center cursor-pointer active:opacity-80 transition-opacity text-center shadow-md"
          >
            Continue
          </Link>
        ) : selectedMethod !== null ? (
          /* Method (M1, M2, M3, M4) Selected -> Goes Directly to Payment Success */
          <Link
            href={`/seat/${chairId}/payment-success?mode=Method-${selectedMethod}`}
            className="w-full border-2 border-black bg-black text-white py-3.5 px-4 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center cursor-pointer active:opacity-80 transition-opacity text-center shadow-md"
          >
            Continue
          </Link>
        ) : (
          /* Nothing Selected -> Disabled */
          <button
            type="button"
            disabled
            className="w-full border-2 border-zinc-300 bg-zinc-200 text-zinc-500 py-3.5 px-4 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center cursor-not-allowed text-center opacity-70"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
