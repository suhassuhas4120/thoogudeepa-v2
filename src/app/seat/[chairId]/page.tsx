'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { useHardwareBack } from '../../../lib/hooks/useHardwareBack';
import { getActiveDiningSession, clearActiveDiningSession, ActiveDiningSession } from '../../../lib/session/diningSession';

interface SeatPageProps {
  params: Promise<{
    chairId: string;
  }>;
}

export default function CustomerSeatPage({ params }: SeatPageProps) {
  const resolvedParams = use(params);
  const chairId = resolvedParams?.chairId || '12';
  const router = useRouter();

  // Prevent device back gestures from exiting the application on entrance screen
  useHardwareBack(`/seat/${chairId}`);

  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;

  const [customerName, setCustomerName] = useState('');
  const [activeSession, setActiveSession] = useState<ActiveDiningSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const session = getActiveDiningSession();
    if (session && session.paymentStatus === 'unpaid') {
      setActiveSession(session);
    }
    setIsCheckingSession(false);
  }, [chairId]);

  const targetMenuUrl = `/seat/${chairId}/menu${
    customerName.trim() ? `?name=${encodeURIComponent(customerName.trim())}` : ''
  }`;

  // If customer has an active unpaid order for a DIFFERENT seat -> Anti-Cheat Lock
  const isLockedToDifferentSeat = activeSession && activeSession.seatId !== chairId && activeSession.paymentStatus === 'unpaid';

  // If customer has an active order for the SAME seat -> Option to resume or add more
  const isCurrentSeatActive = activeSession && activeSession.seatId === chairId && activeSession.paymentStatus === 'unpaid';

  if (!isCheckingSession && isLockedToDifferentSeat) {
    return (
      <div className="min-h-screen w-full bg-white text-black flex flex-col items-center justify-between px-6 py-10 max-w-md mx-auto">
        {/* Top Header Warning */}
        <div className="w-full flex items-center justify-center gap-2 py-3 border-b border-zinc-200">
          <Lock className="w-5 h-5 text-red-600" />
          <span className="text-xs font-black uppercase tracking-wider text-red-600">
            Dining Session Locked
          </span>
        </div>

        {/* Central Lock Information Card */}
        <div className="w-full flex flex-col items-center text-center gap-4 my-auto py-6">
          <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-600 flex items-center justify-center">
            <Lock className="w-10 h-10 text-red-600" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-black tracking-tight text-zinc-950 uppercase">
              Active Order At Seat {activeSession.seatId}
            </h2>
            <p className="text-xs text-zinc-600 font-medium max-w-xs leading-relaxed">
              You currently have an unpaid dining order (Ticket #{activeSession.ticketNumber}) placed from <strong>Seat {activeSession.seatId}</strong>.
            </p>
          </div>

          <div className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3.5 text-left text-xs font-semibold flex flex-col gap-2">
            <div className="flex justify-between items-center text-zinc-700">
              <span>Active Seat:</span>
              <span className="font-bold text-black uppercase">Seat {activeSession.seatId}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-700">
              <span>Ticket ID:</span>
              <span className="font-mono font-bold text-black">{activeSession.ticketNumber}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-700">
              <span>Payment Status:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                Unsettled (Eat Now, Pay Later)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 font-medium">
            To prevent duplicate orders, you must complete your bill at Seat {activeSession.seatId} before placing orders at Seat {seatNumber}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 pb-4">
          <Link
            href={`/seat/${activeSession.seatId}/tracking`}
            className="w-full border-2 border-black bg-black text-white py-3.5 text-xs font-black uppercase tracking-wider text-center rounded-xl flex items-center justify-center gap-2 cursor-pointer active:opacity-80 shadow-md"
          >
            <span>Go to Active Seat {activeSession.seatId}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href={`/seat/${activeSession.seatId}/bill`}
            className="w-full border border-black bg-white text-black py-3 text-xs font-black uppercase tracking-wider text-center rounded-xl cursor-pointer active:bg-zinc-100"
          >
            Pay Seat {activeSession.seatId} Bill
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col items-center justify-between px-6 py-12 max-w-md mx-auto">
      {/* Upper area with enlarged circular logo */}
      <div className="w-full flex flex-col items-center pt-4 sm:pt-8">
        <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full border-2 border-black flex items-center justify-center shadow-xs">
          <span className="text-base font-bold">Logo</span>
        </div>
      </div>

      {/* Center area with Seat No and Name input */}
      <div className="w-full flex flex-col items-center gap-5 my-auto py-6">
        <div className="w-full text-center py-2.5 border border-black">
          <span className="text-lg font-bold">Seat No: {seatNumber}</span>
        </div>

        {/* Welcome back indicator if same seat has an active order */}
        {isCurrentSeatActive && (
          <div className="w-full p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs text-center font-bold flex flex-col gap-1">
            <span>Welcome back! You have an active order for this seat.</span>
            <Link
              href={`/seat/${chairId}/tracking`}
              className="text-emerald-700 underline text-[11px] font-black uppercase"
            >
              View Active Order Tracking &rarr;
            </Link>
          </div>
        )}

        <div className="w-full flex flex-col gap-1.5">
          <label htmlFor="customerName" className="text-sm font-medium">
            Name (Optional)
          </label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter Name"
            className="w-full border border-black px-3 py-2.5 text-base outline-none bg-white text-black rounded-none"
          />
        </div>
      </div>

      {/* Bottom area with Start Ordering button linking directly to Menu */}
      <div className="w-full pb-4 sm:pb-8 flex flex-col gap-2">
        <Link
          href={targetMenuUrl}
          className="w-full block text-center border-2 border-black bg-black text-white py-3.5 text-base font-bold uppercase tracking-wider cursor-pointer active:opacity-80"
        >
          {isCurrentSeatActive ? 'Add More Dishes' : 'Start Ordering'}
        </Link>
        {isCurrentSeatActive && (
          <Link
            href={`/seat/${chairId}/tracking`}
            className="w-full block text-center border border-black bg-white text-black py-2.5 text-xs font-black uppercase tracking-wider cursor-pointer active:bg-zinc-100"
          >
            Track Active Order
          </Link>
        )}
      </div>
    </div>
  );
}
