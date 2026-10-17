'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ChevronLeft, Check } from 'lucide-react';
import CustomerBottomNav from '../../../../components/navigation/CustomerBottomNav';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';

function PaymentSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to profile
  useHardwareBack(`/seat/${chairId}/profile`);

  const modeParam = searchParams?.get('mode') || 'Card';

  // Fixed completion timestamp recorded once and persisted permanently
  const [completionTimestamp, setCompletionTimestamp] = useState<{ date: string; time: string }>({
    date: '',
    time: '',
  });

  useEffect(() => {
    const storageKey = `thoogudeepa_payment_timestamp_${chairId}`;
    const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.date && parsed.time) {
          setCompletionTimestamp(parsed);
          return;
        }
      } catch {
        // Fall through if parsing fails
      }
    }

    // If not stored yet, capture the exact completion time right now and save permanently
    const now = new Date();

    // Format Date: DD/MM/YYYY
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // Format Time: HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    const timestampData = {
      date: formattedDate,
      time: formattedTime,
    };

    setCompletionTimestamp(timestampData);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(timestampData));
    }
  }, [chairId]);

  // Details rows for the receipt/transaction card
  const transactionRows = [
    { label: "Transaction I'D", value: '4051 3543 1002' },
    { label: 'Total Amount', value: '₹ ---' },
    { label: 'Payment Mode', value: modeParam },
    { label: 'Seat name', value: `Seat #${chairId}` },
    { label: 'Time', value: completionTimestamp.time || '--:--:--' },
    { label: 'Date', value: completionTimestamp.date || '--/--/----' },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-36">
      {/* Scrollable Content Container */}
      <div className="w-full flex flex-col items-center gap-6">
        {/* Top Header without Back button */}
        <header className="w-full flex items-center justify-center py-2 border-b border-zinc-200 pb-3 relative">
          {/* Center Title */}
          <h1 className="text-base font-bold tracking-tight">Payment Success</h1>
        </header>

        {/* Central Success Badge Section */}
        <div className="w-full flex flex-col items-center justify-center pt-4 pb-2">
          {/* Concentric Circular Container with Check Badge */}
          <div className="w-32 h-32 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-sm p-3 relative">
            {/* Inner Scalloped / Starburst Circular Shape */}
            <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center bg-black text-white shadow-md">
              <Check className="w-12 h-12 stroke-[3]" />
            </div>
          </div>

          {/* Success Title */}
          <h2 className="text-lg font-black tracking-tight mt-5 mb-1 text-center">
            Payment Successful!
          </h2>

          {/* Success Subtitle Line */}
          <p className="text-xs text-zinc-600 font-bold tracking-wide text-center">
            Successfully Paid ₹ ---
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="w-full flex flex-col gap-2.5">
          <span className="text-xs font-black uppercase tracking-wider">
            Payment Method
          </span>

          <div className="w-full border-2 border-black rounded-3xl p-5 flex flex-col gap-3.5 bg-white shadow-sm">
            {transactionRows.map((row, idx) => (
              <div key={idx} className="w-full flex items-center justify-between text-xs">
                <span className="text-zinc-600 font-semibold">{row.label}</span>
                <span className="font-bold">{row.value}</span>
              </div>
            ))}

            {/* Status Row with Pill */}
            <div className="w-full flex items-center justify-between text-xs pt-1 border-t border-zinc-200">
              <span className="text-zinc-600 font-semibold">Status</span>
              <span className="border border-black px-3 py-1 rounded-full text-[10px] font-black uppercase bg-zinc-100">
                Success
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky View Bill Button directly above the bottom nav icons */}
      <div className="sticky bottom-16 z-30 w-full bg-white/95 backdrop-blur-sm pt-2 pb-2">
        <Link
          href={`/seat/${chairId}/receipt`}
          className="w-full border-2 border-black bg-black text-white py-3.5 px-4 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center cursor-pointer active:opacity-80 transition-opacity text-center shadow-md"
        >
          View Bill
        </Link>
      </div>

      {/* Fixed Bottom Navigation Bar - Home, likes, cart disabled; Profile enabled with arrow indication */}
      <CustomerBottomNav
        chairId={chairId}
        disabledTabs={['home', 'likes', 'cart']}
        showIndicatorArrowOnProfile={true}
      />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
