'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Armchair,
  User,
  UtensilsCrossed,
  Download,
  CheckCircle2,
  Smile,
  Meh,
  Frown,
  Angry,
  ChefHat,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../../../../lib/context/CartContext';
import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';

export default function CustomerReceiptPage() {
  const params = useParams();
  const chairId = (params?.chairId as string) || '12';

  // Device hardware back button & swipe back: return to profile (not payment-success)
  useHardwareBack(`/seat/${chairId}/profile`);

  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;

  const { items, getItemQuantity } = useCart();

  // Ratings feedback selector
  const [selectedRating, setSelectedRating] = useState<string>('opt-1');

  // Compute items list from cart or mock representation
  const defaultItems = [
    { name: 'Item Title 1', qty: 1, price: '₹ ---' },
    { name: 'Item Title 2', qty: 1, price: '₹ ---' },
    { name: 'Item Title 3', qty: 1, price: '₹ ---' },
  ];

  const ratingOptions = [
    { id: 'opt-1', label: 'Excellent', icon: ChefHat },
    { id: 'opt-2', label: 'Good', icon: Smile },
    { id: 'opt-3', label: 'Okay', icon: Meh },
    { id: 'opt-4', label: 'Bad', icon: Frown },
    { id: 'opt-5', label: 'Terrible', icon: Angry },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-12">
      {/* Scrollable Upper Content Container */}
      <div className="w-full flex flex-col gap-4">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between py-2 border-b border-zinc-200 pb-3">
          {/* Back Navigation Button directly returning to Profile page */}
          <Link
            href={`/seat/${chairId}/profile`}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
            aria-label="Back to Profile"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Center Title */}
          <div className="text-center flex flex-col items-center">
            <h1 className="text-sm font-black tracking-wider uppercase">
              Bill Details
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">
                Seat #{seatNumber}
              </span>
            </div>
          </div>

          {/* Spacer to keep center balanced */}
          <div className="w-10 h-10" />
        </header>

        {/* Card 1: Restaurant Identity & Order Details Card */}
        <div className="w-full border-2 border-black rounded-3xl p-4 flex flex-col gap-3 bg-white shadow-xs">
          {/* Brand Row with Circular Logo Placeholder */}
          <div className="w-full flex items-center gap-3 pb-3 border-b border-zinc-200">
            <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center bg-white shrink-0">
              <span className="text-[10px] font-bold">Logo</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="w-32 h-2.5 border-b-2 border-black" />
              <div className="w-44 h-1.5 border-b border-zinc-300" />
            </div>
          </div>

          {/* 2-Column Meta Information Grid (Date, Time, Seat, Waiter, Guest, Mode) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Date */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5 text-black" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date</span>
                <span className="text-xs font-bold">---</span>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-black" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Time</span>
                <span className="text-xs font-bold">---</span>
              </div>
            </div>

            {/* Seat */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center shrink-0">
                <Armchair className="w-3.5 h-3.5 text-black" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Seat</span>
                <span className="text-xs font-bold">Seat #{seatNumber}</span>
              </div>
            </div>

            {/* Waiter */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-black" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Waiter</span>
                <span className="text-xs font-bold">---</span>
              </div>
            </div>

            {/* Guest */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-black" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Guest</span>
                <span className="text-xs font-bold">---</span>
              </div>
            </div>

            {/* Mode */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-3.5 h-3.5 text-black" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Mode</span>
                <span className="text-xs font-bold">Dine-In</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Items Description & Amount Breakdown */}
        <div className="w-full border-2 border-black rounded-3xl p-4 flex flex-col gap-3 bg-white shadow-xs">
          {/* Table Header */}
          <div className="w-full flex items-center justify-between pb-2 border-b border-zinc-200 text-[11px] font-black uppercase tracking-wider text-zinc-600">
            <span>Item Description</span>
            <span>Amount</span>
          </div>

          {/* Item Rows */}
          <div className="w-full flex flex-col gap-2.5">
            {defaultItems.map((item, idx) => (
              <div key={idx} className="w-full flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span>{item.name}</span>
                  <span className="text-zinc-500 font-semibold">&times; {item.qty}</span>
                </div>
                <span>{item.price}</span>
              </div>
            ))}
          </div>

          {/* Subtotals & Taxes */}
          <div className="w-full flex flex-col gap-2 pt-3 border-t border-zinc-200 text-xs font-semibold">
            <div className="w-full flex items-center justify-between text-zinc-600">
              <span>Item Subtotal</span>
              <span>₹ ---</span>
            </div>
            <div className="w-full flex items-center justify-between text-zinc-600">
              <span>CGST</span>
              <span>₹ ---</span>
            </div>
            <div className="w-full flex items-center justify-between text-zinc-600">
              <span>SGST</span>
              <span>₹ ---</span>
            </div>
          </div>

          {/* Grand Total Amount Paid */}
          <div className="w-full flex items-center justify-between pt-3 border-t-2 border-black text-sm font-black uppercase tracking-wider">
            <span>Total Amount Paid</span>
            <span className="text-base font-black">₹ ---</span>
          </div>
        </div>

        {/* Card 3: Payment Method & Settlement Status */}
        <div className="w-full border-2 border-black rounded-3xl p-3.5 px-4 flex items-center justify-between bg-white shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-black flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-black" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black uppercase tracking-wide">Paid via ___</span>
              <span className="text-[10px] text-zinc-500 font-semibold">Transaction ID: ---</span>
            </div>
          </div>

          <div className="border border-black px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-zinc-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
            <span>Settled</span>
          </div>
        </div>

        {/* Card 4: Feedback / Rating Section */}
        <div className="w-full border-2 border-black rounded-3xl p-4 flex flex-col gap-3 bg-white shadow-xs">
          {/* Header Row */}
          <div className="w-full flex items-center justify-between pb-1 border-b border-zinc-200">
            <div className="flex flex-col gap-0.5 text-left">
              <span className="text-xs font-black uppercase tracking-wider">Share your experience</span>
              <span className="text-[10px] text-zinc-500 font-medium">Your feedback helps us serve you better</span>
            </div>
            <ArrowRight className="w-4 h-4 text-black" />
          </div>

          {/* 5 Feedback Rating Pills */}
          <div className="w-full grid grid-cols-5 gap-1.5 pt-1">
            {ratingOptions.map((opt) => {
              const isSelected = selectedRating === opt.id;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedRating(opt.id)}
                  className={`border rounded-2xl py-2 px-1 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isSelected ? 'border-2 border-black bg-zinc-100 shadow-xs' : 'border-zinc-300 bg-white hover:border-black'
                  }`}
                >
                  <Icon className="w-4 h-4 text-black" />
                  <span className="text-[10px] font-bold tracking-tight text-center truncate w-full">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 5: Bottom 2-Column Actions (Download Bill & Share via WhatsApp) */}
        <div className="w-full grid grid-cols-2 gap-3 pt-1">
          {/* Download Bill */}
          <button
            type="button"
            className="w-full border-2 border-black rounded-2xl p-3 flex items-center gap-2.5 bg-white cursor-pointer active:opacity-70 transition-opacity shadow-xs"
          >
            <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-black" />
            </div>
            <div className="flex flex-col text-left flex-1 min-w-0">
              <span className="text-xs font-black truncate">Download Bill</span>
              <span className="text-[10px] text-zinc-500 font-semibold truncate">Save a copy</span>
            </div>
          </button>

          {/* Share via WhatsApp */}
          <button
            type="button"
            className="w-full border-2 border-black rounded-2xl p-3 flex items-center justify-between bg-white cursor-pointer active:opacity-70 transition-opacity shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 text-black" />
              </div>
              <div className="flex flex-col text-left flex-1 min-w-0">
                <span className="text-xs font-black truncate">Share via WhatsApp</span>
                <span className="text-[10px] text-zinc-500 font-semibold truncate">Send bill</span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-black shrink-0 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
