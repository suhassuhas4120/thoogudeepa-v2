/**
 * Thoogudeepa Waiter Tablet POS Cockpit - Cockpit Master Container Component
 *
 * Master Orchestrator Component for the 10-inch Tablet Viewport (1024px x 768px):
 * - Screen 1: Balanced Left-Right Landscape Login Screen
 * - Screen 2: 100-Seat Floor Board (Zone 1: Seats 01 to 10)
 * - Screen 3: Order Cockpit (Left: Menu Catalog, Right: Live Ticket OR In-Container Bill)
 * - Screen 4: Waiter Profile & Shift Handover Dashboard
 * - Right Slide-Over Sheet: Real-time Customer Service Calls & Kitchen Order Ready alerts
 * - Balanced In-Between Theme: Soft slate canvas (#E2E8F0), crisp white cards (#FFFFFF),
 *   slate-900 typography, subtle borders (#CBD5E1), and vibrant accents
 * - Single clean icon per action button throughout the application
 * - Strict line count maintained between 300 and 400 lines (never exceeds 400).
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  ScreenId, 
  PaymentMode, 
  INITIAL_WAITER_PROFILE, 
  INITIAL_SEATS, 
  INITIAL_TICKET_ITEMS, 
  INITIAL_ALERTS, 
  SHIFT_LOGS, 
  MENU_DISHES,
  SeatItem,
  ServiceAlert,
  TicketItem
} from './types';
import { TabletLogin } from './TabletLogin';
import { TabletHeader } from './TabletHeader';
import { TabletFloorGrid } from './TabletFloorGrid';
import { TabletMenuCatalog } from './TabletMenuCatalog';
import { TabletLiveTicket } from './TabletLiveTicket';
import { TabletBillSettlement } from './TabletBillSettlement';
import { TabletAlertSheet } from './TabletAlertSheet';
import { TabletProfileShift } from './TabletProfileShift';

export const TabletCockpitMaster: React.FC = () => {
  // Navigation & Screen View State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('login');
  const [profile, setProfile] = useState(INITIAL_WAITER_PROFILE);
  const [seats, setSeats] = useState<SeatItem[]>(INITIAL_SEATS);
  const [ticketItems, setTicketItems] = useState<TicketItem[]>(INITIAL_TICKET_ITEMS);
  const [alerts, setAlerts] = useState<ServiceAlert[]>(INITIAL_ALERTS);
  const [shiftLogs, setShiftLogs] = useState(SHIFT_LOGS);

  // Active Target Seat & Cockpit Right Pane Mode ('ticket' or 'bill')
  const [activeSeatName, setActiveSeatName] = useState<string>('Seat 02: Walk-In');
  const [activeSeatCustomer, setActiveSeatCustomer] = useState<string>('Walk-In Guest');
  const [activeSeatAmount, setActiveSeatAmount] = useState<number>(1029);
  const [isDining, setIsDining] = useState<boolean>(false);
  const [rightPaneMode, setRightPaneMode] = useState<'ticket' | 'bill'>('ticket');

  // Menu Dish Steppers State (dishId -> quantity)
  const [dishQuantities, setDishQuantities] = useState<Record<number, number>>({ 1: 2, 3: 1 });

  // Right-Side Alert Slide-Over Sheet State
  const [isAlertSheetOpen, setIsAlertSheetOpen] = useState<boolean>(false);
  const [activeSheetTab, setActiveSheetTab] = useState<'customer' | 'kitchen'>('customer');

  // Floating Toast Notification Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => { setToastMessage(null); }, 2400);
  }, []);

  // Cart & Pricing Calculations
  const cartCount = useMemo(() => Object.values(dishQuantities).reduce((acc, q) => acc + q, 0), [dishQuantities]);

  const subtotal = useMemo(() => {
    return Object.entries(dishQuantities).reduce((acc, [id, qty]) => {
      const dish = MENU_DISHES.find(d => d.id === Number(id));
      return acc + (dish ? dish.price * qty : 200 * qty);
    }, 0);
  }, [dishQuantities]);

  const gst = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const grandTotal = useMemo(() => subtotal + gst, [subtotal, gst]);

  // Unresolved Alert Counts for Global Header Badges
  const customerCallsCount = useMemo(() => alerts.filter(a => a.type === 'customer' && !a.isResolved).length, [alerts]);
  const kitchenAlertsCount = useMemo(() => alerts.filter(a => a.type === 'kitchen' && !a.isResolved).length, [alerts]);
  const occupiedSeatsCount = useMemo(() => seats.filter(s => s.status === 'occupied').length, [seats]);

  // Handler: Login Success transition
  const handleLoginSuccess = () => {
    setCurrentScreen('seats');
    showToast('Shift Started: Ramesh Kumar (Seats 01 - 10)');
  };

  // Handler: Logout from Profile
  const handleEndShift = () => {
    setCurrentScreen('login');
    showToast('Shift ended successfully. Have a great rest!');
  };

  // Handler: Open Order Screen for a Seat
  const handleOpenOrder = (seatId: string, seatName: string, customer: string, amount: number, dining: boolean) => {
    setActiveSeatName(`${seatName}: ${customer}`);
    setActiveSeatCustomer(customer);
    setActiveSeatAmount(amount);
    setIsDining(dining);
    setRightPaneMode('ticket');

    if (!dining) {
      setDishQuantities({});
      setTicketItems([]);
    } else {
      setDishQuantities({ 1: 2, 3: 1 });
      setTicketItems(INITIAL_TICKET_ITEMS);
    }
    setCurrentScreen('order');
  };

  // Handler: Open Bill Settlement Screen (Right-pane mode switch)
  const handleOpenBill = (seatName: string, customer: string, amount: number) => {
    setActiveSeatName(`${seatName}: ${customer}`);
    setActiveSeatCustomer(customer);
    setActiveSeatAmount(amount);
    setIsDining(true);
    setRightPaneMode('bill');
    setCurrentScreen('order');
  };

  // Handler: Quick switch target seat from menu subheader
  const handleQuickSeatSwitch = (seatVal: string) => {
    const seatObj = seats.find(s => s.seatNumber === seatVal);
    if (seatObj) {
      handleOpenOrder(seatObj.id, seatObj.seatNumber, seatObj.guestName, seatObj.totalAmount, seatObj.status === 'occupied');
    }
  };

  // Handler: Add dish to cart for the first time
  const handleAddDishFirstTime = (dishId: number, price: number) => {
    setDishQuantities(prev => ({ ...prev, [dishId]: 1 }));
    const dishInfo = MENU_DISHES.find(d => d.id === dishId);
    if (dishInfo) {
      setTicketItems(prev => {
        const existing = prev.find(item => item.id === dishId);
        if (existing) return prev.map(item => item.id === dishId ? { ...item, quantity: item.quantity + 1 } : item);
        return [...prev, { id: dishId, name: dishInfo.name, quantity: 1, price: price, status: 'PLACED' }];
      });
    }
    showToast(`Added to ticket`);
  };

  // Handler: Stepper increment / decrement quantity
  const handleChangeQty = (dishId: number, delta: number, price: number) => {
    const currentQty = dishQuantities[dishId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    setDishQuantities(prev => {
      const updated = { ...prev };
      if (newQty === 0) delete updated[dishId];
      else updated[dishId] = newQty;
      return updated;
    });

    setTicketItems(prev => {
      if (newQty === 0) return prev.filter(item => item.id !== dishId);
      return prev.map(item => item.id === dishId ? { ...item, quantity: newQty } : item);
    });
  };

  // Handler: Mark an item as served
  const handleServeItem = (itemId: number) => {
    setTicketItems(prev => prev.map(item => (item.id === itemId ? { ...item, status: 'SERVED' } : item)));
    showToast('Dish marked as served');
  };

  // Handler: Fire KOT to Kitchen
  const handlePunchKot = () => {
    setTicketItems(prev => prev.map(item => (item.status === 'PLACED' ? { ...item, status: 'RECEIVED' } : item)));
    const activeSeatNum = activeSeatName.split(':')[0].trim();
    setSeats(prev => prev.map(s => s.seatNumber === activeSeatNum ? { ...s, status: 'occupied', totalAmount: grandTotal, orderCount: cartCount } : s));
    setIsDining(true);
    showToast(`KOT fired to kitchen for ${activeSeatNum}`);
  };

  // Handler: Clear ticket pad
  const handleClearTicket = () => {
    setDishQuantities({});
    setTicketItems([]);
    showToast('Ticket reset');
  };

  // Handler: Confirm Settlement and Vacate
  const handleConfirmSettlement = () => {
    const activeSeatNum = activeSeatName.split(':')[0].trim();
    setSeats(prev => prev.map(s => s.seatNumber === activeSeatNum ? { ...s, status: 'vacant', guestName: 'Available', totalAmount: 0, orderCount: 0, hasBillRequest: false } : s));
    setRightPaneMode('ticket');
    setCurrentScreen('seats');
    showToast(`Payment settled & ${activeSeatNum} vacated`);
  };

  // Alerts Slide-Over Sheet Handlers
  const handleOpenAlertSheet = (tabType: 'customer' | 'kitchen') => {
    setActiveSheetTab(tabType);
    setIsAlertSheetOpen(true);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, isResolved: true } : a)));
    showToast('Alert attended and synchronized');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-0 lg:p-4 select-none bg-[#E2E8F0]">
      {/* ======================================================== */}
      {/* FIXED TABLET COCKPIT FRAME (1024px x 768px ACROSS ALL SCREENS) */}
      {/* ======================================================== */}
      <main className="tablet-frame relative w-[1024px] max-w-[100vw] h-[768px] max-h-[100vh] bg-[#F8FAFC] border border-slate-300 rounded-[28px] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Top Global Header (Persistent on Floor, Order, Profile - NO CENTER TABS!) */}
        {currentScreen !== 'login' && (
          <TabletHeader
            currentScreen={currentScreen}
            waiterName={profile.name}
            assignedZone={profile.assignedZone}
            customerCallsCount={customerCallsCount}
            kitchenAlertsCount={kitchenAlertsCount}
            occupiedCount={occupiedSeatsCount}
            onNavigate={(s) => setCurrentScreen(s)}
            onOpenAlertSheet={handleOpenAlertSheet}
          />
        )}

        {/* ======================================================== */}
        {/* SCREEN 1: LOGIN (LEFT-RIGHT BALANCED LANDSCAPE WITH LOGO) */}
        {/* ======================================================== */}
        {currentScreen === 'login' && (
          <TabletLogin onLoginSuccess={handleLoginSuccess} />
        )}

        {/* ======================================================== */}
        {/* SCREEN 2: 100-SEAT FLOOR BOARD (SEATS 01 TO 10) */}
        {/* ======================================================== */}
        {currentScreen === 'seats' && (
          <TabletFloorGrid
            seats={seats}
            onOpenOrder={handleOpenOrder}
            onOpenBill={handleOpenBill}
          />
        )}

        {/* ======================================================== */}
        {/* SCREEN 3: ORDER TERMINAL & IN-CONTAINER BILL (NO POPUP!) */}
        {/* ======================================================== */}
        {currentScreen === 'order' && (
          <section id="screen-order" className="w-full flex-1 flex flex-row overflow-hidden bg-slate-50">
            {/* Left 60%: Menu Catalog & Categories */}
            <TabletMenuCatalog
              activeSeatName={activeSeatName}
              isDining={isDining}
              dishQuantities={dishQuantities}
              cartCount={cartCount}
              onBackToFloor={() => setCurrentScreen('seats')}
              onQuickSeatSwitch={handleQuickSeatSwitch}
              onAddDishFirstTime={handleAddDishFirstTime}
              onChangeQty={handleChangeQty}
              onSwitchToTicketMode={() => setRightPaneMode('ticket')}
            />

            {/* Right 40%: In-Container Live Ticket OR Bill Settlement */}
            <div className="w-[40%] h-full flex flex-col justify-between p-4 bg-[#F1F5F9] border-l border-slate-200 overflow-y-auto no-scrollbar">
              {rightPaneMode === 'ticket' ? (
                <TabletLiveTicket
                  activeSeatName={activeSeatName}
                  ticketItems={ticketItems}
                  subtotal={subtotal}
                  gst={gst}
                  grandTotal={grandTotal}
                  onServeItem={handleServeItem}
                  onPunchKot={handlePunchKot}
                  onSwitchToBillMode={() => setRightPaneMode('bill')}
                  onClearTicket={handleClearTicket}
                />
              ) : (
                <TabletBillSettlement
                  seatName={activeSeatName.split(':')[0].trim()}
                  guestName={activeSeatCustomer}
                  totalAmount={activeSeatAmount}
                  onBackToTicket={() => setRightPaneMode('ticket')}
                  onConfirmSettlement={handleConfirmSettlement}
                  onPrintReceipt={() => showToast('Tax invoice sent to thermal printer')}
                />
              )}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* SCREEN 4: PROFILE & SHIFT SUMMARY (NO BELL IN HEADER) */}
        {/* ======================================================== */}
        {currentScreen === 'profile' && (
          <TabletProfileShift
            profile={profile}
            shiftLogs={shiftLogs}
            onBackToSeats={() => setCurrentScreen('seats')}
            onPrintShiftReport={() => showToast('Shift summary printed to thermal printer')}
            onEndShift={handleEndShift}
          />
        )}

        {/* ======================================================== */}
        {/* RIGHT-SIDE SLIDE-OVER SHEET (DEDICATED CALLS / KITCHEN) */}
        {/* ======================================================== */}
        <TabletAlertSheet
          isOpen={isAlertSheetOpen}
          activeTab={activeSheetTab}
          alerts={alerts}
          onClose={() => setIsAlertSheetOpen(false)}
          onSwitchTab={(t) => setActiveSheetTab(t)}
          onResolveAlert={handleResolveAlert}
          onGoToCollectBill={(sNum, gName, amt) => {
            setIsAlertSheetOpen(false);
            handleOpenBill(sNum, gName, amt);
          }}
        />

        {/* Floating Toast Notification Feedback */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-xs font-bold z-50 shadow-2xl border border-slate-700 flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default TabletCockpitMaster;
