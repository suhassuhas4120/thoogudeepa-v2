'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Lock, ArrowRight, RotateCcw, AlertTriangle, UtensilsCrossed, CheckCircle2 } from 'lucide-react';
import { 
  getActiveDiningSession, 
  ActiveDiningSession, 
  getDeviceToken 
} from '../../../lib/session/diningSession';
import { realtimeBridge } from '../../../lib/supabase';

export default function CustomerSeatPage() {
  const params = useParams();
  const router = useRouter();
  const chairId = (params?.chairId as string) || '12';
  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;

  const [customerName, setCustomerName] = useState('');
  const [activeSession, setActiveSession] = useState<ActiveDiningSession | null>(null);
  const [occupancy, setOccupancy] = useState<{
    isOccupied: boolean;
    isOwner: boolean;
    ticketNumber?: string;
    orderStatus?: string;
  }>({ isOccupied: false, isOwner: false });
  const [isLoadingOccupancy, setIsLoadingOccupancy] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkSeatOccupancy = useCallback(async () => {
    const token = getDeviceToken();
    const occ = await realtimeBridge.getSeatOccupancy(chairId, token);
    setOccupancy(occ);
    setIsLoadingOccupancy(false);
    return occ;
  }, [chairId]);

  useEffect(() => {
    try {
      const session = getActiveDiningSession();
      if (session && session.paymentStatus === 'unpaid') {
        setActiveSession(session);
      }
    } catch {
      // Ignore storage errors
    }

    checkSeatOccupancy().then((occ) => {
      const session = getActiveDiningSession();
      // If customer has an active unpaid order (on this seat or any other seat),
      // scanning ANY QR immediately opens their active unpaid order tracking screen.
      if (session && session.paymentStatus === 'unpaid') {
        router.replace(`/seat/${session.seatId}/tracking`);
        return;
      }

      if (occ.isOccupied && occ.isOwner) {
        router.replace(`/seat/${chairId}/tracking`);
      }
    });

    // Subscribe to live seat updates
    const unsubscribe = realtimeBridge.subscribeKDS({
      onSeatOccupancyChange: ({ chairId: changedChairId }) => {
        if (changedChairId === chairId) {
          checkSeatOccupancy();
        }
      },
      onClearAll: () => {
        setOccupancy({ isOccupied: false, isOwner: false });
        setActiveSession(null);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [chairId, checkSeatOccupancy, router]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await checkSeatOccupancy();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const targetMenuUrl = `/seat/${chairId}/menu${
    customerName.trim() ? `?name=${encodeURIComponent(customerName.trim())}` : ''
  }`;

  // SCENARIO 1: Device Locked to Another Seat (Customer placed an unpaid order from Seat X and scans Seat Y)
  const isLockedToDifferentSeat =
    activeSession &&
    activeSession.seatId !== chairId &&
    activeSession.paymentStatus === 'unpaid';

  // SCENARIO 2: Seat Occupied by Another Customer (Stranger scans Seat X which is already occupied)
  const isOccupiedByAnotherGuest =
    occupancy.isOccupied && !occupancy.isOwner && !isLockedToDifferentSeat;

  // SCENARIO 3: Active Order on this SAME seat (Owner returning to seat)
  const isCurrentSeatActive =
    (activeSession &&
      activeSession.seatId === chairId &&
      activeSession.paymentStatus === 'unpaid') ||
    (occupancy.isOccupied && occupancy.isOwner);

  // --- VIEW 1: LOCKED TO DIFFERENT SEAT ---
  if (isLockedToDifferentSeat && activeSession) {
    return (
      <div className="min-h-screen w-full bg-white text-black flex flex-col items-center justify-between px-6 py-10 max-w-md mx-auto">
        {/* Header Notice */}
        <div className="w-full flex items-center justify-center gap-2 py-3 border-b border-zinc-200">
          <Lock className="w-5 h-5 text-red-600" />
          <span className="text-xs font-black uppercase tracking-wider text-red-600">
            Dining Session In Progress
          </span>
        </div>

        {/* Central Lock Information Card */}
        <div className="w-full flex flex-col items-center text-center gap-4 my-auto py-6">
          <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-600 flex items-center justify-center shadow-xs">
            <Lock className="w-10 h-10 text-red-600" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-black tracking-tight text-zinc-950 uppercase">
              Active Order At Seat {activeSession.seatId}
            </h2>
            <p className="text-xs text-zinc-600 font-medium max-w-xs leading-relaxed">
              You currently have an unsettled feast (Ticket #{activeSession.ticketNumber}) placed from <strong>Seat {activeSession.seatId}</strong>.
            </p>
          </div>

          <div className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3.5 text-left text-xs font-semibold flex flex-col gap-2">
            <div className="flex justify-between items-center text-zinc-700">
              <span>Your Active Seat:</span>
              <span className="font-bold text-black uppercase">Seat {activeSession.seatId}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-700">
              <span>Ticket ID:</span>
              <span className="font-mono font-bold text-black">#{activeSession.ticketNumber}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-700">
              <span>Payment Status:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                Unsettled (Eat Now, Pay Later)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
            To prevent cross-table ordering errors, you cannot place orders from Seat {seatNumber} until your meal at Seat {activeSession.seatId} is concluded.
          </p>
        </div>

        {/* Action Buttons: Return to active seat */}
        <div className="w-full flex flex-col gap-2.5 pb-4">
          <Link
            href={`/seat/${activeSession.seatId}/tracking`}
            className="w-full border-2 border-black bg-black text-white py-3.5 text-xs font-black uppercase tracking-wider text-center rounded-xl flex items-center justify-center gap-2 cursor-pointer active:opacity-80 shadow-md"
          >
            <span>Return to My Active Order (Seat {activeSession.seatId})</span>
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

  // --- VIEW 2: SEAT FILLED BY ANOTHER CUSTOMER ---
  // If the seat is filled, DO NOT give option to customer to select other seat from application.
  // Must show: seat is filled, please find other seat and scan.
  if (isOccupiedByAnotherGuest) {
    return (
      <div className="min-h-screen w-full bg-white text-black flex flex-col items-center justify-between px-6 py-10 max-w-md mx-auto">
        {/* Top Occupied Badge */}
        <div className="w-full flex items-center justify-center gap-2 py-3 border-b border-zinc-200">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="text-xs font-black uppercase tracking-wider text-amber-700">
            Seat Occupied
          </span>
        </div>

        {/* Central Occupied Notification Card */}
        <div className="w-full flex flex-col items-center text-center gap-4 my-auto py-6">
          <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-500 flex items-center justify-center shadow-xs">
            <Lock className="w-10 h-10 text-amber-700" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-black tracking-tight text-zinc-950 uppercase">
              Seat {seatNumber} Is Filled
            </h2>
            <p className="text-sm text-zinc-800 font-bold max-w-xs leading-snug">
              This seat is currently occupied by another customer.
            </p>
          </div>

          <div className="w-full bg-[#fbf9f5] border-2 border-amber-400 rounded-2xl p-4 text-center text-xs font-semibold flex flex-col gap-2 shadow-xs">
            <span className="text-amber-900 font-black text-sm uppercase tracking-wide">
              Please Find Another Seat
            </span>
            <p className="text-zinc-600 text-xs leading-relaxed">
              Please look for any available vacant table in the restaurant and scan the QR code placed on that table to begin your order.
            </p>
          </div>

          <div className="text-[11px] text-zinc-500 font-medium space-y-1 text-center max-w-xs">
            <p>
              Each table is linked strictly to its physical QR code to ensure accurate kitchen delivery to your exact seat.
            </p>
          </div>
        </div>

        {/* Only Re-check Button — NO option to select another seat inside application */}
        <div className="w-full flex flex-col gap-2.5 pb-4">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="w-full border-2 border-black bg-black text-white py-3.5 text-xs font-black uppercase tracking-wider text-center rounded-xl flex items-center justify-center gap-2 cursor-pointer active:opacity-80 shadow-md"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking Seat...' : 'Check If Seat Is Available Now'}</span>
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 3: SAME CUSTOMER RETURNING TO ACTIVE SEAT ---
  // If the seat is filled by the SAME customer, open the same order and seat
  if (isCurrentSeatActive) {
    return (
      <div className="min-h-screen w-full bg-white text-black flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-sm animate-pulse">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
            WELCOME BACK • SEAT {seatNumber}
          </span>
          <h2 className="text-xl font-black uppercase text-zinc-900">
            Opening Your Active Order...
          </h2>
          <p className="text-xs text-zinc-500">
            Resuming your live table order and kitchen preparation pass.
          </p>
        </div>
        <Link
          href={`/seat/${chairId}/tracking`}
          className="w-full py-3.5 border-2 border-black bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2"
        >
          <span>View Live Order Tracking</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // --- VIEW 4: VACANT TABLE (NEW CUSTOMER ACCESS) ---
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
          Start Ordering
        </Link>
      </div>
    </div>
  );
}
