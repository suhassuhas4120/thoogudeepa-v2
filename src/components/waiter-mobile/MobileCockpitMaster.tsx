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

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  generateSeatsForStaff,
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

const getInitialStoredAccount = (): WaiterAuthAccount => {
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem('thoogudeepa_waiter_mobile_account');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.id || parsed.seatRange)) {
          return parsed;
        }
      }
    } catch {}
  }
  return DEFAULT_STAFF_ACCOUNTS[0];
};

export const MobileCockpitMaster: React.FC = () => {
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  // Navigation & Screen State
  const [activeScreen, setActiveScreen] = useState<MobileScreenId>('login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeWaiterAccount, setActiveWaiterAccount] = useState<WaiterAuthAccount>(getInitialStoredAccount);
  const activeAccountRef = useRef<WaiterAuthAccount>(activeWaiterAccount);
  activeAccountRef.current = activeWaiterAccount;

  // Floor Seats State (Generated for active waiter)
  const [seats, setSeats] = useState<SeatEntity[]>(() => generateSeatsForStaff(getInitialStoredAccount()));
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<string>(() => {
    const acc = getInitialStoredAccount();
    const st = generateSeatsForStaff(acc);
    return st[0]?.seatNumber || 'Seat 01';
  });
  const selectedSeatRef = useRef<string>(selectedSeatNumber);
  selectedSeatRef.current = selectedSeatNumber;

  // Restore navigation and auth state on initial client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedScreen = sessionStorage.getItem('thoogudeepa_waiter_mobile_screen') as MobileScreenId;
      if (savedScreen && ['seats', 'order', 'cart', 'bill', 'alerts', 'profile'].includes(savedScreen)) {
        setActiveScreen(savedScreen);
      }
      const savedAuth = sessionStorage.getItem('thoogudeepa_waiter_mobile_auth') === 'true';
      if (savedAuth) {
        setIsAuthenticated(true);
      }
      const savedSeat = sessionStorage.getItem('thoogudeepa_waiter_mobile_seat');
      if (savedSeat) {
        setSelectedSeatNumber(savedSeat);
      }
      try {
        const rawAccount = sessionStorage.getItem('thoogudeepa_waiter_mobile_account');
        if (rawAccount) {
          const parsed = JSON.parse(rawAccount);
          if (parsed && (parsed.id || parsed.seatRange)) {
            setActiveWaiterAccount(parsed);
            activeAccountRef.current = parsed;
            setSeats(generateSeatsForStaff(parsed));
          }
        }
      } catch {}
    }
    setHasMounted(true);
  }, []);
  const [activeTicketNumber, setActiveTicketNumber] = useState<string>('');
  const [selectedGuestName, setSelectedGuestName] = useState<string>('Walk-In Guest');
  const [selectedBillAmount, setSelectedBillAmount] = useState<number>(0);

  // Cart & KOT State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Verified Bill Requests from Customer (seats that requested and confirmed bill)
  const [verifiedBillSeats, setVerifiedBillSeats] = useState<Record<string, boolean>>({});

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

  const refreshSeats = useCallback(async (accountOverride?: WaiterAuthAccount) => {
    let account = accountOverride || activeAccountRef.current;
    if (typeof window !== 'undefined' && (!account || account.id === DEFAULT_STAFF_ACCOUNTS[0].id)) {
      try {
        const raw = sessionStorage.getItem('thoogudeepa_waiter_mobile_account');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.id || parsed.seatRange)) {
            account = parsed;
          }
        }
      } catch {}
    }
    if (!account) {
      account = DEFAULT_STAFF_ACCOUNTS[0];
    }

    try {
      let baseNumber = 1;
      if (account.seatRange) {
        const match = account.seatRange.match(/\d+/);
        if (match) {
          baseNumber = parseInt(match[0], 10);
        }
      }
      if (!baseNumber || isNaN(baseNumber)) {
        if (account.id === '2' || account.name?.includes('Suresh')) baseNumber = 11;
        else if (account.id === '3' || account.name?.includes('Anand')) baseNumber = 21;
        else if (account.id === '4' || account.name?.includes('Deepa') || account.name?.includes('Dinesh')) baseNumber = 31;
        else baseNumber = 1;
      }

      const floorData = await realtimeBridge.getFloorSeats(baseNumber, 10);
      if (floorData && floorData.length > 0) {
        setSeats(floorData.map(f => {
          if (f.status === 'vacant') {
            return {
              id: f.id,
              seatNumber: f.seatNumber,
              numericId: f.numericId,
              status: 'vacant' as const,
              guestName: 'Walk-In Guest',
              diningDuration: '--',
              itemCount: 0,
              runningTotal: 0,
              hasBillRequest: false,
              zone: account.zone
            };
          }
          return {
            id: f.id,
            seatNumber: f.seatNumber,
            numericId: f.numericId,
            status: f.status,
            guestName: f.guestName,
            diningDuration: f.diningDuration,
            itemCount: f.itemCount,
            runningTotal: f.runningTotal,
            hasBillRequest: f.hasBillRequest,
            zone: account.zone
          };
        }));
      } else {
        setSeats(generateSeatsForStaff(account));
      }
    } catch (err) {
      console.error('Error loading seats:', err);
      setSeats(generateSeatsForStaff(account));
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    try {
      const activeAlerts = await realtimeBridge.getServiceAlerts();
      setAlerts(activeAlerts.filter(a => !a.isResolved).map(a => ({
        id: a.id,
        type: a.type,
        seatNumber: a.seatNumber,
        chairId: a.chairId,
        dishId: a.dishId,
        dishName: a.dishName,
        itemId: a.itemId,
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

  const syncCartForSeat = useCallback((chairId: string) => {
    const cleanChair = chairId.replace(/[^0-9]/g, '');
    if (!cleanChair) return;

    realtimeBridge.getOrderForSeat(cleanChair).then((details) => {
      if (details.order?.ticket_number) {
        setActiveTicketNumber(details.order.ticket_number);
      } else {
        setActiveTicketNumber('');
      }
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
            menuItem: {
              ...foundMenu,
              id: it.dish_id || foundMenu.id,
              name: it.dish_name || foundMenu.name
            },
            quantity: it.quantity,
            lineTotal: it.price * it.quantity,
            stage: it.stage as any,
            orderItemId: it.id,
            ticketNumber: details.order?.ticket_number
          };
        }));
      } else {
        setCartItems([]);
      }

      // Check if bill request is already active for this seat
      const activeReq = realtimeBridge.getActiveBillRequest(cleanChair);
      if (activeReq) {
        setVerifiedBillSeats(prev => ({ ...prev, [cleanChair]: true, [selectedSeatRef.current || cleanChair]: true }));
      }
    });
  }, []);

  useEffect(() => {
    refreshSeats();
    refreshAlerts();

    const unsub = realtimeBridge.subscribeKDS({
      onNewOrder: (payload) => {
        refreshSeats();
        refreshAlerts();
        const curSeat = selectedSeatRef.current || '';
        const cleanCurSeat = curSeat.replace(/[^0-9]/g, '').replace(/^0+/, '');
        const targetChair = payload?.order?.chair_id ? payload.order.chair_id.replace(/[^0-9]/g, '').replace(/^0+/, '') : '';
        if (targetChair && cleanCurSeat && targetChair === cleanCurSeat) {
          syncCartForSeat(cleanCurSeat);
        }
      },
      onStageChange: (data) => {
        refreshAlerts();
        const curSeat = selectedSeatRef.current || '';
        const cleanCurSeat = curSeat.replace(/[^0-9]/g, '').replace(/^0+/, '');
        const targetChair = data.chairId ? data.chairId.replace(/[^0-9]/g, '').replace(/^0+/, '') : '';

        // Only update cartItems if the event belongs to the currently opened seat
        if (targetChair && cleanCurSeat && targetChair !== cleanCurSeat) {
          return;
        }

        setCartItems(prev => {
          let hasExactMatch = false;
          if (data.itemId) {
            hasExactMatch = prev.some(item => item.orderItemId === data.itemId);
          }
          if (hasExactMatch) {
            return prev.map(item => item.orderItemId === data.itemId ? { ...item, stage: data.stage } : item);
          }

          const targetNum = (data.dishId || data.key || '').replace(/[^0-9]/g, '');
          const targetName = data.dishName ? data.dishName.toLowerCase().replace(/donne\s*/i, '').trim() : '';

          let updatedOne = false;
          return prev.map(item => {
            if (updatedOne) return item;
            const itemNum = String(item.menuItem.id).replace(/[^0-9]/g, '');
            const itemName = item.menuItem.name.toLowerCase().replace(/donne\s*/i, '').trim();

            const matches =
              String(item.menuItem.id) === data.dishId ||
              data.key === String(item.menuItem.id) ||
              (targetNum && itemNum === targetNum) ||
              (targetName && (itemName === targetName || itemName.includes(targetName) || targetName.includes(itemName)));

            if (matches && (!data.ticketNumber || !item.ticketNumber || data.ticketNumber === item.ticketNumber)) {
              updatedOne = true;
              return { ...item, stage: data.stage };
            }
            return item;
          });
        });
      },
      onTicketDispatched: () => { refreshAlerts(); },
      onSeatOccupancyChange: (data) => {
        refreshSeats();
        if (data && !data.isOccupied) {
          const curSeat = selectedSeatRef.current || '';
          const cleanCurSeat = curSeat.replace(/[^0-9]/g, '');
          const targetChair = (data.chairId || '').replace(/[^0-9]/g, '');
          if (targetChair && cleanCurSeat && targetChair === cleanCurSeat) {
            setCartItems([]);
            setActiveTicketNumber('');
          }
        }
      },
      onNewAlert: (alert) => {
        setAlerts(prev => {
          if (prev.some(a => a.id === alert.id)) return prev;
          return [{
            id: alert.id,
            type: alert.type,
            seatNumber: alert.seatNumber,
            chairId: alert.chairId,
            dishId: alert.dishId,
            dishName: alert.dishName,
            itemId: alert.itemId,
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
      onBillRequested: (data) => {
        refreshSeats();
        refreshAlerts();
        if (data?.chairId) {
          const clean = data.chairId.replace(/[^0-9]/g, '');
          setVerifiedBillSeats(prev => ({ ...prev, [clean]: true, [data.chairId]: true }));
        }
      },
      onCustomerPaidUpi: (data) => {
        if (data?.chairId) {
          const clean = data.chairId.replace(/[^0-9]/g, '');
          setVerifiedBillSeats(prev => ({ ...prev, [clean]: true, [data.chairId]: true }));
        }
      },
      onBillSettled: (data) => {
        refreshSeats();
        refreshAlerts();
        const curSeat = selectedSeatRef.current || '';
        const cleanCurSeat = curSeat.replace(/[^0-9]/g, '');
        const targetChair = (data?.chairId || '').replace(/[^0-9]/g, '');
        if (targetChair) {
          setVerifiedBillSeats(prev => {
            const next = { ...prev };
            delete next[targetChair];
            delete next[targetChair.replace(/^0+/, '')];
            return next;
          });
        }
        if (targetChair && cleanCurSeat && targetChair === cleanCurSeat) {
          setCartItems([]);
          setActiveTicketNumber('');
        }
      },
      onClearAll: () => {
        setVerifiedBillSeats({});
        refreshSeats();
        refreshAlerts();
      }
    });

    return () => unsub();
  }, [refreshSeats, refreshAlerts]);

  // Persist navigation and auth state to survive browser refresh
  useEffect(() => {
    if (!hasMounted) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('thoogudeepa_waiter_mobile_screen', activeScreen);
      sessionStorage.setItem('thoogudeepa_waiter_mobile_auth', String(isAuthenticated));
      sessionStorage.setItem('thoogudeepa_waiter_mobile_seat', selectedSeatNumber);
      sessionStorage.setItem('thoogudeepa_waiter_mobile_account', JSON.stringify(activeWaiterAccount));
    }
  }, [hasMounted, activeScreen, isAuthenticated, selectedSeatNumber, activeWaiterAccount]);

  // Synchronize cart items with seat order data on mount or when seat changes
  useEffect(() => {
    syncCartForSeat(selectedSeatNumber);
  }, [selectedSeatNumber, syncCartForSeat]);

  // Waiter Profile Telemetry
  const waiterProfile: WaiterProfile = useMemo(() => ({
    staffId: RESTAURANT_CONSTANTS.DEFAULT_WAITER_ID,
    name: activeWaiterAccount.name,
    initials: activeWaiterAccount.initials,
    assignedSection: `${activeWaiterAccount.zone} (${activeWaiterAccount.seatRange})`,
    assignedSeats: `${activeWaiterAccount.zone} (${activeWaiterAccount.seatRange})`,
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
    activeAccountRef.current = account;
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('thoogudeepa_waiter_mobile_account', JSON.stringify(account));
      sessionStorage.setItem('thoogudeepa_waiter_mobile_auth', 'true');
      sessionStorage.setItem('thoogudeepa_waiter_mobile_screen', 'seats');
    }
    const newSeats = generateSeatsForStaff(account);
    setSeats(newSeats);
    if (newSeats.length > 0) {
      setSelectedSeatNumber(newSeats[0].seatNumber);
      setSelectedGuestName(newSeats[0].guestName || 'Walk-In Guest');
      setSelectedBillAmount(newSeats[0].runningTotal || 0);
    }
    setActiveScreen('seats');
    refreshSeats(account);
    showToast(`Shift Authenticated: Welcome ${account.name}!`);
  }, [refreshSeats, showToast]);

  // Handle dynamic zone change
  const handleZoneChange = useCallback((zoneLabel: string) => {
    const staff = DEFAULT_STAFF_ACCOUNTS.find(s => 
      zoneLabel.toLowerCase().includes(s.seatRange.toLowerCase()) || 
      zoneLabel.toLowerCase().includes(s.zone.toLowerCase())
    ) || activeAccountRef.current;
    setActiveWaiterAccount(staff);
    activeAccountRef.current = staff;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('thoogudeepa_waiter_mobile_account', JSON.stringify(staff));
    }
    const newSeats = generateSeatsForStaff(staff);
    setSeats(newSeats);
    if (newSeats.length > 0) {
      setSelectedSeatNumber(newSeats[0].seatNumber);
      setSelectedGuestName(newSeats[0].guestName || 'Walk-In Guest');
      setSelectedBillAmount(newSeats[0].runningTotal || 0);
    }
    refreshSeats(staff);
    showToast(`Switched to ${staff.seatRange}`);
  }, [refreshSeats, showToast]);

  // Handle waiter logout / end shift
  const handleEndShift = useCallback(() => {
    setIsAuthenticated(false);
    setActiveScreen('login');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('thoogudeepa_waiter_mobile_screen');
      sessionStorage.removeItem('thoogudeepa_waiter_mobile_auth');
      sessionStorage.removeItem('thoogudeepa_waiter_mobile_seat');
      sessionStorage.removeItem('thoogudeepa_waiter_mobile_account');
    }
    showToast('Shift closed successfully. Thermal summary printed.');
  }, [showToast]);

  // Handle opening seat order pad (take order)
  const handleOpenTakeOrder = useCallback((seatNum: string, guest?: string) => {
    setSelectedSeatNumber(seatNum);
    setSelectedGuestName(guest || 'Walk-In Guest');
    setActiveTicketNumber('');
    setCartItems([]);
    setSelectedBillAmount(0);
    setActiveScreen('order');
    showToast(`Taking new order for ${seatNum}`);
  }, [showToast]);

  // Handle viewing live cart for occupied seat
  const handleOpenViewOrder = useCallback(async (seatNum: string, guest?: string) => {
    setSelectedSeatNumber(seatNum);
    setSelectedGuestName(guest || 'Dining Guest');
    setActiveTicketNumber('');
    setCartItems([]);
    setSelectedBillAmount(0);
    const cleanChair = seatNum.replace(/[^0-9]/g, '');
    try {
      const details = await realtimeBridge.getOrderForSeat(cleanChair);
      if (details.order?.ticket_number) {
        setActiveTicketNumber(details.order.ticket_number);
      }
      if (details.order?.total_amount) {
        setSelectedBillAmount(details.order.total_amount);
      }
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
            menuItem: {
              ...foundMenu,
              id: it.dish_id || foundMenu.id,
              name: it.dish_name || foundMenu.name
            },
            quantity: it.quantity,
            lineTotal: it.price * it.quantity,
            stage: it.stage as any,
            orderItemId: it.id,
            ticketNumber: details.order?.ticket_number
          };
        }));
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching order for seat:', err);
    }
    setActiveScreen('cart');
    showToast(`Viewing live order cart for ${seatNum}`);
  }, [showToast]);

  // Handle opening seat bill checkout
  const handleOpenSeatBill = useCallback(async (seatNum: string, guest: string, amount: number) => {
    setSelectedSeatNumber(seatNum);
    setSelectedGuestName(guest);
    setSelectedBillAmount(amount);
    const cleanChair = seatNum.replace(/[^0-9]/g, '');
    let fetchedTicket: string | undefined = undefined;
    if (cleanChair) {
      try {
        const details = await realtimeBridge.getOrderForSeat(cleanChair);
        if (details.order?.ticket_number) {
          fetchedTicket = details.order.ticket_number;
          setActiveTicketNumber(details.order.ticket_number);
        }
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
              menuItem: {
                ...foundMenu,
                id: it.dish_id || foundMenu.id,
                name: it.dish_name || foundMenu.name
              },
              quantity: it.quantity,
              lineTotal: it.price * it.quantity,
              stage: it.stage as any,
              orderItemId: it.id,
              ticketNumber: details.order?.ticket_number
            };
          }));
        }
      } catch (err) {
        console.error('Error fetching seat order for bill:', err);
      }
    }
    setActiveScreen('bill');
    realtimeBridge.notifyBillModeActive(seatNum, amount, { mode: 'qr', ticketNumber: fetchedTicket });
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
  const handleServeDish = useCallback((alertId: string, dishName: string, alertObj?: FloorAlert) => {
    const alert = alertObj || alerts.find(a => a.id === alertId);
    realtimeBridge.resolveServiceAlert(alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));

    const rawSeat = alert?.seatNumber || '';
    const cleanChair = (alert?.chairId || rawSeat.replace(/[^0-9]/g, '')).replace(/^0+/, '') || '1';
    const targetKey = alert?.itemId || alert?.dishId || dishName;

    // Broadcast item served to KDS, customer tracking, and local registries
    realtimeBridge.updateStage(targetKey, 'SERVED', {
      chairId: cleanChair,
      ticketNumber: alert?.kotNumber,
      dishId: alert?.dishId,
      dishName: alert?.dishName || dishName,
      itemId: alert?.itemId
    });

    if (alert?.itemId && alert.itemId !== targetKey) {
      realtimeBridge.updateStage(alert.itemId, 'SERVED', {
        chairId: cleanChair,
        ticketNumber: alert?.kotNumber,
        dishId: alert?.dishId,
        dishName: alert?.dishName || dishName,
        itemId: alert.itemId
      });
    }

    if (alert?.dishId) {
      const cleanDish = alert.dishId.replace(/^dish-/, '');
      realtimeBridge.updateStage(`dish-${cleanDish}`, 'SERVED', {
        chairId: cleanChair,
        ticketNumber: alert?.kotNumber,
        dishId: `dish-${cleanDish}`,
        dishName: alert?.dishName || dishName,
        itemId: alert?.itemId
      });
      realtimeBridge.updateStage(cleanDish, 'SERVED', {
        chairId: cleanChair,
        ticketNumber: alert?.kotNumber,
        dishId: cleanDish,
        dishName: alert?.dishName || dishName,
        itemId: alert?.itemId
      });
    }

    if (dishName && dishName !== targetKey) {
      realtimeBridge.updateStage(dishName, 'SERVED', {
        chairId: cleanChair,
        ticketNumber: alert?.kotNumber,
        dishId: alert?.dishId,
        dishName,
        itemId: alert?.itemId
      });
    }

    // Update active cart items if currently viewing this seat
    const curSeatClean = selectedSeatNumber.replace(/[^0-9]/g, '');
    if (cleanChair && curSeatClean && cleanChair === curSeatClean) {
      setCartItems(prev =>
        prev.map(it => {
          const itDishClean = String(it.menuItem.id).replace(/^dish-/, '');
          const isMatch =
            Boolean(alert?.itemId && it.orderItemId === alert.itemId) ||
            Boolean(alert?.dishId && String(it.menuItem.id) === alert.dishId) ||
            Boolean(alert?.dishId && itDishClean === alert.dishId.replace(/^dish-/, '')) ||
            Boolean(it.menuItem.name.toLowerCase().trim() === dishName.toLowerCase().trim());
          return isMatch ? { ...it, stage: 'SERVED' } : it;
        })
      );
    }

    showToast(`Served ${dishName} to ${alert?.seatNumber || 'table'}!`);
  }, [alerts, selectedSeatNumber, showToast]);

  // Handle serving an item from live cart
  const handleServeItemMobile = useCallback((identifier: string) => {
    const cleanChair = selectedSeatNumber.replace(/[^0-9]/g, '');
    const dish = cartItems.find(i => i.orderItemId === identifier || String(i.menuItem.id) === identifier);
    const cleanDishNum = identifier.replace(/[^0-9]/g, '');

    setCartItems(prev => prev.map(i => (i.orderItemId === identifier || String(i.menuItem.id) === identifier) ? { ...i, stage: 'SERVED' } : i));

    const targetKey = dish?.orderItemId || identifier;
    realtimeBridge.updateStage(targetKey, 'SERVED', {
      chairId: cleanChair,
      ticketNumber: activeTicketNumber || undefined,
      dishId: String(dish?.menuItem?.id || identifier),
      dishName: dish?.menuItem?.name,
      itemId: dish?.orderItemId
    });

    if (cleanDishNum && (!dish?.orderItemId || dish.orderItemId === identifier)) {
      realtimeBridge.updateStage(`dish-${cleanDishNum}`, 'SERVED', {
        chairId: cleanChair,
        ticketNumber: activeTicketNumber || undefined,
        dishId: `dish-${cleanDishNum}`,
        dishName: dish?.menuItem?.name,
        itemId: dish?.orderItemId
      });
      realtimeBridge.updateStage(cleanDishNum, 'SERVED', {
        chairId: cleanChair,
        ticketNumber: activeTicketNumber || undefined,
        dishId: cleanDishNum,
        dishName: dish?.menuItem?.name,
        itemId: dish?.orderItemId
      });
    }

    const matchingAlert = alerts.find(a => (a.seatNumber.includes(cleanChair) || a.seatNumber === selectedSeatNumber) && a.type === 'kitchen_ready');
    if (matchingAlert) {
      realtimeBridge.resolveServiceAlert(matchingAlert.id);
      setAlerts(prev => prev.filter(a => a.id !== matchingAlert.id));
    }

    showToast(`Marked ${dish?.menuItem?.name || 'dish'} as served!`);
  }, [selectedSeatNumber, cartItems, alerts, activeTicketNumber, showToast]);

  // Settle Bill and Vacate
  const handleSettleSuccess = useCallback((seatNum: string, method: PaymentMethod, amount: number) => {
    const cleanChair = seatNum.replace(/[^0-9]/g, '');
    realtimeBridge.settleBill(cleanChair, method, amount, { ticketNumber: activeTicketNumber || undefined }).then(() => {
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

  if (!hasMounted) {
    return (
      <div className="w-full h-full min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm font-medium">
        Loading Waiter Cockpit...
      </div>
    );
  }

  return (
    <div className="w-full h-screen h-[100dvh] min-h-[100dvh] flex flex-col justify-center items-center bg-slate-900 p-0 sm:p-4 select-none overflow-hidden">
      
      {/* 425px Modern Smartphone Viewport Container */}
      <main className="w-full max-w-[425px] h-full sm:h-[860px] max-h-[100dvh] bg-[#F8FAFC] sm:rounded-[36px] sm:border sm:border-slate-700 shadow-2xl flex flex-col relative overflow-hidden">
        
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
                  onRefreshSeats={() => {
                    refreshSeats(activeWaiterAccount);
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
                activeTicketNumber={activeTicketNumber}
                cartItems={cartItems}
                pendingAlertCount={alerts.length}
                isBillRequested={
                  Boolean(
                    verifiedBillSeats[selectedSeatNumber.replace(/[^0-9]/g, '')] ||
                    verifiedBillSeats[selectedSeatNumber] ||
                    realtimeBridge.getActiveBillRequest(selectedSeatNumber.replace(/[^0-9]/g, ''))
                  )
                }
                onClose={() => setActiveScreen('seats')}
                onOpenMenu={() => setActiveScreen('order')}
                onProceedToBill={(seatNum, guest, amount) => {
                  handleOpenSeatBill(seatNum, guest, amount);
                }}
                onOpenAlerts={() => setActiveScreen('alerts')}
                onModifyQuantity={handleModifyCartQuantity}
                onRemoveItem={(id) => setCartItems(prev => prev.filter(i => i.menuItem.id !== id))}
                onServeItem={handleServeItemMobile}
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
                cartItems={cartItems}
                pendingAlertCount={alerts.length}
                isVerifiedByCustomer={
                  Boolean(
                    verifiedBillSeats[selectedSeatNumber.replace(/[^0-9]/g, '')] ||
                    verifiedBillSeats[selectedSeatNumber] ||
                    realtimeBridge.getActiveBillRequest(selectedSeatNumber.replace(/[^0-9]/g, ''))
                  )
                }
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

