'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import CustomerBottomNav from '../../../../components/navigation/CustomerBottomNav';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';
import { getActiveDiningSession, clearActiveDiningSession, updateActiveDiningSession } from '../../../../lib/session/diningSession';
import { useCart } from '../../../../lib/context/CartContext';
import { realtimeBridge } from '../../../../lib/supabase';

function PaymentSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chairId = (params?.chairId as string) || '12';
  const { clearCart } = useCart();

  // Device hardware back button & swipe back: return to profile
  useHardwareBack(`/seat/${chairId}/profile`);

  const modeParam = searchParams?.get('mode') || 'UPI';
  const amountParam = searchParams?.get('amount');
  const tipParam = searchParams?.get('tip');

  const [settledAmount, setSettledAmount] = useState<number>(
    amountParam ? Number(amountParam) : 0
  );
  const [appliedTip, setAppliedTip] = useState<number>(0);
  const [transactionId, setTransactionId] = useState<string>('');

  // Mark session as paid, save settled receipt record, and release anti-cheat lock
  useEffect(() => {
    const s = getActiveDiningSession();
    const storedTipStr = typeof window !== 'undefined' ? sessionStorage.getItem(`thoogudeepa_selected_tip_${chairId}`) : null;
    const tipFromStorage = storedTipStr === '₹ 30' ? 30 : storedTipStr === '₹ 50' ? 50 : storedTipStr === '₹ 100' ? 100 : 0;
    const tipAmount = tipParam !== null && tipParam !== undefined ? Number(tipParam) : tipFromStorage;
    setAppliedTip(tipAmount);

    let finalAmount = Number(amountParam) || 0;
    if (s && s.seatId === chairId) {
      if (!finalAmount) {
        finalAmount = (s.totalAmount || 0) + tipAmount;
      }
      setSettledAmount(finalAmount);
      try {
        localStorage.setItem(
          `thoogudeepa_settled_receipt_${chairId}`,
          JSON.stringify({
            ticketNumber: s.ticketNumber,
            seatId: chairId,
            items: s.items || [],
            subtotal: s.items && s.items.length > 0
              ? s.items.reduce((acc, it) => acc + it.price * it.quantity, 0)
              : Math.round((finalAmount - tipAmount) / 1.05),
            tip: tipAmount,
            totalAmount: finalAmount,
            mode: modeParam,
            settledAt: Date.now(),
          })
        );
      } catch {
        // Ignore storage errors
      }
    } else {
      try {
        const storedReceipt = localStorage.getItem(`thoogudeepa_settled_receipt_${chairId}`);
        if (storedReceipt) {
          const parsed = JSON.parse(storedReceipt);
          if (parsed.totalAmount) {
            setSettledAmount(parsed.totalAmount);
            finalAmount = parsed.totalAmount;
          }
          if (parsed.tip) {
            setAppliedTip(parsed.tip);
          }
        }
      } catch {
        // Ignore storage errors
      }
    }

    // Persist or generate clean transaction ID
    const txnKey = `thoogudeepa_txn_id_${chairId}`;
    let txn = '';
    try {
      txn = localStorage.getItem(txnKey) || '';
      if (!txn) {
        txn = `TXN-${chairId}-${Math.floor(10000000 + Math.random() * 90000000)}`;
        localStorage.setItem(txnKey, txn);
      }
    } catch {
      txn = `TXN-${chairId}-${Date.now().toString().slice(-8)}`;
    }
    setTransactionId(txn);

    updateActiveDiningSession({ paymentStatus: 'paid' });
    realtimeBridge.settleBill(chairId, modeParam, finalAmount);
    clearActiveDiningSession();
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chairId, modeParam, amountParam, tipParam]);

  // Completion timestamp recorded once and persisted permanently
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

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

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
    { label: 'Transaction ID', value: transactionId || `TXN-${chairId}-90823411` },
    ...(appliedTip > 0 ? [{ label: 'Staff Tip (Waiter)', value: `₹ ${appliedTip}` }] : []),
    { label: 'Total Settled', value: `₹ ${settledAmount}` },
    { label: 'Payment Mode', value: modeParam },
    { label: 'Seat Assigned', value: `Seat #${chairId}` },
    { label: 'Time', value: completionTimestamp.time || '--:--:--' },
    { label: 'Date', value: completionTimestamp.date || '--/--/----' },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-36">
      {/* Scrollable Content Container */}
      <div className="w-full flex flex-col items-center gap-6">
        {/* Top Header */}
        <header className="w-full flex items-center justify-center py-2 border-b border-zinc-200 pb-3 relative">
          <h1 className="text-base font-bold tracking-tight">Payment Completed</h1>
        </header>

        {/* Central Success Badge Section */}
        <div className="w-full flex flex-col items-center justify-center pt-4 pb-2">
          {/* Concentric Circular Container with Check Badge */}
          <div className="w-32 h-32 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-sm p-3 relative">
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
            Successfully Settled ₹ {settledAmount}
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="w-full flex flex-col gap-2.5">
          <span className="text-xs font-black uppercase tracking-wider">
            Settlement Summary
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
              <span className="border border-black px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-900 border-emerald-500">
                Paid &amp; Settled
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
          View Tax Invoice
        </Link>
      </div>

      {/* Fixed Bottom Navigation Bar - Home, likes, cart disabled; Profile enabled */}
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
