"use client";
/**
 * Thoogudeepa Waiter Mobile Cockpit - Top Sticky Header Component
 *
 * Real-world enterprise Waiter Navigation Header:
 * - Balanced Modern Theme: Soft slate canvas (#F8FAFC), crisp white card (#FFFFFF),
 *   subtle borders (#E2E8F0), slate-900 typography, and vibrant accents
 * - Navigation Back Arrow (<) to return to previous screen
 * - Hotel Name 'ತೂಗುದೀಪ ದೊನ್ನೆ ಬಿರಿಯಾನಿ' prominently displayed in dark bold typography
 * - Waiter Name and Assigned Seats section subtitle
 * - Real-Time Service Alert Notification Bell with Urgent Counter Badge
 * - Clean, non-clumsy layout: No fake phone status bar, no sound button, no telemetry clutter
 */

import React from 'react';
import { 
  ArrowLeft,
  Bell
} from 'lucide-react';
import { WaiterProfile } from './types';

export interface MobileHeaderProps {
  /** Active waiter profile data */
  readonly profile: WaiterProfile;
  /** Count of pending floor alerts (Customer calls + kitchen ready) */
  readonly pendingAlertCount: number;
  /** Navigation callback to open floor alerts screen */
  readonly onOpenAlerts: () => void;
  /** Navigation callback to return to previous screen (Login) */
  readonly onBack?: () => void;
  /** Optional navigation callback to open waiter profile screen */
  readonly onOpenProfile?: () => void;
  /** Optional callback when zone is changed */
  readonly onZoneChange?: (zone: string) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  profile,
  pendingAlertCount,
  onOpenAlerts,
  onBack,
  onOpenProfile,
  onZoneChange
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 select-none shrink-0 shadow-2xs z-30 transition-all">
      {/* Main Waiter Header Row with Hotel Name & Back Navigation */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2.5">
        
        {/* Left: Back Arrow Navigation & Brand/Staff Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-100 active:scale-95 text-slate-800 shadow-2xs transition-all shrink-0 cursor-pointer"
              title="Back to Login"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {/* Circular Brand Logo Emblem */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300/60 overflow-hidden flex items-center justify-center shadow-xs">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
          </div>

          {/* Hotel Name in Bold Kannada Typography + Waiter Subtitle */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate leading-tight">
                ತೂಗುದೀಪ ದೊನ್ನೆ ಬಿರಿಯಾನಿ
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 shrink-0">
                POS
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-800 truncate">
                {profile.name}
              </span>
              <span className="text-slate-300 text-[10px]">•</span>
              <span className="text-[10px] font-semibold text-slate-500 truncate">
                {profile.assignedSeats || 'Zone 1 (Seats 01–10)'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Notification Alerts Bell */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAlerts}
            className="relative w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 active:scale-95 text-slate-700 shadow-2xs transition-all cursor-pointer"
            title="Floor Service Notifications"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {pendingAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-2xs animate-pulse">
                {pendingAlertCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

export default MobileHeader;
