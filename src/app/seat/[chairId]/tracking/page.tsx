'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  Clock,
  Sparkles,
  UtensilsCrossed,
  PlusCircle,
  Bell,
} from 'lucide-react';
import CustomerBottomNav from '../../../../components/navigation/CustomerBottomNav';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';

export default function LiveOrderTrackingPage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to cart
  useHardwareBack(`/seat/${chairId}/cart`);

  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;

  // 3 sample tracking cards matching the screenshot
  const trackingItems = [
    {
      id: '1',
      tag: "Chef's Special",
      title: 'Item Title 1',
      subtitle: 'Regular | Spicy',
      note: 'Freshly prepared with authentic ingredients',
      price: '₹ ---',
      statusText: 'Preparing',
      currentStep: 3, // 1 to 5
    },
    {
      id: '2',
      tag: 'Popular',
      title: 'Item Title 2',
      subtitle: 'Regular | Medium Spicy',
      note: 'Rich flavor, premium preparation',
      price: '₹ ---',
      statusText: 'Preparing',
      currentStep: 3,
    },
    {
      id: '3',
      tag: 'Veg Option',
      title: 'Item Title 3',
      subtitle: 'Regular | Chilled',
      note: 'Refreshing and fresh',
      price: '₹ ---',
      statusText: 'In Kitchen',
      currentStep: 2,
    },
  ];

  // 5 progress steps
  const steps = [
    { label: 'Placed', time: '09:32 PM' },
    { label: 'Received', time: '09:34 PM' },
    { label: 'Preparing', time: '09:41 PM' },
    { label: 'Ready', time: '--:--' },
    { label: 'Served', time: '--:--' },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-24">
      {/* Scrollable Content Container */}
      <div className="w-full flex flex-col gap-4">
        {/* Top Header - Back icon goes back to Cart page */}
        <header className="w-full flex items-center justify-between py-2 border-b border-zinc-200 pb-3">
          {/* Back Navigation Button to Cart Page */}
          <Link
            href={`/seat/${chairId}/cart`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70"
            aria-label="Back to Cart"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Center Brand Title */}
          <div className="text-center flex flex-col items-center">
            <span className="text-sm font-black tracking-wider uppercase">
              THOOGUDEEPA
            </span>
            <span className="text-[10px] text-zinc-500 tracking-tight">
              Donne Biryani Mane
            </span>
          </div>

          {/* Right Seat Badge & Bell Notification */}
          <div className="flex items-center gap-1.5">
            <div className="border border-black px-2.5 py-1 rounded-lg text-xs font-bold bg-white">
              Seat {seatNumber}
            </div>
            <Link
              href={`/seat/${chairId}/assistant?from=${encodeURIComponent(`/seat/${chairId}/tracking`)}`}
              className="w-9 h-9 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
              aria-label="Assistant & Call Waiter"
            >
              <Bell className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Live Order Tracking Banner / Header */}
        <div className="w-full border-2 border-black rounded-2xl p-4 flex items-center justify-between bg-white shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-black" />
              <h2 className="text-base font-black tracking-tight">
                Live Order Tracking
              </h2>
            </div>
            <p className="text-xs text-zinc-600">
              Your food is being prepared! Sit back and relax.
            </p>
          </div>
          <div className="border border-black p-2 rounded-xl text-center shrink-0">
            <Sparkles className="w-4 h-4 mx-auto mb-0.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider block">
              Live State
            </span>
          </div>
        </div>

        {/* 3 Item Tracking Cards with Enlarged Circular Image and 5-Step Horizontal Progress Tracker */}
        <div className="w-full flex flex-col gap-4">
          {trackingItems.map((item) => (
            <div
              key={item.id}
              className="w-full border-2 border-black rounded-2xl p-3.5 flex flex-col gap-3 bg-white shadow-sm"
            >
              {/* Card Top Row with Enlarged Image and without > icon */}
              <div className="w-full flex items-start justify-between gap-3">
                {/* Left: Tag + Enlarged Circular Image */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider border border-black px-1.5 py-0.5 rounded">
                    {item.tag}
                  </span>
                  <div className="w-22 h-22 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-sm">
                    <span className="text-xs font-bold">Image</span>
                  </div>
                </div>

                {/* Middle: Title & Details */}
                <div className="flex-1 flex flex-col gap-0.5 min-w-0 pt-1">
                  <h3 className="text-sm font-bold truncate">{item.title}</h3>
                  <span className="text-[11px] text-zinc-700">{item.subtitle}</span>
                  <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">
                    {item.note}
                  </p>
                </div>

                {/* Right: Price & Status Tag (Chevron > removed) */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 pt-1">
                  <span className="text-sm font-black">{item.price}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider border border-black bg-black text-white px-2 py-0.5 rounded-full">
                    {item.statusText}
                  </span>
                </div>
              </div>

              {/* 5-Step Horizontal Progress Tracker */}
              <div className="w-full border-t border-dashed border-zinc-300 pt-3">
                <div className="w-full flex items-center justify-between relative">
                  {/* Connecting Horizontal Line */}
                  <div className="absolute top-3 left-4 right-4 h-0.5 bg-zinc-300 -z-0" />

                  {steps.map((st, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < item.currentStep;
                    const isCurrent = stepNumber === item.currentStep;

                    return (
                      <div
                        key={st.label}
                        className="flex flex-col items-center gap-1 z-10 min-w-[50px]"
                      >
                        {/* Circle Indicator */}
                        <div
                          className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold ${
                            isCompleted || isCurrent
                              ? 'bg-black text-white'
                              : 'bg-white text-zinc-400'
                          }`}
                        >
                          {isCompleted ? '✓' : stepNumber}
                        </div>

                        {/* Label & Time */}
                        <span className="text-[9px] font-bold tracking-tight text-center">
                          {st.label}
                        </span>
                        <span className="text-[8px] text-zinc-500 text-center">
                          {st.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add More Items Button linking directly to Menu Page */}
        <div className="w-full pt-1">
          <Link
            href={`/seat/${chairId}/menu`}
            className="w-full py-3 border-2 border-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-black text-white cursor-pointer active:opacity-80 transition-opacity"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add More Items</span>
          </Link>
        </div>
      </div>

      {/* Bottom Sticky Order Summary Bar with Pay button elevated above fixed bottom nav */}
      <div className="sticky bottom-[58px] z-30 w-full max-w-md bg-white border-t-2 border-black py-3 px-4 mt-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 border border-black rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold">Order Summary</span>
            <span className="text-[11px] text-zinc-600 font-semibold">
              3 Items &bull; ₹ ---
            </span>
          </div>
        </div>

        {/* Pay Button linking to Order Summary Bill page */}
        <Link
          href={`/seat/${chairId}/bill`}
          className="px-6 py-2.5 border-2 border-black bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg active:opacity-80 cursor-pointer text-center"
        >
          Pay
        </Link>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <CustomerBottomNav chairId={chairId} />
    </div>
  );
}
