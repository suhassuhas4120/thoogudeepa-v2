'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Bell, User, Clock, Heart, ShoppingBag, UtensilsCrossed, BookOpen, ReceiptText } from 'lucide-react';
import CustomerBottomNav from '../../../../components/navigation/CustomerBottomNav';
import { useCart } from '../../../../lib/context/CartContext';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';

export default function CustomerProfilePage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to menu
  useHardwareBack(`/seat/${chairId}/menu`);

  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;
  const { totalItemCount, likedItems } = useCart();
  const likedCount = Object.values(likedItems).filter(Boolean).length;

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-28">
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
          <h1 className="text-base font-bold tracking-tight">Profile</h1>

          {/* Right Notification Bell */}
          <Link
            href={`/seat/${chairId}/assistant?from=${encodeURIComponent(`/seat/${chairId}/profile`)}`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
            aria-label="Assistant & Call Waiter"
          >
            <Bell className="w-5 h-5" />
          </Link>
        </header>

        {/* Profile Avatar & Seat Badge */}
        <div className="w-full border-2 border-black rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 bg-white shadow-sm">
          <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center bg-zinc-50 shadow-xs">
            <User className="w-10 h-10 text-black stroke-[1.8]" />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-base font-black tracking-tight">Seat #{seatNumber} Guest</span>
            <span className="text-xs text-zinc-500 font-semibold">Active Dining Session</span>
          </div>

          <div className="border border-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-100">
            Chair #{seatNumber} &bull; Section A
          </div>
        </div>

        {/* Quick Activity Shortcuts */}
        <div className="w-full flex flex-col gap-2.5">
          <span className="text-xs font-black uppercase tracking-wider">
            Quick Actions
          </span>

          <div className="w-full flex flex-col gap-2">
            <Link
              href={`/seat/${chairId}/tracking`}
              className="w-full border-2 border-black rounded-2xl p-4 flex items-center justify-between bg-white hover:bg-zinc-50 cursor-pointer active:opacity-80 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-black" />
                <span className="text-xs font-bold">Live Order Tracking</span>
              </div>
              <span className="text-xs font-black">&rarr;</span>
            </Link>

            <Link
              href={`/seat/${chairId}/likes`}
              className="w-full border-2 border-black rounded-2xl p-4 flex items-center justify-between bg-white hover:bg-zinc-50 cursor-pointer active:opacity-80 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-black" />
                <span className="text-xs font-bold">Wishlist / Liked Items</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {likedCount}
                </span>
                <span className="text-xs font-black">&rarr;</span>
              </div>
            </Link>

            <Link
              href={`/seat/${chairId}/cart`}
              className="w-full border-2 border-black rounded-2xl p-4 flex items-center justify-between bg-white hover:bg-zinc-50 cursor-pointer active:opacity-80 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-black" />
                <span className="text-xs font-bold">Cart Items</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {totalItemCount}
                </span>
                <span className="text-xs font-black">&rarr;</span>
              </div>
            </Link>

            {/* View Menu Button below Cart Items */}
            <Link
              href={`/seat/${chairId}/menu`}
              className="w-full border-2 border-black rounded-2xl p-4 flex items-center justify-between bg-white hover:bg-zinc-50 cursor-pointer active:opacity-80 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-black" />
                <span className="text-xs font-bold">View Menu</span>
              </div>
              <span className="text-xs font-black">&rarr;</span>
            </Link>

            {/* View Your Bill Button below View Menu linking to receipt page */}
            <Link
              href={`/seat/${chairId}/receipt`}
              className="w-full border-2 border-black rounded-2xl p-4 flex items-center justify-between bg-white hover:bg-zinc-50 cursor-pointer active:opacity-80 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <ReceiptText className="w-5 h-5 text-black" />
                <span className="text-xs font-bold">View Your Bill</span>
              </div>
              <span className="text-xs font-black">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar with Profile Active */}
      <CustomerBottomNav chairId={chairId} activeTab="profile" />
    </div>
  );
}
