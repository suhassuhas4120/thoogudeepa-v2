/**
 * Thoogudeepa Waiter Mobile Cockpit - Food Menu Catalog Component
 *
 * Real-world enterprise Waiter Order Pad & Food Catalog interface:
 * - Balanced Modern Theme: Soft slate canvas (#F8FAFC), crisp white card (#FFFFFF),
 *   subtle borders (#E2E8F0), slate-900 typography, and vibrant accents
 * - Top Order Bar: Target Seat Indicator with back action to Floor Grid
 * - Integrated Search Bar with tactile [ ✕ ] Clear Button
 * - Cart Icon with Badge Number positioned directly on top-right of the icon
 * - Category Filter Pills: All Items, Donne Biryani, Starters, Rice & Gravy, Beverages
 * - Item Cards: Non-Veg / Veg indicators, price, description, and '+ Add' / Stepper controls
 * - Sticky Floating Bottom KOT Summary Bar ('3 Items Added • ₹740' with 'PUNCH KOT' button)
 * - Strict Line Count: Maintained strictly between 300 and 400 lines
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  Search, 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Flame, 
  Sparkles, 
  UtensilsCrossed, 
  Filter,
  Check,
  Bell
} from 'lucide-react';
import { 
  MenuItem, 
  CartItem, 
  MenuCategoryKey, 
  SAMPLE_MENU_ITEMS 
} from './types';

export interface MobileOrderCatalogProps {
  /** Active target seat number (e.g., 'Seat 02') */
  readonly activeSeatNumber: string;
  /** Active target guest name */
  readonly activeGuestName?: string;
  /** Available food catalog */
  readonly menuItems?: MenuItem[];
  /** Current cart item lines */
  readonly cartItems: CartItem[];
  /** Pending floor alerts count */
  readonly pendingAlertCount?: number;
  /** Callback to open alerts */
  readonly onOpenAlerts?: () => void;
  /** Callback when item quantity is modified */
  readonly onModifyQuantity: (item: MenuItem, change: number) => void;
  /** Callback when cart bottom sheet is toggled */
  readonly onOpenCartSheet: () => void;
  /** Callback to punch KOT to kitchen */
  readonly onPunchKOT: () => void;
  /** Navigation callback back to seats grid */
  readonly onBackToSeats: () => void;
}

export const MobileOrderCatalog: React.FC<MobileOrderCatalogProps> = ({
  activeSeatNumber,
  activeGuestName = 'Walk-In Guest',
  menuItems = SAMPLE_MENU_ITEMS,
  cartItems,
  pendingAlertCount = 2,
  onOpenAlerts,
  onModifyQuantity,
  onOpenCartSheet,
  onPunchKOT,
  onBackToSeats
}) => {
  const [activeCategory, setActiveCategory] = useState<MenuCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Category definitions with active counts
  const categories: { key: MenuCategoryKey; label: string }[] = useMemo(() => [
    { key: 'all', label: 'All Items' },
    { key: 'biryani', label: 'Donne Biryani' },
    { key: 'starters', label: 'Starters' },
    { key: 'gravy', label: 'Rice & Gravy' },
    { key: 'drinks', label: 'Beverages' }
  ], []);

  // Compute total item count in cart
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cartItems]);

  // Compute running subtotal
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.lineTotal, 0);
  }, [cartItems]);

  // Map item IDs to cart quantity for quick lookups
  const cartQuantities = useMemo(() => {
    const map = new Map<string, number>();
    cartItems.forEach(item => {
      map.set(item.menuItem.id, item.quantity);
    });
    return map;
  }, [cartItems]);

  // Filtered menu items by category and query
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesKannada = item.kannadaName ? item.kannadaName.includes(q) : false;
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesKannada && !matchesDesc) return false;
      }
      return true;
    });
  }, [menuItems, activeCategory, searchQuery]);

  // Clear search input
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 select-none overflow-hidden relative">
      
      {/* Top Order Pad Header: Hotel Name FIRST, Waiter Below, Bell Always on Right */}
      <header className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs shrink-0 select-none z-20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBackToSeats}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-100 btn-press shrink-0 shadow-2xs text-slate-700"
            title="Back to Seats"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black text-slate-900 tracking-tight truncate leading-tight">
                ತೂಗುದೀಪ ದೊನ್ನೆ ಬಿರಿಯಾನಿ
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                TAKE ORDER
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-800 truncate">Ramesh Kumar</span>
              <span className="text-slate-300 text-[10px]">•</span>
              <span className="text-[10px] font-semibold text-slate-500 truncate">
                {activeSeatNumber}: {activeGuestName}
              </span>
            </div>
          </div>
        </div>

        {/* Alert Bell Icon Always at Top Right */}
        <button
          type="button"
          onClick={onOpenAlerts}
          className="relative w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 btn-press shrink-0 shadow-2xs"
          title="Alerts"
        >
          <Bell className="w-4 h-4 text-slate-700" />
          {pendingAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-2xs animate-pulse">
              {pendingAlertCount}
            </span>
          )}
        </button>
      </header>

      {/* Search Input Bar Row: ALWAYS CART ICON BESIDE SEARCH OPTION */}
      <div className="p-3 bg-white border-b border-slate-100 shrink-0 space-y-2 shadow-2xs z-10">
        <div className="flex items-center gap-2">
          {/* Search Bar with Dedicated ✕ Clear Button */}
          <div className="relative flex-1 flex items-center min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search biryani, starters..."
              className="w-full h-8 pl-8 pr-7 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-all"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-all"
                title="Clear search"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* ALWAYS CART ICON BESIDE SEARCH OPTION */}
          <button
            type="button"
            onClick={onOpenCartSheet}
            className="relative h-8 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5 btn-press shadow-2xs shrink-0"
            title="View Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-black text-slate-900">Cart</span>
            {totalCartCount > 0 && (
              <span className="bg-amber-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>

        {/* Horizontal Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`h-6 px-2.5 rounded-lg text-[10px] font-bold shrink-0 transition-all shadow-2xs ${
                activeCategory === cat.key
                  ? 'bg-slate-900 text-white font-black'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dishes Catalog List */}
      <div className="p-3 flex-1 overflow-y-auto no-scrollbar space-y-2.5 pb-28">
        {filteredMenuItems.length === 0 ? (
          /* Empty Search State */
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-2 mx-auto">
              <UtensilsCrossed className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">No Dishes Found</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Try searching with another item or category keyword.
            </p>
          </div>
        ) : (
          filteredMenuItems.map(dish => {
            const currentQty = cartQuantities.get(dish.id) || 0;
            const isNonVeg = dish.dietary === 'non_veg';

            return (
              <div
                key={dish.id}
                className="border border-slate-200 rounded-2xl p-3 bg-white shadow-xs flex items-center justify-between gap-2.5 hover:border-slate-300 transition-all"
              >
                {/* Dish Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {/* Food Dietary Indicator */}
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      isNonVeg ? 'bg-rose-500' : 'bg-emerald-500'
                    }`} />
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {dish.name}
                    </h4>
                    {dish.isBestseller && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[7px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-300">
                        Chef Best
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {dish.description}
                  </p>

                  <span className="text-xs font-black text-amber-700 block mt-1">
                    ₹{dish.price}
                  </span>
                </div>

                {/* Add / Stepper Controls */}
                <div className="flex items-center shrink-0">
                  {currentQty > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onModifyQuantity(dish, -1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-800 btn-press shadow-2xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-black text-slate-900">
                        {currentQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onModifyQuantity(dish, 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center font-bold btn-press shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onModifyQuantity(dish, 1)}
                      className="h-7 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 btn-press flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Sticky Floating Bottom KOT Punch Bar */}
      {totalCartCount > 0 && (
        <div className="absolute bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-xs border-t border-slate-200 flex items-center justify-between shadow-lg z-30 animate-in slide-in-from-bottom-2 duration-200">
          <div>
            <span className="text-xs font-black text-slate-900 block">
              {totalCartCount} Items Added • ₹{cartSubtotal}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">
              Ready for Kitchen Pass
            </span>
          </div>

          <button
            type="button"
            onClick={onPunchKOT}
            className="h-10 px-4 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-black text-xs rounded-xl flex items-center gap-2 btn-press shadow-md transition-all"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Send to KOT 🔥</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default MobileOrderCatalog;
