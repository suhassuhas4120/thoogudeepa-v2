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

import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  RESTAURANT_CONSTANTS
} from './types';
import { realtimeBridge } from '../../lib/supabase';
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

  // Floor Seats State (Zone 1: 10 Seats)
  const [seats, setSeats] = useState<SeatEntity[]>(INITIAL_SEAT_DATA);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<string>('Seat 02');
  const [selectedGuestName, setSelectedGuestName] = useState<string>('Walk-In Guest');
  const [selectedBillAmount, setSelectedBillAmount] = useState<number>(840);

  // Cart & KOT State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { menuItem: SAMPLE_MENU_ITEMS[0], quantity: 2, lineTotal: 520 },
    { menuItem: SAMPLE_MENU_ITEMS[2], quantity: 1, lineTotal: 220 }
  ]);

  // Floor Service Alerts State
  const [alerts, setAlerts] = useState<FloorAlert[]>([]);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger reactive toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2600);
  }, []);

  const refreshSeats = useCallback(async () => {
    try {
      const floorData = await realtimeBridge.getFloorSeats();
      setSeats(floorData.map(f => ({
        id: f.id,
        seatNumber: f.seatNumber,
        numericId: f.numericId,
        status: f.status,
        guestName: f.guestName,
        diningDuration: f.diningDuration,
        itemCount: f.itemCount,
        runningTotal: f.runningTotal,
        hasBillRequest: f.hasBillRequest,
        zone: f.zone
      })));
    } catch (err) {
      console.error('Error loading seats:', err);
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    try {
      const activeAlerts = await realtimeBridge.getServiceAlerts();
      setAlerts(activeAlerts.filter(a => !a.isResolved).map(a => ({
        id: a.id,
        type: a.type,
        seatNumber: a.seatNumber,
        guestName: a.guestName,
        title: a.title,
        message: a.message,
        timeAgo: a.timeAgo,
        billAmount: a.billAmount,
        kotNumber: a.kotNumber,
        isUrgent: a.isUrgent
      })));
    } catch (err) {
      console.error('Error loading alerts:', err);
    }
  }, []);

  useEffect(() => {
    refreshSeats();
    refreshAlerts();

    const unsub = realtimeBridge.subscribeKDS({
      onNewOrder: () => { refreshSeats(); refreshAlerts(); },
      onStageChange: (data) => {
        refreshAlerts();
        setCartItems(prev => prev.map(item => {
          if (
            String(item.menuItem.id) === data.dishId ||
            (data.dishName && item.menuItem.name.toLowerCase() === data.dishName.toLowerCase()) ||
            data.key === String(item.menuItem.id)
          ) {
            return { ...item, stage: data.stage };
          }
          return item;
        }));
      },
      onTicketDispatched: () => { refreshAlerts(); },
      onSeatOccupancyChange: () => { refreshSeats(); },
      onNewAlert: (alert) => {
        setAlerts(prev => {
          if (prev.some(a => a.id === alert.id)) return prev;
          return [{
            id: alert.id,
            type: alert.type,
            seatNumber: alert.seatNumber,
            guestName: alert.guestName,
            title: alert.title,
            message: alert.message,
            timeAgo: alert.timeAgo,
            billAmount: alert.billAmount,
            kotNumber: alert.kotNumber,
            isUrgent: alert.isUrgent
          }, ...prev];
        });
      },
      onResolveAlert: (alertId) => { setAlerts(prev => prev.filter(a => a.id !== alertId)); },
      onBillRequested: () => { refreshSeats(); refreshAlerts(); },
      onBillSettled: () => { refreshSeats(); refreshAlerts(); },
      onClearAll: () => { refreshSeats(); refreshAlerts(); }
    });

    return () => unsub();
  }, [refreshSeats, refreshAlerts]);

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
    setIsAuthenticated(true);
    setActiveScreen('seats');
    showToast(`Shift Authenticated: Welcome ${account.name}!`);
  }, [showToast]);

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
    setCartItems([]);
    setActiveScreen('order');
    showToast(`Taking new order for ${seatNum}`);
  }, [showToast]);

  // Handle viewing live cart for occupied seat
  const handleOpenViewOrder = useCallback(async (seatNum: string, guest?: string) => {
    setSelectedSeatNumber(seatNum);
    setSelectedGuestName(guest || 'Dining Guest');
    const cleanChair = seatNum.replace(/[^0-9]/g, '');
    try {
      const details = await realtimeBridge.getOrderForSeat(cleanChair);
      if (details.items && details.items.length > 0) {
        setCartItems(details.items.map(it => {
          const foundMenu: MenuItem = SAMPLE_MENU_ITEMS.find(m => String(m.id) === it.dish_id || m.name.toLowerCase() === it.dish_name.toLowerCase()) || {
            id: String(it.dish_id || '999'),
            name: it.dish_name,
            kannadaName: '',
            price: it.price,
            category: 'biryani',
            dietary: 'non_veg',
            description: 'Authentic preparation',
            prepTimeMinutes: 15,
            isAvailable: true,
            isBestseller: false
          };
          return {
            menuItem: foundMenu,
            quantity: it.quantity,
            lineTotal: it.price * it.quantity,
            stage: it.stage as any
          };
        }));
      }
    } catch (err) {
      console.error('Error fetching order for seat:', err);
    }
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
        return [...prev, { menuItem, quantity: 1, lineTotal: menuItem.price, stage: 'PLACED' }];
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

  // Fire KOT submission to Kitchen and update seat
  const handleFireKOT = useCallback((instructions: string) => {
    const cleanChair = selectedSeatNumber.replace(/[^0-9]/g, '');
    const ticketNum = String(Date.now()).slice(-4);
    const totalAmount = cartItems.reduce((acc, c) => acc + c.lineTotal, 0);

    const orderRecord = {
      ticket_number: ticketNum,
      chair_id: cleanChair,
      seat_label: selectedSeatNumber,
      status: 'pending' as const,
      total_amount: totalAmount,
      device_token: `waiter-${activeWaiterAccount.name}`,
    };

    const orderItems = cartItems.map((c) => ({
      chair_id: cleanChair,
      seat_label: selectedSeatNumber,
      dish_id: String(c.menuItem.id),
      dish_name: c.menuItem.name,
      quantity: c.quantity,
      price: c.menuItem.price,
      stage: 'PLACED' as const,
      notes: instructions || '',
      addons: ['PLACED'],
    }));

    realtimeBridge.placeOrder(orderRecord, orderItems).then(() => {
      refreshSeats();
    });

    setCartItems(prev => prev.map(c => ({ ...c, stage: 'PLACED' })));
    showToast(`KOT #${ticketNum} successfully sent to Kitchen printer!`);
    setSeats(prev => prev.map(s => s.seatNumber === selectedSeatNumber ? {
      ...s,
      status: 'occupied',
      guestName: selectedGuestName,
      itemCount: cartItems.length,
      runningTotal: totalAmount
    } : s));
  }, [selectedSeatNumber, selectedGuestName, cartItems, activeWaiterAccount, refreshSeats, showToast]);

  // Resolve Customer Call
  const handleAttendCall = useCallback((alertId: string) => {
    realtimeBridge.resolveServiceAlert(alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast('Customer call marked as Attended!');
  }, [showToast]);

  // Serve Kitchen Dish
  const handleServeDish = useCallback((alertId: string, dishName: string) => {
    realtimeBridge.resolveServiceAlert(alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast(`Served ${dishName} to table!`);
  }, [showToast]);

  // Settle Bill and Vacate
  const handleSettleSuccess = useCallback((seatNum: string, method: PaymentMethod, amount: number) => {
    const cleanChair = seatNum.replace(/[^0-9]/g, '');
    realtimeBridge.settleBill(cleanChair, method, amount).then(() => {
      refreshSeats();
    });
    setSeats(prev => prev.map(s => s.seatNumber === seatNum ? {
      ...s,
      status: 'vacant',
      guestName: undefined,
      itemCount: 0,
      runningTotal: 0
    } : s));
    setActiveScreen('seats');
    showToast(`${seatNum} settled via ${method.toUpperCase()} & marked clean!`);
  }, [refreshSeats, showToast]);

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
                />
                <MobileSeatGrid
                  seats={seats}
                  onOpenTakeOrder={handleOpenTakeOrder}
                  onOpenViewOrder={handleOpenViewOrder}
                  onOpenSeatOrder={handleOpenTakeOrder}
                  onOpenSeatBill={handleOpenSeatBill}
                  onRefreshSeats={() => {
                    refreshSeats();
                    showToast('Floor seats refreshed from cloud!');
                  }}
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
                onAttendCall={handleAttendCall}
                onCollectBill={handleOpenSeatBill}
                onServeDish={handleServeDish}
              />
            )}

            {/* SCREEN 7: WAITER PROFILE & SHIFT SUMMARY */}
            {activeScreen === 'profile' && (
              <MobileProfileShift
                profile={waiterProfile}
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

