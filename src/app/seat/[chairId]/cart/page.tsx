'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Heart, Minus, Plus, Bell, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../../../lib/context/CartContext';
import CustomerBottomNav from '../../../../components/navigation/CustomerBottomNav';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';
import { realtimeBridge } from '../../../../lib/supabase';
import { setActiveDiningSession } from '../../../../lib/session/diningSession';

const DISH_CATALOG: Record<string, { title: string; price: number; desc: string }> = {
  '1': { title: 'Signature Chicken Donne Biryani', price: 240, desc: 'Seeraga samba rice steamed with coriander herbal masala' },
  '2': { title: 'Mutton Donne Biryani', price: 340, desc: 'Slow-cooked succulent tender goat meat in palm leaf donne cups' },
  '3': { title: 'Kshatriya Donne Biryani', price: 270, desc: 'Crispy fried spiced chicken cuts on donne rice' },
  '4': { title: 'Egg Donne Biryani', price: 190, desc: 'Pan-roasted masala eggs on aromatic donne rice' },
  '5': { title: 'Gunfire Chicken Kebab', price: 210, desc: 'Crispy military chicken kebabs with lemon slices' },
  '6': { title: 'Chicken Sukka', price: 230, desc: 'Pan-roasted tender spiced chicken with curry leaves' },
  '7': { title: 'Mutton Chukka', price: 330, desc: 'Boneless tender goat meat in rich pepper gravy' },
  '8': { title: 'Guntur Chilli Chicken', price: 220, desc: 'Hot red chilli and green peppercorn sauté' },
  '9': { title: 'Donne Khushka Rice', price: 150, desc: 'Fragrant seasoned donne biryani rice without meat' },
  '10': { title: 'Chilled Spiced Buttermilk', price: 60, desc: 'Cooling herbal yoghurt with ginger & coriander' },
};

export default function CustomerCartPage() {
  const params = useParams();
  const router = useRouter();
  const chairId = (params?.chairId as string) || '12';
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Device hardware back button & swipe back: return to menu
  useHardwareBack(`/seat/${chairId}/menu`);

  const { items, getItemQuantity, updateQuantity, likedItems } = useCart();
  const likedCount = Object.values(likedItems).filter(Boolean).length;

  // Real items present in cart with quantity > 0 (strictly zero dummy items)
  const activeItemIds = useMemo(() => {
    return Object.keys(items).filter((id) => (items[id]?.quantity || 0) > 0);
  }, [items]);

  // Slidable suggestions to complement meal
  const extraItems = ['5', '6', '8', '9', '10'].filter((id) => !activeItemIds.includes(id));

  // Compute live subtotal, GST (5%), and total
  const subtotal = useMemo(() => {
    return activeItemIds.reduce((sum, id) => {
      const qty = items[id]?.quantity || 0;
      const price = DISH_CATALOG[id]?.price || 240;
      return sum + price * qty;
    }, 0);
  }, [activeItemIds, items]);

  const gstAmount = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gstAmount;

  const handlePlaceOrder = async () => {
    if (isSubmitting || activeItemIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const ticketNum = `TK-${chairId}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const orderItems = activeItemIds.map((id) => {
        const qty = items[id]?.quantity || 1;
        const catalogEntry = DISH_CATALOG[id] || { title: `Military Dish #${id}`, price: 240 };
        return {
          chair_id: chairId,
          seat_label: `SEAT ${chairId}`,
          dish_id: `dish-${id}`,
          dish_name: catalogEntry.title,
          quantity: qty,
          price: catalogEntry.price,
          stage: 'REC' as const,
        };
      });

      const orderRecord = {
        ticket_number: ticketNum,
        chair_id: chairId,
        seat_label: `SEAT ${chairId}`,
        status: 'pending' as const,
        total_amount: grandTotal,
      };

      const result = await realtimeBridge.placeOrder(orderRecord, orderItems);
      const generatedOrderId = result.orderId || `ord-${Date.now()}`;

      setActiveDiningSession({
        seatId: chairId,
        ticketNumber: ticketNum,
        orderId: generatedOrderId,
        orderStatus: 'pending',
        paymentStatus: 'unpaid',
        orderedAt: Date.now(),
        totalAmount: grandTotal,
      });

      router.push(`/seat/${chairId}/tracking`);
    } catch (err) {
      console.error('Order dispatch error:', err);
      router.push(`/seat/${chairId}/tracking`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-36">
      {/* Top and Middle Content */}
      <div className="w-full flex flex-col gap-5">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between py-2 border-b border-zinc-200 pb-3">
          <Link
            href={`/seat/${chairId}/menu`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70"
            aria-label="Back to Menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <h1 className="text-lg font-bold tracking-tight">Cart</h1>

          <Link
            href={`/seat/${chairId}/assistant?from=${encodeURIComponent(`/seat/${chairId}/cart`)}`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
            aria-label="Assistant & Call Waiter"
          >
            <Bell className="w-5 h-5" />
          </Link>
        </header>

        {/* Liked Items Quick Access Bar */}
        <Link
          href={`/seat/${chairId}/likes`}
          className="w-full border-2 border-black rounded-2xl p-2.5 px-3 flex items-center justify-between bg-white hover:bg-zinc-50 active:opacity-80 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-black fill-black" />
            <span className="text-xs font-black uppercase tracking-wider">
              Items You Liked ({likedCount})
            </span>
          </div>
          <span className="text-xs font-bold text-zinc-600 flex items-center gap-1">
            View &rarr;
          </span>
        </Link>

        {/* Empty Cart View */}
        {activeItemIds.length === 0 ? (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center gap-3.5 border-2 border-dashed border-zinc-300 rounded-3xl bg-zinc-50/50 p-6 my-2">
            <div className="w-16 h-16 rounded-full border-2 border-black bg-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-7 h-7 text-black" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-black uppercase tracking-tight text-zinc-950">
                Your Tray is Empty
              </h2>
              <p className="text-xs text-zinc-500 font-medium max-w-xs leading-relaxed">
                You have not selected any military delicacies yet. Browse our donne biryanis and authentic starters to start ordering!
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
          /* Active Cart Items List */
          <div className="w-full flex flex-col gap-3.5">
            {activeItemIds.map((itemId) => {
              const qty = getItemQuantity(itemId) || 1;
              const dish = DISH_CATALOG[itemId] || { title: `Military Dish #${itemId}`, price: 240, desc: 'Fresh authentic preparation' };

              return (
                <div
                  key={itemId}
                  className="w-full border border-black rounded-2xl p-3 flex items-center justify-between bg-white shadow-sm gap-3"
                >
                  {/* Circular Image Placeholder */}
                  <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center shrink-0 bg-zinc-100">
                    <span className="text-[10px] font-black uppercase text-zinc-700">Dish</span>
                  </div>

                  {/* Title and Price Section */}
                  <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-bold text-zinc-950 truncate">
                      {dish.title}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-500 line-clamp-1">
                      {dish.desc}
                    </span>
                    <span className="text-xs font-black text-zinc-900 mt-0.5">
                      ₹ {dish.price}
                    </span>
                  </div>

                  {/* Stepper Pill */}
                  <div className="flex items-center border border-black rounded-xl bg-black text-white px-2 py-1 gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(itemId, Math.max(0, qty - 1))}
                      className="w-5 h-5 flex items-center justify-center font-bold text-sm cursor-pointer active:opacity-70"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black min-w-[14px] text-center">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(itemId, qty + 1)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-sm cursor-pointer active:opacity-70"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Horizontal Slidable Recommendations */}
        {extraItems.length > 0 && (
          <div className="w-full flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Add More Items
              </span>
            </div>

            <div className="w-full flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
              {extraItems.map((extraId) => {
                const dish = DISH_CATALOG[extraId] || { title: `Extra Dish #${extraId}`, price: 180 };
                const extraQty = getItemQuantity(extraId);

                return (
                  <div
                    key={extraId}
                    className="w-36 shrink-0 border border-black rounded-xl p-3 flex flex-col items-center text-center bg-white shadow-2xs"
                  >
                    <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center mb-1.5 bg-zinc-100">
                      <span className="text-[9px] font-black uppercase text-zinc-700">Dish</span>
                    </div>

                    <span className="text-xs font-bold truncate w-full">
                      {dish.title}
                    </span>
                    <span className="text-[11px] font-black text-zinc-800 mt-0.5">
                      ₹ {dish.price}
                    </span>

                    {extraQty === 0 ? (
                      <button
                        type="button"
                        onClick={() => updateQuantity(extraId, 1)}
                        className="w-full mt-2 py-1 border border-black rounded text-[11px] font-black uppercase bg-black text-white cursor-pointer active:opacity-80"
                      >
                        + Add
                      </button>
                    ) : (
                      <div className="w-full mt-2 flex items-center justify-between border border-black rounded bg-black text-white px-2 py-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(extraId, extraQty - 1)}
                          className="text-xs font-bold px-1 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-[11px] font-bold">{extraQty}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(extraId, extraQty + 1)}
                          className="text-xs font-bold px-1 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Bill Breakdown */}
        {activeItemIds.length > 0 && (
          <div className="w-full flex flex-col gap-2.5 border-t border-zinc-300 pt-4 text-xs font-semibold">
            <div className="w-full flex items-center justify-between text-zinc-700">
              <span>Subtotal ({activeItemIds.length} dishes)</span>
              <span className="font-bold text-zinc-900">₹ {subtotal}</span>
            </div>
            <div className="w-full flex items-center justify-between text-zinc-700">
              <span>GST (5%)</span>
              <span className="font-bold text-zinc-900">₹ {gstAmount}</span>
            </div>
            <div className="w-full border-t border-black pt-2 flex items-center justify-between text-sm font-black">
              <span>Total Payable (Pay after meal)</span>
              <span className="text-base">₹ {grandTotal}</span>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Place Order Button */}
      <div className="sticky bottom-16 z-30 w-full bg-white/95 backdrop-blur-sm pt-2 pb-2">
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isSubmitting || activeItemIds.length === 0}
          className="w-full flex items-center justify-center gap-2.5 border-2 border-black bg-black text-white py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl cursor-pointer active:opacity-80 transition-opacity shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{isSubmitting ? 'Placing Order...' : activeItemIds.length === 0 ? 'Select Dishes to Order' : 'Place Order'}</span>
          {activeItemIds.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-black text-xs font-black flex items-center justify-center shrink-0">
              {activeItemIds.length}
            </span>
          )}
        </button>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <CustomerBottomNav chairId={chairId} activeTab="cart" />
    </div>
  );
}
