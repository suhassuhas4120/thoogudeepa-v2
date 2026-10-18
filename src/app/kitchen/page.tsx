'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { realtimeBridge, OrderRecord, OrderItemRecord } from '@/lib/supabase';
import { MENU_ITEMS } from '@/lib/data/menuData';
import { 
  ShieldCheck, 
  Tablet, 
  Layers, 
  ChefHat, 
  UserCheck, 
  Store, 
  UtensilsCrossed, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Check, 
  Ban, 
  Lock, 
  Unlock, 
  RotateCcw, 
  QrCode,
  Trash2,
  Sparkles,
  Flame
} from 'lucide-react';

export default function KitchenDisplaySystemPage() {
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeScreenTab, setActiveScreenTab] = useState<number>(2);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');

  // Real incoming active orders from seats 01-100 (clean zero-order start)
  const [activeOrders, setActiveOrders] = useState<{ order: OrderRecord; items: OrderItemRecord[] }[]>([]);
  const [itemStages, setItemStages] = useState<Record<string, 'PLACED' | 'REC' | 'PREP' | 'READY' | 'SERVED'>>({});

  // Screen 3 Item availability with Lock/Unlock and Reset/Update protection
  const defaultStockStatus: Record<string, boolean> = MENU_ITEMS.reduce(
    (acc, it) => {
      acc[it.id] = true;
      return acc;
    },
    {} as Record<string, boolean>
  );

  const [stockStatus, setStockStatus] = useState<Record<string, boolean>>(defaultStockStatus);
  const [committedStockStatus, setCommittedStockStatus] = useState<Record<string, boolean>>(defaultStockStatus);
  const [isStockLocked, setIsStockLocked] = useState<boolean>(true);
  const [stockNotice, setStockNotice] = useState<string>('');

  // Auditory chime notification on incoming kitchen ticket
  const playKitchenChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Ignore audio policy before user interaction
    }
  };

  // Fetch active orders and subscribe to real-time updates
  useEffect(() => {
    let isCancelled = false;

    async function loadOrders() {
      const orders = await realtimeBridge.getActiveOrders();
      if (!isCancelled) {
        setActiveOrders(orders || []);
        const stages: Record<string, 'PLACED' | 'REC' | 'PREP' | 'READY' | 'SERVED'> = {};
        (orders || []).forEach((o) => {
          const chair = o.order.chair_id ? o.order.chair_id.replace(/[^0-9]/g, '') : '';
          const tNum = o.order.ticket_number || '';
          let cachedStages: Record<string, string> = {};
          if (typeof window !== 'undefined' && chair) {
            try {
              cachedStages = JSON.parse(localStorage.getItem(`thoogudeepa_item_stages_${chair}`) || '{}');
            } catch {}
          }

          o.items.forEach((it) => {
            const dNum = it.dish_id ? it.dish_id.replace(/[^0-9]/g, '') : '';
            const dName = it.dish_name ? it.dish_name.toLowerCase().replace(/donne\s*/i, '').trim() : '';

            const effStage: 'PLACED' | 'REC' | 'PREP' | 'READY' | 'SERVED' =
              (chair && tNum && it.dish_id && cachedStages[`${chair}-${tNum}-${it.dish_id}`] as any) ||
              (chair && it.dish_id && cachedStages[`${chair}-${it.dish_id}`] as any) ||
              (chair && dNum && cachedStages[`${chair}-${dNum}`] as any) ||
              (chair && dName && cachedStages[`${chair}-${dName}`] as any) ||
              (it.dish_id && cachedStages[it.dish_id] as any) ||
              (dNum && cachedStages[dNum] as any) ||
              (dName && cachedStages[dName] as any) ||
              it.stage ||
              'PLACED';

            it.stage = effStage;

            if (chair) {
              if (tNum && it.dish_id) stages[`${chair}-${tNum}-${it.dish_id}`] = effStage;
              if (tNum && dNum) stages[`${chair}-${tNum}-${dNum}`] = effStage;
              if (it.dish_id) stages[`${chair}-${it.dish_id}`] = effStage;
              if (dNum) stages[`${chair}-${dNum}`] = effStage;
              if (dName) stages[`${chair}-${dName}`] = effStage;
              if (it.id) stages[`${chair}-${it.id}`] = effStage;
            }
          });
        });
        setItemStages(stages);
      }
    }

    loadOrders();

    const unsubscribe = realtimeBridge.subscribeKDS({
      onNewOrder: (newOrder) => {
        playKitchenChime();
        setActiveOrders((prev) => {
          const exists = prev.some(
            (o) => o.order.ticket_number === newOrder.order.ticket_number || (o.order.id && o.order.id === newOrder.order.id)
          );
          if (exists) return prev;
          return [newOrder, ...prev];
        });
      },
      onStageChange: (data) => {
        const chair = data.chairId ? data.chairId.replace(/[^0-9]/g, '') : '';
        const tNum = data.ticketNumber || '';
        const dId = data.dishId || data.key || '';
        const num = dId.replace(/[^0-9]/g, '');
        const cleanName = data.dishName ? data.dishName.toLowerCase().replace(/donne\s*/i, '').trim() : '';

        // Update itemStages strictly under chair-scoped keys to isolate seats
        setItemStages((prev) => {
          const next = { ...prev };
          if (chair) {
            if (tNum && dId) next[`${chair}-${tNum}-${dId}`] = data.stage;
            if (tNum && num) next[`${chair}-${tNum}-${num}`] = data.stage;
            if (dId) {
              next[`${chair}-${dId}`] = data.stage;
              next[`${chair}-dish-${dId.replace('dish-', '')}`] = data.stage;
              next[`${chair}-${dId.replace('dish-', '')}`] = data.stage;
            }
            if (num) {
              next[`${chair}-${num}`] = data.stage;
              next[`${chair}-dish-${num}`] = data.stage;
            }
            if (cleanName) {
              next[`${chair}-${cleanName}`] = data.stage;
            }
            if (data.key) {
              next[`${chair}-${data.key}`] = data.stage;
            }
          }
          return next;
        });

        // Update activeOrders items strictly for the matching seat and ticket
        setActiveOrders((prev) =>
          prev.map((o) => {
            const oChair = o.order.chair_id ? o.order.chair_id.replace(/[^0-9]/g, '') : '';
            if (chair && oChair !== chair) return o;
            if (tNum && o.order.ticket_number && o.order.ticket_number !== tNum) return o;

            const targetNum = num;
            const targetName = cleanName;

            const updatedItems = o.items.map((it) => {
              const itNum = it.dish_id ? it.dish_id.replace(/[^0-9]/g, '') : '';
              const itName = it.dish_name ? it.dish_name.toLowerCase().replace(/donne\s*/i, '').trim() : '';
              const matches =
                it.id === data.key ||
                it.dish_id === data.key ||
                it.dish_id === data.dishId ||
                `dish-${it.dish_id}` === data.key ||
                `dish-${data.dishId}` === it.dish_id ||
                (targetNum && itNum === targetNum) ||
                (targetName && (itName === targetName || itName.includes(targetName) || targetName.includes(itName)));

              if (matches) {
                return { ...it, stage: data.stage };
              }
              return it;
            });

            return { ...o, items: updatedItems };
          })
        );
      },
      onAvailabilityChange: (data) => {
        setStockStatus((prev) => ({ ...prev, [data.dishId]: data.isAvailable }));
      },
      onClearAll: () => {
        setActiveOrders([]);
        setItemStages({});
      },
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, []);

  const handleKeyPress = (val: string) => {
    setErrorMessage('');
    if (val === 'CLR') {
      setPin('');
      return;
    }
    if (val === 'DEL') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }
    if (pin.length < 4) {
      setPin((prev) => prev + val);
    }
  };

  const handleLoginSubmit = () => {
    if (pin === '1234') {
      setErrorMessage('');
      setActiveScreenTab(2);
    } else {
      setErrorMessage('Invalid PIN. Use default PIN 1234');
      setPin('');
    }
  };

  const updateItemStage = (
    itemKey: string,
    stage: 'PLACED' | 'REC' | 'PREP' | 'READY' | 'SERVED',
    meta?: { chairId?: string; dishId?: string; ticketNumber?: string; dishName?: string }
  ) => {
    const chair = meta?.chairId ? meta.chairId.replace(/[^0-9]/g, '') : '';
    const tNum = meta?.ticketNumber || '';
    const dId = meta?.dishId || itemKey;
    const num = dId.replace(/[^0-9]/g, '');
    const cleanName = meta?.dishName ? meta.dishName.toLowerCase().replace(/donne\s*/i, '').trim() : '';

    // 1. Update React itemStages using strict chair-scoped keys
    setItemStages((prev) => {
      const next = { ...prev };
      if (chair) {
        if (tNum && dId) next[`${chair}-${tNum}-${dId}`] = stage;
        if (tNum && num) next[`${chair}-${tNum}-${num}`] = stage;
        if (dId) {
          next[`${chair}-${dId}`] = stage;
          next[`${chair}-dish-${dId.replace('dish-', '')}`] = stage;
          next[`${chair}-${dId.replace('dish-', '')}`] = stage;
        }
        if (num) {
          next[`${chair}-${num}`] = stage;
          next[`${chair}-dish-${num}`] = stage;
        }
        if (cleanName) {
          next[`${chair}-${cleanName}`] = stage;
        }
        next[`${chair}-${itemKey}`] = stage;
      }
      return next;
    });

    // 2. Update activeOrders items strictly for this chair and ticket
    setActiveOrders((prev) =>
      prev.map((o) => {
        const oChair = o.order.chair_id ? o.order.chair_id.replace(/[^0-9]/g, '') : '';
        if (chair && oChair !== chair) return o;
        if (tNum && o.order.ticket_number && o.order.ticket_number !== tNum) return o;

        const updatedItems = o.items.map((it) => {
          const itNum = it.dish_id ? it.dish_id.replace(/[^0-9]/g, '') : '';
          const itName = it.dish_name ? it.dish_name.toLowerCase().replace(/donne\s*/i, '').trim() : '';
          const matches =
            it.id === itemKey ||
            it.dish_id === itemKey ||
            it.dish_id === dId ||
            (num && itNum === num) ||
            (cleanName && (itName === cleanName || itName.includes(cleanName) || cleanName.includes(itName)));

          if (matches) {
            return { ...it, stage };
          }
          return it;
        });

        return { ...o, items: updatedItems };
      })
    );

    // 3. Broadcast to all other devices with full seat, ticket, and dish metadata
    realtimeBridge.updateStage(itemKey, stage, meta);
  };

  const handleCompleteOrder = (ticketNumber: string, chairId?: string) => {
    setActiveOrders((prev) => prev.filter((o) => o.order.ticket_number !== ticketNumber));
    realtimeBridge.dispatchTicket(ticketNumber, chairId);
  };

  const handleClearAllOrders = async () => {
    // 1. Immediately wipe React state so UI updates to 0 orders instantly
    setActiveOrders([]);
    setItemStages({});
    setStockNotice('All kitchen orders deleted');
    setTimeout(() => setStockNotice(''), 3500);

    // 2. Wipe browser storage synchronously
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('thoogudeepa_v2_active_orders_list');
        localStorage.removeItem('thoogudeepa_v2_seat_occupancy_registry');
        const keys = Object.keys(localStorage);
        for (const k of keys) {
          if (
            k.startsWith('thoogudeepa') ||
            k.includes('order') ||
            k.includes('session') ||
            k.includes('cart') ||
            k.includes('stage') ||
            k.includes('ticket')
          ) {
            localStorage.removeItem(k);
          }
        }
        sessionStorage.clear();
      } catch (err) {
        console.error('Storage clear error:', err);
      }
    }

    // 3. Clear remote database and broadcast
    try {
      await realtimeBridge.clearAllOrders();
    } catch (err) {
      console.error('Realtime clear error:', err);
    }
  };

  const toggleStock = (dishKey: string) => {
    if (isStockLocked) {
      setStockNotice('Unlock with lock symbol to modify');
      setTimeout(() => setStockNotice(''), 2500);
      return;
    }
    setStockStatus((prev) => ({ ...prev, [dishKey]: !prev[dishKey] }));
  };

  const handleStockReset = () => {
    const allAvailable = Object.keys(stockStatus).reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setStockStatus(allAvailable);
    setStockNotice('All items set to Available');
    setTimeout(() => setStockNotice(''), 2500);
  };

  const handleStockUpdate = () => {
    setCommittedStockStatus(stockStatus);
    setIsStockLocked(true);
    setStockNotice('Saved & locked');
    setTimeout(() => setStockNotice(''), 2500);
    Object.entries(stockStatus).forEach(([dishId, isAvailable]) => {
      realtimeBridge.setAvailability(dishId, isAvailable);
    });
  };

  // Samsung Galaxy Tab A9 Frame Shell (8.7 inch, 5:3 aspect, 1340x800)
  const renderGalaxyTabA9 = (content: React.ReactNode, title: string, screenNumber: number) => {
    return (
      <div className="flex flex-col items-center gap-2 w-full max-w-[1020px]">
        <div className="w-full flex items-center justify-between px-2 text-xs font-black tracking-wider text-zinc-500 uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 inline-block" />
            <span>{title}</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            SAMSUNG GALAXY TAB A9 • PASS STATION #{screenNumber}
          </span>
        </div>

        <div className="w-full aspect-[5/3] bg-zinc-950 p-3 sm:p-4 rounded-[28px] sm:rounded-[36px] shadow-2xl border-4 border-zinc-800 relative flex items-center justify-center">
          <div className="absolute top-1/2 left-1.5 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-700 pointer-events-none" />
          <div className="w-full h-full bg-[#f8f9fa] rounded-[18px] sm:rounded-[24px] overflow-hidden flex flex-col p-3 sm:p-4 border border-zinc-300">
            {content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f5f7] text-zinc-900 flex flex-col font-sans select-none pb-12">
      {/* Top Suite Bar */}
      <header className="w-full bg-white border-b border-zinc-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Left Branding & Heading */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber-600 bg-amber-50 flex items-center justify-center shrink-0 shadow-xs">
            <ChefHat className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                KITCHEN DISPLAY SYSTEM
              </span>
              <span className="text-[10px] text-zinc-400 font-medium uppercase">
                THOOGUDEEPA DONNE BIRYANI MANE
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-zinc-900 flex items-center gap-1.5">
              <span>ORDERS &amp; PASS CONTROL</span>
              <span className="text-zinc-400 font-normal">•</span>
              <span className="text-amber-700">Master Dispatch</span>
            </h1>
          </div>
        </div>

        {/* Right Role Navigation & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Reset Queue Button */}
          <button
            type="button"
            onClick={handleClearAllOrders}
            className="px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 hover:text-white hover:bg-red-700 border border-red-300 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Delete all kitchen orders"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Orders</span>
          </button>

          {/* Role Pills */}
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-full border border-zinc-200 text-xs font-bold">
            <Link
              href="/seat/12/menu"
              className="px-3 py-1 rounded-full text-zinc-600 hover:text-black hover:bg-white transition-colors flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>CUSTOMER</span>
            </Link>
            <div className="px-3 py-1 rounded-full bg-zinc-900 text-white flex items-center gap-1.5 shadow-xs">
              <ChefHat className="w-3.5 h-3.5" />
              <span>KITCHEN</span>
            </div>
            <Link
              href="/qrs"
              className="px-3 py-1 rounded-full text-zinc-700 hover:text-black hover:bg-white transition-colors flex items-center gap-1.5 border border-zinc-200/80 bg-white shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-zinc-900" />
              <span>100 SEAT QRS</span>
            </Link>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>SINGLE TABLET</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ALL 3 SCREENS</span>
            </button>
          </div>
        </div>
      </header>

      {/* Screen Tabs Bar */}
      <div className="w-full bg-[#fafafa] border-b border-zinc-200 px-6 py-2 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveScreenTab(1)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeScreenTab === 1
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
          }`}
        >
          <span>1. KDS LOGIN</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveScreenTab(2)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeScreenTab === 2
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
          }`}
        >
          <span>2. ALL SEATS &amp; FEEDS</span>
          <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-black flex items-center justify-center">
            {activeOrders.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveScreenTab(3)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeScreenTab === 3
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
          }`}
        >
          <span>3. SEAT DETAIL &amp; 86 INVENTORY</span>
        </button>
      </div>

      {/* Content Rendering Engine */}
      {(() => {
        {/* SCREEN 1: KDS Station Login */}
        const screen1Content = (
          <div className="flex-1 flex flex-col justify-between items-center text-center w-full h-full py-1">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-900 bg-amber-50 flex items-center justify-center mb-1">
                <ChefHat className="w-6 h-6 text-amber-700" />
              </div>
              <h2 className="text-base font-black tracking-tight text-zinc-950 uppercase">
                STATION ACCESS
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium max-w-xs leading-tight">
                Enter kitchen pass authority PIN (Default PIN: 1234)
              </p>
            </div>

            <div className="w-full max-w-[280px] flex flex-col items-center gap-2 my-auto">
              <div className="flex items-center justify-center gap-3 py-2 px-4 rounded-xl bg-white border-2 border-zinc-900 w-full shadow-2xs">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border border-zinc-800 transition-all ${
                      pin.length > idx ? 'bg-zinc-950 scale-110' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {errorMessage && (
                <span className="text-[10px] font-bold text-red-600 leading-none">
                  {errorMessage}
                </span>
              )}

              <div className="grid grid-cols-3 gap-1.5 w-full pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'DEL'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleKeyPress(val)}
                    className="h-10 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 active:bg-zinc-200 text-xs font-black text-zinc-800 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                  >
                    {val}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleLoginSubmit}
                className="w-full mt-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>LOGIN</span>
              </button>
            </div>
          </div>
        );

        {/* SCREEN 2: All Seats & Feeds (Dynamic Orders) */}
        const activeTicketsToDisplay = activeOrders
          .map((active) => {
            const order = active.order;
            const cleanChair = (order.chair_id || '').replace(/[^0-9]/g, '');

            const tNum = order.ticket_number || '';
            const unservedItems = active.items.filter((it, idx) => {
              const itemKey = it.id || it.dish_id || `${order.ticket_number}-${idx}`;
              const dNum = it.dish_id ? it.dish_id.replace(/[^0-9]/g, '') : '';
              const dName = it.dish_name ? it.dish_name.toLowerCase().replace(/donne\s*/i, '').trim() : '';

              const isServed =
                it.stage === 'SERVED' ||
                (cleanChair && tNum && it.dish_id && itemStages[`${cleanChair}-${tNum}-${it.dish_id}`] === 'SERVED') ||
                (cleanChair && tNum && dNum && itemStages[`${cleanChair}-${tNum}-${dNum}`] === 'SERVED') ||
                (cleanChair && it.dish_id && itemStages[`${cleanChair}-${it.dish_id}`] === 'SERVED') ||
                (cleanChair && dNum && itemStages[`${cleanChair}-${dNum}`] === 'SERVED') ||
                (cleanChair && dNum && itemStages[`${cleanChair}-dish-${dNum}`] === 'SERVED') ||
                (cleanChair && dName && itemStages[`${cleanChair}-${dName}`] === 'SERVED') ||
                (cleanChair && it.dish_name && itemStages[`${cleanChair}-${it.dish_name.toLowerCase()}`] === 'SERVED') ||
                (cleanChair && itemStages[`${cleanChair}-${itemKey}`] === 'SERVED');

              return !isServed;
            });

            return { ...active, unservedItems };
          })
          .filter((active) => active.items.length === 0 || active.unservedItems.length > 0);

        const screen2Content = (
          <div className="flex-1 flex flex-col justify-between w-full h-full overflow-hidden">
            {/* Header Status */}
            <div className="flex items-center justify-between pb-1 shrink-0 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  ALL SEATS ({activeTicketsToDisplay.length} ACTIVE {activeTicketsToDisplay.length === 1 ? 'TICKET' : 'TICKETS'})
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {activeTicketsToDisplay.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllOrders}
                    className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-50 text-red-700 hover:bg-red-700 hover:text-white border border-red-300 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Delete all active orders"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete All</span>
                  </button>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase">
                Real-Time Pass Queue
              </span>
            </div>

            {/* Zero Orders Fresh State */}
            {activeTicketsToDisplay.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-300 rounded-2xl bg-white/60 my-auto">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center text-emerald-700 mb-2.5 shadow-2xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight text-zinc-950">
                  ALL PASSES CLEAR • 0 ACTIVE ORDERS
                </h3>
                <p className="text-[11px] text-zinc-500 font-medium max-w-sm mt-1 leading-relaxed">
                  No orders are currently waiting. When customers scan their tabletop QR (Seats 01–100) and place an order, it will appear here immediately!
                </p>
                <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Supabase Real-Time Channel Connected</span>
                </div>
              </div>
            ) : (
              /* Grid of Active Orders (Content-fitting, compact, neatly aligned) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full flex-1 overflow-y-auto py-1 items-start content-start">
                {activeTicketsToDisplay.map((active) => {
                  const order = active.order;
                  const chairId = order.chair_id || '12';

                  return (
                    <div
                      key={order.ticket_number || order.id}
                      className="w-full h-fit bg-white rounded-xl border-2 border-zinc-950 shadow-xs p-3 flex flex-col gap-2.5"
                    >
                      {/* Ticket Header (Seat & KOT on Same Line) */}
                      <div className="pb-2 border-b border-zinc-200 flex items-center gap-2 shrink-0">
                        <span className="font-black text-xs text-zinc-950 uppercase tracking-tight bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300 whitespace-nowrap shrink-0">
                          SEAT {chairId}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-700 font-mono whitespace-nowrap">
                          KOT: #{order.ticket_number}
                        </span>
                      </div>

                      {/* Items List (Tight spacing, no excessive gaps) */}
                      <div className="flex flex-col gap-1.5 py-0.5">
                        {active.items.length === 0 ? (
                          <div className="text-[11px] text-zinc-500 font-medium italic py-2 text-center">
                            Order received (compiling line items...)
                          </div>
                        ) : (
                          active.unservedItems.map((it, idx) => {
                            const itemKey = it.id || it.dish_id || `${order.ticket_number}-${idx}`;
                            const cleanChair = (order.chair_id || '').replace(/[^0-9]/g, '');
                            const tNum = order.ticket_number || '';
                            const dNum = it.dish_id ? it.dish_id.replace(/[^0-9]/g, '') : '';
                            const dName = it.dish_name ? it.dish_name.toLowerCase().replace(/donne\s*/i, '').trim() : '';

                            const currentStage =
                              it.stage ||
                              (cleanChair && tNum && it.dish_id && itemStages[`${cleanChair}-${tNum}-${it.dish_id}`]) ||
                              (cleanChair && tNum && dNum && itemStages[`${cleanChair}-${tNum}-${dNum}`]) ||
                              (cleanChair && it.dish_id && itemStages[`${cleanChair}-${it.dish_id}`]) ||
                              (cleanChair && dNum && itemStages[`${cleanChair}-${dNum}`]) ||
                              (cleanChair && dNum && itemStages[`${cleanChair}-dish-${dNum}`]) ||
                              (cleanChair && dName && itemStages[`${cleanChair}-${dName}`]) ||
                              (cleanChair && itemStages[`${cleanChair}-${itemKey}`]) ||
                              'PLACED';

                            return (
                              <div
                                key={itemKey}
                                className="bg-[#fbf9f5] rounded-lg border border-zinc-200 p-2 flex flex-col gap-1.5"
                              >
                                {/* Full Dish Title and Multiplier (Zero Prices) */}
                                <div className="flex items-start gap-2 min-w-0">
                                  <span className="w-5 h-5 rounded bg-zinc-900 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                    {it.quantity}x
                                  </span>
                                  <span className="font-black text-xs text-zinc-950 leading-snug break-words flex-1">
                                    {it.dish_name}
                                  </span>
                                </div>

                                {/* Customizations & Add-ons Clearly Visible */}
                                {(it.notes || (it.addons && it.addons.length > 0 && !it.addons.every((a) => a === 'PLACED'))) && (
                                  <div className="text-[10px] font-bold text-amber-950 bg-amber-50/90 border border-amber-300 rounded px-2 py-1 leading-snug">
                                    <span className="font-black text-[9px] uppercase tracking-wide text-amber-800 block">
                                      ADD-ONS &amp; CUSTOMIZATION:
                                    </span>
                                    <span>{(it.notes || it.addons?.filter((a) => a !== 'PLACED').join(', '))}</span>
                                  </div>
                                )}

                                {/* Dish Stage Status Indicator */}
                                <div className="flex items-center justify-between text-[9px] font-bold">
                                  <span className="text-zinc-500 font-extrabold uppercase tracking-tight">Status:</span>
                                  {currentStage === 'PLACED' && (
                                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 font-black flex items-center gap-1 shadow-2xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                      PLACED (Tap 1.REC to accept)
                                    </span>
                                  )}
                                  {currentStage === 'REC' && (
                                    <span className="text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-300 font-black flex items-center gap-1 shadow-2xs">
                                      <Check className="w-3 h-3 text-sky-600" />
                                      RECEIVED IN KITCHEN
                                    </span>
                                  )}
                                  {currentStage === 'PREP' && (
                                    <span className="text-orange-900 bg-orange-50 px-2 py-0.5 rounded border border-orange-300 font-black flex items-center gap-1 shadow-2xs">
                                      <Flame className="w-3 h-3 text-orange-600" />
                                      COOKING IN WOK
                                    </span>
                                  )}
                                  {currentStage === 'READY' && (
                                    <span className="text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-black flex items-center gap-1 shadow-2xs">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      PASS READY TO SERVE
                                    </span>
                                  )}
                                </div>

                                {/* Interactive 3-Stage Stepper: REC -> PREP -> READY */}
                                <div className="grid grid-cols-3 gap-1 pt-0.5">
                                  {(['REC', 'PREP', 'READY'] as const).map((stage, sIdx) => {
                                    const isCurrent = currentStage === stage;
                                    return (
                                      <button
                                        key={stage}
                                        type="button"
                                        onClick={() =>
                                          updateItemStage(itemKey, stage, {
                                            chairId: order.chair_id,
                                            dishId: it.dish_id,
                                            ticketNumber: order.ticket_number,
                                            dishName: it.dish_name,
                                          })
                                        }
                                        className={`h-7 rounded-md text-[9px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                                          isCurrent
                                            ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                            : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                                        }`}
                                      >
                                        {sIdx + 1}.{stage}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

        {/* SCREEN 3: Seat Detail & 86 Inventory */}
        const screen3Content = (
          <div className="flex-1 flex flex-col justify-between w-full h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-1 shrink-0 border-b border-zinc-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                86 INVENTORY CONTROL (MENU AVAILABILITY)
              </h3>
              {stockNotice && (
                <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {stockNotice}
                </span>
              )}
            </div>

            {/* Dish Toggles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 overflow-y-auto py-2">
              {MENU_ITEMS.map((dish) => {
                const isAvailable = stockStatus[dish.id] !== false;
                return (
                  <div
                    key={dish.id}
                    className="p-2 rounded-xl border border-zinc-300 bg-white shadow-2xs flex flex-col justify-between gap-2"
                  >
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block leading-tight">
                        {dish.title}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider mt-0.5 inline-block ${
                        isAvailable ? 'text-emerald-700' : 'text-red-600 line-through'
                      }`}>
                        {isAvailable ? 'Available' : 'Sold Out (86)'}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isStockLocked}
                      onClick={() => toggleStock(dish.id)}
                      className={`w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        isAvailable
                          ? 'bg-zinc-900 hover:bg-black text-white'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-300'
                      } ${isStockLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isAvailable ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>IN STOCK</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-3 h-3" />
                          <span>86 OUT</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Controls Lock / Unlock & Save */}
            <div className="pt-2 border-t border-zinc-200 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsStockLocked(!isStockLocked)}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isStockLocked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{isStockLocked ? 'UNLOCK TO EDIT' : 'LOCK CONTROLS'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isStockLocked}
                  onClick={handleStockReset}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ALL AVAILABLE</span>
                </button>
                <button
                  type="button"
                  disabled={isStockLocked}
                  onClick={handleStockUpdate}
                  className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SAVE &amp; BROADCAST</span>
                </button>
              </div>
            </div>
          </div>
        );

        return (
          <main className="w-full max-w-[1220px] mx-auto px-2 sm:px-4 mt-4 flex-1 flex flex-col items-center">
            {viewMode === 'all' ? (
              <div className="flex flex-col gap-10 w-full items-center pb-12">
                {renderGalaxyTabA9(screen1Content, "1. KDS STATION LOGIN", 1)}
                {renderGalaxyTabA9(screen2Content, "2. ALL SEATS & FEEDS (DISPATCH)", 2)}
                {renderGalaxyTabA9(screen3Content, "3. SEAT DETAIL & 86 INVENTORY", 3)}
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {activeScreenTab === 1 && renderGalaxyTabA9(screen1Content, "1. KDS STATION LOGIN", 1)}
                {activeScreenTab === 2 && renderGalaxyTabA9(screen2Content, "2. ALL SEATS & FEEDS (DISPATCH)", 2)}
                {activeScreenTab === 3 && renderGalaxyTabA9(screen3Content, "3. SEAT DETAIL & 86 INVENTORY", 3)}
              </div>
            )}
          </main>
        );
      })()}
    </div>
  );
}
