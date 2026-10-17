'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Sparkles,
  Droplets,
  Scroll,
  Utensils,
  Sparkle,
  Disc,
  GlassWater,
  Flame,
  Bell,
  Clock,
  Pencil,
  Check,
  Send,
} from 'lucide-react';

import { useHardwareBack } from '../../../../lib/hooks/useHardwareBack';

interface QuickOption {
  id: string;
  iconName: string;
}

interface SubmittedRequest {
  id: string;
  timestamp: string;
  status: 'Pending' | 'Served';
}

function AssistantPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const chairId = (params?.chairId as string) || '12';
  const seatNumber = chairId.replace(/[^0-9]/g, '') || chairId;
  const fromParam = searchParams.get('from');

  const [activeRequests, setActiveRequests] = useState<SubmittedRequest[]>([
    { id: '1', timestamp: '2 mins ago', status: 'Pending' },
  ]);
  const [specialNote, setSpecialNote] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleBack = () => {
    if (fromParam) {
      router.push(fromParam);
    } else {
      router.back();
    }
  };

  // Device hardware back button & swipe back: return to the originating screen
  useHardwareBack(null, handleBack);

  const handleCallWaiter = () => {
    const newReq: SubmittedRequest = {
      id: String(Date.now()),
      timestamp: 'Just now',
      status: 'Pending',
    };
    setActiveRequests((prev) => [newReq, ...prev]);
    setSelectedService(null);
  };

  const quickGridOptions: QuickOption[] = [
    { id: 'opt-1', iconName: 'water' },
    { id: 'opt-2', iconName: 'napkin' },
    { id: 'opt-3', iconName: 'cutlery' },
    { id: 'opt-4', iconName: 'cleaning' },
    { id: 'opt-5', iconName: 'plate' },
    { id: 'opt-6', iconName: 'glass' },
    { id: 'opt-7', iconName: 'condiments' },
    { id: 'opt-8', iconName: 'bell' },
  ];

  const renderIcon = (name: string) => {
    switch (name) {
      case 'water':
        return <Droplets className="w-5 h-5 text-black" />;
      case 'napkin':
        return <Scroll className="w-5 h-5 text-black" />;
      case 'cutlery':
        return <Utensils className="w-5 h-5 text-black" />;
      case 'cleaning':
        return <Sparkle className="w-5 h-5 text-black" />;
      case 'plate':
        return <Disc className="w-5 h-5 text-black" />;
      case 'glass':
        return <GlassWater className="w-5 h-5 text-black" />;
      case 'condiments':
        return <Flame className="w-5 h-5 text-black" />;
      case 'bell':
      default:
        return <Bell className="w-5 h-5 text-black" />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between max-w-md mx-auto relative px-4 pt-4 pb-12">
      {/* Scrollable Upper & Middle Area */}
      <div className="w-full flex flex-col gap-4">
        {/* Top Header Row */}
        <header className="w-full flex items-center justify-between py-2 border-b border-zinc-200 pb-3">
          {/* Back Navigation Button */}
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 border border-black rounded-lg flex items-center justify-center cursor-pointer active:opacity-70 bg-white"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Seat Tag Center */}
          <div className="flex items-center gap-1.5 border border-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white">
            <span>Seat #{seatNumber}</span>
          </div>

          {/* Spacer to keep center balanced */}
          <div className="w-10 h-10" />
        </header>

        {/* Hero Banner / Card Top */}
        <div className="w-full border-2 border-black rounded-3xl p-4 flex items-center justify-between bg-white shadow-xs">
          <div className="flex flex-col gap-1 flex-1">
            <h1 className="text-xl font-black tracking-tight uppercase">Call Waiter</h1>
            <p className="text-xs text-zinc-500 font-medium">Need something? We&apos;re here to help.</p>
          </div>
          {/* Circular Illustration Placeholder */}
          <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center shrink-0 bg-white">
            <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>

        {/* Section 1: 2x4 Quick Service Grid Card */}
        <div className="w-full border-2 border-black rounded-3xl p-4 flex flex-col gap-3 bg-white shadow-xs">
          {/* Section Header with Quick Assistance Title */}
          <div className="w-full flex items-center justify-between pb-1 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-black flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-black" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider">Quick Assistance</h2>
            </div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Tap to request</span>
          </div>

          {/* 2-Column Grid with 8 service items */}
          <div className="grid grid-cols-2 gap-2.5">
            {quickGridOptions.map((opt) => {
              const isSelected = selectedService === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedService(opt.id)}
                  className={`w-full border rounded-2xl p-2.5 flex items-center text-left transition-all cursor-pointer ${
                    isSelected ? 'border-2 border-black bg-zinc-100' : 'border-zinc-300 bg-white hover:border-black'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 w-full">
                    <div className="w-9 h-9 rounded-full border border-black flex items-center justify-center shrink-0 bg-white">
                      {renderIcon(opt.iconName)}
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="w-14 h-2 border-b border-black" />
                      <div className="w-10 h-1.5 border-b border-zinc-300" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Inline Information Strip */}
          <div className="w-full border border-zinc-300 rounded-xl p-2.5 flex items-center gap-2.5 bg-zinc-50">
            <div className="w-6 h-6 rounded-full border border-black flex items-center justify-center shrink-0 bg-white">
              <span className="text-[10px] font-black">i</span>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="w-32 h-1.5 border-b border-black" />
              <div className="w-48 h-1.5 border-b border-zinc-300" />
            </div>
          </div>
        </div>

        {/* Section 2: Recent Requests Container */}
        <div className="w-full border-2 border-black rounded-3xl p-4 flex flex-col gap-3 bg-white shadow-xs">
          {/* Section Header with Your Requests Title */}
          <div className="w-full flex items-center justify-between pb-1 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-black flex items-center justify-center">
                <Clock className="w-3 h-3 text-black" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider">Your Requests</h2>
            </div>
            {/* Counter pill */}
            <div className="border border-black px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-zinc-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              <span>{activeRequests.length} Pending</span>
            </div>
          </div>

          {/* Dynamic List of Active Requests */}
          <div className="w-full flex flex-col gap-2">
            {activeRequests.map((req, idx) => (
              <div
                key={req.id || idx}
                className="w-full border border-black rounded-2xl p-2.5 flex items-center justify-between bg-white"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full border border-black flex items-center justify-center shrink-0 bg-white">
                    <Droplets className="w-4 h-4 text-black" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="w-20 h-2 border-b border-black" />
                    <div className="w-14 h-1.5 border-b border-zinc-300" />
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="border border-black px-2 py-0.5 rounded-full text-[10px] font-bold bg-white">
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Special Request Input Row */}
          <div className="w-full border border-black rounded-2xl p-2.5 flex items-center justify-between bg-white gap-2">
            <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center shrink-0">
              <Pencil className="w-3.5 h-3.5 text-black" />
            </div>
            <input
              type="text"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="---"
              className="flex-1 text-xs outline-none bg-transparent text-black"
            />
            {specialNote.trim().length > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleCallWaiter();
                  setSpecialNote('');
                }}
                className="w-7 h-7 rounded-full border border-black flex items-center justify-center bg-black text-white shrink-0 cursor-pointer active:opacity-70"
                aria-label="Submit note"
              >
                <Send className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action Button at Bottom */}
      <div className="w-full pt-4 sticky bottom-3 bg-white/95 backdrop-blur-xs">
        <button
          type="button"
          onClick={handleCallWaiter}
          className="w-full flex items-center justify-between border-2 border-black bg-black text-white py-3.5 px-5 rounded-2xl cursor-pointer active:opacity-80 transition-opacity shadow-md"
        >
          <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center">
            <Bell className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1 flex items-center justify-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest">
              Call Waiter
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AssistantPageContent />
    </Suspense>
  );
}
