'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Receipt,
  Flame,
} from 'lucide-react';
import CustomerBottomNav from '../../../../components/navigation/CustomerBottomNav';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';
import { getActiveDiningSession, ActiveDiningSession } from '../../../../lib/session/diningSession';
import { realtimeBridge } from '../../../../lib/supabase';
import { getMenuItemById } from '../../../../lib/data/menuData';

export default function LiveOrderTrackingPage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to cart
  useHardwareBack(`/seat/${chairId}/cart`);

  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;

  const [session, setSession] = useState<ActiveDiningSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [itemStages, setItemStages] = useState<Record<string, 'REC' | 'PREP' | 'READY' | 'SERVED'>>({});
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  useEffect(() => {
    const s = getActiveDiningSession();
    if (s && s.seatId === chairId && s.paymentStatus === 'unpaid') {
      setSession(s);
    }

    // Restore cached stage progress for this seat if available
    try {
      const cachedStages = localStorage.getItem(`thoogudeepa_item_stages_${chairId}`);
      if (cachedStages) {
        setItemStages(JSON.parse(cachedStages));
      }
      const dispatchRecord = localStorage.getItem(`thoogudeepa_ticket_dispatched_${chairId}`);
      if (dispatchRecord) {
        setIsDispatched(true);
      }
    } catch {
      // Ignore storage errors
    }

    setIsLoaded(true);

    const unsubscribe = realtimeBridge.subscribeKDS({
      onStageChange: (data) => {
        setItemStages((prev) => {
          const nextStages = { ...prev };
          if (data.key) nextStages[data.key] = data.stage;
          if (data.dishId) nextStages[data.dishId] = data.stage;
          return nextStages;
        });
      },
      onTicketDispatched: (data) => {
        if (!data.chairId || data.chairId === chairId) {
          setIsDispatched(true);
        }
      },
      onClearAll: () => {
        setSession(null);
        setItemStages({});
        setIsDispatched(false);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [chairId]);

  // Determine items list to track individually
  const trackingDishes = useMemo(() => {
    if (session?.items && session.items.length > 0) {
      return session.items;
    }
    if (session) {
      // Fallback single line item if placed before itemization
      return [
        {
          id: 'dish-1',
          title: 'Signature Donne Biryani Order',
          quantity: 1,
          price: session.totalAmount || 240,
        },
      ];
    }
    return [];
  }, [session]);

  const placedTimeStr = useMemo(() => {
    return session?.orderedAt
      ? new Date(session.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Just now';
  }, [session]);

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-28">
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
          /* Active Order Tracking with Individual Item Cards */
          <>
            {/* Top Live Pass Status Banner */}
            <div className="w-full border-2 border-black rounded-2xl p-4 flex items-center justify-between bg-white shadow-sm">
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-black shrink-0" />
                  <h2 className="text-base font-black tracking-tight truncate">
                    Live Dish Tracking
                  </h2>
                </div>
                <p className="text-xs text-zinc-600 truncate">
                  Ticket #{session?.ticketNumber} • {trackingDishes.length} {trackingDishes.length === 1 ? 'Dish' : 'Dishes'} in Kitchen Pass
                </p>
              </div>

              <div className="border border-black px-2.5 py-1.5 rounded-xl text-center shrink-0 bg-zinc-50">
                <Sparkles className="w-4 h-4 mx-auto mb-0.5 text-amber-600" />
                <span className="text-[9px] font-black uppercase tracking-wider block">
                  Live Sync
                </span>
              </div>
            </div>

            {/* Individual Item Cards */}
            <div className="w-full flex flex-col gap-4">
              {trackingDishes.map((dish, idx) => {
                const numericDishId = dish.id.replace('dish-', '');
                const dishDetails = getMenuItemById(numericDishId);

                // Determine this item's specific stage
                const itemKey1 = dish.id;
                const itemKey2 = `dish-${numericDishId}`;
                const itemKey3 = `${session?.ticketNumber}-${idx}`;
                const stageRaw =
                  isDispatched
                    ? 'SERVED'
                    : itemStages[itemKey1] ||
                      itemStages[itemKey2] ||
                      itemStages[itemKey3] ||
                      'REC';

                // Map stage to numeric step 1..5
                let currentStepNum = 2; // Default Received
                let badgeLabel = 'IN KITCHEN';
                let badgeClass = 'bg-amber-50 text-amber-900 border-amber-300';

                if (stageRaw === 'SERVED') {
                  currentStepNum = 5;
                  badgeLabel = 'SERVED AT TABLE';
                  badgeClass = 'bg-zinc-950 text-white border-zinc-950';
                } else if (stageRaw === 'READY') {
                  currentStepNum = 4;
                  badgeLabel = 'READY TO SERVE';
                  badgeClass = 'bg-emerald-50 text-emerald-900 border-emerald-400';
                } else if (stageRaw === 'PREP') {
                  currentStepNum = 3;
                  badgeLabel = 'COOKING IN WOK';
                  badgeClass = 'bg-orange-50 text-orange-950 border-orange-400';
                }

                // 5-Step tracking points for this specific dish
                const dishSteps = [
                  { label: 'Placed', sub: placedTimeStr },
                  { label: 'Received', sub: 'Pass Sync' },
                  { label: 'Preparing', sub: 'In Wok' },
                  { label: 'Ready', sub: 'Pass Ready' },
                  { label: 'Served', sub: 'At Table' },
                ];

                const progressPercent = ((currentStepNum - 1) / (dishSteps.length - 1)) * 88;

                return (
                  <div
                    key={dish.id || idx}
                    className="w-full border-2 border-black rounded-2xl p-4 flex flex-col gap-3 bg-white shadow-sm transition-all"
                  >
                    {/* Dish Header Info */}
                    <div className="w-full flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Circular Dish Image */}
                        <div className="w-14 h-14 rounded-full border-2 border-black overflow-hidden flex items-center justify-center shrink-0 bg-zinc-100 shadow-2xs">
                          <img
                            src={dishDetails.imageUrl}
                            alt={dish.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-zinc-950 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                              {dish.quantity}x
                            </span>
                            <h3 className="text-xs font-black truncate text-zinc-950">
                              {dish.title}
                            </h3>
                          </div>
                          <span className="text-[11px] font-bold text-zinc-600 mt-0.5">
                            ₹ {dish.price * dish.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Live State Badge */}
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                    </div>

                    {/* Individual Dish 5-Step Progress Stepper */}
                    <div className="w-full pt-2 border-t border-zinc-200">
                      <div className="flex items-center justify-between relative px-1">
                        {/* Gray background track line */}
                        <div className="absolute top-3.5 left-5 right-5 h-0.5 bg-zinc-200 -z-10" />
                        {/* Active black track line */}
                        <div
                          className="absolute top-3.5 left-5 h-0.5 bg-black -z-10 transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />

                        {dishSteps.map((st, stepIdx) => {
                          const stepNumber = stepIdx + 1;
                          const isCompleted = stepNumber < currentStepNum;
                          const isCurrent = stepNumber === currentStepNum;

                          return (
                            <div
                              key={st.label}
                              className="flex flex-col items-center gap-1 min-w-[46px]"
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
                                {st.sub}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
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
