"use client";
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

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  TicketItem,
  KitchenStatus,
  WaiterOption,
  getSeatsForWaiter
} from './types';
import { realtimeBridge } from '../../lib/supabase';
import { TabletLogin } from './TabletLogin';
import { TabletHeader } from './TabletHeader';
import { TabletFloorGrid } from './TabletFloorGrid';
import { TabletMenuCatalog } from './TabletMenuCatalog';
import { TabletLiveTicket } from './TabletLiveTicket';
import { TabletBillSettlement } from './TabletBillSettlement';
import { TabletAlertSheet } from './TabletAlertSheet';
import { TabletProfileShift } from './TabletProfileShift';

export const TabletCockpitMaster: React.FC = () => {
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  // Navigation & Screen View State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('login');
  const [profile, setProfile] = useState<typeof INITIAL_WAITER_PROFILE>(INITIAL_WAITER_PROFILE);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const [seats, setSeats] = useState<SeatItem[]>(INITIAL_SEATS);
  const [ticketItems, setTicketItems] = useState<TicketItem[]>([]);
  const [alerts, setAlerts] = useState<ServiceAlert[]>(INITIAL_ALERTS);
  const [shiftLogs, setShiftLogs] = useState(SHIFT_LOGS);

  // Active Target Seat & Cockpit Right Pane Mode ('ticket' or 'bill')
  const [activeSeatName, setActiveSeatName] = useState<string>('Seat 02: Walk-In');
  const activeSeatNameRef = useRef<string>(activeSeatName);
  activeSeatNameRef.current = activeSeatName;

  // Restore navigation and profile on initial client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedScreen = sessionStorage.getItem('thoogudeepa_waiter_tablet_screen') as ScreenId;
      if (savedScreen && ['floor', 'order', 'profile'].includes(savedScreen)) {
        setCurrentScreen(savedScreen);
      }
      try {
        const rawProfile = sessionStorage.getItem('thoogudeepa_waiter_tablet_profile');
        if (rawProfile) {
          const parsed = JSON.parse(rawProfile);
          setProfile(parsed);
          profileRef.current = parsed;
        }
      } catch {}
      const savedSeat = sessionStorage.getItem('thoogudeepa_waiter_tablet_seat');
      if (savedSeat) {
        setActiveSeatName(savedSeat);
        activeSeatNameRef.current = savedSeat;
      }
    }
    setHasMounted(true);
  }, []);
  const [activeTicketNumber, setActiveTicketNumber] = useState<string>('');
  const [activeSeatCustomer, setActiveSeatCustomer] = useState<string>('Walk-In Guest');
  const [activeSeatAmount, setActiveSeatAmount] = useState<number>(0);
  const [isDining, setIsDining] = useState<boolean>(false);
  const [rightPaneMode, setRightPaneMode] = useState<'ticket' | 'bill'>('ticket');

  // Menu Dish Steppers State (dishId -> quantity)
  const [dishQuantities, setDishQuantities] = useState<Record<number, number>>({});

  // Verified bill requested seats tracking (seat/chairId -> boolean)
  const [verifiedBillSeats, setVerifiedBillSeats] = useState<Record<string, boolean>>({});

  // Right-Side Alert Slide-Over Sheet State
  const [isAlertSheetOpen, setIsAlertSheetOpen] = useState<boolean>(false);
  const [activeSheetTab, setActiveSheetTab] = useState<'customer' | 'kitchen'>('customer');

  // Floating Toast Notification Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => { setToastMessage(null); }, 2400);
  }, []);

  const refreshSeats = useCallback(async (waiterIdOverride?: string) => {
    const currentId = waiterIdOverride || profileRef.current.id;
    try {
      const startSeat = currentId === 'w2' ? 11 : currentId === 'w3' ? 21 : currentId === 'w4' ? 31 : 1;
      const floorData = await realtimeBridge.getFloorSeats(startSeat, 10);
      const defaultWaiterSeats = getSeatsForWaiter(currentId);

      setSeats(floorData.map(f => {
        if (f.status === 'vacant') {
          return {
            id: f.id,
            seatNumber: f.seatNumber,
            status: 'vacant' as const,
            guestName: 'Available',
            guestCount: 0,
            diningTime: 'Ready',
            totalAmount: 0,
            orderCount: 0,
            hasBillRequest: false
          };
        }
        return {
          id: f.id,
          seatNumber: f.seatNumber,
          status: 'occupied' as const,
          guestName: f.guestName,
          guestCount: f.guestCount || 2,
          diningTime: f.diningDuration || '15m',
          totalAmount: f.runningTotal,
          orderCount: f.itemCount,
          hasBillRequest: f.hasBillRequest
        };
      }));
    } catch (err) {
      console.error('Error loading tablet seats:', err);
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    try {
      const activeAlerts = await realtimeBridge.getServiceAlerts();
      setAlerts(activeAlerts.map(a => ({
        id: a.id,
        type: a.type === 'kitchen_ready' ? ('kitchen' as const) : ('customer' as const),
        seatNumber: a.seatNumber,
        chairId: a.chairId,
        dishId: a.dishId,
        dishName: a.dishName,
        itemId: a.itemId,
        guestName: a.guestName || 'Guest',
        title: a.title,
        description: a.message || a.title,
        timeAgo: a.timeAgo,
        amount: a.billAmount,
        kotId: a.kotNumber,
        isResolved: Boolean(a.isResolved)
      })));
    } catch (err) {
      console.error('Error loading tablet alerts:', err);
    }
  }, []);

  const syncTicketForSeat = useCallback((chairId: string) => {
    const cleanChair = chairId.replace(/[^0-9]/g, '');
    if (!cleanChair) return;

    const activeReq = realtimeBridge.getActiveBillRequest(cleanChair);
    if (activeReq) {
      setVerifiedBillSeats(prev => ({ ...prev, [cleanChair]: true, [chairId]: true }));
    }

    realtimeBridge.getOrderForSeat(cleanChair).then((details) => {
      if (details.order?.ticket_number) {
        setActiveTicketNumber(details.order.ticket_number);
      } else {
        setActiveTicketNumber('');
      }
      if (details.items && details.items.length > 0) {
        const qtyMap: Record<number, number> = {};
        const items: TicketItem[] = details.items.map((it, idx) => {
          const numId = Number(it.dish_id.replace(/[^0-9]/g, '')) || (idx + 1);
          qtyMap[numId] = (qtyMap[numId] || 0) + it.quantity;
          const dish = MENU_DISHES.find(d => d.id === numId);
          const itStage = it.stage as string;
          const currentItemStage: KitchenStatus =
            itStage === 'READY' ? 'READY' :
            itStage === 'PREP' ? 'PREPARING' :
            itStage === 'REC' ? 'RECEIVED' :
            itStage === 'SERVED' ? 'SERVED' : 'PLACED';
          return {
            id: numId,
            orderItemId: it.id,
            ticketNumber: details.order?.ticket_number,
            name: it.dish_name,
            quantity: it.quantity,
            price: it.price,
            imageUrl: dish?.imageUrl || '/logo.jpg',
            status: currentItemStage
          };
        });
        setDishQuantities(qtyMap);
        setTicketItems(items);
      } else {
        setDishQuantities({});
        setTicketItems([]);
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
        const curSeat = (activeSeatNameRef.current || '').split(':')[0].trim();
        const cleanCurSeat = curSeat.replace(/[^0-9]/g, '').replace(/^0+/, '');
        const targetChair = payload?.order?.chair_id ? payload.order.chair_id.replace(/[^0-9]/g, '').replace(/^0+/, '') : '';
        if (targetChair && cleanCurSeat && targetChair === cleanCurSeat) {
          syncTicketForSeat(cleanCurSeat);
        }
      },
      onStageChange: (data) => {
        refreshAlerts();
        const curSeat = (activeSeatNameRef.current || '').split(':')[0].trim();
        const cleanCurSeat = curSeat.replace(/[^0-9]/g, '').replace(/^0+/, '');
        const targetChair = data.chairId ? data.chairId.replace(/[^0-9]/g, '').replace(/^0+/, '') : '';

        // Only update ticketItems if this stage change belongs to the currently selected seat
        if (targetChair && cleanCurSeat && targetChair !== cleanCurSeat) {
          return;
        }

        const nextStatus: KitchenStatus =
          data.stage === 'READY' ? 'READY' :
          data.stage === 'PREP' ? 'PREPARING' :
          data.stage === 'REC' ? 'RECEIVED' :
          data.stage === 'SERVED' ? 'SERVED' : 'PLACED';

        setTicketItems(prev => {
          if (!data.itemId) return prev;
          return prev.map(item => item.orderItemId === data.itemId ? { ...item, status: nextStatus } : item);
        });
      },
      onTicketDispatched: () => { refreshAlerts(); },
      onSeatOccupancyChange: (data) => {
        refreshSeats();
        if (data && !data.isOccupied) {
          const curSeat = (activeSeatNameRef.current || '').split(':')[0].trim();
          const cleanCurSeat = curSeat.replace(/[^0-9]/g, '').replace(/^0+/, '');
          const targetChair = (data.chairId || '').replace(/[^0-9]/g, '').replace(/^0+/, '');
          if (targetChair && cleanCurSeat && targetChair === cleanCurSeat) {
            setTicketItems([]);
            setDishQuantities({});
            setActiveTicketNumber('');
            setActiveSeatCustomer('Walk-In Guest');
            setActiveSeatAmount(0);
            setActiveSeatName(`${curSeat}: Walk-In Guest`);
            setIsDining(false);
          }
        }
      },
      onNewAlert: (alert) => {
        setAlerts(prev => {
          if (prev.some(a => a.id === alert.id)) return prev;
          const mapped: ServiceAlert = {
            id: alert.id,
            type: alert.type === 'kitchen_ready' ? 'kitchen' : 'customer',
            seatNumber: alert.seatNumber,
            chairId: alert.chairId,
            dishId: alert.dishId,
            dishName: alert.dishName,
            itemId: alert.itemId,
            guestName: alert.guestName || 'Guest',
            title: alert.title,
            description: alert.message || alert.title,
            timeAgo: alert.timeAgo,
            amount: alert.billAmount,
            kotId: alert.kotNumber,
            isResolved: false
          };
          return [mapped, ...prev];
        });
      },
      onResolveAlert: (alertId) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isResolved: true } : a));
      },
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
        const curSeat = (activeSeatNameRef.current || '').split(':')[0].trim();
        const cleanCurSeat = curSeat.replace(/[^0-9]/g, '').replace(/^0+/, '');
        const targetChair = (data?.chairId || '').replace(/[^0-9]/g, '').replace(/^0+/, '');
        if (targetChair && cleanCurSeat && targetChair === cleanCurSeat) {
          setTicketItems([]);
          setDishQuantities({});
          setActiveTicketNumber('');
          setActiveSeatCustomer('Walk-In Guest');
          setActiveSeatAmount(0);
          setActiveSeatName(`${curSeat}: Walk-In Guest`);
          setIsDining(false);
        }
        if (targetChair) {
          setVerifiedBillSeats(prev => {
            const next = { ...prev };
            delete next[targetChair];
            delete next[targetChair.padStart(2, '0')];
            delete next[data?.chairId || ''];
            return next;
          });
        }
      },
      onClearAll: () => {
        refreshSeats();
        refreshAlerts();
        setVerifiedBillSeats({});
      }
    });

    return () => unsub();
  }, [refreshSeats, refreshAlerts]);

  // Persist tablet navigation and seat state across browser reloads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('thoogudeepa_waiter_tablet_screen', currentScreen);
      sessionStorage.setItem('thoogudeepa_waiter_tablet_seat', activeSeatName);
      sessionStorage.setItem('thoogudeepa_waiter_tablet_profile', JSON.stringify(profile));
    }
  }, [currentScreen, activeSeatName, profile]);

  // Load real items and stages for active tablet seat on mount and whenever activeSeatName changes
  useEffect(() => {
    const activeSeatNum = activeSeatName.split(':')[0].trim();
    syncTicketForSeat(activeSeatNum);
  }, [activeSeatName, syncTicketForSeat]);

  // Cart & Pricing Calculations
  const cartCount = useMemo(() => Object.values(dishQuantities).reduce((acc, q) => acc + q, 0), [dishQuantities]);

  const subtotal = useMemo(() => {
    if (ticketItems && ticketItems.length > 0) {
      return ticketItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    }
    return Object.entries(dishQuantities).reduce((acc, [id, qty]) => {
      const dish = MENU_DISHES.find(d => d.id === Number(id));
      return acc + (dish ? dish.price * qty : 200 * qty);
    }, 0);
  }, [ticketItems, dishQuantities]);

  const gst = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const grandTotal = useMemo(() => subtotal + gst, [subtotal, gst]);

  // Unresolved Alert Counts for Global Header Badges
  const customerCallsCount = useMemo(() => alerts.filter(a => a.type === 'customer' && !a.isResolved).length, [alerts]);
  const kitchenAlertsCount = useMemo(() => alerts.filter(a => a.type === 'kitchen' && !a.isResolved).length, [alerts]);
  const occupiedSeatsCount = useMemo(() => seats.filter(s => s.status === 'occupied').length, [seats]);

  // Handler: Login Success transition
  const handleLoginSuccess = (waiter: WaiterOption) => {
    setProfile(prev => ({
      ...prev,
      id: waiter.id,
      name: waiter.name,
      role: waiter.role,
      assignedZone: waiter.assignedZone || 'Zone 1 (Seats 01-10)',
      avatarInitials: waiter.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
    }));
    profileRef.current = {
      ...profileRef.current,
      id: waiter.id
    };
    const newSeats = getSeatsForWaiter(waiter.id);
    setSeats(newSeats);
    if (newSeats.length > 0) {
      setActiveSeatName(`${newSeats[0].seatNumber}: ${newSeats[0].guestName}`);
      setActiveSeatCustomer(newSeats[0].guestName);
      setActiveSeatAmount(newSeats[0].totalAmount);
    }
    setCurrentScreen('seats');
    refreshSeats(waiter.id);
    showToast(`Shift Started: ${waiter.name} (${waiter.assignedZone || 'Seats 01-10'})`);
  };

  // Handler: Logout from Profile
  const handleEndShift = () => {
    setCurrentScreen('login');
    showToast('Shift ended successfully. Have a great rest!');
  };

  // Handler: Open Order Screen for a Seat
  const handleOpenOrder = async (seatId: string, seatName: string, customer: string, amount: number, dining: boolean) => {
    setActiveSeatName(`${seatName}: ${customer}`);
    setActiveSeatCustomer(customer);
    setActiveSeatAmount(amount);
    setIsDining(dining);
    setRightPaneMode('ticket');

    const cleanChair = seatName.replace(/[^0-9]/g, '');
    if (!dining) {
      setDishQuantities({});
      setTicketItems([]);
    } else {
      try {
        const details = await realtimeBridge.getOrderForSeat(cleanChair);
        if (details.order?.ticket_number) {
          setActiveTicketNumber(details.order.ticket_number);
        } else {
          setActiveTicketNumber('');
        }
        if (details.items && details.items.length > 0) {
          const qtyMap: Record<number, number> = {};
          const items: TicketItem[] = details.items.map((it, idx) => {
            const numId = Number(it.dish_id.replace(/[^0-9]/g, '')) || (idx + 1);
            qtyMap[numId] = (qtyMap[numId] || 0) + it.quantity;
            const dish = MENU_DISHES.find(d => d.id === numId);
            const itStage = it.stage as string;
            const currentItemStage: KitchenStatus =
              itStage === 'READY' ? 'READY' :
              itStage === 'PREP' ? 'PREPARING' :
              itStage === 'REC' ? 'RECEIVED' :
              itStage === 'SERVED' ? 'SERVED' : 'PLACED';
            return {
              id: numId,
              orderItemId: it.id,
              ticketNumber: details.order?.ticket_number,
              name: it.dish_name,
              quantity: it.quantity,
              price: it.price,
              imageUrl: dish?.imageUrl || '/logo.jpg',
              status: currentItemStage
            };
          });
          setDishQuantities(qtyMap);
          setTicketItems(items);
        } else {
          setDishQuantities({});
          setTicketItems([]);
        }
      } catch {
        setDishQuantities({});
        setTicketItems([]);
      }
    }
    setCurrentScreen('order');
  };

  // Handler: Open Bill Settlement Screen (Right-pane mode switch)
  const handleOpenBill = async (seatName: string, customer: string, amount: number) => {
    const seatObj = seats.find(s => s.seatNumber === seatName);
    const seatId = seatObj?.id || seatName.replace(/[^0-9]/g, '');
    await handleOpenOrder(seatId, seatName, customer, amount, true);
    setIsDining(true);
    setRightPaneMode('bill');
    realtimeBridge.notifyBillModeActive(seatName, amount, { mode: 'qr' });
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
        return [...prev, { id: dishId, name: dishInfo.name, quantity: 1, price: price, imageUrl: dishInfo.imageUrl, status: 'PLACED' }];
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
  const handleServeItem = (itemIdentifier: number | string) => {
    const activeSeatNum = activeSeatName.split(':')[0].trim();
    const cleanChair = activeSeatNum.replace(/[^0-9]/g, '');
    const dish = ticketItems.find(item => item.orderItemId === itemIdentifier || item.id === itemIdentifier);

    setTicketItems(prev => prev.map(item => (item.orderItemId === itemIdentifier || (!item.orderItemId && item.id === itemIdentifier) ? { ...item, status: 'SERVED' } : item)));

    const targetKey = dish?.orderItemId || (typeof itemIdentifier === 'string' ? itemIdentifier : `dish-${itemIdentifier}`);

    realtimeBridge.updateStage(targetKey, 'SERVED', {
      chairId: cleanChair,
      ticketNumber: activeTicketNumber || undefined,
      dishId: String(dish?.id || itemIdentifier),
      dishName: dish?.name,
      itemId: dish?.orderItemId
    });

    const matchingAlert = alerts.find(a => (a.seatNumber.includes(cleanChair) || a.seatNumber === activeSeatNum) && a.type === 'kitchen');
    if (matchingAlert) {
      realtimeBridge.resolveServiceAlert(matchingAlert.id);
      setAlerts(prev => prev.map(a => a.id === matchingAlert.id ? { ...a, isResolved: true } : a));
    }

    showToast('Dish marked as served');
  };

  // Handler: Fire KOT to Kitchen
  const handlePunchKot = () => {
    const activeSeatNum = activeSeatName.split(':')[0].trim();
    const cleanChair = activeSeatNum.replace(/[^0-9]/g, '');
    const ticketNum = String(Date.now()).slice(-4);

    const orderRecord = {
      ticket_number: ticketNum,
      chair_id: cleanChair,
      seat_label: activeSeatNum,
      status: 'pending' as const,
      total_amount: grandTotal,
      device_token: `tablet-${profile.name}`,
    };

    const orderItems = ticketItems.map((item) => ({
      chair_id: cleanChair,
      seat_label: activeSeatNum,
      dish_id: String(item.id).startsWith('dish-') ? String(item.id) : `dish-${item.id}`,
      dish_name: item.name,
      quantity: item.quantity,
      price: item.price,
      stage: 'PLACED' as const,
      notes: '',
      addons: ['PLACED'],
    }));

    realtimeBridge.placeOrder(orderRecord, orderItems).then(() => {
      refreshSeats();
    });

    setTicketItems(prev => prev.map(item => ({ ...item, status: 'PLACED' })));
    setSeats(prev => prev.map(s => s.seatNumber === activeSeatNum ? { ...s, status: 'occupied', totalAmount: grandTotal, orderCount: cartCount } : s));
    setIsDining(true);
    showToast(`KOT #${ticketNum} fired to kitchen for ${activeSeatNum}`);
  };

  // Handler: Clear ticket pad
  const handleClearTicket = () => {
    setDishQuantities({});
    setTicketItems([]);
    showToast('Ticket reset');
  };

  // Handler: Confirm Settlement and Vacate
  const handleConfirmSettlement = (mode: 'cash' | 'upi' = 'cash') => {
    const activeSeatNum = activeSeatName.split(':')[0].trim();
    const cleanChair = activeSeatNum.replace(/[^0-9]/g, '');
    realtimeBridge.settleBill(cleanChair, mode, grandTotal, { ticketNumber: activeTicketNumber || undefined }).then(() => {
      refreshSeats();
    });
    setSeats(prev => prev.map(s => s.seatNumber === activeSeatNum ? { ...s, status: 'vacant', guestName: 'Available', totalAmount: 0, orderCount: 0, hasBillRequest: false } : s));
    setRightPaneMode('ticket');
    setCurrentScreen('seats');
    showToast(`Payment settled via ${mode.toUpperCase()} & ${activeSeatNum} vacated`);
  };

  // Alerts Slide-Over Sheet Handlers
  const handleOpenAlertSheet = (tabType: 'customer' | 'kitchen') => {
    setActiveSheetTab(tabType);
    setIsAlertSheetOpen(true);
  };

  const handleResolveAlert = (alertId: string) => {
    realtimeBridge.resolveServiceAlert(alertId);
    setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, isResolved: true } : a)));
    showToast('Alert attended and synchronized');
  };

  const handleServeKitchenDish = (alertId: string, dishName: string, alertObj?: any) => {
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

    // Update active ticket items if viewing this seat
    const curSeatClean = activeSeatName.replace(/[^0-9]/g, '');
    if (cleanChair && curSeatClean && cleanChair === curSeatClean) {
      setTicketItems(prev =>
        prev.map(it => {
          const isMatch = alert?.itemId
            ? it.orderItemId === alert.itemId
            : (Boolean(alert?.dishId && String(it.id) === alert.dishId) ||
               Boolean(it.name.toLowerCase().trim() === dishName.toLowerCase().trim()));
          return isMatch ? { ...it, status: 'SERVED' } : it;
        })
      );
    }

    showToast(`Served ${dishName} to ${alert?.seatNumber || 'table'}!`);
  };

  if (!hasMounted) {
    return (
      <div className="w-full h-full min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm font-medium">
        Loading Tablet Cockpit...
      </div>
    );
  }

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
            waiterName={profile.name}
            assignedZone={profile.assignedZone}
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
              seats={seats}
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
              {(() => {
                const curSeatClean = activeSeatName.split(':')[0].trim().replace(/[^0-9]/g, '');
                const curSeatRaw = activeSeatName.split(':')[0].trim();
                const isVerified = Boolean(
                  (curSeatClean && verifiedBillSeats[curSeatClean]) ||
                  (curSeatRaw && verifiedBillSeats[curSeatRaw]) ||
                  (curSeatClean && realtimeBridge.getActiveBillRequest(curSeatClean))
                );

                return rightPaneMode === 'ticket' ? (
                  <TabletLiveTicket
                    activeSeatName={activeSeatName}
                    ticketItems={ticketItems}
                    subtotal={subtotal}
                    gst={gst}
                    grandTotal={grandTotal}
                    isBillRequested={isVerified}
                    onServeItem={handleServeItem}
                    onPunchKot={handlePunchKot}
                    onSwitchToBillMode={() => {
                      setRightPaneMode('bill');
                      const cleanChair = activeSeatName.split(':')[0].trim();
                      realtimeBridge.notifyBillModeActive(cleanChair, grandTotal, { mode: 'qr' });
                    }}
                    onClearTicket={handleClearTicket}
                  />
                ) : (
                  <TabletBillSettlement
                    seatName={activeSeatName.split(':')[0].trim()}
                    guestName={activeSeatCustomer}
                    totalAmount={isDining && ticketItems.length > 0 ? grandTotal : (activeSeatAmount || grandTotal)}
                    subtotal={isDining && ticketItems.length > 0 ? subtotal : (activeSeatAmount ? Math.round(activeSeatAmount / 1.05) : subtotal)}
                    ticketItems={ticketItems}
                    isVerifiedByCustomer={isVerified}
                    onBackToTicket={() => setRightPaneMode('ticket')}
                    onConfirmSettlement={handleConfirmSettlement}
                    onPrintReceipt={() => showToast('Tax invoice sent to thermal printer')}
                  />
                );
              })()}
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
          onServeKitchenDish={handleServeKitchenDish}
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

