"use client";
/**
 * Thoogudeepa Waiter Tablet POS Cockpit - Bill Settlement Component
 *
 * Real-world enterprise In-Container Bill Settlement (40% split screen pane):
 * - Balanced In-Between Theme: Soft slate canvas (#F1F5F9), crisp white cards (#FFFFFF),
 *   subtle borders (#E2E8F0), slate-900 typography, and vibrant accents
 * - Renders directly inside the right container (NO POPUP MODAL)
 * - Header with [ ← Back ] to Live Ticket and customer context
 * - Itemized tax invoice breakdown: Subtotal, CGST (2.5%), SGST (2.5%), Total
 * - Payment Method Selector:
 *   * Cash Tender with dynamic tip synchronization, exact preset & change return
 *   * Dynamic UPI QR Code for Google Pay, PhonePe, Paytm, and BHIM with tip included
 * - Tip Preset selector (+₹0, +₹20, +₹50, +₹100) that automatically updates cash tender
 * - Conditional Payment Settlement Enablement:
 *   * Waiter must toggle/verify "Payment Received" before vacating!
 * - Single clean icon per action button:
 *   * [ Print Receipt ] (Printer icon)
 *   * [ Settle & Vacate ] (CheckCircle icon, disabled until payment confirmed)
 * - Standardized badge tokens (uniform 24px height, 10px bold uppercase font)
 * - Strict line count maintained between 300 and 400 lines (never exceeds 400).
 */

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Printer, 
  CheckCircle, 
  Banknote, 
  QrCode 
} from 'lucide-react';
import { PaymentMode } from './types';

export interface TabletBillSettlementProps {
  /** Target seat identifier (e.g. 'Seat 04') */
  seatName: string;
  /** Customer / Guest name */
  guestName: string;
  /** Gross payable amount */
  totalAmount: number;
  /** Callback to return back to live ticket mode */
  onBackToTicket: () => void;
  /** Callback to complete settlement and vacate seat on floor grid */
  onConfirmSettlement: () => void;
  /** Callback to print thermal tax invoice receipt */
  onPrintReceipt: () => void;
}

export const TabletBillSettlement: React.FC<TabletBillSettlementProps> = ({
  seatName,
  guestName,
  totalAmount,
  onBackToTicket,
  onConfirmSettlement,
  onPrintReceipt
}) => {
  // Selected payment method: cash or upi
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<number>(totalAmount);
  const [isReceiptPrinting, setIsReceiptPrinting] = useState<boolean>(false);
  
  // Conditional Payment Verification State (Must be verified by waiter to enable vacate)
  const [isPaymentReceived, setIsPaymentReceived] = useState<boolean>(false);

  // Financial calculations with tip dynamically included
  const payableAmount = totalAmount + selectedTip;
  const subtotal = Math.round(totalAmount / 1.05);
  const gst = totalAmount - subtotal;
  const cgst = Math.round(gst / 2);
  const sgst = gst - cgst;
  const cashChange = Math.max(0, cashTendered - payableAmount);

  // Handler: Selecting tip automatically syncs cash tender amount
  const handleSelectTip = (tip: number) => {
    setSelectedTip(tip);
    const updatedPayable = totalAmount + tip;
    setCashTendered(updatedPayable);
  };

  // UPI QR Code Generator URL including tip
  const qrUrl = useMemo(() => {
    const upiUri = `upi://pay?pa=thoogudeepa@icici&pn=Thoogudeepa%20Donne%20Biryani&am=${payableAmount}&cu=INR&tn=${encodeURIComponent(seatName)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUri)}`;
  }, [payableAmount, seatName]);

  const handlePrint = () => {
    setIsReceiptPrinting(true);
    onPrintReceipt();
    setTimeout(() => {
      setIsReceiptPrinting(false);
    }, 1800);
  };

  const handleConfirmVacate = () => {
    if (!isPaymentReceived) return;
    onConfirmSettlement();
  };

  return (
    <div 
      id="right-mode-bill" 
      className="flex flex-col justify-between h-full select-none bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
      role="region"
      aria-label="In-Container Bill Settlement Pane"
    >
      <div className="overflow-y-auto no-scrollbar flex-1 pr-0.5">
        {/* ======================================================== */}
        {/* 1. HEADER: RETURN TO TICKET BUTTON & INVOICE TARGET      */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToTicket}
              className="w-8 h-8 rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 active:scale-90 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              title="Return to Live Order Ticket"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </button>
            <div>
              <h3 className="text-xs font-black text-slate-900 leading-none">
                {seatName} • Settlement
              </h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1 leading-none">
                Customer: <span className="text-slate-800">{guestName}</span>
              </p>
            </div>
          </div>
          {/* Standardized Uniform Badge Size */}
          <span className="h-6 px-2.5 inline-flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
            Tax Invoice
          </span>
        </div>

        {/* ======================================================== */}
        {/* 2. ITEMIZED INVOICE BREAKDOWN                            */}
        {/* ======================================================== */}
        <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/70 mb-3 text-xs shadow-2xs">
          {/* Sample Bill Items */}
          <div className="space-y-1.5 pb-2 border-b border-slate-200 text-[11px]">
            <div className="flex justify-between font-bold text-slate-800">
              <span>2x Chicken Donne Biryani</span>
              <span className="text-amber-700 font-extrabold">₹520</span>
            </div>
            <div className="flex justify-between font-bold text-slate-800">
              <span>1x Chilli Chicken (Dry)</span>
              <span className="text-amber-700 font-extrabold">₹220</span>
            </div>
            <div className="flex justify-between font-bold text-slate-800">
              <span>1x Fresh Lime Soda</span>
              <span className="text-amber-700 font-extrabold">₹60</span>
            </div>
            <div className="flex justify-between font-bold text-slate-800">
              <span>1x Gunpowder Ghee Rice</span>
              <span className="text-amber-700 font-extrabold">₹180</span>
            </div>
          </div>

          {/* Subtotal & GST breakdown */}
          <div className="space-y-1 pt-2 border-b border-slate-200 pb-2 text-[10px] text-slate-500 font-semibold">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (2.5%):</span>
              <span>₹{cgst}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (2.5%):</span>
              <span>₹{sgst}</span>
            </div>
            {selectedTip > 0 && (
              <div className="flex justify-between text-amber-700 font-bold">
                <span>Staff Tip:</span>
                <span>+₹{selectedTip}</span>
              </div>
            )}
          </div>

          {/* Grand Payable */}
          <div className="pt-2 flex justify-between items-center text-xs font-black">
            <span className="text-slate-900">Total Payable:</span>
            <span className="text-base font-black text-amber-700">
              ₹{payableAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. OPTIONAL TIP PRESETS (DYNAMICALLY SYNCED TO CASH)     */}
        {/* ======================================================== */}
        <div className="mb-3">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
            Add Waiter Tip (Optional)
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 20, 50, 100].map(tip => (
              <button
                key={tip}
                type="button"
                onClick={() => handleSelectTip(tip)}
                className={`h-8 rounded-xl text-xs font-bold border transition-all flex items-center justify-center cursor-pointer ${
                  selectedTip === tip
                    ? 'bg-amber-500 text-slate-950 font-black border-amber-500 shadow-xs ring-2 ring-amber-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {tip === 0 ? 'None' : `+₹${tip}`}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. PAYMENT METHOD SELECTOR: CASH VS DYNAMIC UPI QR       */}
        {/* ======================================================== */}
        <div className="mb-3">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
            Payment Mode
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* Cash Tab */}
            <button
              type="button"
              onClick={() => { setPaymentMode('cash'); setIsPaymentReceived(false); }}
              className={`h-10 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                paymentMode === 'cash'
                  ? 'bg-amber-50 text-amber-900 border-2 border-amber-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Cash</span>
            </button>

            {/* UPI QR Tab */}
            <button
              type="button"
              onClick={() => { setPaymentMode('upi'); setIsPaymentReceived(false); }}
              className={`h-10 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                paymentMode === 'upi'
                  ? 'bg-amber-50 text-amber-900 border-2 border-amber-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>UPI / QR</span>
            </button>
          </div>
        </div>

        {/* Cash Tender Calculator View with Tip Integration */}
        {paymentMode === 'cash' && (
          <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 mb-3 space-y-2.5">
            {/* Total Payable Row with Tip Indicator */}
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200">
              <span className="font-bold text-slate-700">Total Payable:</span>
              <div className="text-right">
                <span className="font-black text-amber-700 text-sm">
                  ₹{payableAmount.toLocaleString('en-IN')}
                </span>
                {selectedTip > 0 && (
                  <span className="text-[9px] text-slate-500 block font-semibold">
                    (₹{totalAmount} bill + ₹{selectedTip} tip)
                  </span>
                )}
              </div>
            </div>

            {/* Cash Tender Input */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Cash Received:</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                  className="w-24 px-2 py-1 text-xs font-black bg-white border border-slate-300 rounded-lg text-right outline-none text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Quick Denominations with Exact Presets */}
            <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
              <button
                type="button"
                onClick={() => setCashTendered(payableAmount)}
                className={`h-7 px-2.5 rounded-lg text-[10px] font-bold border transition-all shadow-2xs cursor-pointer ${
                  cashTendered === payableAmount
                    ? 'bg-amber-500 text-slate-950 font-black border-amber-500'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Exact (₹{payableAmount})
              </button>
              {[500, 1000, 2000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCashTendered(val)}
                  className={`h-7 px-2.5 rounded-lg text-[10px] font-bold border transition-all shadow-2xs cursor-pointer ${
                    cashTendered === val
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-500'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            {/* Change Due or Remaining Due */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-black">
              {cashTendered >= payableAmount ? (
                <>
                  <span className="text-slate-600">Change Due:</span>
                  <span className="text-emerald-600 font-black text-sm">
                    ₹{cashChange.toLocaleString('en-IN')}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-rose-600 font-bold">Remaining Due:</span>
                  <span className="text-rose-600 font-black text-sm">
                    -₹{(payableAmount - cashTendered).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Dynamic UPI QR Code View */}
        {paymentMode === 'upi' && (
          <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 mb-3 flex flex-col items-center text-center">
            <span className="text-[10px] font-bold text-slate-500 mb-2">
              Scan with GPay, PhonePe, Paytm or BHIM
            </span>
            <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-300">
              <img
                src={qrUrl}
                alt="UPI Payment QR Code"
                className="w-32 h-32 object-contain rounded-lg"
              />
            </div>
            <span className="text-xs font-black text-amber-700 mt-2">
              ₹{payableAmount.toLocaleString('en-IN')} {selectedTip > 0 ? `(incl. ₹${selectedTip} tip)` : ''}
            </span>
          </div>
        )}

        {/* ======================================================== */}
        {/* CONDITIONAL PAYMENT VERIFICATION SWITCH                  */}
        {/* ======================================================== */}
        <div 
          onClick={() => setIsPaymentReceived(!isPaymentReceived)}
          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all mb-2 ${
            isPaymentReceived 
              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500/30' 
              : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400'
          }`}
          title="Waiter confirms that customer paid before vacating seat"
        >
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
              isPaymentReceived ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
            }`}>
              {isPaymentReceived && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className="text-xs font-bold text-slate-900">
              {isPaymentReceived ? 'Payment Received & Verified' : 'Tap to Confirm Payment Received'}
            </span>
          </div>
          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isPaymentReceived ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {isPaymentReceived ? 'VERIFIED' : 'PENDING'}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. SETTLEMENT ACTIONS: PRINT RECEIPT & CONDITIONAL VACATE */}
      {/* ======================================================== */}
      <div className="pt-3 border-t border-slate-200 mt-2 space-y-2">
        {/* Single Icon Button: Print Receipt */}
        <button
          type="button"
          onClick={handlePrint}
          className="w-full h-10 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span>{isReceiptPrinting ? 'Printing Receipt...' : 'Print Receipt'}</span>
        </button>

        {/* Single Icon Button: Settle & Vacate */}
        <button
          type="button"
          disabled={!isPaymentReceived}
          onClick={handleConfirmVacate}
          className={`w-full h-11 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            isPaymentReceived
              ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-xs cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 opacity-60'
          }`}
          title={isPaymentReceived ? "Vacate seat and close bill" : "Confirm payment received before vacating seat"}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{isPaymentReceived ? 'Settle & Vacate' : 'Awaiting Payment from Customer'}</span>
        </button>
      </div>
    </div>
  );
};

export default TabletBillSettlement;
