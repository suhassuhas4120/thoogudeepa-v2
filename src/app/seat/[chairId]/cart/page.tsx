'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Heart, Minus, Plus, Bell } from 'lucide-react';
import { useCart } from '../../../../lib/context/CartContext';
import CustomerBottomNav from '../../../../components/navigation/CustomerBottomNav';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';

export default function CustomerCartPage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to menu
  useHardwareBack(`/seat/${chairId}/menu`);

  const { items, getItemQuantity, updateQuantity, likedItems } = useCart();
  const likedCount = Object.values(likedItems).filter(Boolean).length;

  // Items currently active in cart (excluding any with 0 quantity)
  const defaultItems = ['1', '2', '3', '4', '5'];
  const combinedIds = Array.from(new Set([...Object.keys(items), ...defaultItems]));
  const activeItemIds = combinedIds.filter((id) => {
    if (items[id] !== undefined) {
      return items[id].quantity > 0;
    }
    return defaultItems.includes(id);
  });

  // Additional items for the horizontal slidable row
  const extraItems = ['6', '7', '8', '9', '10'];

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-36">
      {/* Top and Middle Content */}
      <div className="w-full flex flex-col gap-5">
        {/* Top Header without X icon */}
        <header className="w-full flex items-center justify-between py-2 border-b border-zinc-200 pb-3">
          {/* Back Navigation Button */}
          <Link
            href={`/seat/${chairId}/menu`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70"
            aria-label="Back to Menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Center Title */}
          <h1 className="text-lg font-bold tracking-tight">Cart</h1>

          {/* Right Bell Notification */}
          <Link
            href={`/seat/${chairId}/assistant?from=${encodeURIComponent(`/seat/${chairId}/cart`)}`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
            aria-label="Assistant & Call Waiter"
          >
            <Bell className="w-5 h-5" />
          </Link>
        </header>

        {/* Like Items (7) Section above cart items */}
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

        {/* Cart Item Cards List with enlarged circular images */}
        <div className="w-full flex flex-col gap-3.5">
          {activeItemIds.map((itemId) => {
            const qty = getItemQuantity(itemId) || 2;

            return (
              <div
                key={itemId}
                className="w-full border border-black rounded-2xl p-3 flex items-center justify-between bg-white shadow-sm gap-3"
              >
                {/* Enlarged Circular Image Placeholder */}
                <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center shrink-0 bg-white">
                  <span className="text-xs font-bold">Image</span>
                </div>

                {/* Center Title and Price Section */}
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-bold truncate">
                    Item Title {itemId}
                  </span>
                  <span className="text-xs font-bold text-zinc-800">
                    ₹ ---
                  </span>
                </div>

                {/* Right Stepper Pill */}
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

        {/* Horizontal Slidable Row with Enlarged Images (Above Promo Code) */}
        <div className="w-full flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              Add More Items
            </span>
          </div>

          <div className="w-full flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
            {extraItems.map((extraId) => {
              const extraQty = getItemQuantity(extraId);

              return (
                <div
                  key={extraId}
                  className="w-36 shrink-0 border border-black rounded-xl p-3 flex flex-col items-center text-center bg-white"
                >
                  {/* Enlarged Circular Image for Slidable Item */}
                  <div className="w-18 h-18 rounded-full border-2 border-black flex items-center justify-center mb-2 bg-white">
                    <span className="text-[11px] font-bold">Image</span>
                  </div>

                  {/* Title & Price */}
                  <span className="text-xs font-bold truncate w-full">
                    Extra Item {extraId}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-800 mt-0.5">
                    ₹ ---
                  </span>

                  {/* Quick Add Button or mini stepper */}
                  {extraQty === 0 ? (
                    <button
                      type="button"
                      onClick={() => updateQuantity(extraId, 1)}
                      className="w-full mt-2 py-1.5 border border-black rounded text-[11px] font-bold uppercase bg-black text-white cursor-pointer active:opacity-80"
                    >
                      + Add
                    </button>
                  ) : (
                    <div className="w-full mt-2 flex items-center justify-between border border-black rounded bg-black text-white px-2 py-1">
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

        {/* Bill Breakdown / Summary Section */}
        <div className="w-full flex flex-col gap-2.5 border-t border-zinc-300 pt-4 text-xs font-semibold">
          <div className="w-full flex items-center justify-between text-zinc-700">
            <span>Subtotal</span>
            <span>₹ ---</span>
          </div>
          <div className="w-full flex items-center justify-between text-zinc-700">
            <span>GST</span>
            <span>₹ ---</span>
          </div>
          <div className="w-full border-t border-black pt-2 flex items-center justify-between text-sm font-black">
            <span>Total</span>
            <span>₹ ---</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Place Order Button above the bottom nav icons */}
      <div className="sticky bottom-16 z-30 w-full bg-white/95 backdrop-blur-sm pt-2 pb-2">
        <Link
          href={`/seat/${chairId}/tracking`}
          className="w-full flex items-center justify-center gap-2.5 border-2 border-black bg-black text-white py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl cursor-pointer active:opacity-80 transition-opacity shadow-md"
        >
          <span>Place Order</span>
          <span className="w-5 h-5 rounded-full bg-white text-black text-xs font-black flex items-center justify-center shrink-0">
            {activeItemIds.length}
          </span>
        </Link>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <CustomerBottomNav chairId={chairId} activeTab="cart" />
    </div>
  );
}
