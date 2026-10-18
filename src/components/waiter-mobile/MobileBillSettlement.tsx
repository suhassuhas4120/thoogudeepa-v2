"use client";
/**
 * Thoogudeepa Waiter Mobile Cockpit - Bill Settlement & Checkout Component
 *
 * Real-world enterprise Waiter Table Checkout & Settle interface:
 * - Balanced Modern Theme: Soft slate canvas (#F8FAFC), crisp white card (#FFFFFF),
 *   subtle borders (#E2E8F0), slate-900 typography, and vibrant accents
 * - Top Checkout Header:
 *   * Hotel Name: 'ತೂಗುದೀಪ ದೊನ್ನೆ ಬಿರಿಯಾನಿ' (clean, no settlement badge)
 *   * Waiter Subtitle: 'Ramesh Kumar • {seatNumber} Settlement'
 *   * Alert Notification Bell ALWAYS at top right with live badge counter
 * - Itemized Bill Receipt Breakdown (dishes, quantities, unit prices, line totals)
 * - Transparent Tax Computation: Subtotal, CGST (2.5%), SGST (2.5%), Grand Total
 * - Payment Method Selection: EXACTLY TWO OPTIONS: CASH & UPI QR CODE (Matching Tablet POS)
 * - UPI Mode:
 *   * Dynamic QR Code for table/seat
 *   * Soundbox Confirmation / Payment Received verification checkbox
 * - Cash Mode:
 *   * Cash Tendered from Customer: Fixed/disabled input with no increase/decrease spinner
 *   * Cash Presets Pills: Exact bill, rounded steps (₹840, ₹850, ₹900, ₹1000, ₹2000)
 *   * Real-time Return Change calculation banner
 * - Settle Action CTA: 'PRINT RECEIPT & SETTLE' with thermal printer icon
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  ArrowLeft, 
  Receipt, 
  Banknote, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ShieldCheck,
  User,
  Bell,
  X,
  AlertCircle
} from 'lucide-react';
import { PaymentMethod, RESTAURANT_CONSTANTS } from './types';

export interface MobileBillSettlementProps {
  /** Target seat label (e.g., 'Seat 04') */
  readonly seatNumber: string;
  /** Dining guest name */
  readonly guestName?: string;
  /** Total bill amount */
  readonly totalAmount?: number;
  readonly cartItems?: readonly import('./types').CartItem[];
  /** Pending alerts count badge */
  readonly pendingAlertCount?: number;
  /** Navigation callback back to seats grid */
  readonly onBackToSeats: () => void;
  /** Callback to open alerts */
  readonly onOpenAlerts?: () => void;
  /** Callback when bill is successfully paid & settled */
  readonly onSettleSuccess: (seatNumber: string, method: PaymentMethod, amount: number) => void;
  /** Toast feedback callback */
  readonly onShowToast?: (message: string) => void;
}

export const MobileBillSettlement: React.FC<MobileBillSettlementProps> = ({
  seatNumber = 'Seat 04',
  guestName = 'Kiran R',
  totalAmount = 840,
  cartItems,
  pendingAlertCount = 2,
  onBackToSeats,
  onOpenAlerts,
  onSettleSuccess,
  onShowToast
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isUpiVerified, setIsUpiVerified] = useState<boolean>(true);

  // Dynamic bill lines using real cart items if available, or fallback
  const billLines = useMemo(() => {
    if (cartItems && cartItems.length > 0) {
      return cartItems.map((c, idx) => ({
        id: String(c.menuItem.id || idx),
        name: c.menuItem.name,
        quantity: c.quantity,
        unitPrice: c.menuItem.price,
        lineTotal: c.lineTotal,
      }));
    }
    return [
      { id: '1', name: 'Chicken Donne Biryani', quantity: 2, unitPrice: 260, lineTotal: 520 },
      { id: '2', name: 'Chilli Chicken Dry', quantity: 1, unitPrice: 220, lineTotal: 220 },
      { id: '3', name: 'Mineral Water Bottle', quantity: 1, unitPrice: 40, lineTotal: 40 }
    ];
  }, [cartItems]);

  // Compute breakdown
  const subtotal = useMemo(() => {
    return billLines.reduce((acc, curr) => acc + curr.lineTotal, 0);
  }, [billLines]);

  const cgst = useMemo(() => Math.round(subtotal * RESTAURANT_CONSTANTS.TAX_RATE_CGST), [subtotal]);
  const sgst = useMemo(() => Math.round(subtotal * RESTAURANT_CONSTANTS.TAX_RATE_SGST), [subtotal]);
  const finalGrandTotal = useMemo(() => subtotal + cgst + sgst, [subtotal, cgst, sgst]);

  // Cash tendered state (default to exact bill)
  const [receivedCashAmount, setReceivedCashAmount] = useState<number>(finalGrandTotal);

  useEffect(() => {
    setReceivedCashAmount(finalGrandTotal);
  }, [finalGrandTotal]);

  // Dynamic cash presets pills matching tablet
  const cashPresets = useMemo(() => {
    const exact = finalGrandTotal;
    const next50 = Math.ceil(exact / 50) * 50;
    const next100 = Math.ceil(exact / 100) * 100;
    const next500 = Math.ceil(exact / 500) * 500;
    const set = new Set<number>([exact]);
    if (next50 > exact) set.add(next50);
    if (next100 > exact) set.add(next100);
    if (next500 > exact) set.add(next500);
    if (exact <= 1000) set.add(1000);
    if (exact <= 2000) set.add(2000);
    return Array.from(set).filter(v => v >= exact).sort((a, b) => a - b).slice(0, 5);
  }, [finalGrandTotal]);

  // Cash return change calculation
  const cashChange = useMemo(() => {
    if (receivedCashAmount < finalGrandTotal) return 0;
    return receivedCashAmount - finalGrandTotal;
  }, [receivedCashAmount, finalGrandTotal]);

  // Payment settle handler
  const handleExecuteSettle = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsReceiptModalOpen(true);
      onShowToast?.(`Bill for ${seatNumber} settled via ${selectedMethod.toUpperCase()}!`);
    }, 500);
  }, [seatNumber, selectedMethod, onShowToast]);

  // Close settlement and route back to seats
  const handleFinalizeAndExit = useCallback(() => {
    setIsReceiptModalOpen(false);
    onSettleSuccess(seatNumber, selectedMethod, finalGrandTotal);
  }, [seatNumber, selectedMethod, finalGrandTotal, onSettleSuccess]);

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 select-none overflow-hidden relative">
      
      {/* Top Bill Settlement Header: Hotel Name FIRST, Waiter Below, Bell Always on Right (NO SETTLEMENT BADGE) */}
      <header className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs shrink-0 select-none z-20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBackToSeats}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-100 btn-press shrink-0 shadow-2xs text-slate-700 cursor-pointer"
            title="Back to Seats"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate leading-tight">
              ತೂಗುದೀಪ ದೊನ್ನೆ ಬಿರಿಯಾನಿ
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-800 truncate">Ramesh Kumar</span>
              <span className="text-slate-300 text-[10px]">•</span>
              <span className="text-[10px] font-semibold text-slate-500 truncate">
                {seatNumber} Settlement
              </span>
            </div>
          </div>
        </div>

        {/* Alert Bell Always on Top Right */}
        <button
          type="button"
          onClick={onOpenAlerts}
          className="relative w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 btn-press shrink-0 shadow-2xs cursor-pointer"
          title="Alerts"
        >
          <Bell className="w-4 h-4 text-slate-700" />
          {pendingAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-2xs animate-pulse">
              {pendingAlertCount}
            </span>
          )}
        </button>
      </header>

      {/* Bill Receipt Scroll View */}
      <div className="p-3.5 flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pb-24">
        
        {/* Receipt Card */}
        <div className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                Itemized Order Breakdown
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              Guest: {guestName}
            </span>
          </div>

          {/* Dish Rows */}
          <div className="space-y-2 text-xs">
            {billLines.map(line => (
              <div 
                key={line.id}
                className="flex items-center justify-between pb-1.5 border-b border-slate-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-slate-900 shrink-0">
                    {line.quantity}x
                  </span>
                  <span className="text-slate-800 truncate">
                    {line.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  ₹{line.lineTotal}
                </span>
              </div>
            ))}
          </div>

          {/* Tax Calculation Breakdown */}
          <div className="mt-3 pt-2 border-t border-slate-200 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-medium text-[11px]">
              <span>Subtotal</span>
              <span>₹{subtotal}.00</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 font-medium text-[11px]">
              <span>CGST (2.5%) + SGST (2.5%)</span>
              <span>₹{cgst + sgst}.00</span>
            </div>
            <div className="flex items-center justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-100">
              <span>Grand Total</span>
              <span className="text-amber-800 font-black">
                ₹{finalGrandTotal}.00
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method Selector Card: EXACTLY TWO OPTIONS (Cash & UPI QR) */}
        <div className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-xs space-y-3">
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
            Select Payment Method (Cash / UPI)
          </span>
          
          <div className="grid grid-cols-2 gap-2">
            
            {/* Option 1: Cash Button */}
            <button
              type="button"
              onClick={() => setSelectedMethod('cash')}
              className={`h-12 rounded-xl border flex flex-col items-center justify-center shadow-2xs btn-press transition-all cursor-pointer ${
                selectedMethod === 'cash'
                  ? 'border-2 border-amber-600 bg-amber-50 text-amber-900 font-bold'
                  : 'border-slate-200 bg-slate-50 text-slate-800 font-bold hover:bg-slate-100'
              }`}
            >
              <Banknote className="w-4 h-4 mb-0.5 text-amber-600" />
              <span className="text-xs font-black">Cash Payment</span>
            </button>

            {/* Option 2: UPI QR Button */}
            <button
              type="button"
              onClick={() => setSelectedMethod('upi')}
              className={`h-12 rounded-xl border flex flex-col items-center justify-center shadow-2xs btn-press transition-all cursor-pointer ${
                selectedMethod === 'upi'
                  ? 'border-2 border-slate-900 bg-slate-900 text-white font-bold'
                  : 'border-slate-200 bg-slate-50 text-slate-800 font-bold hover:bg-slate-100'
              }`}
            >
              <QrCode className="w-4 h-4 mb-0.5 text-emerald-400" />
              <span className="text-xs font-black">UPI QR Code</span>
            </button>

          </div>

          {/* UPI MODE (Matching Tablet) */}
          {selectedMethod === 'upi' && (
            <div className="mt-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center animate-in fade-in duration-200 space-y-3">
              {/* QR Frame with Crisp Emerald Ring & White Tile */}
              <div className="relative p-2.5 bg-white border-2 border-emerald-500 rounded-2xl shadow-sm ring-4 ring-emerald-500/10">
                <div className="w-44 h-44 bg-white rounded-xl p-1 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                    <path d="M0 0h30v30H0zm4 4h22v22H4zm4 4h14v14H8zM70 0h30v30H70zm4 4h22v22H74zm4 4h14v14H78zM0 70h30v30H0zm4 4h22v22H4zm4 4h14v14H8zM40 8h6v12h-6zm12 0h6v6h-6zm0 10h10v6H52zM8 40h6v6H8zm12 0h8v6h-8zm14 0h6v6h-6zm12 0h14v6H46zm20 0h8v12h-8zm14 0h12v6H80zM8 50h12v6H8zm24 0h10v6H32zm20 0h6v12h-6zm14 0h6v6h-6zm0 10h12v6H66zM40 70h6v12h-6zm12 0h12v6H52zm0 10h6v12h-6zm18-10h6v6h-6zm0 10h12v12H70zm18 0h6v12h-6zM40 88h12v6H40zm24 0h6v6h-6z" />
                    <rect x="42" y="42" width="16" height="16" rx="3" fill="#0F172A" />
                    <circle cx="50" cy="50" r="4" fill="#D97706" />
                  </svg>
                </div>
              </div>

              {/* Amount and Scan Instructions */}
              <div className="text-center">
                <span className="text-xs font-black text-slate-900 block font-mono">
                  Scan to Pay ₹{finalGrandTotal}.00
                </span>
                <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                  UPI ID: <span className="font-bold text-slate-800">thoogudeepa@okicici</span>
                </span>
              </div>

              {/* UPI Brand Logos Support Badge */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[9px] font-black text-slate-700 shadow-2xs">GPay</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[9px] font-black text-indigo-700 shadow-2xs">PhonePe</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[9px] font-black text-sky-700 shadow-2xs">Paytm</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[9px] font-black text-emerald-700 shadow-2xs">BHIM</span>
              </div>

              {/* Soundbox Confirmation Verification Checkbox */}
              <label className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer border text-left transition ${
                isUpiVerified
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}>
                <input
                  type="checkbox"
                  checked={isUpiVerified}
                  onChange={(e) => setIsUpiVerified(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-600 cursor-pointer shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[11px] font-black block leading-tight">
                    Soundbox Confirmation / Payment Received
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">
                    Verified chime on table soundbox terminal
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* CASH MODE (Matching Tablet with Fixed Input & Amount Pills) */}
          {selectedMethod === 'cash' && (
            <div className="mt-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
              
              {/* Cash Tendered Field: Fixed & Disabled with No Steppers */}
              <div>
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                  Cash Received / Tendered (₹)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-black text-slate-500">₹</span>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={`${receivedCashAmount}.00`}
                    className="w-full h-11 pl-8 pr-24 bg-white border-2 border-slate-300 rounded-xl text-base font-black text-slate-900 cursor-not-allowed select-none font-mono"
                  />
                  <span className="absolute right-2 px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-600 uppercase border border-slate-200">
                    Exact Amount
                  </span>
                </div>
              </div>

              {/* Preset Cash Amount Pills */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Quick Amount Presets
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {cashPresets.map((preset) => {
                    const isSelected = receivedCashAmount === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setReceivedCashAmount(preset)}
                        className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                          isSelected
                            ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                            : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        ₹{preset} {preset === finalGrandTotal ? '(Exact)' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Return Change Display */}
              <div className="flex items-center justify-between p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-xs font-black text-emerald-950">
                <span>Return Change to Guest:</span>
                <span className="text-base text-emerald-800 font-mono">
                  ₹{cashChange.toFixed(2)}
                </span>
              </div>

            </div>
          )}

        </div>

        {/* Settle Bill Action Button */}
        <button
          type="button"
          onClick={handleExecuteSettle}
          disabled={isProcessing}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-2 btn-press transition-all disabled:opacity-50 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>
            {isProcessing ? 'PRINTING RECEIPT...' : `PRINT RECEIPT & SETTLE (₹${finalGrandTotal})`}
          </span>
        </button>

      </div>

      {/* Confirmation Modal */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Settlement Complete</h3>
            <p className="text-xs text-slate-500 mt-1">
              {seatNumber} settled for ₹{finalGrandTotal} via {selectedMethod.toUpperCase()}.
            </p>
            <button
              type="button"
              onClick={handleFinalizeAndExit}
              className="w-full h-10 mt-4 rounded-xl bg-slate-900 text-white text-xs font-bold btn-press shadow-xs cursor-pointer"
            >
              Back to Floor Grid
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MobileBillSettlement;
