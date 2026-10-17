'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { realtimeBridge } from '@/lib/supabase';
import { 
  ShieldCheck, 
  Tablet, 
  Layers, 
  ChefHat, 
  UserCheck, 
  Store, 
  UtensilsCrossed, 
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Ban,
  Lock,
  Unlock,
  RotateCcw,
  QrCode
} from 'lucide-react';

export default function KitchenDisplaySystemPage() {
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeScreenTab, setActiveScreenTab] = useState<number>(2);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');

  // Screen 2 item stage trackers across active seats (3 items each across 6 seats)
  const [itemStages, setItemStages] = useState<Record<string, 'REC' | 'PREP' | 'READY'>>({
    'chicken-biryani-seat-12': 'REC',
    'mutton-biryani-seat-12': 'REC',
    'chicken-sukka-seat-12': 'REC',
    'donne-chicken-seat-04': 'PREP',
    'chicken-sukka-seat-04': 'REC',
    'gunfire-kebab-seat-04': 'REC',
    'donne-mutton-seat-07': 'READY',
    'gunfire-kebab-seat-07': 'REC',
    'donne-khushka-seat-07': 'REC',
    'donne-egg-seat-02': 'REC',
    'chkn-guntur-seat-02': 'PREP',
    'chicken-kebab-seat-02': 'REC',
    'mutton-chukka-seat-09': 'PREP',
    'donne-khushka-seat-09': 'READY',
    'donne-chicken-seat-09': 'REC',
    'chkn-kebab-seat-15': 'REC',
    'donne-chicken-seat-15': 'REC',
    'donne-egg-seat-15': 'REC',
  });

  // Screen 3 Item availability with Lock/Unlock and Reset/Update protection
  const defaultStockStatus: Record<string, boolean> = {
    'chicken-biryani': true,
    'mutton-biryani': true,
    'donne-egg-biryani': true,
    'gunfire-kebab': false, // Sold Out
    'chicken-sukka': true,
    'donne-khushka': true,
    'mutton-chukka': true,
    'guntur-chicken': true,
  };

  const [stockStatus, setStockStatus] = useState<Record<string, boolean>>(defaultStockStatus);
  const [committedStockStatus, setCommittedStockStatus] = useState<Record<string, boolean>>(defaultStockStatus);
  const [isStockLocked, setIsStockLocked] = useState<boolean>(true);
  const [stockNotice, setStockNotice] = useState<string>('');

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

  useEffect(() => {
    const unsubscribe = realtimeBridge.subscribeKDS({
      onStageChange: (data) => {
        setItemStages((prev) => ({ ...prev, [data.key]: data.stage }));
      },
      onAvailabilityChange: (data) => {
        setStockStatus((prev) => ({ ...prev, [data.dishId]: data.isAvailable }));
      },
    });

    return () => {
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

  const updateItemStage = (itemKey: string, stage: 'REC' | 'PREP' | 'READY') => {
    setItemStages((prev) => ({ ...prev, [itemKey]: stage }));
    realtimeBridge.updateStage(itemKey, stage);
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

        {/* Right Role Navigation & View Toggle */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Role Pills */}
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-full border border-zinc-200 text-xs font-bold">
            <Link
              href="/seat/12/menu/"
              className="px-3 py-1 rounded-full text-zinc-600 hover:text-black hover:bg-white transition-colors flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>CUSTOMER (10)</span>
            </Link>
            <div className="px-3 py-1 rounded-full bg-zinc-900 text-white flex items-center gap-1.5 shadow-xs">
              <ChefHat className="w-3.5 h-3.5" />
              <span>KITCHEN (3)</span>
            </div>
            <button
              type="button"
              className="px-3 py-1 rounded-full text-zinc-500 hover:text-black hover:bg-white transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>WAITER (10)</span>
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded-full text-zinc-500 hover:text-black hover:bg-white transition-colors flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>MANAGER (16)</span>
            </button>
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
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
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
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
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
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeScreenTab === 1
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
          }`}
        >
          <span>1. KDS Station Login</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveScreenTab(2)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeScreenTab === 2
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>2. All Seats &amp; Feeds</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveScreenTab(3)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeScreenTab === 3
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-700" />
          <span>3. Seat Detail &amp; 86 Inventory</span>
        </button>
      </div>

      {/* Reusable Samsung Galaxy Tab A9 Chassis Renderer */}
      {(() => {
        const renderGalaxyTabA9 = (
          content: React.ReactNode, 
          title: string, 
          screenNum: number
        ) => (
          <div key={screenNum} className="w-full flex flex-col items-center">
            {/* Screen Title & Tablet Resolution Header */}
            <div className="w-full max-w-[1200px] flex items-center justify-between pb-2 px-1">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                <Tablet className="w-4 h-4 text-zinc-700" />
                <span>{title}</span>
              </span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase bg-zinc-200/90 px-2.5 py-0.5 rounded border border-zinc-300 shadow-2xs">
                SAMSUNG GALAXY TAB A9 • 1340×800 (15:9)
              </span>
            </div>

            {/* Samsung Galaxy Tab A9 Chassis Frame (Graphite Metallic Finish, 9mm Uniform Bezel, Exact 1340x800 Aspect) */}
            <div className="w-full max-w-[1200px] h-[720px] rounded-[28px] bg-[#161a22] p-2.5 sm:p-3 shadow-2xl border border-zinc-700/60 ring-1 ring-zinc-800/80 relative flex flex-col justify-between shrink-0">
              {/* Landscape Top Bezel with Front Camera & Ambient Sensor */}
              <div className="flex items-center justify-center gap-2.5 mb-1.5 py-0.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0a0d14] ring-1 ring-zinc-700/70 shadow-inner" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              </div>

              {/* Tab A9 Inner Screen Display (Uniform Fixed Height & Width Across All 3 Screens) */}
              <div className="w-full flex-1 rounded-[18px] bg-[#faf7f2] overflow-hidden flex flex-col justify-between p-2 sm:p-2.5 border border-zinc-200/50 shadow-inner">
                {/* Tablet Status Header */}
                <div className="w-full flex items-center justify-between pb-1.5 border-b border-zinc-200/80 mb-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center text-white text-[9px] font-black shadow-2xs">
                      T
                    </div>
                    <span className="text-xs font-black tracking-wider text-zinc-900 uppercase">
                      THOOGUDEEPA KDS
                    </span>
                  </div>
                </div>

                {/* Screen Body - fills exact remaining viewport */}
                <div className="flex-1 w-full overflow-hidden flex flex-col">
                  {content}
                </div>
              </div>
            </div>
          </div>
        );

        {/* SCREEN 1: KDS Station Login */}
        const screen1Content = (
          <div className="flex-1 flex items-center justify-center w-full h-full my-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch max-w-3xl mx-auto w-full">
              {/* Left Card: Brand & Kitchen Identity */}
              <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[360px]">
                {/* Circular Emblem */}
                <div className="relative w-24 h-24 rounded-full border-4 border-zinc-300 bg-zinc-50 p-1 flex items-center justify-center shadow-md">
                  <div className="w-full h-full rounded-full border border-dashed border-zinc-300 flex flex-col items-center justify-center bg-white p-1">
                    <ChefHat className="w-8 h-8 text-zinc-800 mb-0.5" />
                    <span className="text-[9px] font-black uppercase text-zinc-900 tracking-tight leading-none">
                      THOOGUDEEPA
                    </span>
                  </div>
                </div>

                {/* Brand Title */}
                <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 mt-5 leading-snug uppercase max-w-[240px]">
                  THOOGUDEEPA DONNE BIRYANI MANE
                </h2>

                {errorMessage && (
                  <div className="mt-3 text-xs font-bold text-red-600">
                    {errorMessage}
                  </div>
                )}
              </div>

              {/* Right Card: PIN Keypad */}
              <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs p-6 sm:p-8 flex flex-col justify-between min-h-[360px]">
                <div>
                  <h3 className="text-xs font-black tracking-widest text-zinc-700 uppercase text-center">
                    ENTER PIN TO LOGIN
                  </h3>

                  {/* PIN Display Field */}
                  <div className="w-full rounded-xl bg-[#f7f5f0] border border-zinc-200/90 py-3.5 px-4 flex items-center justify-center gap-3.5 mt-3 shadow-inner">
                    {[0, 1, 2, 3].map((idx) => {
                      const isFilled = pin.length > idx;
                      return (
                        <div
                          key={idx}
                          className={`w-3 h-3 rounded-full transition-all duration-150 ${
                            isFilled
                              ? 'bg-zinc-900 scale-110'
                              : 'border-2 border-zinc-300 bg-transparent'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Keypad Grid (3x4) */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'DEL'].map((keyVal) => (
                    <button
                      key={keyVal}
                      type="button"
                      onClick={() => handleKeyPress(keyVal)}
                      className="h-11 rounded-xl bg-[#faf8f5] hover:bg-zinc-100 active:bg-zinc-200 active:scale-95 border border-zinc-200/90 font-bold text-sm text-zinc-800 shadow-2xs transition-all flex items-center justify-center cursor-pointer select-none"
                    >
                      {keyVal}
                    </button>
                  ))}
                </div>

                {/* Submit Login Action */}
                <button
                  type="button"
                  onClick={handleLoginSubmit}
                  className="w-full mt-4 py-3 rounded-xl bg-zinc-900 hover:bg-black active:scale-[0.98] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-zinc-900 transition-all cursor-pointer shadow-2xs"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>LOGIN</span>
                </button>
              </div>
            </div>
          </div>
        );

        {/* SCREEN 2: All Seats & Feeds */}
        const screen2Content = (
          <div className="flex-1 flex flex-col justify-between w-full h-full overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center justify-between pb-1 shrink-0">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                ALL SEATS (6 ACTIVE TICKETS)
              </h3>
            </div>

            {/* 3-Column Seats Layout - 2 Rows x 3 Columns (All 6 Seats Visible Without Scrolling) */}
            <div className="grid grid-cols-3 grid-rows-2 gap-2 w-full flex-1 overflow-hidden">
              {/* Card 1: SEAT 12 */}
              <div className="bg-white rounded-lg border border-zinc-300 shadow-2xs p-1.5 flex flex-col justify-between h-full overflow-hidden">
                <div className="pb-0.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
                  <span className="font-black text-xs text-zinc-950 uppercase tracking-tight">
                    SEAT 12
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-start gap-1 py-0.5 overflow-hidden">
                  {/* Item 1 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Chicken Biryani
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Extra Raita, Medium Spice</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['chicken-biryani-seat-12'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('chicken-biryani-seat-12', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Mutton Biryani
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Bone-in Tender, Salna Bowl</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['mutton-biryani-seat-12'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('mutton-biryani-seat-12', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Chicken Sukka
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Crisp Curry Leaves, Lemon</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['chicken-sukka-seat-12'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('chicken-sukka-seat-12', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <button
                  type="button"
                  onClick={() => setActiveScreenTab(3)}
                  className="w-full py-1 rounded bg-zinc-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer shrink-0 border border-zinc-900 mt-auto"
                >
                  <span>MANAGE SEAT 12</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 2: SEAT 04 */}
              <div className="bg-white rounded-lg border border-zinc-300 shadow-2xs p-1.5 flex flex-col justify-between h-full overflow-hidden">
                <div className="pb-0.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
                  <span className="font-black text-xs text-zinc-950 uppercase tracking-tight">
                    SEAT 04
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-start gap-1 py-0.5 overflow-hidden">
                  {/* Item 1 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        2x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Donne Chkn Biryani
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Double Raitha Bowl</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['donne-chicken-seat-04'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('donne-chicken-seat-04', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Chicken Sukka
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Mild Roast Masala</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['chicken-sukka-seat-04'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('chicken-sukka-seat-04', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Gunfire Kebab
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Extra Lemon &amp; Onions</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['gunfire-kebab-seat-04'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('gunfire-kebab-seat-04', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <button
                  type="button"
                  onClick={() => setActiveScreenTab(3)}
                  className="w-full py-1 rounded bg-zinc-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer shrink-0 border border-zinc-900 mt-auto"
                >
                  <span>MANAGE SEAT 04</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 3: SEAT 07 */}
              <div className="bg-white rounded-lg border border-zinc-300 shadow-2xs p-1.5 flex flex-col justify-between h-full overflow-hidden">
                <div className="pb-0.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
                  <span className="font-black text-xs text-zinc-950 uppercase tracking-tight">
                    SEAT 07
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-start gap-1 py-0.5 overflow-hidden">
                  {/* Item 1 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Donne Mutton Biry.
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Traditional Handi Style</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['donne-mutton-seat-07'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('donne-mutton-seat-07', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        2x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Gunfire Kebab
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Crispy Fried, Mint Dip</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['gunfire-kebab-seat-07'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('gunfire-kebab-seat-07', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Donne Khushka
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Pure Ghee Seeraga Rice</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['donne-khushka-seat-07'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('donne-khushka-seat-07', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <button
                  type="button"
                  onClick={() => setActiveScreenTab(3)}
                  className="w-full py-1 rounded bg-zinc-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer shrink-0 border border-zinc-900 mt-auto"
                >
                  <span>MANAGE SEAT 07</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 4: SEAT 02 */}
              <div className="bg-white rounded-lg border border-zinc-300 shadow-2xs p-1.5 flex flex-col justify-between h-full overflow-hidden">
                <div className="pb-0.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
                  <span className="font-black text-xs text-zinc-950 uppercase tracking-tight">
                    SEAT 02
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-start gap-1 py-0.5 overflow-hidden">
                  {/* Item 1 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        2x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Donne Egg Biryani
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Steamed Double Egg</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['donne-egg-seat-02'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('donne-egg-seat-02', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Chkn Guntur
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Hot Green Chilli Rub</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['chkn-guntur-seat-02'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('chkn-guntur-seat-02', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Chicken Kebab
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Masala Deep Fry</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['chicken-kebab-seat-02'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('chicken-kebab-seat-02', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <button
                  type="button"
                  onClick={() => setActiveScreenTab(3)}
                  className="w-full py-1 rounded bg-zinc-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer shrink-0 border border-zinc-900 mt-auto"
                >
                  <span>MANAGE SEAT 02</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 5: SEAT 09 */}
              <div className="bg-white rounded-lg border border-zinc-300 shadow-2xs p-1.5 flex flex-col justify-between h-full overflow-hidden">
                <div className="pb-0.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
                  <span className="font-black text-xs text-zinc-950 uppercase tracking-tight">
                    SEAT 09
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-start gap-1 py-0.5 overflow-hidden">
                  {/* Item 1 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Mutton Chukka
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Dry Black Pepper Roast</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['mutton-chukka-seat-09'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('mutton-chukka-seat-09', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Donne Khushka
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Extra Salna Gravy</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['donne-khushka-seat-09'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('donne-khushka-seat-09', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Donne Chkn Biryani
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Spicy Donne Leaf Pack</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['donne-chicken-seat-09'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('donne-chicken-seat-09', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <button
                  type="button"
                  onClick={() => setActiveScreenTab(3)}
                  className="w-full py-1 rounded bg-zinc-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer shrink-0 border border-zinc-900 mt-auto"
                >
                  <span>MANAGE SEAT 09</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 6: SEAT 15 */}
              <div className="bg-white rounded-lg border border-zinc-300 shadow-2xs p-1.5 flex flex-col justify-between h-full overflow-hidden">
                <div className="pb-0.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
                  <span className="font-black text-xs text-zinc-950 uppercase tracking-tight">
                    SEAT 15
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-start gap-1 py-0.5 overflow-hidden">
                  {/* Item 1 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        2x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Chicken Kebab
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Crispy Oil Fry, Onions</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['chkn-kebab-seat-15'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('chkn-kebab-seat-15', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Donne Chkn Biryani
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Mild Spice Portion</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['donne-chicken-seat-15'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('donne-chicken-seat-15', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-[#fbf9f5] rounded border border-zinc-200/90 px-1.5 py-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        1x
                      </span>
                      <span className="font-black text-[11px] text-zinc-900 tracking-tight truncate">
                        Donne Egg Biryani
                      </span>
                    </div>
                    {/* Add-on Space */}
                    <div className="text-[9px] font-semibold text-zinc-600 truncate pl-5 flex items-center gap-1 leading-none py-0.5">
                      <span className="text-zinc-400 font-bold">•</span>
                      <span className="truncate">Add-on: Extra Boiled Egg Side</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                        const currentStage = itemStages['donne-egg-seat-15'];
                        const isCurrent = currentStage === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => updateItemStage('donne-egg-seat-15', stage)}
                            className={`h-6 rounded text-[10px] font-black tracking-wider uppercase transition-all border cursor-pointer flex items-center justify-center select-none ${
                              isCurrent
                                ? 'bg-zinc-950 text-white border-zinc-950 ring-1 ring-zinc-400'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {idx + 1}.{stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <button
                  type="button"
                  onClick={() => setActiveScreenTab(3)}
                  className="w-full py-1 rounded bg-zinc-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer shrink-0 border border-zinc-900 mt-auto"
                >
                  <span>MANAGE SEAT 15</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );

        {/* SCREEN 3: Seat Detail & 86 Inventory */}
        const screen3Content = (
          <div className="flex-1 flex flex-col justify-between w-full h-full overflow-hidden">
            {/* Header with Back to All Tables button shifted to left */}
            <div className="flex items-center justify-start pb-1.5 border-b border-zinc-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setActiveScreenTab(2)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs border border-zinc-900"
              >
                <span>← BACK TO ALL TABLES</span>
              </button>
            </div>

            {/* Two-Column Layout (Seat 12 Course Pass & 86 Inventory Controls) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full flex-1 overflow-hidden mt-1">
              {/* Left Column (7 Cols): Seat 12 Course Breakdown */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-300 p-3 shadow-xs flex flex-col justify-between h-full overflow-hidden">
                <div className="flex flex-col gap-2 overflow-y-auto thin-slider pr-0.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                    <h4 className="font-black text-sm text-zinc-900">
                      SEAT 12 • TICKET #TK-1082
                    </h4>
                  </div>

                  {/* Dishes in this Seat */}
                  <div className="flex flex-col gap-2">
                    {/* Dish 1 */}
                    <div className="bg-[#fbf9f5] rounded-lg border border-zinc-200 p-2.5 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded bg-zinc-900 text-white text-[11px] font-black flex items-center justify-center">
                          1x
                        </span>
                        <span className="font-black text-xs sm:text-sm text-zinc-900">
                          Chicken Biryani
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-600 italic">
                        Special Instructions: Traditional Donne leaf pack, extra aroma coriander
                      </span>
                      {/* Stage Selector */}
                      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                        {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                          const currentStage = itemStages['chicken-biryani-seat-12'];
                          const isCurrent = currentStage === stage;
                          return (
                            <button
                              key={stage}
                              type="button"
                              onClick={() => updateItemStage('chicken-biryani-seat-12', stage)}
                              className={`h-8 rounded-md text-[11px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                                isCurrent
                                  ? 'bg-zinc-950 text-white border-zinc-950 ring-2 ring-zinc-400'
                                  : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                              }`}
                            >
                              {idx + 1}.{stage}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dish 2 */}
                    <div className="bg-[#fbf9f5] rounded-lg border border-zinc-200 p-2.5 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded bg-zinc-900 text-white text-[11px] font-black flex items-center justify-center">
                          1x
                        </span>
                        <span className="font-black text-xs sm:text-sm text-zinc-900">
                          Mutton Biryani
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-600 italic">
                        Special Instructions: Bone-in tender portion, spiced pepper gravy side
                      </span>
                      {/* Stage Selector */}
                      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                        {(['REC', 'PREP', 'READY'] as const).map((stage, idx) => {
                          const currentStage = itemStages['mutton-biryani-seat-12'];
                          const isCurrent = currentStage === stage;
                          return (
                            <button
                              key={stage}
                              type="button"
                              onClick={() => updateItemStage('mutton-biryani-seat-12', stage)}
                              className={`h-8 rounded-md text-[11px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                                isCurrent
                                  ? 'bg-zinc-950 text-white border-zinc-950 ring-2 ring-zinc-400'
                                  : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                              }`}
                            >
                              {idx + 1}.{stage}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Left Bottom Fast Dispatch Controls */}
                <div className="pt-2 border-t border-zinc-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      updateItemStage('chicken-biryani-seat-12', 'READY');
                      updateItemStage('mutton-biryani-seat-12', 'READY');
                    }}
                    className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer border border-zinc-900 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>MARK ALL READY</span>
                  </button>
                </div>
              </div>

              {/* Right Column (5 Cols): Item Availability Controls with Lock & Reset/Update */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-300 p-3 shadow-xs flex flex-col justify-between h-full overflow-hidden">
                <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
                  <div className="pb-1.5 border-b border-zinc-200 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {stockNotice && (
                        <span className="text-[10px] font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                          {stockNotice}
                        </span>
                      )}
                    </div>
                    {/* Lock / Unlock symbol button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsStockLocked(!isStockLocked);
                        setStockNotice(isStockLocked ? 'UNLOCKED' : 'LOCKED');
                        setTimeout(() => setStockNotice(''), 2500);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border transition-colors shadow-2xs select-none ${
                        isStockLocked
                          ? 'bg-zinc-900 hover:bg-black text-white border-zinc-900'
                          : 'bg-white hover:bg-zinc-100 text-zinc-900 border-zinc-400 ring-1 ring-zinc-400'
                      }`}
                      title={isStockLocked ? "Click lock symbol to unlock" : "Click to lock controls"}
                    >
                      {isStockLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>LOCKED</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>UNLOCKED</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Dish Availability Toggles Grid */}
                  <div className="flex-1 overflow-y-auto thin-slider pr-0.5 flex flex-col gap-1.5">
                    {[
                      { key: 'chicken-biryani', name: 'Chicken Biryani' },
                      { key: 'mutton-biryani', name: 'Mutton Biryani' },
                      { key: 'donne-egg-biryani', name: 'Donne Egg Biryani' },
                      { key: 'gunfire-kebab', name: 'Gunfire Kebab' },
                      { key: 'chicken-sukka', name: 'Chicken Sukka' },
                      { key: 'donne-khushka', name: 'Donne Khushka' },
                      { key: 'mutton-chukka', name: 'Mutton Chukka' },
                      { key: 'guntur-chicken', name: 'Guntur Chicken' },
                    ].map((dish) => {
                      const isAvailable = stockStatus[dish.key];
                      return (
                        <div
                          key={dish.key}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-[#faf9f6] border border-zinc-200"
                        >
                          <span className="text-xs font-black text-zinc-800 truncate">
                            {dish.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleStock(dish.key)}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                              isAvailable
                                ? 'bg-zinc-900 hover:bg-black text-white border border-zinc-900'
                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border border-zinc-300 line-through'
                            } ${isStockLocked ? 'opacity-85' : 'ring-1 ring-zinc-300'}`}
                          >
                            {isAvailable ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>AVAILABLE</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3 h-3" />
                                <span>SOLD OUT</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action Controls: RESET and UPDATE */}
                <div className="pt-2 border-t border-zinc-200 shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isStockLocked}
                    onClick={handleStockReset}
                    className={`flex-1 py-2 rounded-lg font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-colors shadow-2xs select-none ${
                      isStockLocked
                        ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
                        : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 cursor-pointer'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESET</span>
                  </button>
                  <button
                    type="button"
                    disabled={isStockLocked}
                    onClick={handleStockUpdate}
                    className={`flex-1 py-2 rounded-lg font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-colors shadow-2xs select-none ${
                      isStockLocked
                        ? 'bg-zinc-200 text-zinc-400 border-zinc-200 cursor-not-allowed'
                        : 'bg-zinc-900 hover:bg-black text-white border-zinc-900 cursor-pointer'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>UPDATE</span>
                  </button>
                </div>
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
