'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ChevronLeft, Bell, Plus, Check } from 'lucide-react';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';
import { getActiveDiningSession, ActiveDiningSession } from '../../../../lib/session/diningSession';
import { getMenuItemById } from '../../../../lib/data/menuData';

function CustomerSelfPaymentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to bill/order summary
  useHardwareBack(`/seat/${chairId}/bill`);

  const amountParam = searchParams?.get('amount');
  const tipParam = searchParams?.get('tip');

  const [session, setSession] = useState<ActiveDiningSession | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(1);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    const s = getActiveDiningSession();
    if (s && s.paymentStatus === 'unpaid') {
      if (s.seatId !== chairId) {
        window.location.replace(`/seat/${s.seatId}/payment`);
        return;
      }
      setSession(s);
    }
  }, [chairId]);

  const storedTipStr = typeof window !== 'undefined' ? sessionStorage.getItem(`thoogudeepa_selected_tip_${chairId}`) : null;
  const tipFromStorage = storedTipStr === '₹ 30' ? 30 : storedTipStr === '₹ 50' ? 50 : storedTipStr === '₹ 100' ? 100 : 0;
  const tipAmount = tipParam !== null && tipParam !== undefined ? Number(tipParam) : tipFromStorage;

  const itemsList = session?.items && session.items.length > 0 ? session.items : [];
  const itemsSubtotal = itemsList.length > 0
    ? itemsList.reduce((acc, it) => acc + it.price * it.quantity, 0)
    : (session?.totalAmount ? Math.round(session.totalAmount / 1.05) : 0);

  const cgst = Math.round(itemsSubtotal * 0.025);
  const sgst = Math.round(itemsSubtotal * 0.025);
  const gstAmount = cgst + sgst;
  const billTotal = itemsSubtotal + gstAmount;

  const grandPayable = amountParam ? Number(amountParam) : (billTotal + tipAmount);

  const cards = [
    {
      id: 'card1',
      title: 'UPI / INSTANT QR',
      number: `upi://pay?pa=thoogudeepa@upi&seat=${chairId}`,
      holder: `Seat #${chairId} Guest`,
      expiry: 'LIVE',
      logo: 'UPI',
    },
    {
      id: 'card2',
      title: 'RUPAY / DEBIT CARD',
      number: '•••• •••• •••• 8765',
      holder: `Seat #${chairId} Guest`,
      expiry: '12 / 29',
      logo: 'RUPAY',
    },
    {
      id: 'card3',
      title: 'CREDIT / TAP TO PAY',
      number: '•••• •••• •••• 9901',
      holder: `Seat #${chairId} Guest`,
      expiry: '08 / 30',
      logo: 'VISA',
    },
  ];

  // Payment channels
  const paymentMethods = [
    { id: 0, isAdd: true },
    { id: 1, label: 'UPI' },
    { id: 2, label: 'Card' },
    { id: 3, label: 'NetBank' },
    { id: 4, label: 'Cash' },
  ];

  // Determine selected method name
  const selectedMethodObj = paymentMethods.find((m) => m.id === selectedMethod);
  const selectedMethodName = selectedMethodObj?.label || 'UPI';

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
          <div className="flex flex-col items-center">
            <h1 className="text-base font-bold tracking-tight">Settle Bill</h1>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">
              Seat #{chairId}
            </span>
          </div>

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
                  {/* Top row inside card: Title & Brand / Logo */}
                  <div className="w-full flex items-center justify-between">
                    <span className="text-sm font-black tracking-wide">{card.title}</span>
                    <div className="border border-black px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white">
                      {isSelected ? 'SELECTED' : card.logo}
                    </div>
                  </div>

                  {/* Middle row: Card Number / Identifier */}
                  <div className="text-sm font-mono font-bold tracking-wider my-auto truncate">
                    {card.number}
                  </div>

                  {/* Bottom row: Meta Details */}
                  <div className="w-full flex items-end justify-between">
                    <div className="w-8 h-6 border border-black rounded-md flex items-center justify-center bg-zinc-100">
                      <div className="w-4 h-3 border border-black rounded-xs" />
                    </div>
                    <div className="flex gap-4 text-right">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Customer</span>
                        <span className="text-xs font-bold">{card.holder}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Status</span>
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
            Choose Payment Mode
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
                  className={`px-4 py-2.5 rounded-full border-2 border-black flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                    isSelected ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                  aria-label={method.label}
                >
                  <span className="text-xs font-black uppercase tracking-wider">
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Items & Price Breakdown Section */}
        <div className="w-full border-2 border-black rounded-2xl p-4 flex flex-col gap-4 bg-white shadow-sm">
          {/* Section Header */}
          <div className="w-full flex items-center justify-between border-b border-zinc-200 pb-2">
            <span className="text-xs font-black uppercase tracking-wider">
              Items &amp; Bill Breakdown
            </span>
            <span className="text-[10px] font-bold border border-black px-2 py-0.5 rounded-full uppercase bg-zinc-50">
              {session?.ticketNumber || `Seat #${chairId}`}
            </span>
          </div>

          {/* Real Item Rows */}
          <div className="w-full flex flex-col gap-3">
            {session?.items && session.items.length > 0 ? (
              session.items.map((item, idx) => {
                const numericId = item.id.replace('dish-', '');
                const dishData = getMenuItemById(numericId);
                return (
                  <div key={idx} className="w-full flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full border border-black overflow-hidden flex items-center justify-center shrink-0 bg-zinc-100">
                        <img
                          src={dishData.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-semibold">
                          Qty: {item.quantity} &times; ₹ {item.price}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black shrink-0">
                      ₹ {item.price * item.quantity}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full border border-black overflow-hidden flex items-center justify-center shrink-0 bg-zinc-100">
                    <img
                      src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80"
                      alt="Donne Biryani"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate">
                      Authentic Military Dining
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold">
                      Dine-in Order Session
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black shrink-0">
                  ₹ {itemsSubtotal}
                </span>
              </div>
            )}
          </div>

          {/* Subtotal & Taxes Breakdown */}
          <div className="w-full border-t border-zinc-200 pt-3 flex flex-col gap-1.5 text-xs text-zinc-700">
            <div className="w-full flex items-center justify-between">
              <span>Item Subtotal ({itemsList.reduce((acc, curr) => acc + curr.quantity, 0)} items)</span>
              <span className="font-bold text-zinc-900">₹ {itemsSubtotal}</span>
            </div>
            <div className="w-full flex items-center justify-between text-zinc-600">
              <span>CGST (2.5%)</span>
              <span className="font-bold">₹ {cgst}</span>
            </div>
            <div className="w-full flex items-center justify-between text-zinc-600">
              <span>SGST (2.5%)</span>
              <span className="font-bold">₹ {sgst}</span>
            </div>
            {tipAmount > 0 && (
              <div className="w-full flex items-center justify-between text-emerald-800 font-bold bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-200">
                <span>Staff Tip (Waiter)</span>
                <span>+ ₹ {tipAmount}</span>
              </div>
            )}
          </div>

          {/* Total Payable Box */}
          <div className="w-full border-t-2 border-black pt-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-wider">
                Total Payable
              </span>
              {tipAmount > 0 && (
                <span className="text-[10px] text-emerald-700 font-bold">
                  Includes ₹{tipAmount} Tip
                </span>
              )}
            </div>
            <span className="text-xl font-black text-black">
              ₹ {grandPayable}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Continue Button */}
      <div className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-sm pt-3 pb-4 border-t border-zinc-200">
        {selectedCardId ? (
          /* Card Selected -> Goes to Card Details */
          <Link
            href={`/seat/${chairId}/card-details?card=${selectedCardId}&amount=${grandPayable}&tip=${tipAmount}`}
            className="w-full border-2 border-black bg-black text-white py-3.5 px-4 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center cursor-pointer active:opacity-80 transition-opacity text-center shadow-md"
          >
            Continue with Card
          </Link>
        ) : selectedMethod !== null ? (
          /* Method Selected -> Goes to Payment Success */
          <Link
            href={`/seat/${chairId}/payment-success?mode=${encodeURIComponent(selectedMethodName)}&amount=${grandPayable}&tip=${tipAmount}`}
            className="w-full border-2 border-black bg-black text-white py-3.5 px-4 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center cursor-pointer active:opacity-80 transition-opacity text-center shadow-md"
          >
            Pay ₹ {grandPayable} via {selectedMethodName}
          </Link>
        ) : (
          /* Nothing Selected */
          <button
            type="button"
            disabled
            className="w-full border-2 border-zinc-300 bg-zinc-200 text-zinc-500 py-3.5 px-4 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center cursor-not-allowed text-center opacity-70"
          >
            Select Payment Method
          </button>
        )}
      </div>
    </div>
  );
}

export default function CustomerSelfPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CustomerSelfPaymentContent />
    </Suspense>
  );
}
