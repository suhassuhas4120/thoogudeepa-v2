"use client";
/**
 * Thoogudeepa Waiter Tablet POS Cockpit - Menu Catalog Component
 *
 * Real-world enterprise Menu Ordering Panel (60% split screen width):
 * - Balanced In-Between Theme: Soft slate canvas (#F8FAFC), crisp white cards (#FFFFFF),
 *   subtle borders (#E2E8F0), slate-900 typography, and vibrant accents
 * - Subheader with explicit [ Floor ] navigation button on ONE single line
 * - STRICTLY NO "TARGET SEAT:" LABEL (Removed as requested by user)
 * - Custom styled seat switcher dropdown with proper visualization and chevron icon
 * - Search placeholder with Cart Count badge positioned DIRECTLY ON the cart icon
 * - Clean category filter pills (All Items, Donne Biryani, Starters, Gravy, Beverages)
 * - Food cards with veg/non-veg badge, price, spice indicator, and stepper controls
 * - [ + Add ] action button for first-time selection with Plus icon
 * - Standardized badge tokens (uniform 24px height, 10px bold uppercase font)
 * - Strict line count maintained between 300 and 400 lines (never exceeds 400).
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronDown,
  Search, 
  Plus, 
  Minus, 
  Utensils, 
  X
} from 'lucide-react';
import { DishItem, MENU_DISHES, SeatItem } from './types';

export interface TabletMenuCatalogProps {
  /** Target seat identifier and guest name (e.g., 'Seat 02: Walk-In') */
  activeSeatName: string;
  /** Active seats list assigned to waiter */
  seats?: SeatItem[];
  /** Whether the seat is currently dining with an active order */
  isDining: boolean;
  /** Map of dish ID to quantity currently selected in the cart/order */
  dishQuantities: Record<number, number>;
  /** Total count of items added in current ticket */
  cartCount: number;
  /** Callback to navigate back to the Floor Board matrix */
  onBackToFloor: () => void;
  /** Callback to quickly switch active seat without leaving catalog */
  onQuickSeatSwitch: (seatVal: string) => void;
  /** Callback when waiter taps '+ Add' on a dish for the first time */
  onAddDishFirstTime: (id: number, price: number) => void;
  /** Callback to increment or decrement quantity */
  onChangeQty: (id: number, delta: number, price: number) => void;
  /** Callback to toggle focus to live ticket column on smaller screens */
  onSwitchToTicketMode: () => void;
}

export const TabletMenuCatalog: React.FC<TabletMenuCatalogProps> = ({
  activeSeatName,
  seats,
  isDining,
  dishQuantities,
  cartCount,
  onBackToFloor,
  onQuickSeatSwitch,
  onAddDishFirstTime,
  onChangeQty,
  onSwitchToTicketMode
}) => {
  // Search query & Category state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [vegOnlyFilter, setVegOnlyFilter] = useState<boolean>(false);

  // Category navigation tabs
  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'biryani', label: 'Donne Biryani' },
    { id: 'starters', label: 'Starters' },
    { id: 'gravy', label: 'Rice & Gravy' },
    { id: 'drinks', label: 'Beverages' }
  ];

  // Dynamic seats list for complete dropdown selection
  const allSeatsList = useMemo(() => {
    if (seats && seats.length > 0) {
      return seats.map(s => ({
        id: s.seatNumber,
        label: s.status === 'occupied'
          ? `${s.seatNumber} (${s.guestName} - ₹${s.totalAmount}${s.hasBillRequest ? ' Bill Req' : ''})`
          : `${s.seatNumber} (Available)`
      }));
    }
    return [
      { id: 'Seat 01', label: 'Seat 01 (Walk-In Available)' }
    ];
  }, [seats]);

  // Filtered dishes based on category, search text, and veg toggle
  const filteredDishes = useMemo(() => {
    return MENU_DISHES.filter(dish => {
      const matchesSearch = 
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
      const matchesVeg = !vegOnlyFilter || dish.isVeg;
      return matchesSearch && matchesCategory && matchesVeg;
    });
  }, [searchQuery, selectedCategory, vegOnlyFilter]);

  const currentSeatId = activeSeatName.split(':')[0].trim();

  return (
    <div 
      className="w-[60%] h-full flex flex-col border-r border-slate-200 p-4 sm:p-5 overflow-y-auto no-scrollbar select-none bg-white"
      role="region"
      aria-label="Menu Catalog Ordering Terminal"
    >
      {/* ======================================================== */}
      {/* 1. SUB-HEADER: ALL IN ONE SINGLE LINE (NO WRAPPING) */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3 gap-2 flex-nowrap">
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Explicit Back to Floor Grid Button */}
          <button
            type="button"
            onClick={onBackToFloor}
            className="h-9 px-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs group shrink-0"
            title="Return to Floor Seat Matrix"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Floor</span>
          </button>

          {/* Brand & Active Seat Name and Dining Status Tag */}
          <div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs font-black text-slate-900">ತೂಗುದೀಪ ದೊನ್ನೆ ಬಿರಿಯಾನಿ</span>
              <span
                className={`h-6 px-2.5 inline-flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider rounded-full border shadow-2xs ${
                  isDining 
                    ? 'bg-amber-50 text-amber-800 border-amber-300' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                }`}
              >
                {isDining ? 'Dining Active' : 'New Order'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-700 font-bold mt-0.5">
              <span>ಮಿಲಿಟರಿ ಹೋಟೆಲ್</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700 font-bold">{activeSeatName}</span>
            </div>
          </div>
        </div>

        {/* PROPER CUSTOM DROPDOWN (NO "TARGET SEAT:" TEXT LABEL!) */}
        <div className="relative shrink-0">
          <div className="relative flex items-center">
            <select
              value={currentSeatId}
              onChange={(e) => onQuickSeatSwitch(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 bg-slate-50 hover:bg-slate-100 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-800 cursor-pointer shadow-2xs outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              title="Quickly switch order target seat"
            >
              {allSeatsList.map(seat => (
                <option key={seat.id} value={seat.id} className="bg-white text-slate-800">
                  {seat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SEARCH PLACEHOLDER & CART ICON WITH OVERLAY BADGE */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2.5 mb-3">
        {/* Search Input Box */}
        <div className="flex-1 h-10 border border-slate-300 hover:border-slate-400 rounded-2xl px-3.5 flex items-center gap-2 bg-slate-50 min-w-0 shadow-2xs transition-colors focus-within:border-amber-500">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search biryani, starters, beverages..."
            className="w-full text-xs font-semibold bg-transparent outline-none text-slate-900 placeholder-slate-400"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              className="w-6 h-6 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all shrink-0 active:scale-90"
              title="Clear Search"
              aria-label="Clear Search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Veg Only Toggle Pill */}
        <button
          type="button"
          onClick={() => setVegOnlyFilter(!vegOnlyFilter)}
          className={`h-10 px-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-2xs ${
            vegOnlyFilter 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20' 
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
          title="Filter pure vegetarian dishes"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
          <span className="hidden sm:inline">Veg</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. CATEGORY FILTER PILLS (UNIFORM HEIGHT: h-8) */}
      {/* ======================================================== */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
        {categories.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`h-8 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white font-black shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 4. DISHES CARD GRID WITH STEPPERS & VEG/NON-VEG BADGES */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
        {filteredDishes.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400">
            <Utensils className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-bold text-slate-600">No dishes found matching search criteria</p>
          </div>
        ) : (
          filteredDishes.map(dish => {
            const qty = dishQuantities[dish.id] || 0;

            return (
              <div
                key={dish.id}
                className={`border rounded-2xl p-3 flex flex-col justify-between transition-all bg-white shadow-xs ${
                  qty > 0 
                    ? 'border-amber-400 ring-1 ring-amber-400/30' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top: Veg Indicator & Price */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {/* Standard Indian Veg/Non-Veg Border Marker */}
                      <span 
                        className={`w-3.5 h-3.5 border flex items-center justify-center rounded-xs ${
                          dish.isVeg 
                            ? 'border-emerald-600 bg-emerald-50' 
                            : 'border-rose-600 bg-rose-50'
                        }`}
                        title={dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      >
                        <span 
                          className={`w-1.5 h-1.5 rounded-full ${
                            dish.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`} 
                        />
                      </span>
                      <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                        {dish.name}
                      </h4>
                    </div>

                    <span className="text-xs font-black text-amber-700 whitespace-nowrap bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      ₹{dish.price}
                    </span>
                  </div>

                  {/* Description & Category Tag */}
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                {/* Bottom Stepper or Clean + Add Button */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {qty > 0 ? `Selected: ${qty}` : 'Ready to add'}
                  </span>

                  {qty === 0 ? (
                    // Standardized Clean Button: + Add (USER REQUESTED!)
                    <button
                      type="button"
                      onClick={() => onAddDishFirstTime(dish.id, dish.price)}
                      className="h-8 px-3.5 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition-all"
                    >
                      <Plus className="w-3 h-3 text-slate-600" />
                      <span>Add</span>
                    </button>
                  ) : (
                    // Stepper: [-] [qty] [+] with uniform h-8 container
                    <div className="h-8 flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onChangeQty(dish.id, -1, dish.price)}
                        className="w-7 h-7 rounded-lg hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-700 transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-slate-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onChangeQty(dish.id, 1, dish.price)}
                        className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-90 flex items-center justify-center text-slate-950 transition-all shadow-2xs"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3 text-slate-950 stroke-[3]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TabletMenuCatalog;

