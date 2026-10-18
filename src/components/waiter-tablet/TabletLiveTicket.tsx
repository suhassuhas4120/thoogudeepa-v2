"use client";
/**
 * Thoogudeepa Waiter Tablet POS Cockpit - Live Ticket Component
 *
 * Real-world enterprise Live Order Ticket (40% split screen column):
 * - Balanced In-Between Theme: Soft slate canvas (#F1F5F9), crisp white cards (#FFFFFF),
 *   subtle borders (#E2E8F0), slate-900 typography, and vibrant accents
 * - Target seat header with order timer and kitchen note action
 * - STRICTLY NO CLEAR BUTTON (Removed accidental clear button as requested)
 * - Itemized dish rows with standardized kitchen status badges:
 *   * PLACED: Order queued at POS
 *   * RECEIVED: Acknowledged by Kitchen Display System (KDS)
 *   * PREPARING: Master chef actively preparing in donne biryani pots
 *   * READY: Placed on pass counter with urgent emerald badge + [ Served ] button
 *   * SERVED: Food delivered to dining table
 * - Financial summary breakdown: Subtotal, GST (5%), and Grand Total
 * - Single clean icon per action button:
 *   * [ Punch KOT ] (Send icon, Disabled when ticket has 0 items)
 *   * [ Collect Bill ] (CreditCard icon, Disabled when 0 items)
 * - Standardized badge tokens (uniform 24px height, 10px bold uppercase font)
 * - Strict line count maintained between 300 and 400 lines (never exceeds 400).
 */

import React, { useState, useEffect } from 'react';
import { 
  Timer,
  Send,
  CreditCard,
  Check,
  FileText
} from 'lucide-react';
import { TicketItem, KitchenStatus } from './types';

export interface TabletLiveTicketProps {
  /** Target seat identifier and guest name */
  activeSeatName: string;
  /** List of ordered items on the active ticket */
  ticketItems: TicketItem[];
  /** Subtotal amount before taxes */
  subtotal: number;
  /** GST 5% calculation */
  gst: number;
  /** Grand Total including taxes */
  grandTotal: number;
  /** Callback to mark an item as served once picked up from kitchen pass */
  onServeItem: (itemId: number) => void;
  /** Callback to fire KOT directly to kitchen pass counter */
  onPunchKot: () => void;
  /** Callback to switch right-pane mode from ticket to Bill Settlement (NO POPUP) */
  onSwitchToBillMode: () => void;
  /** Callback to clear ticket items for a new guest */
  onClearTicket?: () => void;
  /** Optional callback to add special kitchen instructions */
  onAddKitchenNote?: (note: string) => void;
}

export const TabletLiveTicket: React.FC<TabletLiveTicketProps> = ({
  activeSeatName,
  ticketItems,
  subtotal,
  gst,
  grandTotal,
  onServeItem,
  onPunchKot,
  onSwitchToBillMode,
  onClearTicket,
  onAddKitchenNote
}) => {
  const [kitchenNote, setKitchenNote] = useState<string>('');
  const [isNoteInputOpen, setIsNoteInputOpen] = useState<boolean>(false);
  const [kotSentSuccess, setKotSentSuccess] = useState<boolean>(false);
  const [kotOrderSerial, setKotOrderSerial] = useState<number>(104);
  const [ticketElapsedSeconds, setTicketElapsedSeconds] = useState<number>(340);

  // Live order timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTicketElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  };

  const handleFireKot = () => {
    if (ticketItems.length === 0) return;
    setKotSentSuccess(true);
    setKotOrderSerial(prev => prev + 1);
    onPunchKot();
    setTimeout(() => {
      setKotSentSuccess(false);
    }, 2000);
  };

  const handleSaveNote = () => {
    if (kitchenNote.trim() && onAddKitchenNote) {
      onAddKitchenNote(kitchenNote.trim());
    }
    setIsNoteInputOpen(false);
  };

  const hasItems = ticketItems.length > 0;

  return (
    <div 
      id="right-mode-ticket" 
      className="flex flex-col justify-between h-full select-none bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
      role="region"
      aria-label="Live Seat Ticket and KOT Management"
    >
      <div className="flex flex-col h-[calc(100%-140px)]">
        {/* ======================================================== */}
        {/* 1. TICKET HEADER: ACTIVE SEAT & TIMER (NO CLEAR BUTTON!) */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Live Seat Ticket
              </h3>
              {/* Standardized Uniform Badge Size: h-6 px-2.5 text-[10px] */}
              <span className="h-6 px-2.5 inline-flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
                KOT #{kotOrderSerial}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-slate-800 font-extrabold">{activeSeatName}</span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                <Timer className="w-3 h-3 text-slate-500" />
                {formatTimer(ticketElapsedSeconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Kitchen Note Button */}
            <button
              type="button"
              onClick={() => setIsNoteInputOpen(!isNoteInputOpen)}
              className="h-7 px-3 text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-2xs flex items-center gap-1"
              title="Add Kitchen Instructions"
            >
              <FileText className="w-3 h-3 text-slate-500" />
              <span>Note</span>
            </button>
          </div>
        </div>

        {/* Optional Kitchen Note Input Box */}
        {isNoteInputOpen && (
          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
            <input
              type="text"
              value={kitchenNote}
              onChange={(e) => setKitchenNote(e.target.value)}
              placeholder="e.g. Extra raita, less spicy..."
              className="flex-1 text-xs font-medium bg-transparent outline-none text-slate-800 placeholder-slate-400"
            />
            <button
              type="button"
              onClick={handleSaveNote}
              className="h-7 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg shadow-2xs"
            >
              Save
            </button>
          </div>
        )}

        {/* Column Headers for Items and Kitchen Status */}
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
          <span>Dish & Quantity</span>
          <span>Kitchen Status</span>
        </div>

        {/* ======================================================== */}
        {/* 2. TICKET ITEMS LIST WITH SIMPLE STANDARDIZED BADGES */}
        {/* ======================================================== */}
        <div className="space-y-2 overflow-y-auto no-scrollbar flex-1 pr-0.5 py-1">
          {ticketItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
              <p className="text-xs font-bold text-slate-600">No dishes on ticket</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Select dishes from the menu to punch</p>
            </div>
          ) : (
            ticketItems.map(item => {
              return (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/60 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold block truncate text-xs text-slate-900">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        ₹{item.price * item.quantity} (₹{item.price} each)
                      </span>
                    </div>

                    {/* STANDARDIZED KITCHEN BADGES WITH SINGLE BUTTON */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.status === 'READY' && (
                        <div className="flex items-center gap-1.5">
                          <span className="h-6 px-2.5 inline-flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                            READY
                          </span>
                          {/* Simple Clean Button: Served (Check Icon) */}
                          <button
                            type="button"
                            onClick={() => onServeItem(item.id)}
                            className="h-6 px-2.5 rounded-lg text-[10px] font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 transition-all shadow-2xs flex items-center justify-center gap-1"
                            title="Mark as Served to Table"
                          >
                            <Check className="w-3 h-3" />
                            <span>Served</span>
                          </button>
                        </div>
                      )}

                      {item.status === 'PREPARING' && (
                        <span className="h-6 px-2.5 inline-flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                          PREPARING
                        </span>
                      )}

                      {item.status === 'RECEIVED' && (
                        <span className="h-6 px-2.5 inline-flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-sky-50 text-sky-700 border border-sky-300 shadow-2xs">
                          RECEIVED
                        </span>
                      )}

                      {item.status === 'PLACED' && (
                        <span className="h-6 px-2.5 inline-flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
                          PLACED
                        </span>
                      )}

                      {item.status === 'SERVED' && (
                        <span className="h-6 px-2.5 inline-flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-slate-100 text-slate-500 border border-slate-200 shadow-2xs">
                          SERVED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TICKET TOTALS & CONDITIONAL ACTION BUTTONS */}
      {/* ======================================================== */}
      <div className="pt-3 border-t border-slate-200 mt-2">
        {/* Pricing Summary */}
        <div className="space-y-1 mb-3 text-xs">
          <div className="flex justify-between text-slate-500 font-semibold text-[11px]">
            <span>Subtotal:</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-500 font-semibold text-[11px]">
            <span>GST (5% SGST + CGST):</span>
            <span>₹{gst.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-black text-xs pt-1 border-t border-slate-200">
            <span>Grand Total:</span>
            <span className="text-sm font-black text-amber-700">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* 2 Primary Action Buttons: Exactly One Icon per Button (Send, CreditCard) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Button 1: Punch KOT to Kitchen */}
          <button
            type="button"
            disabled={!hasItems}
            onClick={handleFireKot}
            className={`h-11 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-2xs transition-all ${
              hasItems
                ? 'bg-slate-900 hover:bg-slate-800 active:scale-95 text-white cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
            }`}
            title={hasItems ? "Fire KOT to Kitchen" : "Add dishes before firing KOT"}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{kotSentSuccess ? 'Sent to Kitchen' : 'Send to Kitchen'}</span>
          </button>

          {/* Button 2: Collect Bill */}
          <button
            type="button"
            disabled={!hasItems}
            onClick={onSwitchToBillMode}
            className={`h-11 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-2xs transition-all ${
              hasItems
                ? 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black cursor-pointer shadow-amber-500/20'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
            }`}
            title={hasItems ? "Switch Right Pane to Settle Bill" : "Punch order dishes first before bill collection"}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Collect Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabletLiveTicket;

