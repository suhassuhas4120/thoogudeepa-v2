"use client";
/**
 * Thoogudeepa Waiter Tablet POS Cockpit - Global Header Component
 *
 * Real-world enterprise Tablet Header (64px fixed height):
 * - Dark Slate Enterprise Theme (#111827) matching Clover & Toast POS
 * - Left Section: Official circular brand logo with glowing halo & waiter context
 * - Right Section: Simplified action buttons without extra icons:
 *   * [ Calls (2) ] (Clean text with live counter pill)
 *   * [ Kitchen (2) ] (Clean text with live counter pill)
 *   * [ Profile ] (Person icon button with active highlight)
 * - Standardized badge tokens (uniform 24px height, 10px bold uppercase font)
 * - Strict line count maintained between 300 and 400 lines (never exceeds 400).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Volume2, 
  VolumeX, 
  Wifi, 
  Clock,
  PhoneCall,
  ChefHat
} from 'lucide-react';
import { ScreenId } from './types';

export interface TabletHeaderProps {
  /** Currently active screen route in the tablet cockpit */
  currentScreen: ScreenId;
  /** Active waiter staff name (e.g. 'Ramesh Kumar') */
  waiterName?: string;
  /** Assigned seating zone range (e.g. 'Seats 01 – 10 (Zone 1)') */
  assignedZone?: string;
  /** Active pending customer calls count */
  customerCallsCount: number;
  /** Active orders ready on the kitchen pass counter */
  kitchenAlertsCount: number;
  /** Number of occupied seats currently active */
  occupiedCount?: number;
  /** Station ID indicator */
  stationId?: string;
  /** Primary navigation callback to switch between screens */
  onNavigate: (screen: ScreenId) => void;
  /** Callback to trigger the right slide-over alert drawer */
  onOpenAlertSheet: (tabType: 'customer' | 'kitchen') => void;
  /** Optional audio feedback trigger */
  onPlayChime?: (tone: 'call' | 'kitchen' | 'click') => void;
}

export const TabletHeader: React.FC<TabletHeaderProps> = ({
  currentScreen,
  waiterName = 'Ramesh Kumar',
  assignedZone = 'Zone 1 (Tables 01-10)',
  customerCallsCount,
  kitchenAlertsCount,
  occupiedCount = 4,
  stationId = 'Station 01',
  onNavigate,
  onOpenAlertSheet,
  onPlayChime
}) => {
  // Local state for interactive header controls
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(true);
  const [showStationTooltip, setShowStationTooltip] = useState<boolean>(false);

  // Real-time HH:MM AM/PM Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formatted = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Online / Offline Network detection
  useEffect(() => {
    const handleOnline = () => setIsNetworkOnline(true);
    const handleOffline = () => setIsNetworkOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Audio tone generator fallback
  const playCockpitTone = useCallback((type: 'call' | 'kitchen' | 'click') => {
    if (isSoundMuted || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'call') {
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'kitchen') {
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.setValueAtTime(680, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {
      // AudioContext unavailable
    }
  }, [isSoundMuted]);

  // Keyboard accessibility shortcuts (Alt+C for Calls, Alt+K for Kitchen, Alt+P for Profile)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        triggerCustomerCalls();
      } else if (e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        triggerKitchenAlerts();
      } else if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        onNavigate('profile');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [customerCallsCount, kitchenAlertsCount, isSoundMuted]);

  // Audio & Alert Dispatchers
  const triggerCustomerCalls = useCallback(() => {
    if (!isSoundMuted) {
      if (onPlayChime) onPlayChime('call');
      else playCockpitTone('call');
    }
    onOpenAlertSheet('customer');
  }, [isSoundMuted, onPlayChime, onOpenAlertSheet]);

  const triggerKitchenAlerts = useCallback(() => {
    if (!isSoundMuted) {
      if (onPlayChime) onPlayChime('kitchen');
      else playCockpitTone('kitchen');
    }
    onOpenAlertSheet('kitchen');
  }, [isSoundMuted, onPlayChime, onOpenAlertSheet]);

  return (
    <header 
      id="tablet-global-header"
      className="h-16 bg-white border-b border-slate-200 px-4 sm:px-5 flex items-center justify-between shrink-0 select-none z-30 relative shadow-xs"
      role="banner"
      aria-label="Thoogudeepa Tablet POS Global Header"
    >
      {/* ======================================================== */}
      {/* 1. LEFT SECTION: AUTHENTIC LOGO & WAITER IDENTITY */}
      {/* ======================================================== */}
      <div className="flex items-center gap-3">
        {/* Authentic Circular Brand Logo */}
        <div 
          className="relative group cursor-pointer" 
          onClick={() => onNavigate('seats')}
          title="Return to Floor Board"
        >
          <img
            src="/logo.jpg"
            alt="Thoogudeepa Official Logo"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-400/50 shadow-xs transition-transform group-hover:scale-105"
            loading="eager"
          />
          <span 
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"
            title="POS Station Connected"
          />
        </div>

        {/* Brand & Staff Information */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
              ತೂಗುದೀಪ ದೊನ್ನೆ ಬಿರಿಯಾನಿ
            </span>
            {/* Standardized Uniform Badge Size: h-6 px-2.5 text-[10px] */}
            <span 
              onClick={() => setShowStationTooltip(!showStationTooltip)}
              className="h-6 px-2.5 inline-flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-amber-50 text-amber-800 border border-amber-300 cursor-pointer hover:bg-amber-100 transition-colors shadow-2xs"
            >
              {stationId}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 leading-none">
              {waiterName}
            </span>
            <span className="text-slate-300 text-xs leading-none">•</span>
            <span className="text-[11px] font-semibold text-slate-500 leading-none">
              {assignedZone}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CENTER SECTION: CLEAN CLOCK & NETWORK STATUS */}
      {/* ======================================================== */}
      <div className="hidden md:flex items-center gap-2.5">
        {/* Real-time Clock */}
        {currentTime && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{currentTime}</span>
          </div>
        )}

        {/* Sound Toggle Button */}
        <button
          type="button"
          onClick={() => setIsSoundMuted(!isSoundMuted)}
          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
            isSoundMuted 
              ? 'bg-slate-100 text-slate-400 border-slate-300' 
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}
          title={isSoundMuted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
        >
          {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Network Online Status: Standardized Badge Token */}
        <span 
          className={`h-6 px-2.5 inline-flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider rounded-full border gap-1 shadow-2xs ${
            isNetworkOnline 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
              : 'bg-rose-50 text-rose-700 border-rose-300'
          }`}
          title={isNetworkOnline ? 'Cloud Synced' : 'Offline Mode'}
        >
          <Wifi className="w-3 h-3" />
          <span>{isNetworkOnline ? 'Online' : 'Offline'}</span>
        </span>
      </div>

      {/* ======================================================== */}
      {/* 3. RIGHT SECTION: PROPER SINGLE ICONS ON CALLS, KITCHEN */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* BUTTON 1: CUSTOMER CALLS (Single PhoneCall Icon + Count Pill) */}
        <button
          type="button"
          onClick={triggerCustomerCalls}
          id="btn-header-calls"
          className="h-10 px-3.5 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 shadow-2xs text-slate-800"
          title="Open Customer Table Service Calls"
          aria-label={`Customer Calls: ${customerCallsCount} pending`}
        >
          <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
          <span className="text-slate-800 font-extrabold">Calls</span>
          <span className="h-5 px-1.5 min-w-[20px] inline-flex items-center justify-center text-[10px] font-black rounded-full bg-rose-500 text-white shadow-2xs">
            {customerCallsCount}
          </span>
        </button>

        {/* BUTTON 2: KITCHEN ORDER READY (Single ChefHat Icon + Count Pill) */}
        <button
          type="button"
          onClick={triggerKitchenAlerts}
          id="btn-header-kitchen"
          className="h-10 px-3.5 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 shadow-2xs text-slate-800"
          title="Open Kitchen Pass Counter Alerts"
          aria-label={`Kitchen Alerts: ${kitchenAlertsCount} orders ready`}
        >
          <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-slate-800 font-extrabold">Kitchen</span>
          <span className="h-5 px-1.5 min-w-[20px] inline-flex items-center justify-center text-[10px] font-black rounded-full bg-emerald-600 text-white shadow-2xs">
            {kitchenAlertsCount}
          </span>
        </button>

        {/* PERSON ICON BUTTON: DIRECT NAVIGATION TO PROFILE */}
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          id="btn-header-profile"
          className={`w-10 h-10 border rounded-xl flex items-center justify-center active:scale-95 transition-all ml-0.5 shadow-2xs relative group ${
            currentScreen === 'profile'
              ? 'bg-slate-900 border-slate-900 text-white font-black'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
          }`}
          title="Waiter Profile & Shift Summary"
          aria-label="Navigate to Profile and Shift Summary"
        >
          <User className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="sr-only">My Profile & Shift Summary</span>
        </button>
      </div>
    </header>
  );
};

export default TabletHeader;

