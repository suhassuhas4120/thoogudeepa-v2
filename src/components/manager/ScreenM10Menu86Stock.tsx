'use client';

import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Tag,
  Search,
  Plus,
  RotateCcw,
  Percent,
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react';
import { MENU_ITEMS } from '@/lib/data/menuData';
import { PromoRule } from './types';
import { realtimeBridge } from '@/lib/supabase';

const INITIAL_PROMOS: PromoRule[] = [
  { id: 'pr-0', code: 'B1G1', title: 'Sunday Special', discountPercent: 50, minBillAmount: 1500, isActive: true, description: 'Buy 1 Get 1 Free', timing: '5 AM - 12 PM', dateRange: '15 Oct 2026 - 16 Oct 2026' },
  { id: 'pr-1', code: 'HAPPYHOUR10', title: 'Happy Hours (4 PM - 7 PM)', discountPercent: 10, minBillAmount: 500, isActive: true, description: '10% Flat on Dine-in Orders', timing: '4 PM - 7 PM', dateRange: 'Daily' },
  { id: 'pr-2', code: 'WEEKENDCOMBO', title: 'Weekend Family Feast', discountPercent: 15, minBillAmount: 1500, isActive: true, description: '15% on Biryani Pots & Starters', timing: 'All Day', dateRange: 'Sat - Sun' },
  { id: 'pr-3', code: 'CORP10', title: 'Corporate Tech Park Badge', discountPercent: 10, minBillAmount: 800, isActive: false, description: '10% with verified Corporate ID', timing: '12 PM - 4 PM', dateRange: 'Mon - Fri' },
];

export function ScreenM10Menu86Stock() {
  const [stockMap, setStockMap] = useState<Record<string, boolean>>(() => {
    return MENU_ITEMS.reduce((acc, dish) => {
      acc[dish.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
  });

  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [promos, setPromos] = useState<PromoRule[]>(INITIAL_PROMOS);

  // Form states for new offer
  const [offerName, setOfferName] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountVal, setDiscountVal] = useState<string>('');
  const [minOrder, setMinOrder] = useState<string>('');

  const toggleStock = async (dishId: string) => {
    if (isLocked) return;
    const nextVal = !stockMap[dishId];
    setStockMap((prev) => ({ ...prev, [dishId]: nextVal }));
    await realtimeBridge.setAvailability(dishId, nextVal);
  };

  const resetAllInStock = async () => {
    if (isLocked) return;
    const allTrue: Record<string, boolean> = {};
    for (const dish of MENU_ITEMS) {
      allTrue[dish.id] = true;
      await realtimeBridge.setAvailability(dish.id, true);
    }
    setStockMap(allTrue);
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerName.trim() || !promoCode.trim()) return;
    const newRule: PromoRule = {
      id: `pr-${Date.now()}`,
      title: offerName.trim(),
      code: promoCode.trim().toUpperCase(),
      discountPercent: parseInt(discountVal, 10) || 10,
      minBillAmount: parseInt(minOrder, 10) || 500,
      isActive: true,
      description: 'Manager created promotional campaign',
      timing: 'All Day',
      dateRange: 'Active Shift',
    };
    setPromos((prev) => [newRule, ...prev]);
    setOfferName('');
    setPromoCode('');
    setDiscountVal('');
    setMinOrder('');
    alert(`Offer "${newRule.title}" activated with code ${newRule.code}`);
  };

  const togglePromoActive = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const soldOutCount = Object.values(stockMap).filter((v) => !v).length;
  const filteredDishes = MENU_ITEMS.filter((dish) =>
    dish.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full mx-auto p-1 space-y-4 font-mono">
      {/* Top Header Banner */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9C3D1E] text-white shadow-sm">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-100 rounded px-1.5 py-0.5">
              INVENTORY &amp; DISCOUNTS
            </span>
            <h1 className="text-base sm:text-lg font-black font-mono text-slate-900 mt-1">
              Menu Stocks and Offers
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isLocked
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-rose-50 text-rose-800 border border-rose-300 animate-pulse'
            }`}
          >
            {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            <span>{isLocked ? 'Editing Locked' : 'Editing UNLOCKED'}</span>
          </button>
          <span className="text-xs font-bold text-slate-700 bg-[#FAF8F5] border border-slate-200 px-3 py-1.5 rounded-xl">
            {promos.filter((p) => p.isActive).length} Active Campaigns
          </span>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
            {soldOutCount} Sold Out (86)
          </span>
        </div>
      </div>

      {/* 2-Column Split Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Real-Time Dish Availability (~50% / lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-[#9C3D1E]" />
              <h3 className="font-mono text-xs font-black uppercase text-slate-900">
                Real-Time Dish Availability (15 Dishes)
              </h3>
            </div>
            <button
              type="button"
              onClick={resetAllInStock}
              disabled={isLocked}
              className="px-2.5 py-1 bg-[#FAF8F5] border border-slate-300 rounded text-[10px] font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
            >
              Reset All In-Stock
            </button>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-400 font-mono"
            />
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto no-scrollbar">
            {filteredDishes.map((dish) => {
              const inStock = stockMap[dish.id] ?? true;
              return (
                <div
                  key={dish.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                    inStock
                      ? 'bg-[#FAF8F5] border-slate-200'
                      : 'bg-rose-50 border-rose-300'
                  }`}
                >
                  <div className="pr-2 truncate">
                    <span className="font-bold text-slate-900 block truncate">{dish.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">₹{dish.price}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStock(dish.id)}
                    disabled={isLocked}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                      isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    } ${
                      inStock
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {inStock ? 'IN STOCK' : '86 OUT'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Promotional Campaigns (~50% / lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#9C3D1E]" />
              <h3 className="font-mono text-xs font-black uppercase text-slate-900">
                Add Promotional Offers
              </h3>
            </div>
          </div>

          <form onSubmit={handleAddOffer} className="space-y-2.5 bg-[#FAF8F5] border border-slate-200 rounded-xl p-3.5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Offer Name (e.g. Festival Treat)"
                value={offerName}
                onChange={(e) => setOfferName(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <input
                type="text"
                placeholder="Promo Code (e.g. TREAT20)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Discount % (e.g. 15)"
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <input
                type="number"
                placeholder="Min Order ₹ (e.g. 500)"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#9C3D1E] text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition cursor-pointer"
            >
              + Activate Promo Campaign
            </button>
          </form>

          {/* Active Campaign Cards */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
            {promos.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-[#FAF8F5] border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{p.title}</span>
                    <span className="px-1.5 py-0.5 rounded bg-orange-100 text-[#9C3D1E] text-[10px] font-black">
                      {p.code}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {p.discountPercent}% Off • Min Bill ₹{p.minBillAmount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => togglePromoActive(p.id)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    p.isActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {p.isActive ? 'ACTIVE' : 'PAUSED'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
