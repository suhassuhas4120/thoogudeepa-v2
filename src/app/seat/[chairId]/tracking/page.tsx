'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  Check,
} from 'lucide-react';
import CustomerBottomNav from '../../../../components/navigation/CustomerBottomNav';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';
import { getActiveDiningSession, ActiveDiningSession, getDeviceToken } from '../../../../lib/session/diningSession';
import { realtimeBridge } from '../../../../lib/supabase';
import { getMenuItemById } from '../../../../lib/data/menuData';

export default function LiveOrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to cart
  useHardwareBack(`/seat/${chairId}/cart`);

  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;

  const [session, setSession] = useState<ActiveDiningSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [itemStages, setItemStages] = useState<Record<string, 'PLACED' | 'REC' | 'PREP' | 'READY' | 'SERVED'>>({});
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Synchronize latest dish stages and order items from server
  const syncLatestStages = useCallback(async () => {
    try {
      setIsSyncing(true);
      const cleanChair = chairId.replace(/[^0-9]/g, '');
      const res = await realtimeBridge.getOrderForSeat(cleanChair || chairId);
      if (res.items && res.items.length > 0) {
        const tNum = res.order?.ticket_number || '';
        // 1. Sync session dishes with latest items from database
        setSession((prev) => {
          if (!prev) {
            return {
              seatId: cleanChair || chairId,
              ticketNumber: tNum,
              orderId: res.order?.id || `ord-${Date.now()}`,
              orderStatus: (res.order?.status as any) || 'pending',
              orderedAt: res.order?.created_at ? new Date(res.order.created_at).getTime() : Date.now(),
              totalAmount: res.order?.total_amount || 0,
              items: res.items.map((it) => ({
                id: it.id || `dish-${it.dish_id}`,
                dish_id: it.dish_id,
                title: it.dish_name || 'Dish',
                quantity: it.quantity,
                price: it.price,
                stage: it.stage,
                notes: it.notes,
                addons: it.addons,
              })),
              paymentStatus: 'unpaid',
            };
          }
          const updatedItems = res.items.map((it) => {
            const prevItem = prev.items?.find((p) =>
              (p.id && it.id && p.id === it.id) ||
              (p.dish_id && it.dish_id && (p.dish_id === it.dish_id || p.dish_id.replace(/^dish-/, '') === it.dish_id.replace(/^dish-/, ''))) ||
              (p.title && it.dish_name && p.title.toLowerCase().trim() === it.dish_name.toLowerCase().trim())
            );
            return {
              id: it.id || prevItem?.id || `dish-${it.dish_id}`,
              dish_id: it.dish_id,
              title: it.dish_name || prevItem?.title || 'Dish',
              quantity: it.quantity,
              price: it.price,
              stage: it.stage,
              notes: it.notes || prevItem?.notes,
              addons: it.addons || prevItem?.addons,
            };
          });
          return {
            ...prev,
            ticketNumber: tNum || prev.ticketNumber,
            totalAmount: res.order?.total_amount || prev.totalAmount,
            items: updatedItems,
          };
        });

        // 2. Hydrate itemStages across ticket-scoped keys
        setItemStages((prev) => {
          const updated = { ...prev };
          res.items.forEach((it) => {
            if (it.stage) {
              if (it.id) updated[it.id] = it.stage;
              if (it.dish_id) updated[it.dish_id] = it.stage;
              const clean = it.dish_id ? it.dish_id.replace(/^dish-/, '') : '';
              if (clean) updated[clean] = it.stage;
              if (it.dish_name) {
                updated[it.dish_name] = it.stage;
                updated[it.dish_name.toLowerCase()] = it.stage;
              }
              if (tNum) {
                if (it.id) updated[`${tNum}-${it.id}`] = it.stage;
                if (it.dish_id) updated[`${tNum}-${it.dish_id}`] = it.stage;
                if (clean) updated[`${tNum}-${clean}`] = it.stage;
                if (it.dish_name) {
                  updated[`${tNum}-${it.dish_name}`] = it.stage;
                  updated[`${tNum}-${it.dish_name.toLowerCase()}`] = it.stage;
                }
              }
            }
          });
          return updated;
        });
      }
    } catch (err) {
      console.warn('Error syncing order stages:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [chairId]);

  useEffect(() => {
    // Verify occupancy: if occupied by someone else, redirect to seat entrance
    async function checkAccess() {
      const token = getDeviceToken();
      const occ = await realtimeBridge.getSeatOccupancy(chairId, token);
      if (occ.isOccupied && !occ.isOwner) {
        router.replace(`/seat/${chairId}`);
      }
    }
    checkAccess();

    const s = getActiveDiningSession();
    if (s && s.paymentStatus === 'unpaid') {
      if (s.seatId !== chairId) {
        router.replace(`/seat/${s.seatId}/tracking`);
        return;
      }
      setSession(s);
    }

    const cleanCurrentChair = chairId.replace(/[^0-9]/g, '');
    const paddedChair = cleanCurrentChair.padStart(2, '0');

    // Restore cached stage progress for this seat if available
    try {
      let cached = {};
      const keysToTry = [
        chairId ? `thoogudeepa_item_stages_${chairId}` : '',
        cleanCurrentChair ? `thoogudeepa_item_stages_${cleanCurrentChair}` : '',
        paddedChair ? `thoogudeepa_item_stages_${paddedChair}` : '',
      ].filter(Boolean);
      for (const k of keysToTry) {
        const raw = localStorage.getItem(k);
        if (raw) cached = { ...cached, ...JSON.parse(raw) };
      }
      if (Object.keys(cached).length > 0) {
        setItemStages(cached);
      }
      const dispatchRecord = localStorage.getItem(`thoogudeepa_ticket_dispatched_${chairId}`) ||
                             localStorage.getItem(`thoogudeepa_ticket_dispatched_${cleanCurrentChair}`);
      if (dispatchRecord) {
        setIsDispatched(true);
      }
    } catch {
      // Ignore storage errors
    }

    setIsLoaded(true);

    // Initial background sync
    syncLatestStages();

    // Regular interval poll to guarantee active order status stays current
    const pollInterval = setInterval(() => {
      syncLatestStages();
    }, 2500);

    const unsubscribe = realtimeBridge.subscribeKDS({
      onStageChange: (data) => {
        const targetNum = (data.chairId || '').replace(/[^0-9]/g, '').replace(/^0+/, '');
        const currentNum = (cleanCurrentChair || '').replace(/^0+/, '');
        // Isolate updates: ignore stage events meant for other dining seats
        if (targetNum && currentNum && targetNum !== currentNum) {
          return;
        }

        setItemStages((prev) => {
          const nextStages = { ...prev };
          const stage = data.stage;
          if (data.itemId) nextStages[data.itemId] = stage;
          if (data.key) nextStages[data.key] = stage;
          if (data.dishId) {
            nextStages[data.dishId] = stage;
            const clean = data.dishId.replace(/^dish-/, '');
            nextStages[clean] = stage;
            nextStages[`dish-${clean}`] = stage;
          }
          if (data.dishName) {
            nextStages[data.dishName] = stage;
            nextStages[data.dishName.toLowerCase()] = stage;
            nextStages[data.dishName.toLowerCase().trim()] = stage;
          }
          const tNum = data.ticketNumber || '';
          if (tNum) {
            if (data.itemId) nextStages[`${tNum}-${data.itemId}`] = stage;
            if (data.dishId) {
              nextStages[`${tNum}-${data.dishId}`] = stage;
              const clean = data.dishId.replace(/^dish-/, '');
              nextStages[`${tNum}-${clean}`] = stage;
              nextStages[`${tNum}-dish-${clean}`] = stage;
            }
            if (data.dishName) {
              nextStages[`${tNum}-${data.dishName}`] = stage;
              nextStages[`${tNum}-${data.dishName.toLowerCase()}`] = stage;
            }
          }
          return nextStages;
        });

        // Update active session items stage immediately
        setSession((prev) => {
          if (!prev || !prev.items) return prev;
          const targetCleanDish = data.dishId ? data.dishId.replace(/^dish-/, '') : '';
          const updatedItems = prev.items.map((it) => {
            const cleanDishId = (it.dish_id || it.id || '').replace(/^dish-/, '');
            const matches =
              Boolean(data.itemId && it.id && it.id === data.itemId) ||
              Boolean(data.key && it.id && it.id === data.key) ||
              Boolean(data.dishId && it.dish_id && it.dish_id === data.dishId) ||
              Boolean(targetCleanDish && cleanDishId && cleanDishId === targetCleanDish) ||
              Boolean(data.dishName && it.title && it.title.toLowerCase().trim() === data.dishName.toLowerCase().trim());

            if (matches) {
              return { ...it, stage: data.stage };
            }
            return it;
          });
          return { ...prev, items: updatedItems };
        });

        // Trigger authoritative refresh
        syncLatestStages();
      },
      onTicketDispatched: (data) => {
        if (!data.chairId || data.chairId === chairId || data.chairId.replace(/[^0-9]/g, '') === cleanCurrentChair) {
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
      clearInterval(pollInterval);
      unsubscribe();
    };
  }, [chairId, syncLatestStages]);

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
    <div className="min-h-screen w-full flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-28 text-[#1A2621]">
      {/* Scrollable Content Container */}
      <div className="w-full flex flex-col gap-4">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between py-2 border-b border-[rgba(220,226,222,0.7)] pb-3">
          <Link
            href={`/seat/${chairId}/cart`}
            className="w-10 h-10 border border-[rgba(220,226,222,0.8)] rounded-xl flex items-center justify-center cursor-pointer active:opacity-70 bg-[#FFFEFC] text-[#1A2621] shadow-2xs"
            aria-label="Back to Cart"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="text-center flex flex-col items-center">
            <span className="text-sm font-black tracking-wider uppercase text-[#1A2621]">
              THOOGUDEEPA
            </span>
            <span className="text-[10px] text-[#5A6860] tracking-tight">
              Donne Biryani Mane
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="border border-[#244436]/20 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#FFFEFC] text-[#244436] shadow-2xs">
              Seat {seatNumber}
            </div>
            <Link
              href={`/seat/${chairId}/assistant?from=${encodeURIComponent(`/seat/${chairId}/tracking`)}`}
              className="w-9 h-9 border border-[rgba(220,226,222,0.8)] rounded-xl flex items-center justify-center cursor-pointer active:opacity-70 bg-[#FFFEFC] text-[#244436] shadow-2xs"
              aria-label="Assistant & Call Waiter"
            >
              <Bell className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {isLoaded && !session ? (
          /* Empty State - No active order placed yet */
          <div className="w-full py-16 flex flex-col items-center justify-center text-center gap-4 border border-[rgba(220,226,222,0.8)] rounded-3xl bg-[#FFFEFC] p-6 my-4 shadow-[0_4px_20px_-4px_rgba(36,68,54,0.06)]">
            <div className="w-16 h-16 rounded-full border border-[rgba(220,226,222,0.9)] bg-[#F9F8F5] flex items-center justify-center shadow-xs">
              <Clock className="w-7 h-7 text-[#244436]" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1A2621]">
                No Orders in Kitchen Yet
              </h2>
              <p className="text-xs text-[#5A6860] font-medium max-w-xs leading-relaxed">
                Seat {seatNumber} does not currently have any active tickets in preparation. Browse our authentic military menu to place your order!
              </p>
            </div>
            <Link
              href={`/seat/${chairId}/menu`}
              className="mt-2 px-6 py-2.5 bg-gradient-to-r from-[#244436] to-[#DD6B28] text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer active:opacity-85 shadow-md flex items-center gap-2 hover:opacity-95"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          /* Active Order Tracking with Individual Item Cards */
          <>
            {/* Top Live Pass Status Banner */}
            <div className="w-full border border-[rgba(220,226,222,0.8)] rounded-2xl p-4 flex items-center justify-between bg-[#FFFEFC] shadow-[0_4px_20px_-4px_rgba(36,68,54,0.06)]">
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#244436] shrink-0" />
                  <h2 className="text-base font-black tracking-tight truncate text-[#1A2621]">
                    Live Dish Tracking
                  </h2>
                </div>
                <p className="text-xs text-[#5A6860] truncate">
                  Ticket #{session?.ticketNumber} • {trackingDishes.length} {trackingDishes.length === 1 ? 'Dish' : 'Dishes'} in Kitchen Pass
                </p>
              </div>

              <button
                type="button"
                onClick={() => syncLatestStages()}
                className="border border-[rgba(220,226,222,0.8)] px-2.5 py-1.5 rounded-xl text-center shrink-0 bg-[#F9F8F5] hover:bg-[#F3F1EC] active:scale-95 transition-all cursor-pointer shadow-2xs"
                title="Tap to refresh live status"
              >
                <Sparkles className={`w-4 h-4 mx-auto mb-0.5 text-[#DD6B28] ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-wider block text-[#244436]">
                  {isSyncing ? 'Syncing...' : 'Live Sync'}
                </span>
              </button>
            </div>

            {/* Individual Item Cards */}
            <div className="w-full flex flex-col gap-4">
              {trackingDishes.map((dish, idx) => {
                const cleanDishNum = (dish.dish_id || dish.id || '').replace(/^dish-/, '');
                const dishDetails = getMenuItemById(cleanDishNum) || {
                  id: cleanDishNum,
                  name: dish.title || 'Dish',
                  kannadaName: '',
                  price: dish.price || 150,
                  category: 'biryani' as const,
                  dietary: 'non_veg' as const,
                  description: '',
                  prepTimeMinutes: 15,
                  imageUrl: '/images/dishes/chicken-donne-biryani.jpg',
                  isAvailable: true,
                  isBestseller: false,
                };

                // Determine this item's specific stage
                const tNum = session?.ticketNumber || '';
                const candList: string[] = [];
                if (isDispatched) candList.push('SERVED');
                if ((dish as any).stage) candList.push((dish as any).stage);

                const lookupKeys = [
                  dish.id,
                  dish.dish_id,
                  cleanDishNum,
                  `dish-${cleanDishNum}`,
                  dish.title,
                  dish.title?.toLowerCase(),
                  dish.title?.toLowerCase().trim(),
                  tNum && dish.id && `${tNum}-${dish.id}`,
                  tNum && dish.dish_id && `${tNum}-${dish.dish_id}`,
                  tNum && cleanDishNum && `${tNum}-${cleanDishNum}`,
                  tNum && `${tNum}-dish-${cleanDishNum}`,
                  tNum && dish.title && `${tNum}-${dish.title}`,
                  tNum && dish.title && `${tNum}-${dish.title.toLowerCase()}`,
                  tNum && dish.title && `${tNum}-${dish.title.toLowerCase().trim()}`,
                ].filter(Boolean) as string[];

                for (const k of lookupKeys) {
                  if (itemStages[k]) candList.push(itemStages[k]);
                }

                let stageRaw: 'PLACED' | 'REC' | 'PREP' | 'READY' | 'SERVED' = 'PLACED';
                if (candList.includes('SERVED')) {
                  stageRaw = 'SERVED';
                } else if (candList.includes('READY')) {
                  stageRaw = 'READY';
                } else if (candList.includes('PREP')) {
                  stageRaw = 'PREP';
                } else if (candList.includes('REC')) {
                  stageRaw = 'REC';
                } else {
                  stageRaw = 'PLACED';
                }

                // Map stage to numeric step 1..5
                let currentStepNum = 1; // Default Placed
                let badgeLabel = 'ORDER PLACED';
                let badgeClass = 'bg-emerald-50 text-[#244436] border-emerald-300';

                if (stageRaw === 'SERVED') {
                  currentStepNum = 5;
                  badgeLabel = 'SERVED AT TABLE';
                  badgeClass = 'bg-[#244436] text-white border-[#244436]';
                } else if (stageRaw === 'READY') {
                  currentStepNum = 4;
                  badgeLabel = 'READY TO SERVE';
                  badgeClass = 'bg-amber-100 text-amber-900 border-amber-400 font-black animate-pulse';
                } else if (stageRaw === 'PREP') {
                  currentStepNum = 3;
                  badgeLabel = 'COOKING IN WOK';
                  badgeClass = 'bg-orange-50 text-[#DD6B28] border-orange-300 font-bold';
                } else if (stageRaw === 'REC') {
                  currentStepNum = 2;
                  badgeLabel = 'RECEIVED IN KITCHEN';
                  badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
                }

                // 5-Step tracking points for this specific dish
                const dishSteps = [
                  { label: 'Placed', sub: placedTimeStr },
                  { label: 'Received', sub: 'Pass Sync' },
                  { label: 'Preparing', sub: 'In Wok' },
                  { label: 'Ready', sub: 'Pass Ready' },
                  { label: 'Served', sub: 'At Table' },
                ];

                const progressPercent = Math.max(0, Math.min(100, ((currentStepNum - 1) / (dishSteps.length - 1)) * 100));

                return (
                  <div
                    key={dish.id || idx}
                    className="w-full border border-[rgba(220,226,222,0.8)] rounded-2xl p-4 flex flex-col gap-3 bg-[#FFFEFC] shadow-[0_4px_16px_-4px_rgba(36,68,54,0.05)] transition-all"
                  >
                    {/* Dish Header Info */}
                    <div className="w-full flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Circular Dish Image */}
                        <div className="w-14 h-14 rounded-full border border-[rgba(220,226,222,0.9)] overflow-hidden flex items-center justify-center shrink-0 bg-[#fbf9f5] shadow-2xs p-0.5">
                          <img
                            src={dishDetails.imageUrl}
                            alt={dish.title}
                            className="w-full h-full object-cover object-center rounded-full"
                            loading="lazy"
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-[#244436] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                              {dish.quantity}x
                            </span>
                            <h3 className="text-xs font-black truncate text-[#1A2621]">
                              {dish.title}
                            </h3>
                          </div>
                          <span className="text-[11px] font-bold text-[#5A6860] mt-0.5">
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
                    <div className="w-full pt-2 border-t border-[rgba(220,226,222,0.7)]">
                      <div className="flex items-center justify-between relative px-2">
                        {/* Gray background track line between first and last circle centers */}
                        <div className="absolute top-[14px] -translate-y-1/2 left-[28px] right-[28px] h-[3px] bg-zinc-200 z-0 rounded-full pointer-events-none" />

                        {/* Active gradient track line connecting done status circles */}
                        <div className="absolute top-[14px] -translate-y-1/2 left-[28px] right-[28px] h-[3px] z-0 pointer-events-none rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#244436] to-[#DD6B28] transition-all duration-500 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {dishSteps.map((st, stepIdx) => {
                          const stepNumber = stepIdx + 1;
                          const isDone = stepNumber <= currentStepNum;

                          return (
                            <div
                              key={st.label}
                              className="relative z-10 flex flex-col items-center gap-1 min-w-[46px]"
                            >
                              <div
                                className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                                  isDone
                                    ? 'bg-[#244436] text-white border-[#244436]'
                                    : 'bg-[#FFFEFC] text-[#5A6860] border-[rgba(220,226,222,0.9)]'
                                }`}
                              >
                                {isDone ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                                ) : (
                                  stepNumber
                                )}
                              </div>

                              <span
                                className={`text-[9px] tracking-tight text-center ${
                                  isDone ? 'font-black text-[#1A2621]' : 'font-semibold text-zinc-400'
                                }`}
                              >
                                {st.label}
                              </span>
                              <span
                                className={`text-[8px] text-center ${
                                  isDone ? 'font-bold text-[#5A6860]' : 'text-zinc-400'
                                }`}
                              >
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
                className="w-full py-3.5 border border-[#244436]/20 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-[#FFFEFC] text-[#244436] cursor-pointer active:opacity-80 transition-all shadow-2xs hover:bg-[#F9F8F5]"
              >
                <PlusCircle className="w-4 h-4 text-[#244436]" />
                <span>Add More Dishes</span>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Bottom Sticky Summary Bar with Pay Button */}
      {session && (
        <div className="sticky bottom-[58px] z-30 w-full max-w-md bg-[#FFFEFC]/95 backdrop-blur-md border-t border-[rgba(220,226,222,0.8)] py-3 px-4 mt-6 flex items-center justify-between shadow-[0_-4px_20px_-4px_rgba(36,68,54,0.06)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 border border-[rgba(220,226,222,0.8)] rounded-xl flex items-center justify-center bg-[#F9F8F5]">
              <Receipt className="w-4 h-4 text-[#244436]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1A2621]">Ticket #{session.ticketNumber}</span>
              <span className="text-[11px] text-[#5A6860] font-semibold">
                Total: ₹ {session.totalAmount}
              </span>
            </div>
          </div>

          <Link
            href={`/seat/${chairId}/bill`}
            className="px-6 py-2.5 bg-gradient-to-r from-[#244436] to-[#DD6B28] text-white text-xs font-bold uppercase tracking-wider rounded-xl active:opacity-90 cursor-pointer text-center shadow-md hover:shadow-lg"
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
