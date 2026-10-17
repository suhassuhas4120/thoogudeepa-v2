'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Bell, Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '../../../../lib/context/CartContext';
import CustomerBottomNav from '../../../../components/navigation/CustomerBottomNav';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';

export default function CustomerLikesPage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to menu
  useHardwareBack(`/seat/${chairId}/menu`);

  const { likedItems, toggleLike, getItemQuantity, updateQuantity } = useCart();

  // All catalog items
  const catalog = [
    { id: '1', title: 'Item Title 1', subtitle: 'Chef special recipe', price: '₹ ---' },
    { id: '2', title: 'Item Title 2', subtitle: 'Traditional preparation', price: '₹ ---' },
    { id: '3', title: 'Item Title 3', subtitle: 'Freshly seasoned', price: '₹ ---' },
    { id: '4', title: 'Item Title 4', subtitle: 'Signature dish', price: '₹ ---' },
    { id: '5', title: 'Item Title 5', subtitle: 'Special blend', price: '₹ ---' },
    { id: '6', title: 'Item Title 6', subtitle: 'Authentic taste', price: '₹ ---' },
  ];

  // Filter only items currently liked
  const likedList = catalog.filter((item) => likedItems[item.id]);

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-24">
      {/* Scrollable Content Container */}
      <div className="w-full flex flex-col gap-5">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between py-2 border-b border-zinc-200 pb-3">
          {/* Back Navigation Button to Menu */}
          <Link
            href={`/seat/${chairId}/menu`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
            aria-label="Back to Menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Center Title */}
          <h1 className="text-base font-bold tracking-tight">Liked Items</h1>

          {/* Right Notification Bell */}
          <Link
            href={`/seat/${chairId}/assistant?from=${encodeURIComponent(`/seat/${chairId}/likes`)}`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
            aria-label="Assistant & Call Waiter"
          >
            <Bell className="w-5 h-5" />
          </Link>
        </header>

        {/* Liked Items Grid / List */}
        {likedList.length === 0 ? (
          <div className="w-full border-2 border-black rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-3 bg-white mt-8 shadow-sm">
            <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center bg-zinc-50">
              <Heart className="w-8 h-8 text-zinc-400" />
            </div>
            <span className="text-sm font-black uppercase tracking-wider">No Liked Items</span>
            <p className="text-xs text-zinc-500">
              Tap the heart icon on any dish card in the menu to add it to your liked section.
            </p>
            <Link
              href={`/seat/${chairId}/menu`}
              className="mt-2 border-2 border-black bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 gap-3.5">
            {likedList.map((item) => {
              const currentQty = getItemQuantity(item.id);

              return (
                <div
                  key={item.id}
                  className="w-full border border-black rounded-2xl p-3 flex flex-col justify-between bg-white shadow-xs"
                >
                  <Link
                    href={`/seat/${chairId}/item/${item.id}`}
                    className="w-full flex flex-col items-center cursor-pointer"
                  >
                    {/* Enlarged Circular Image Placeholder */}
                    <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center mb-2.5 bg-white shadow-xs">
                      <span className="text-xs font-bold">Image</span>
                    </div>

                    <span className="text-xs font-bold text-center truncate w-full">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 text-center truncate w-full">
                      {item.subtitle}
                    </span>
                    <span className="text-xs font-black mt-1">{item.price}</span>
                  </Link>

                  {/* Actions Row: Add/Stepper + Unlike Button */}
                  <div className="w-full flex items-center gap-2 mt-3 pt-2 border-t border-zinc-100">
                    {currentQty === 0 ? (
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex-1 py-1.5 border-2 border-black rounded-lg text-xs font-bold uppercase bg-black text-white cursor-pointer active:opacity-80"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center justify-between border-2 border-black rounded-lg bg-black text-white px-1.5 py-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, currentQty - 1)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-base cursor-pointer active:opacity-60"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black">{currentQty}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, currentQty + 1)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-base cursor-pointer active:opacity-60"
                          aria-label="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Unlike Heart Button */}
                    <button
                      type="button"
                      onClick={() => toggleLike(item.id)}
                      className="w-7 h-7 shrink-0 border border-black rounded-lg flex items-center justify-center cursor-pointer bg-black text-white active:scale-90"
                      aria-label="Remove from liked"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation Bar with Likes active */}
      <CustomerBottomNav chairId={chairId} activeTab="likes" />
    </div>
  );
}
