"use client";
/**
 * Thoogudeepa Waiter Mobile Cockpit - Master App Container Component
 *
 * Real-world enterprise Waiter Master Orchestrator:
 * - Balanced Modern Theme: Soft slate canvas (#F8FAFC), crisp white card (#FFFFFF),
 *   subtle borders (#E2E8F0), slate-900 typography, and vibrant accents
 * - Smartphone Viewport Frame (425px max-width) with smooth screen transitions
 * - Integrated Sub-Components:
 *   * MobileLogin: Fixed logo, bilingual headers, PIN pad, Powered by Nelja Tech badge
 *   * MobileHeader: Staff chip, online pulse, section indicator, alerts bell
 *   * MobileSeatGrid: 10 seats, green vacant borders, amber occupied, rose billing
 *   * MobileOrderCatalog: Search with clear ✕, category pills, cart counter badge
 *   * MobileLiveCartKOT: Bottom slide-up order review, notes placeholder, KOT punch
 *   * MobileBillSettlement: Breakdown, payment mode tabs, dynamic UPI QR, thermal settle
 *   * MobileAlerts: Customer calls (message in placeholder) & kitchen ready (serve buttons)
 *   * MobileProfileShift: Sales stats, shift clock-in, thermal report print, end shift
 *   * MobileBottomNav: Fixed 4-tab dock with active states and badge counters
 * - Global Interactive Toast Notification System
 * - Strict Line Count: Maintained strictly between 300 and 400 lines
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Bell, 
  Receipt,
  Printer
} from 'lucide-react';
import { 
  MobileScreenId, 
  WaiterAuthAccount, 
  WaiterProfile, 
  SeatEntity, 
  CartItem, 
  MenuItem, 
  FloorAlert, 
  PaymentMethod,
  INITIAL_SEAT_DATA,
  DEFAULT_STAFF_ACCOUNTS,
  SAMPLE_MENU_ITEMS,
  RESTAURANT_CONSTANTS,
  generateSeatsForStaff
} from './types';
import MobileLogin from './MobileLogin';
import MobileHeader from './MobileHeader';
import MobileSeatGrid from './MobileSeatGrid';
import MobileOrderCatalog from './MobileOrderCatalog';
import MobileLiveCartKOT from './MobileLiveCartKOT';
import MobileBillSettlement from './MobileBillSettlement';
import MobileAlerts from './MobileAlerts';
import MobileProfileShift from './MobileProfileShift';
import MobileBottomNav from './MobileBottomNav';

export const MobileCockpitMaster: React.FC = () => {
  // Navigation & Screen State
  const [activeScreen, setActiveScreen] = useState<MobileScreenId>('login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeWaiterAccount, setActiveWaiterAccount] = useState<WaiterAuthAccount>(DEFAULT_STAFF_ACCOUNTS[0]);

  // Floor Seats State (Dynamically populated based on active waiter's seat assignment)
  const [seats, setSeats] = useState<SeatEntity[]>(() => generateSeatsForStaff(DEFAULT_STAFF_ACCOUNTS[0]));
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<string>('Seat 02');
  const [selectedGuestName, setSelectedGuestName] = useState<string>('Walk-In Guest');
  const [selectedBillAmount, setSelectedBillAmount] = useState<number>(840);

  // Cart & KOT State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { menuItem: SAMPLE_MENU_ITEMS[0], quantity: 2, lineTotal: 520 },
    { menuItem: SAMPLE_MENU_ITEMS[2], quantity: 1, lineTotal: 220 }
  ]);

  // Floor Service Alerts State
  const [alerts, setAlerts] = useState<FloorAlert[]>([
    {
      id: 'call-1',
      type: 'customer_call',
      seatNumber: 'Seat 03',
      guestName: 'Rajesh V',
      title: 'Water Refill Requested',
      message: 'Water Refill Requested',
      timeAgo: '2 mins ago',
      isUrgent: false
    },
    {
      id: 'call-2',
      type: 'customer_call',
      seatNumber: 'Seat 04',
      guestName: 'Kiran R',
      title: 'Bill Requested (₹840)',
      message: 'Bill Requested (₹840)',
      timeAgo: '1 min ago',
      billAmount: 840,
      isUrgent: true
    },
    {
      id: 'kitchen-1',
      type: 'kitchen_ready',
      seatNumber: 'Seat 01',
      title: '2x Chicken Donne Biryani',
      message: 'Freshly cooked & plated in donne pot',
      timeAgo: '1 min ago',
      kotNumber: 'KOT #108',
      isUrgent: false
    },
    {
      id: 'kitchen-2',
      type: 'kitchen_ready',
      seatNumber: 'Seat 05',
      title: '1x Chilli Chicken Dry',
      message: 'Pass counter ready',
      timeAgo: 'Just now',
      kotNumber: 'KOT #109',
      isUrgent: false
    }
  ]);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger reactive toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2600);
  }, []);

  // Waiter Profile Telemetry
  const waiterProfile: WaiterProfile = useMemo(() => ({
    staffId: RESTAURANT_CONSTANTS.DEFAULT_WAITER_ID,
    name: activeWaiterAccount.name,
    initials: activeWaiterAccount.initials,
    assignedSection: 'Zone 1 (Seats 01 – 10)',
    assignedSeats: activeWaiterAccount.seatRange,
    clockInTime: '11:00 AM',
    activeDuration: '4h 15m active',
    totalSales: 14850,
    billsSettledCount: 18,
    tipsEarned: 620,
    kotsPunched: 28,
    guestsServed: 42,
    connectionStatus: 'online_5g'
  }), [activeWaiterAccount]);

  // Handle successful staff PIN login
  const handleLoginSuccess = useCallback((account: WaiterAuthAccount) => {
    setActiveWaiterAccount(account);
    setSeats(generateSeatsForStaff(account));
    setIsAuthenticated(true);
    setActiveScreen('seats');
    showToast(`Shift Authenticated: Welcome ${account.name}!`);
  }, [showToast]);

  // Handle dynamic zone change
  const handleZoneChange = useCallback((zoneLabel: string) => {
    const staff = DEFAULT_STAFF_ACCOUNTS.find(s => 
      zoneLabel.toLowerCase().includes(s.seatRange.toLowerCase()) || 
      zoneLabel.toLowerCase().includes(s.zone.toLowerCase())
    ) || activeWaiterAccount;
    setActiveWaiterAccount(staff);
    setSeats(generateSeatsForStaff(staff));
    showToast(`Switched to ${staff.seatRange}`);
  }, [activeWaiterAccount, showToast]);

  // Handle waiter logout / end shift
  const handleEndShift = useCallback(() => {
    setIsAuthenticated(false);
    setActiveScreen('login');
    showToast('Shift closed successfully. Thermal summary printed.');
  }, [showToast]);

  // Handle opening seat order pad (take order)
  const handleOpenTakeOrder = useCallback((seatNum: string, guest?: string) => {
    setSelectedSeatNumber(seatNum);
    setSelectedGuestName(guest || 'Walk-In Guest');
    setActiveScreen('order');
    showToast(`Taking new order for ${seatNum}`);
  }, [showToast]);

  // Handle viewing live cart for occupied seat
  const handleOpenViewOrder = useCallback((seatNum: string, guest?: string) => {
    setSelectedSeatNumber(seatNum);
    setSelectedGuestName(guest || 'Dining Guest');
    setActiveScreen('cart');
    showToast(`Viewing live order cart for ${seatNum}`);
  }, [showToast]);

  // Handle opening seat bill checkout
  const handleOpenSeatBill = useCallback((seatNum: string, guest: string, amount: number) => {
    setSelectedSeatNumber(seatNum);
    setSelectedGuestName(guest);
    setSelectedBillAmount(amount);
    setActiveScreen('bill');
    showToast(`Loaded checkout receipt for ${seatNum}`);
  }, [showToast]);

  // Handle cart quantity change
  const handleModifyCartQuantity = useCallback((menuItem: MenuItem, change: number) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.menuItem.id === menuItem.id);
      if (!existing && change > 0) {
        showToast(`Added ${menuItem.name} to order`);
        return [...prev, { menuItem, quantity: 1, lineTotal: menuItem.price }];
      }
      if (existing) {
        const newQty = existing.quantity + change;
        if (newQty <= 0) {
          showToast(`Removed ${menuItem.name} from order`);
          return prev.filter(i => i.menuItem.id !== menuItem.id);
        }
        showToast(`${change > 0 ? 'Added' : 'Removed'} ${menuItem.name}`);
        return prev.map(i => i.menuItem.id === menuItem.id ? {
          ...i,
          quantity: newQty,
          lineTotal: newQty * menuItem.price
        } : i);
      }
      return prev;
    });
  }, [showToast]);

  // Fire KOT submission
  const handleFireKOT = useCallback((instructions: string) => {
    showToast(`KOT #110 successfully sent to Kitchen printer!`);
    // Update seat status to occupied
    setSeats(prev => prev.map(s => s.seatNumber === selectedSeatNumber ? {
      ...s,
      status: 'occupied',
      guestName: selectedGuestName,
      itemCount: cartItems.length,
      runningTotal: cartItems.reduce((acc, c) => acc + c.lineTotal, 0)
    } : s));
  }, [selectedSeatNumber, selectedGuestName, cartItems, showToast]);

  // Resolve Customer Call
  const handleAttendCall = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast('Customer call marked as Attended!');
  }, [showToast]);

  // Serve Kitchen Dish
  const handleServeDish = useCallback((alertId: string, dishName: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast(`Served ${dishName} to table!`);
  }, [showToast]);

  // Settle Bill
  const handleSettleSuccess = useCallback((seatNum: string, method: PaymentMethod, amount: number) => {
    setSeats(prev => prev.map(s => s.seatNumber === seatNum ? {
      ...s,
      status: 'vacant',
      guestName: undefined,
      itemCount: 0,
      runningTotal: 0
    } : s));
    setActiveScreen('seats');
    showToast(`${seatNum} settled via ${method.toUpperCase()} & marked clean!`);
  }, [showToast]);

  // Cart Subtotal for Peek Pill
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.lineTotal, 0);
  }, [cartItems]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cartItems]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-slate-900 p-0 sm:p-4 select-none">
      
      {/* 425px Modern Smartphone Viewport Container */}
      <main className="w-full max-w-[425px] h-full sm:h-[860px] bg-[#F8FAFC] sm:rounded-[36px] sm:border sm:border-slate-700 shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Interactive Toast Banner */}
        {toastMessage && (
          <div className="absolute top-10 left-3 right-3 bg-slate-900/95 text-white px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold z-50 animate-in slide-in-from-top-4 duration-200 border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1 truncate">{toastMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 1: LOGIN (Fixed Logo, PIN Pad, Powered by Nelja) */}
        {/* ======================================================== */}
        {activeScreen === 'login' && (
          <MobileLogin 
            onLoginSuccess={handleLoginSuccess}
            onShowToast={showToast}
          />
        )}

        {/* ======================================================== */}
        {/* AUTHENTICATED APP SCREENS (Header + Active View + Bottom Nav) */}
        {/* ======================================================== */}
        {activeScreen !== 'login' && (
          <>
            {/* SCREEN 2: FLOOR SEAT GRID (Hotel Name FIRST, Waiter Below) */}
            {activeScreen === 'seats' && (
              <>
                <MobileHeader
                  profile={waiterProfile}
                  pendingAlertCount={alerts.length}
                  onOpenAlerts={() => setActiveScreen('alerts')}
                  onOpenProfile={() => setActiveScreen('profile')}
                  onZoneChange={handleZoneChange}
                />
                <MobileSeatGrid
                  seats={seats}
                  seatRange={activeWaiterAccount.seatRange}
                  waiterName={activeWaiterAccount.name}
                  onOpenTakeOrder={handleOpenTakeOrder}
                  onOpenViewOrder={handleOpenViewOrder}
                  onOpenSeatOrder={handleOpenTakeOrder}
                  onOpenSeatBill={handleOpenSeatBill}
                  onRefreshSeats={() => showToast('Floor seats refreshed from cloud!')}
                />
              </>
            )}

            {/* SCREEN 3: MENU & TAKE ORDER (NEW MENU LIST ONLY) */}
            {activeScreen === 'order' && (
              <MobileOrderCatalog
                activeSeatNumber={selectedSeatNumber}
                activeGuestName={selectedGuestName}
                cartItems={cartItems}
                pendingAlertCount={alerts.length}
                onOpenAlerts={() => setActiveScreen('alerts')}
                onModifyQuantity={handleModifyCartQuantity}
                onOpenCartSheet={() => setActiveScreen('cart')}
                onPunchKOT={() => {
                  handleFireKOT('Kitchen Pass Priority');
                  setActiveScreen('cart');
                }}
                onBackToSeats={() => setActiveScreen('seats')}
              />
            )}

            {/* SCREEN 4: CART & LIVE KOT ORDERS SCREEN */}
            {activeScreen === 'cart' && (
              <MobileLiveCartKOT
                seatNumber={selectedSeatNumber}
                guestName={selectedGuestName}
                cartItems={cartItems}
                pendingAlertCount={alerts.length}
                onClose={() => setActiveScreen('seats')}
                onOpenMenu={() => setActiveScreen('order')}
                onProceedToBill={(seatNum, guest, amount) => {
                  handleOpenSeatBill(seatNum, guest, amount);
                }}
                onOpenAlerts={() => setActiveScreen('alerts')}
                onModifyQuantity={handleModifyCartQuantity}
                onRemoveItem={(id) => setCartItems(prev => prev.filter(i => i.menuItem.id !== id))}
                onFireKOT={handleFireKOT}
                onClearCart={() => setCartItems([])}
              />
            )}

            {/* SCREEN 5: BILL SETTLEMENT (Cash & UPI Only) */}
            {activeScreen === 'bill' && (
              <MobileBillSettlement
                seatNumber={selectedSeatNumber}
                guestName={selectedGuestName}
                totalAmount={selectedBillAmount}
                pendingAlertCount={alerts.length}
                onBackToSeats={() => setActiveScreen('seats')}
                onOpenAlerts={() => setActiveScreen('alerts')}
                onSettleSuccess={handleSettleSuccess}
                onShowToast={showToast}
              />
            )}

            {/* SCREEN 6: ALERTS & SERVICE CALLS */}
            {activeScreen === 'alerts' && (
              <MobileAlerts
                alerts={alerts}
                onBack={() => setActiveScreen('seats')}
                onAttendCall={handleAttendCall}
                onCollectBill={handleOpenSeatBill}
                onServeDish={handleServeDish}
              />
            )}

            {/* SCREEN 7: WAITER PROFILE & SHIFT SUMMARY */}
            {activeScreen === 'profile' && (
              <MobileProfileShift
                profile={waiterProfile}
                onBack={() => setActiveScreen('seats')}
                onEndShift={handleEndShift}
                onShowToast={showToast}
              />
            )}

            {/* FIXED SMARTPHONE BOTTOM NAVIGATION DOCK (Screen 2 to Last) */}
            <MobileBottomNav
              activeScreen={activeScreen}
              onNavigate={(screen) => setActiveScreen(screen)}
              pendingAlertsCount={alerts.length}
              cartItemsCount={totalCartCount}
              cartSubtotal={cartSubtotal}
              onOpenCartPeek={() => setActiveScreen('cart')}
              onRequestSupervisor={() => showToast('Supervisor summoned to Zone 1!')}
              onReprintLastReceipt={() => showToast('Last bill reprinted on thermal POS!')}
            />
          </>
        )}

      </main>
    </div>
  );
};

export default MobileCockpitMaster;

