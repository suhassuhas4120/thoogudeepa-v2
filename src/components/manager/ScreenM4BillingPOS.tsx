'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MENU_ITEMS, MENU_CATEGORIES } from '@/lib/data/menuData';
import { realtimeBridge, OrderRecord, OrderItemRecord } from '@/lib/supabase';
import {
  Printer,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  QrCode,
  Banknote,
  Search,
  UtensilsCrossed,
  CheckCircle2,
  Receipt,
  RotateCcw,
  Percent,
  Armchair,
  Grid,
  X,
  ChevronDown,
} from 'lucide-react';

interface BillItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  seatNumber: number;
  stage: string;
}

const PRESET_SEAT_ITEMS: Record<string, BillItem[]> = {
  '17': [
    { id: 'b17-1', name: 'Chicken Pepper Dry', price: 160, qty: 1, seatNumber: 17, stage: 'SERVED' },
    { id: 'b17-2', name: 'Dosa (2pcs)', price: 50, qty: 1, seatNumber: 17, stage: 'SERVED' },
    { id: 'b17-3', name: 'Mutton Liver', price: 240, qty: 1, seatNumber: 17, stage: 'SERVED' },
    { id: 'b17-4', name: 'Chilli Chicken', price: 160, qty: 1, seatNumber: 17, stage: 'SERVED' },
  ],
  '04': [
    { id: 'b4-1', name: 'Chicken Biryani', price: 170, qty: 2, seatNumber: 4, stage: 'SERVED' },
    { id: 'b4-2', name: 'Chicken Pepper Dry', price: 180, qty: 1, seatNumber: 4, stage: 'SERVED' },
  ],
  '01': [
    { id: 'b1-1', name: 'Chicken Biryani', price: 170, qty: 2, seatNumber: 1, stage: 'SERVED' },
    { id: 'b1-2', name: 'Guntur Chicken Fry', price: 190, qty: 1, seatNumber: 1, stage: 'READY' },
    { id: 'b1-3', name: 'Mutton Biryani', price: 280, qty: 1, seatNumber: 1, stage: 'PREP' },
  ],
  '02': [
    { id: 'b2-1', name: 'Mutton Biryani', price: 280, qty: 1, seatNumber: 2, stage: 'PREP' },
    { id: 'b2-2', name: 'Chilli Chicken Donne', price: 180, qty: 1, seatNumber: 2, stage: 'PREP' },
  ],
  '03': [
    { id: 'b3-1', name: 'Mutton Biryani', price: 280, qty: 1, seatNumber: 3, stage: 'SERVED' },
    { id: 'b3-2', name: 'Elaneer Payasam', price: 90, qty: 1, seatNumber: 3, stage: 'SERVED' },
  ],
  '07': [
    { id: 'b7-1', name: 'Chicken Biryani', price: 170, qty: 3, seatNumber: 7, stage: 'SERVED' },
    { id: 'b7-2', name: 'Kushka Rice Portion', price: 90, qty: 2, seatNumber: 7, stage: 'SERVED' },
  ],
  '28': [
    { id: 'b28-1', name: 'Chicken Biryani', price: 170, qty: 3, seatNumber: 28, stage: 'SERVED' },
    { id: 'b28-2', name: 'Mutton Chops', price: 290, qty: 1, seatNumber: 28, stage: 'SERVED' },
  ],
  '32': [
    { id: 'b32-1', name: 'Mutton Biryani', price: 280, qty: 4, seatNumber: 32, stage: 'SERVED' },
    { id: 'b32-2', name: 'Guntur Chicken Fry', price: 190, qty: 2, seatNumber: 32, stage: 'SERVED' },
  ],
};

const ALL_100_SEATS = Array.from({ length: 100 }, (_, i) => (i + 1).toString().padStart(2, '0'));

interface ScreenM4BillingPOSProps {
  selectedSeatId?: string;
  onSelectSeatId?: (id: string) => void;
  liveOrders?: { order: OrderRecord; items: OrderItemRecord[] }[];
  onSettled?: () => void;
}

export function ScreenM4BillingPOS({
  selectedSeatId = '17',
  onSelectSeatId,
  liveOrders = [],
  onSettled,
}: ScreenM4BillingPOSProps) {
  // Normalize clean seat number (e.g. '17', '04', '01')
  const cleanInitialSeat = selectedSeatId.replace(/[^0-9]/g, '') || '17';
  const paddedInitial = cleanInitialSeat.padStart(2, '0');

  const [activeSeat, setActiveSeat] = useState<string>(paddedInitial);
  const [items, setItems] = useState<BillItem[]>([]);
  const [seatBillsMap, setSeatBillsMap] = useState<Record<string, BillItem[]>>({});
  const [seatPickerModalOpen, setSeatPickerModalOpen] = useState<boolean>(false);
  const [modalZoneFilter, setModalZoneFilter] = useState<'ALL' | 'Z1' | 'Z2' | 'Z3' | 'Z4'>('ALL');
  const [modalSearch, setModalSearch] = useState<string>('');
  const [jumpInput, setJumpInput] = useState<string>('');

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [complimentary, setComplimentary] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'CARD'>('UPI');
  const [settledSuccess, setSettledSuccess] = useState<boolean>(false);
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [printThermalOpen, setPrintThermalOpen] = useState<boolean>(false);

  // Set of occupied seats from live orders and presets
  const liveOccupiedSeats = useMemo(() => {
    const set = new Set<string>();
    liveOrders.forEach((o) => {
      const chairNum = (o.order.chair_id || '').replace(/[^0-9]/g, '');
      if (chairNum) {
        set.add(chairNum.padStart(2, '0'));
      }
    });
    Object.keys(PRESET_SEAT_ITEMS).forEach((k) => {
      set.add(k.padStart(2, '0'));
    });
    return set;
  }, [liveOrders]);

  // Quick ribbon seats (always includes activeSeat)
  const quickRibbonSeats = useMemo(() => {
    const base = ['17', '04', '01', '02', '03', '07', '16', '28'];
    const list = [activeSeat, ...base.filter((s) => s !== activeSeat && s.padStart(2, '0') !== activeSeat)];
    return Array.from(new Set(list)).slice(0, 7);
  }, [activeSeat]);

  // Helper to load items for a seat
  const loadSeatItems = (seatNumPadded: string): BillItem[] => {
    if (seatBillsMap[seatNumPadded]) {
      return seatBillsMap[seatNumPadded];
    }
    const unpadded = seatNumPadded.replace(/^0+/, '') || '1';
    const num = parseInt(unpadded, 10);

    // 1. Check live orders from Supabase/resilience store
    const matchingLive = liveOrders.filter((o) => {
      const oChair = (o.order.chair_id || '').replace(/[^0-9]/g, '');
      return oChair === seatNumPadded || oChair === unpadded || Number(oChair) === num;
    });

    if (matchingLive.length > 0) {
      const liveItemsList: BillItem[] = [];
      matchingLive.forEach((lo) => {
        lo.items.forEach((it, idx) => {
          liveItemsList.push({
            id: it.id || `live-${seatNumPadded}-${idx}`,
            name: it.dish_name,
            price: it.price,
            qty: it.quantity,
            seatNumber: num,
            stage: it.stage || 'SERVED',
          });
        });
      });
      if (liveItemsList.length > 0) {
        return liveItemsList;
      }
    }

    // 2. Check preset mock items
    if (PRESET_SEAT_ITEMS[seatNumPadded]) {
      return PRESET_SEAT_ITEMS[seatNumPadded];
    }
    if (PRESET_SEAT_ITEMS[unpadded]) {
      return PRESET_SEAT_ITEMS[unpadded];
    }

    // 3. Fallback default item
    return [
      { id: `b-${seatNumPadded}-1`, name: 'Chicken Biryani', price: 170, qty: 1, seatNumber: num, stage: 'SERVED' },
    ];
  };

  // Sync when selectedSeatId prop changes from Screen 2
  useEffect(() => {
    const clean = selectedSeatId.replace(/[^0-9]/g, '') || '17';
    const padded = clean.padStart(2, '0');
    setActiveSeat(padded);
    const initialItems = loadSeatItems(padded);
    setItems(initialItems);
    setSeatBillsMap((m) => ({ ...m, [padded]: initialItems }));
    setSettledSuccess(false);
  }, [selectedSeatId]);

  // Handle switching seat
  const handleSwitchSeat = (seatNum: string) => {
    const clean = seatNum.replace(/[^0-9]/g, '') || '17';
    const padded = clean.padStart(2, '0');
    setActiveSeat(padded);
    const loaded = loadSeatItems(padded);
    setItems(loaded);
    setSeatBillsMap((m) => ({ ...m, [padded]: loaded }));
    setSettledSuccess(false);
    if (onSelectSeatId) {
      onSelectSeatId(padded);
    }
  };

  const handleJumpSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseInt(jumpInput.trim(), 10);
    if (!isNaN(val) && val >= 1 && val <= 100) {
      handleSwitchSeat(val.toString().padStart(2, '0'));
      setJumpInput('');
    }
  };

  const modalFilteredSeats = useMemo(() => {
    return ALL_100_SEATS.filter((seatStr) => {
      const num = parseInt(seatStr, 10);
      if (modalZoneFilter === 'Z1' && (num < 1 || num > 25)) return false;
      if (modalZoneFilter === 'Z2' && (num < 26 || num > 50)) return false;
      if (modalZoneFilter === 'Z3' && (num < 51 || num > 75)) return false;
      if (modalZoneFilter === 'Z4' && (num < 76 || num > 100)) return false;

      if (modalSearch.trim()) {
        const query = modalSearch.trim().replace(/[^0-9]/g, '');
        if (query && !seatStr.includes(query) && !num.toString().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [modalZoneFilter, modalSearch]);

  const updateItemQty = (id: string, delta: number) => {
    setItems((prev) => {
      const updated = prev
        .map((it) => (it.id === id ? { ...it, qty: it.qty + delta } : it))
        .filter((it) => it.qty > 0);
      setSeatBillsMap((m) => ({ ...m, [activeSeat]: updated }));
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((it) => it.id !== id);
      setSeatBillsMap((m) => ({ ...m, [activeSeat]: updated }));
      return updated;
    });
  };

  const handleAddDirectItem = (dish: typeof MENU_ITEMS[0]) => {
    setItems((prev) => {
      let updated: BillItem[];
      const idx = prev.findIndex((it) => it.name === dish.title);
      if (idx >= 0) {
        updated = prev.map((it, i) => (i === idx ? { ...it, qty: it.qty + 1 } : it));
      } else {
        updated = [
          ...prev,
          {
            id: `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: dish.title,
            price: dish.price,
            qty: 1,
            seatNumber: parseInt(activeSeat, 10) || 17,
            stage: 'NEW',
          },
        ];
      }
      setSeatBillsMap((m) => ({ ...m, [activeSeat]: updated }));
      return updated;
    });
  };

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const taxable = Math.max(0, subtotal - discountAmount);
  const gst = Math.round(taxable * 0.05);
  const grandTotal = complimentary ? 0 : taxable + gst;

  const handleSettle = async () => {
    setSettledSuccess(true);
    const chairNum = activeSeat.replace(/[^0-9]/g, '');
    if (chairNum) {
      await realtimeBridge.settleBill(chairNum, paymentMethod, grandTotal);
    }
    if (onSettled) {
      onSettled();
    }
    setTimeout(() => {
      setItems([]);
      setSettledSuccess(false);
    }, 2000);
  };

  const filteredDishes = MENU_ITEMS.filter((dish) => {
    const matchesCat = selectedCategory === 'all' || dish.categoryId === selectedCategory;
    const matchesSearch = dish.title.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full mx-auto p-1 space-y-4 font-mono">
      {/* Top Header Banner */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9C3D1E] text-white shadow-sm">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-100 rounded px-1.5 py-0.5">
              POINT OF SALE
            </span>
            <h1 className="text-base sm:text-lg font-black font-mono text-slate-900 mt-1">
              Billing &amp; Cashier POS &bull; Seat #{activeSeat}
            </h1>
          </div>
        </div>

        {/* Seat Selection Controls (Pick ANY Seat 1-100) */}
        <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap">
          {/* Direct Dropdown for ANY of the 100 Seats */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-xs">
            <Armchair className="h-3.5 w-3.5 text-[#9C3D1E] shrink-0" />
            <label htmlFor="seat-dropdown-pos" className="text-[11px] font-black text-slate-600 uppercase shrink-0">
              Seat:
            </label>
            <select
              id="seat-dropdown-pos"
              value={activeSeat}
              onChange={(e) => handleSwitchSeat(e.target.value)}
              className="bg-transparent text-xs font-black font-mono text-[#9C3D1E] outline-none cursor-pointer pr-1"
            >
              {ALL_100_SEATS.map((numStr) => {
                const hasOrder = liveOccupiedSeats.has(numStr);
                return (
                  <option key={numStr} value={numStr}>
                    Seat #{numStr} {hasOrder ? '• Active Order' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quick Jump Input */}
          <form
            onSubmit={handleJumpSubmit}
            className="flex items-center gap-1 bg-[#FAF8F5] border border-slate-300 rounded-lg px-2 py-1 shadow-xs"
          >
            <span className="text-slate-400 text-xs font-bold font-mono">#</span>
            <input
              type="number"
              min={1}
              max={100}
              placeholder="1-100"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              className="w-12 bg-transparent text-xs font-bold font-mono text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="px-1.5 py-0.5 bg-[#9C3D1E] text-white rounded text-[10px] font-bold hover:bg-orange-700 cursor-pointer"
            >
              Go
            </button>
          </form>

          {/* "All 100 Seats" Interactive Grid Modal Button */}
          <button
            type="button"
            onClick={() => setSeatPickerModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] border border-slate-300 hover:border-[#9C3D1E] text-slate-800 hover:text-[#9C3D1E] rounded-lg text-xs font-bold transition cursor-pointer shadow-xs shrink-0"
          >
            <Grid className="h-3.5 w-3.5 text-[#9C3D1E]" />
            <span>All 100 Seats</span>
          </button>

          {/* Quick Ribbon (Dynamic: active seat + top active seats) */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar">
            {quickRibbonSeats.map((seatNum) => {
              const padded = seatNum.padStart(2, '0');
              const isCurrent = activeSeat === padded;
              return (
                <button
                  key={seatNum}
                  type="button"
                  onClick={() => handleSwitchSeat(seatNum)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'bg-[#9C3D1E] text-white shadow-xs'
                      : 'bg-[#FAF8F5] border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Seat {padded}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Split Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Bill Line Items & Tender (~60% / lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Armchair className="h-4 w-4 text-[#9C3D1E]" />
              <span className="font-black text-sm text-slate-900">Current Seat: Seat #{activeSeat}</span>
              <span className="text-xs text-slate-500 font-mono">({items.length} items)</span>
            </div>
            <button
              type="button"
              onClick={() => setPrintThermalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Bill</span>
            </button>
          </div>

          {/* Line items table for this particular seat */}
          {items.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-mono">
              No items on Seat #{activeSeat} bill. Add from right menu catalog.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-slate-200 rounded-xl text-xs"
                >
                  <div className="flex-1 pr-2 truncate">
                    <div className="font-bold text-slate-900 truncate">{it.name}</div>
                    <div className="text-[10px] text-slate-500">Seat {activeSeat} &bull; ₹{it.price} each</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-[#9C3D1E]">
                      {it.stage}
                    </span>
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5">
                      <button
                        type="button"
                        onClick={() => updateItemQty(it.id, -1)}
                        className="text-slate-500 hover:text-black font-bold p-0.5 cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono font-bold px-1">{it.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateItemQty(it.id, 1)}
                        className="text-slate-500 hover:text-black font-bold p-0.5 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="w-14 text-right font-black font-mono text-slate-900">
                      ₹{it.price * it.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pricing Calculation Summary */}
          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">₹{subtotal}</span>
            </div>

            {/* Discount selector */}
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <Percent className="h-3 w-3 text-orange-600" />
                <span>Discount:</span>
              </span>
              <div className="flex items-center gap-1">
                {[0, 5, 10, 15, 20].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiscountPercent(d)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      discountPercent === d ? 'bg-[#9C3D1E] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {d === 0 ? 'None' : `${d}%`}
                  </button>
                ))}
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between text-[#9C3D1E] font-bold">
                <span>Discount Savings:</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>GST (5%):</span>
              <span className="font-mono">₹{gst}</span>
            </div>

            <div className="flex items-center justify-between text-slate-900 font-black text-base border-t border-slate-300 pt-2">
              <span>Total Seat Bill:</span>
              <span className="text-[#9C3D1E] font-mono text-xl">₹{grandTotal}</span>
            </div>
          </div>

          {/* Payment Method Selector & Settle Button */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                { id: 'CASH', label: 'Cash Desk', icon: Banknote },
                { id: 'CARD', label: 'Card / EDC', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition cursor-pointer ${
                      paymentMethod === m.id
                        ? 'border-[#9C3D1E] bg-orange-50 text-[#9C3D1E] shadow-xs'
                        : 'border-slate-200 bg-[#FAF8F5] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {settledSuccess ? (
              <div className="w-full py-3 bg-emerald-600 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Seat #{activeSeat} Bill Settled Successfully! Printing Receipt...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSettle}
                disabled={items.length === 0}
                className="w-full py-3 bg-[#9C3D1E] text-white rounded-xl font-mono text-xs font-black uppercase tracking-wider shadow-xs hover:bg-orange-700 transition disabled:opacity-40 cursor-pointer"
              >
                Settle &amp; Close Seat #{activeSeat} ({paymentMethod} ₹{grandTotal})
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Direct Menu Catalog (~40% / lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-[#9C3D1E]" />
              <h3 className="font-mono text-xs font-black uppercase text-slate-900">
                Menu Catalog (Direct Add to Seat #{activeSeat})
              </h3>
            </div>
          </div>

          {/* Search & Category filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {MENU_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#9C3D1E] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes list */}
          <div className="space-y-1.5 max-h-96 overflow-y-auto no-scrollbar pt-1">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                onClick={() => handleAddDirectItem(dish)}
                className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 transition cursor-pointer select-none text-xs"
              >
                <div className="pr-2 truncate">
                  <span className="font-bold text-slate-900 block truncate">{dish.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">₹{dish.price}</span>
                </div>
                <button
                  type="button"
                  className="px-2 py-1 bg-[#9C3D1E] text-white rounded font-bold text-[10px] hover:bg-orange-700 transition cursor-pointer"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thermal Slip Preview Dialog */}
      {printThermalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-black font-mono w-full max-w-sm rounded-xl p-5 space-y-3 shadow-xl">
            <div className="text-center space-y-1 border-b border-black/20 pb-2">
              <h3 className="font-black text-sm uppercase">THOOGUDEEPA DONNE BIRYANI MANE</h3>
              <p className="text-[10px]">Opposite Town Hall, Bengaluru</p>
              <p className="text-[10px]">GSTIN: 29AABCT1234F1Z0</p>
            </div>
            <div className="text-xs flex justify-between">
              <span>Seat: #{activeSeat}</span>
              <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
            </div>
            <div className="border-t border-b border-black/20 py-2 space-y-1 text-xs">
              {items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.qty}x {it.name}</span>
                  <span>₹{it.price * it.qty}</span>
                </div>
              ))}
            </div>
            <div className="text-xs flex justify-between font-bold">
              <span>Grand Total:</span>
              <span>₹{grandTotal}</span>
            </div>
            <button
              type="button"
              onClick={() => setPrintThermalOpen(false)}
              className="w-full py-2 bg-black text-white text-xs font-bold rounded cursor-pointer mt-2"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* 100-Seat Floor Matrix Modal */}
      {seatPickerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-2 border-[#9C3D1E] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-slate-900">
            {/* Modal Header */}
            <div className="p-4 bg-[#FAF8F5] border-b border-[#EAE5DF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9C3D1E] text-white shadow-xs">
                  <Grid className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    Select Any Seat &bull; 100-Seat Restaurant Floor
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Click any seat (01 - 100) to view, add items, or settle its bill
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSeatPickerModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Tabs & Quick Filter */}
            <div className="p-3 bg-white border-b border-[#EAE5DF] flex flex-wrap items-center justify-between gap-2">
              {/* Zone Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'ALL', label: 'All 100' },
                  { id: 'Z1', label: 'Z1 (01-25)' },
                  { id: 'Z2', label: 'Z2 (26-50)' },
                  { id: 'Z3', label: 'Z3 (51-75)' },
                  { id: 'Z4', label: 'Z4 (76-100)' },
                ].map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setModalZoneFilter(z.id as any)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      modalZoneFilter === z.id
                        ? 'bg-[#9C3D1E] text-white shadow-xs'
                        : 'bg-[#FAF8F5] border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {z.label}
                  </button>
                ))}
              </div>

              {/* Search Seat Input */}
              <div className="relative">
                <Search className="h-3 w-3 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter seat #..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-32 bg-[#FAF8F5] border border-slate-300 rounded pl-7 pr-2 py-1 text-xs font-mono text-slate-900 outline-none focus:ring-1 focus:ring-[#9C3D1E]"
                />
              </div>
            </div>

            {/* 100 Seats Grid */}
            <div className="p-4 overflow-y-auto max-h-[55vh]">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {modalFilteredSeats.map((numStr) => {
                  const isSelected = activeSeat === numStr;
                  const hasOrder = liveOccupiedSeats.has(numStr);

                  return (
                    <button
                      key={numStr}
                      type="button"
                      onClick={() => {
                        handleSwitchSeat(numStr);
                        setSeatPickerModalOpen(false);
                      }}
                      className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? 'border-[#9C3D1E] bg-[#9C3D1E] text-white font-black shadow-md scale-105 ring-2 ring-orange-300'
                          : hasOrder
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 font-bold'
                          : 'border-slate-200 bg-[#FAF8F5] text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider opacity-75">
                        Seat
                      </span>
                      <span className="text-sm font-black font-mono">
                        #{numStr}
                      </span>
                      {hasOrder && !isSelected && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />
                      )}
                      {isSelected && (
                        <span className="text-[9px] uppercase font-black text-amber-200 mt-0.5">
                          ACTIVE
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#FAF8F5] border-t border-[#EAE5DF] flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#9C3D1E]" /> Active
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Has Bill
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Vacant
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSeatPickerModalOpen(false)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
