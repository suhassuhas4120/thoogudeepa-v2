'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  Bell,
  ShoppingCart,
  Search,
  Heart,
  ShoppingBag,
  User,
  Home,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import { useCart } from '../../../../lib/context/CartContext';
import CustomerBottomNav from '../../../../components/navigation/CustomerBottomNav';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';

export default function CustomerMenuPage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to seat entrance
  useHardwareBack(`/seat/${chairId}`);

  const { getItemQuantity, updateQuantity, totalItemCount, toggleLike, isItemLiked, likedItems } = useCart();

  const [searchQuery, setSearchQuery] = useState('');

  // 8 sample card skeletons matching the 2-column layout
  const cards = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative">
      {/* Scrollable Content Container */}
      <div className="w-full flex-1 px-4 pt-4 pb-24">
        {/* Top Header Section with Back Navigation */}
        <header className="w-full flex items-center justify-between py-2">
          {/* Back Navigation Button to Screen 1 */}
          <Link
            href={`/seat/${chairId}`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70"
            aria-label="Back to Seat"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Center Title Space */}
          <div className="text-center">
            <span className="text-base font-bold tracking-tight">Title</span>
          </div>

          {/* Right Spacer for Header Balance */}
          <div className="w-10 h-10" />
        </header>

        {/* Sticky Search & Category Bar Section pinned on scroll */}
        <div className="sticky top-0 z-20 bg-white pt-2 pb-3 flex flex-col gap-3 -mx-4 px-4 border-b border-zinc-100">
          {/* Row 1: Search Bar (Reduced Size) with Bell & Cart Beside It */}
          <div className="w-full flex items-center gap-2">
            {/* Reduced Search Input Container */}
            <div className="flex-1 border border-black rounded-2xl flex items-center px-3.5 py-2.5 gap-2 bg-white min-w-0">
              <Search className="w-4 h-4 text-black shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full text-sm outline-none bg-transparent text-black min-w-0"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-5 h-5 rounded-full border border-black flex items-center justify-center cursor-pointer active:opacity-70 shrink-0"
                  aria-label="Clear Search"
                >
                  <X className="w-3 h-3 text-black" />
                </button>
              )}
            </div>

            {/* Bell Icon Button beside Search */}
            <Link
              href={`/seat/${chairId}/assistant?from=${encodeURIComponent(`/seat/${chairId}/menu`)}`}
              className="w-11 h-11 border border-black rounded-2xl flex items-center justify-center cursor-pointer active:opacity-70 bg-white shrink-0 shadow-xs"
              aria-label="Assistant & Call Waiter"
            >
              <Bell className="w-5 h-5" />
            </Link>

            {/* Cart Icon Button beside Search with badge */}
            <Link
              href={`/seat/${chairId}/cart`}
              className="relative w-11 h-11 border border-black rounded-2xl flex items-center justify-center cursor-pointer active:opacity-80 bg-white shrink-0 shadow-xs"
              aria-label="Open Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border border-white">
                  {totalItemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Row 2: Category Filter Pills Section */}
          <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              className="px-4 py-1.5 rounded-xl text-xs font-bold border border-black bg-black text-white whitespace-nowrap"
            >
              Category 1
            </button>
            <button
              type="button"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold border border-black bg-white text-black whitespace-nowrap"
            >
              Category 2
            </button>
            <button
              type="button"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold border border-black bg-white text-black whitespace-nowrap"
            >
              Category 3
            </button>
            <button
              type="button"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold border border-black bg-white text-black whitespace-nowrap"
            >
              Category 4
            </button>
          </div>
        </div>

        {/* 2-Column Product Cards Grid with enlarged circular image area */}
        <div className="w-full grid grid-cols-2 gap-x-3.5 gap-y-20 mt-18">
          {cards.map((num) => {
            const currentQty = getItemQuantity(String(num));
            const isLiked = likedItems[String(num)];

            return (
              <div
                key={num}
                className="relative border border-black rounded-2xl pt-18 sm:pt-20 pb-3.5 px-3 flex flex-col items-center text-center bg-white"
              >
                {/* Clickable Card Body opening Screen 3 */}
                <Link
                  href={`/seat/${chairId}/item/${num}`}
                  className="w-full flex flex-col items-center cursor-pointer active:opacity-75"
                >
                  {/* Enlarged Overlapping Circular Image Placeholder */}
                  <div className="absolute -top-14 sm:-top-16 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-black bg-white flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold">Image</span>
                  </div>

                  {/* Title Section */}
                  <div className="w-full text-xs font-bold mt-1 line-clamp-2">
                    Item Title {num}
                  </div>

                  {/* Short Description Section */}
                  <div className="w-full text-[10px] text-zinc-600 mt-1 line-clamp-2">
                    Short description line goes here
                  </div>

                  {/* Price Section */}
                  <div className="w-full text-sm font-bold mt-2">
                    ₹ ---
                  </div>
                </Link>

                {/* Bottom Row: Stepper/Add Button + Small Heart Like Button */}
                <div className="w-full mt-2.5 flex items-center gap-1.5">
                  {currentQty === 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateQuantity(String(num), 1);
                      }}
                      className="flex-1 py-1.5 border border-black rounded-lg text-xs font-bold uppercase tracking-wider bg-black text-white cursor-pointer active:opacity-80"
                    >
                      Add
                    </button>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="flex-1 flex items-center justify-between border-2 border-black rounded-lg bg-black text-white px-1.5 py-1"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateQuantity(String(num), currentQty - 1);
                        }}
                        className="w-6 h-6 flex items-center justify-center font-bold text-base cursor-pointer active:opacity-60"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black">{currentQty}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateQuantity(String(num), currentQty + 1);
                        }}
                        className="w-6 h-6 flex items-center justify-center font-bold text-base cursor-pointer active:opacity-60"
                        aria-label="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Small Heart Like Button beside Add */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleLike(String(num));
                    }}
                    className={`w-7 h-7 shrink-0 border border-black rounded-lg flex items-center justify-center cursor-pointer transition-all active:scale-90 ${
                      isItemLiked(String(num)) ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                    aria-label="Like item"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isItemLiked(String(num)) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <CustomerBottomNav chairId={chairId} activeTab="home" />
    </div>
  );
}
