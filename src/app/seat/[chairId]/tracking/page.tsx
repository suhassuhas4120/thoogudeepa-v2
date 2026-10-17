'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  Clock,
  Sparkles,
  UtensilsCrossed,
  PlusCircle,
  Bell,
  CheckCircle2,
  ArrowRight,
  Receipt
} from 'lucide-react';
import CustomerBottomNav from '../../../../components/navigation/CustomerBottomNav';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';
import { getActiveDiningSession, ActiveDiningSession } from '../../../../lib/session/diningSession';
import { realtimeBridge } from '../../../../lib/supabase';

export default function LiveOrderTrackingPage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to cart
  useHardwareBack(`/seat/${chairId}/cart`);

  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;

  const [session, setSession] = useState<ActiveDiningSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(3); // 1 to 5

  useEffect(() => {
    const s = getActiveDiningSession();
    if (s && s.seatId === chairId && s.paymentStatus === 'unpaid') {
      setSession(s);
      if (s.orderStatus === 'ready') setCurrentStep(4);
      else if (s.orderStatus === 'in_progress') setCurrentStep(3);
      else setCurrentStep(2);
    }
    setIsLoaded(true);

    const unsubscribe = realtimeBridge.subscribeKDS({
      onStageChange: (data) => {
        if (data.stage === 'READY') setCurrentStep(4);
        else if (data.stage === 'PREP') setCurrentStep(3);
        else if (data.stage === 'REC') setCurrentStep(2);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [chairId]);

  const steps = [
    { label: 'Placed', time: session?.orderedAt ? new Date(session.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--' },
    { label: 'Received', time: 'Pass Sync' },
    { label: 'Preparing', time: 'In Wok' },
    { label: 'Ready', time: 'Pass Ready' },
    { label: 'Served', time: 'At Table' },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-24">
      {/* Scrollable Content Container */}
      <div className="w-full flex flex-col gap-4">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between py-2 border-b border-zinc-200 pb-3">
          <Link
            href={`/seat/${chairId}/cart`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70"
            aria-label="Back to Cart"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="text-center flex flex-col items-center">
            <span className="text-sm font-black tracking-wider uppercase">
              THOOGUDEEPA
            </span>
            <span className="text-[10px] text-zinc-500 tracking-tight">
              Donne Biryani Mane
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="border border-black px-2.5 py-1 rounded-lg text-xs font-bold bg-white">
              Seat {seatNumber}
            </div>
            <Link
              href={`/seat/${chairId}/assistant?from=${encodeURIComponent(`/seat/${chairId}/tracking`)}`}
              className="w-9 h-9 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
              aria-label="Assistant & Call Waiter"
            >
              <Bell className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {isLoaded && !session ? (
          /* Empty State - No active order placed yet */
          <div className="w-full py-16 flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-zinc-300 rounded-3xl bg-zinc-50/50 p-6 my-4">
            <div className="w-16 h-16 rounded-full border-2 border-black bg-white flex items-center justify-center shadow-xs">
              <Clock className="w-7 h-7 text-black" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-black uppercase tracking-tight text-zinc-950">
                No Orders in Kitchen Yet
              </h2>
              <p className="text-xs text-zinc-500 font-medium max-w-xs leading-relaxed">
                Seat {seatNumber} does not currently have any active tickets in preparation. Browse our authentic military menu to place your order!
              </p>
            </div>
            <Link
              href={`/seat/${chairId}/menu`}
              className="mt-2 px-6 py-2.5 border-2 border-black bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer active:opacity-80 shadow-xs flex items-center gap-2"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          /* Active Order Tracking */
          <>
            <div className="w-full border-2 border-black rounded-2xl p-4 flex items-center justify-between bg-white shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-black" />
                  <h2 className="text-base font-black tracking-tight">
                    Live Order Tracking
                  </h2>
                </div>
                <p className="text-xs text-zinc-600">
                  Ticket #{session?.ticketNumber} • Kitchen pass preparation active
                </p>
              </div>
              <div className="border border-black p-2 rounded-xl text-center shrink-0">
                <Sparkles className="w-4 h-4 mx-auto mb-0.5" />
                <span className="text-[9px] font-bold uppercase tracking-wider block">
                  Live State
                </span>
              </div>
            </div>

            {/* Active Ticket Tracking Card */}
            <div className="w-full border-2 border-black rounded-2xl p-3.5 flex flex-col gap-3 bg-white shadow-sm">
              <div className="w-full flex items-start justify-between gap-3">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-black uppercase tracking-wider border border-black px-1.5 py-0.5 rounded bg-zinc-100">
                    PASS ACTIVE
                  </span>
                  <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-sm">
                    <UtensilsCrossed className="w-8 h-8 text-black" />
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-0.5 min-w-0 pt-1">
                  <h3 className="text-sm font-black truncate">
                    Military Kitchen Order
                  </h3>
                  <span className="text-[11px] text-zinc-700 font-bold">
                    Ticket #{session?.ticketNumber}
                  </span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Fresh donne biryani steamed in herbal spices. Hot and authentic.
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0 pt-1">
                  <span className="text-sm font-black">₹ {session?.totalAmount}</span>
                  <span className="text-[9px] font-bold border border-black px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-800">
                    {currentStep >= 4 ? 'Ready' : currentStep === 3 ? 'Preparing' : 'In Kitchen'}
                  </span>
                </div>
              </div>

              {/* 5-Step Horizontal Progress Tracker */}
              <div className="w-full pt-2 border-t border-zinc-200">
                <div className="flex items-center justify-between relative px-2">
                  <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-zinc-200 -z-10" />
                  <div
                    className="absolute top-3.5 left-6 h-0.5 bg-black -z-10 transition-all duration-500"
                    style={{
                      width: `${((currentStep - 1) / (steps.length - 1)) * 88}%`,
                    }}
                  />

                  {steps.map((st, idx) => {
                    const stepNumber = idx + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                      <div
                        key={st.label}
                        className="flex flex-col items-center gap-1 min-w-[48px]"
                      >
                        <div
                          className={`w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-black text-white'
                              : isCurrent
                              ? 'bg-white text-black ring-2 ring-black scale-105'
                              : 'bg-white text-zinc-400 border-zinc-300'
                          }`}
                        >
                          {isCompleted ? '✓' : stepNumber}
                        </div>

                        <span className="text-[9px] font-bold tracking-tight text-center">
                          {st.label}
                        </span>
                        <span className="text-[8px] text-zinc-500 text-center">
                          {st.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Add More Items Button */}
            <div className="w-full pt-1">
              <Link
                href={`/seat/${chairId}/menu`}
                className="w-full py-3 border-2 border-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-black text-white cursor-pointer active:opacity-80 transition-opacity shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add More Dishes</span>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Bottom Sticky Summary Bar with Pay Button */}
      {session && (
        <div className="sticky bottom-[58px] z-30 w-full max-w-md bg-white border-t-2 border-black py-3 px-4 mt-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-black rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">Ticket #{session.ticketNumber}</span>
              <span className="text-[11px] text-zinc-600 font-semibold">
                Total: ₹ {session.totalAmount}
              </span>
            </div>
          </div>

          <Link
            href={`/seat/${chairId}/bill`}
            className="px-6 py-2.5 border-2 border-black bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg active:opacity-80 cursor-pointer text-center"
          >
            Pay Bill
          </Link>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <CustomerBottomNav chairId={chairId} />
    </div>
  );
}
