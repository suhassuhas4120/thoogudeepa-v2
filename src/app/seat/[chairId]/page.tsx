'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Lock, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { getActiveDiningSession, ActiveDiningSession } from '../../../lib/session/diningSession';

export default function CustomerSeatPage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';
  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;

  const [customerName, setCustomerName] = useState('');
  const [activeSession, setActiveSession] = useState<ActiveDiningSession | null>(null);

  useEffect(() => {
    try {
      const session = getActiveDiningSession();
      if (session && session.paymentStatus === 'unpaid') {
        setActiveSession(session);
      }
    } catch {
      // Ignore storage errors
    }
  }, [chairId]);

  const targetMenuUrl = `/seat/${chairId}/menu${
    customerName.trim() ? `?name=${encodeURIComponent(customerName.trim())}` : ''
  }`;

  // If customer has an active unpaid order for a DIFFERENT seat -> Anti-Cheat Lock
  const isLockedToDifferentSeat = activeSession && activeSession.seatId !== chairId && activeSession.paymentStatus === 'unpaid';

  // If customer has an active order for the SAME seat -> Option to resume or add more
  const isCurrentSeatActive = activeSession && activeSession.seatId === chairId && activeSession.paymentStatus === 'unpaid';

  if (isLockedToDifferentSeat && activeSession) {
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
        <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-2 border-black flex flex-col items-center justify-center shadow-xs bg-white">
          <span className="text-xs font-black tracking-widest uppercase text-zinc-400">THOOGUDEEPA</span>
          <span className="text-base font-black uppercase tracking-tight">DONNE BIRYANI</span>
        </div>
      </div>

      {/* Center area with Seat No and Name input */}
      <div className="w-full flex flex-col items-center gap-5 my-auto py-6">
        <div className="w-full text-center py-2.5 border-2 border-black rounded-xl bg-zinc-950 text-white shadow-2xs">
          <span className="text-lg font-black tracking-wider uppercase">Seat No: {seatNumber}</span>
        </div>

        {/* Welcome back indicator if same seat has an active order */}
        {isCurrentSeatActive && (
          <div className="w-full p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs text-center font-bold flex flex-col gap-1 shadow-2xs">
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
          <label htmlFor="customerName" className="text-xs font-bold uppercase tracking-wider text-zinc-700">
            Name (Optional)
          </label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full border-2 border-black px-3.5 py-2.5 text-sm outline-none bg-white text-black rounded-xl placeholder:text-zinc-400 font-semibold"
          />
        </div>
      </div>

      {/* Bottom area with Start Ordering button linking directly to Menu */}
      <div className="w-full pb-4 sm:pb-8 flex flex-col gap-2">
        <Link
          href={targetMenuUrl}
          className="w-full block text-center border-2 border-black bg-black text-white py-3.5 text-sm font-black uppercase tracking-wider rounded-xl cursor-pointer active:opacity-80 shadow-md"
        >
          {isCurrentSeatActive ? 'Add More Dishes' : 'Start Ordering'}
        </Link>
        {isCurrentSeatActive && (
          <Link
            href={`/seat/${chairId}/tracking`}
            className="w-full block text-center border-2 border-black bg-white text-black py-2.5 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer active:bg-zinc-100"
          >
            Track Active Order
          </Link>
        )}
      </div>
    </div>
  );
}
