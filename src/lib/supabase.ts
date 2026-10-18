import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface OrderItemRecord {
  id?: string;
  order_id?: string;
  chair_id: string;
  seat_label: string;
  dish_id: string;
  dish_name: string;
  quantity: number;
  price: number;
  stage: 'PLACED' | 'REC' | 'PREP' | 'READY' | 'SERVED';
  notes?: string;
  addons?: string[];
}

export interface OrderRecord {
  id?: string;
  ticket_number: string;
  chair_id: string;
  seat_label: string;
  status: 'pending' | 'in_progress' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  created_at?: string;
  items?: OrderItemRecord[];
  device_token?: string;
}

export interface DishAvailabilityRecord {
  dish_id: string;
  dish_name: string;
  is_available: boolean;
  updated_at?: string;
}

export interface SeatOccupancyRecord {
  chairId: string;
  ticketNumber: string;
  orderId: string;
  deviceToken: string;
  status: string;
  placedAt: number;
}

export interface ServiceAlertRecord {
  id: string;
  type: 'customer_call' | 'kitchen_ready';
  seatNumber: string;
  guestName?: string;
  title: string;
  message: string;
  timeAgo: string;
  billAmount?: number;
  kotNumber?: string;
  isUrgent: boolean;
  isResolved: boolean;
  createdAt: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local BroadcastChannel for real-time synchronization across browser tabs
const localChannel = typeof window !== 'undefined' ? new BroadcastChannel('thoogudeepa_kds_sync') : null;

// Key for storing active table occupancy across browser tabs / devices
const STORAGE_OCCUPANCY_KEY = 'thoogudeepa_v2_seat_occupancy_registry';
const STORAGE_LOCAL_ORDERS_KEY = 'thoogudeepa_v2_active_orders_list';
const STORAGE_ALERTS_KEY = 'thoogudeepa_v2_service_alerts';
const STORAGE_SHIFT_STATS_KEY = 'thoogudeepa_v2_waiter_shift_stats';

function getLocalAlertsList(): ServiceAlertRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalAlertsList(list: ServiceAlertRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

function getLocalOccupancyMap(): Record<string, SeatOccupancyRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_OCCUPANCY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalOccupancyMap(map: Record<string, SeatOccupancyRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_OCCUPANCY_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage errors
  }
}

function getLocalOrdersList(): { order: OrderRecord; items: OrderItemRecord[] }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalOrdersList(list: { order: OrderRecord; items: OrderItemRecord[] }[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_LOCAL_ORDERS_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

export const realtimeBridge = {
  // Post order to Supabase, update local resilience store, and broadcast locally
  async placeOrder(order: OrderRecord, items: OrderItemRecord[]): Promise<{ success: boolean; orderId?: string }> {
    try {
      const deviceToken = order.device_token || '';
      const generatedId = `ord-${Date.now()}`;

      // 1. Record seat occupancy locally & broadcast
      const occupancyMap = getLocalOccupancyMap();
      occupancyMap[order.chair_id] = {
        chairId: order.chair_id,
        ticketNumber: order.ticket_number,
        orderId: generatedId,
        deviceToken,
        status: order.status || 'pending',
        placedAt: Date.now(),
      };
      setLocalOccupancyMap(occupancyMap);

      // 2. Record order locally for offline / local resilience
      const currentOrders = getLocalOrdersList();
      const newEntry = {
        order: { ...order, id: generatedId },
        items: items.map((it) => ({
          ...it,
          stage: it.stage || 'PLACED',
        })),
      };
      const updatedOrders = [newEntry, ...currentOrders.filter((x) => x.order.ticket_number !== order.ticket_number)];
      setLocalOrdersList(updatedOrders);

      // 3. Broadcast to all open tabs immediately
      if (localChannel) {
        localChannel.postMessage({
          type: 'SEAT_OCCUPIED',
          chairId: order.chair_id,
          occupancy: occupancyMap[order.chair_id],
        });
        localChannel.postMessage({
          type: 'NEW_ORDER',
          order: { ...order, id: generatedId },
          items: newEntry.items,
        });
      }

      // 4. Remote Supabase insertion if connected
      if (supabase) {
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .insert({
            ticket_number: order.ticket_number,
            chair_id: order.chair_id,
            seat_label: order.seat_label,
            status: order.status || 'pending',
            total_amount: order.total_amount,
          })
          .select('id')
          .single();

        if (orderErr) throw orderErr;

        const orderId = orderData.id;
        const itemsToInsert = items.map((it) => {
          const isPlaced = it.stage === 'PLACED' || !it.stage;
          const addonsList = Array.isArray(it.addons) ? [...it.addons] : [];
          if (isPlaced && !addonsList.includes('PLACED')) {
            addonsList.push('PLACED');
          }
          return {
            order_id: orderId,
            chair_id: it.chair_id,
            seat_label: it.seat_label,
            dish_id: it.dish_id,
            dish_name: it.dish_name,
            quantity: it.quantity,
            price: it.price,
            stage: 'REC' as const,
            notes: it.notes || '',
            addons: addonsList,
          };
        });

        const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert);
        if (itemsErr) throw itemsErr;

        // Broadcast cross-device via Supabase Realtime channel
        const liveChannel = supabase.channel('kitchen_realtime_feed');
        liveChannel.send({
          type: 'broadcast',
          event: 'NEW_ORDER',
          payload: { order: { ...order, id: orderId }, items: newEntry.items },
        });

        return { success: true, orderId };
      }

      return { success: true, orderId: generatedId };
    } catch (err) {
      console.error('Error placing order:', err);
      const generatedId = `local-${Date.now()}`;
      if (localChannel) {
        localChannel.postMessage({
          type: 'NEW_ORDER',
          order: { ...order, id: generatedId },
          items,
        });
      }
      return { success: true, orderId: generatedId };
    }
  },

  // Check seat occupancy state (Anti-Hijack Check)
  async getSeatOccupancy(chairId: string, currentDeviceToken: string): Promise<{
    isOccupied: boolean;
    isOwner: boolean;
    ticketNumber?: string;
    orderStatus?: string;
    placedAt?: number;
  }> {
    try {
      // 1. Check local registry first
      const map = getLocalOccupancyMap();
      const localRecord = map[chairId];

      if (localRecord && localRecord.status !== 'completed' && localRecord.status !== 'cancelled') {
        const isOwner = Boolean(
          currentDeviceToken && localRecord.deviceToken && currentDeviceToken === localRecord.deviceToken
        );
        return {
          isOccupied: true,
          isOwner,
          ticketNumber: localRecord.ticketNumber,
          orderStatus: localRecord.status,
          placedAt: localRecord.placedAt,
        };
      }

      // 2. Check remote database if online
      if (supabase) {
        const { data: activeOrder, error } = await supabase
          .from('orders')
          .select('*')
          .eq('chair_id', chairId)
          .in('status', ['pending', 'in_progress', 'ready'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && activeOrder) {
          const isOwner = Boolean(
            localRecord && localRecord.ticketNumber === activeOrder.ticket_number && localRecord.deviceToken === currentDeviceToken
          );
          return {
            isOccupied: true,
            isOwner,
            ticketNumber: activeOrder.ticket_number,
            orderStatus: activeOrder.status,
          };
        }
      }

      return { isOccupied: false, isOwner: false };
    } catch (err) {
      console.error('Error checking seat occupancy:', err);
      return { isOccupied: false, isOwner: false };
    }
  },

  // Release a seat (e.g. upon payment or checkout)
  async releaseSeat(chairId: string): Promise<boolean> {
    try {
      const map = getLocalOccupancyMap();
      delete map[chairId];
      setLocalOccupancyMap(map);

      // Mark order completed in local orders list
      const orders = getLocalOrdersList();
      const updated = orders.filter((o) => o.order.chair_id !== chairId);
      setLocalOrdersList(updated);

      if (localChannel) {
        localChannel.postMessage({
          type: 'SEAT_RELEASED',
          chairId,
        });
      }
      return true;
    } catch {
      return false;
    }
  },

  // Update item stage with seat and dish metadata
  async updateStage(
    itemIdOrKey: string,
    stage: 'PLACED' | 'REC' | 'PREP' | 'READY' | 'SERVED',
    meta?: { chairId?: string; dishId?: string; ticketNumber?: string; dishName?: string }
  ): Promise<boolean> {
    try {
      // 1. Update in local orders list
      const orders = getLocalOrdersList();
      const cleanChair = meta?.chairId ? meta.chairId.replace(/[^0-9]/g, '') : '';
      const tNum = meta?.ticketNumber || '';
      const normDishNum = (meta?.dishId || itemIdOrKey).replace(/[^0-9]/g, '');
      const normName = meta?.dishName ? meta.dishName.toLowerCase().replace(/donne\s*/i, '').trim() : '';

      orders.forEach((o) => {
        const oChair = o.order.chair_id ? o.order.chair_id.replace(/[^0-9]/g, '') : '';
        const isTargetChair = !cleanChair || oChair === cleanChair || o.order.chair_id === meta?.chairId;
        const isTargetTicket = !tNum || o.order.ticket_number === tNum;
        if (isTargetChair && isTargetTicket) {
          o.items.forEach((it) => {
            const itDishNum = it.dish_id ? it.dish_id.replace(/[^0-9]/g, '') : '';
            const itNormName = it.dish_name ? it.dish_name.toLowerCase().replace(/donne\s*/i, '').trim() : '';

            const matches =
              it.id === itemIdOrKey ||
              it.dish_id === itemIdOrKey ||
              it.dish_id === meta?.dishId ||
              `dish-${it.dish_id}` === itemIdOrKey ||
              `dish-${meta?.dishId}` === it.dish_id ||
              `${it.dish_id}-${it.chair_id}` === itemIdOrKey ||
              (cleanChair && oChair === cleanChair && itDishNum && normDishNum && itDishNum === normDishNum) ||
              (cleanChair && oChair === cleanChair && normName && (itNormName === normName || itNormName.includes(normName) || normName.includes(itNormName)));

            if (matches) {
              it.stage = stage;
            }
          });
        }
      });
      setLocalOrdersList(orders);

      // 2. Persist to seat-specific stage cache
      if (typeof window !== 'undefined') {
        const chair = meta?.chairId ? meta.chairId.replace(/[^0-9]/g, '') : '';
        if (chair) {
          try {
            const key = `thoogudeepa_item_stages_${chair}`;
            const existing = JSON.parse(localStorage.getItem(key) || '{}');
            existing[itemIdOrKey] = stage;
            if (meta?.dishId) {
              existing[meta.dishId] = stage;
              existing[`dish-${meta.dishId.replace('dish-', '')}`] = stage;
              existing[meta.dishId.replace('dish-', '')] = stage;
            }
            if (meta?.dishName) {
              const ln = meta.dishName.toLowerCase();
              existing[ln] = stage;
              existing[ln.replace(/donne\s*/i, '').trim()] = stage;
            }
            if (normDishNum) {
              existing[normDishNum] = stage;
              existing[`dish-${normDishNum}`] = stage;
              existing[`menu-0${normDishNum}`] = stage;
              existing[`menu-${normDishNum}`] = stage;
            }
            localStorage.setItem(key, JSON.stringify(existing));
          } catch {
            // Ignore storage errors
          }
        }
      }

      // 3. Remote update if Supabase is connected
      if (supabase) {
        const dbStage = stage === 'PLACED' ? 'REC' : stage;
        if (itemIdOrKey.includes('-') && itemIdOrKey.length === 36) {
          const { data: cur } = await supabase.from('order_items').select('addons').eq('id', itemIdOrKey).maybeSingle();
          const curAddons: string[] = cur?.addons || [];
          const nextAddons = stage === 'PLACED'
            ? (curAddons.includes('PLACED') ? curAddons : [...curAddons, 'PLACED'])
            : curAddons.filter((x: string) => x !== 'PLACED');
          await supabase.from('order_items').update({ stage: dbStage, addons: nextAddons, updated_at: new Date().toISOString() }).eq('id', itemIdOrKey);
        } else if (meta?.chairId) {
          const cleanChair = meta.chairId.replace(/[^0-9]/g, '');
          const possibleChairs = [meta.chairId, cleanChair, cleanChair.padStart(2, '0')];
          const dId = meta.dishId || itemIdOrKey;
          const cleanDishNum = dId.replace(/[^0-9]/g, '');
          const possibleDishIds = [dId, `dish-${cleanDishNum}`, cleanDishNum];

          const { data: curList } = await supabase
            .from('order_items')
            .select('id, dish_id, dish_name, addons, chair_id')
            .in('chair_id', possibleChairs);

          if (curList && curList.length > 0) {
            const normName = meta.dishName ? meta.dishName.toLowerCase().replace(/donne\s*/i, '').trim() : '';
            for (const c of curList) {
              const cDishNum = c.dish_id ? c.dish_id.replace(/[^0-9]/g, '') : '';
              const cName = c.dish_name ? c.dish_name.toLowerCase().replace(/donne\s*/i, '').trim() : '';
              const isMatch =
                possibleDishIds.includes(c.dish_id) ||
                (cleanDishNum && cDishNum === cleanDishNum) ||
                (normName && (cName === normName || cName.includes(normName) || normName.includes(cName)));

              if (isMatch) {
                const curAddons: string[] = c.addons || [];
                const nextAddons = stage === 'PLACED'
                  ? (curAddons.includes('PLACED') ? curAddons : [...curAddons, 'PLACED'])
                  : curAddons.filter((x: string) => x !== 'PLACED');
                await supabase.from('order_items').update({ stage: dbStage, addons: nextAddons, updated_at: new Date().toISOString() }).eq('id', c.id);
              }
            }
          }
        }

        // Advance order status from pending to in_progress when kitchen accepts
        if (meta?.chairId && stage !== 'PLACED') {
          await supabase.from('orders').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('chair_id', meta.chairId).eq('status', 'pending');
        }

        const liveChannel = supabase.channel('kitchen_realtime_feed');
        liveChannel.send({
          type: 'broadcast',
          event: 'STAGE_CHANGE',
          payload: { key: itemIdOrKey, stage, ...meta },
        });
      }

      // 4. Broadcast to other tabs
      if (localChannel) {
        localChannel.postMessage({
          type: 'STAGE_CHANGE',
          key: itemIdOrKey,
          stage,
          ...meta,
        });
      }

      // 5. If marked READY, alert waitstaff for immediate pass pickup
      if (stage === 'READY') {
        const chair = meta?.chairId || '01';
        this.sendServiceAlert({
          id: `pass-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          seatNumber: `Seat ${chair.padStart(2, '0')}`,
          guestName: 'Kitchen Pass',
          type: 'kitchen_ready',
          title: `${meta?.dishId || 'Dish'} Ready to Serve`,
          message: `Pass counter: Dish ready for Seat ${chair}`,
          timeAgo: 'Just now',
          kotNumber: meta?.ticketNumber || 'KOT',
          isUrgent: false,
          isResolved: false
        }).catch(() => {});
      }

      return true;
    } catch (err) {
      console.error('Error updating stage:', err);
      return false;
    }
  },

  // Dispatch / Complete order from pass
  async dispatchTicket(ticketNumber: string, chairId?: string): Promise<boolean> {
    try {
      // 1. Update local orders list
      const orders = getLocalOrdersList();
      const updated = orders.filter((o) => o.order.ticket_number !== ticketNumber);
      setLocalOrdersList(updated);

      // 2. Dispatch record in local storage
      if (typeof window !== 'undefined' && chairId) {
        try {
          const key = `thoogudeepa_ticket_dispatched_${chairId}`;
          localStorage.setItem(key, JSON.stringify({ ticketNumber, dispatchedAt: Date.now() }));
        } catch {
          // Ignore storage errors
        }
      }

      // 3. Update Supabase & broadcast cross-device
      if (supabase) {
        await supabase.from('orders').update({ status: 'ready', updated_at: new Date().toISOString() }).eq('ticket_number', ticketNumber);
        const liveChannel = supabase.channel('kitchen_realtime_feed');
        liveChannel.send({
          type: 'broadcast',
          event: 'TICKET_DISPATCHED',
          payload: { ticketNumber, chairId },
        });
      }

      // 4. Broadcast
      if (localChannel) {
        localChannel.postMessage({
          type: 'TICKET_DISPATCHED',
          ticketNumber,
          chairId,
        });
      }

      // 5. Send kitchen pass pickup alert to waiters
      const chair = chairId || '01';
      this.sendServiceAlert({
        id: `pass-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        seatNumber: `Seat ${chair.padStart(2, '0')}`,
        guestName: 'Chef Pass Counter',
        type: 'kitchen_ready',
        title: `Ticket #${ticketNumber} Plated & Ready`,
        message: `All items prepared on pass counter for Seat ${chair}`,
        timeAgo: 'Just now',
        kotNumber: ticketNumber,
        isUrgent: true,
        isResolved: false
      }).catch(() => {});

      return true;
    } catch (err) {
      console.error('Error dispatching ticket:', err);
      return false;
    }
  },

  // Update dish availability
  async setAvailability(dishId: string, isAvailable: boolean): Promise<boolean> {
    try {
      if (supabase) {
        await supabase
          .from('dish_inventory')
          .upsert({ dish_id: dishId, is_available: isAvailable, updated_at: new Date().toISOString() });
      }
      if (localChannel) {
        localChannel.postMessage({
          type: 'AVAILABILITY_CHANGE',
          dishId,
          isAvailable,
        });
      }
      return true;
    } catch (err) {
      console.error('Error updating availability:', err);
      return false;
    }
  },

  // Fetch active orders (pending, in_progress, ready) with fallback and local hydration
  async getActiveOrders(): Promise<{ order: OrderRecord; items: OrderItemRecord[] }[]> {
    const localOrders = getLocalOrdersList();
    try {
      if (supabase) {
        const { data: orders, error: oErr } = await supabase
          .from('orders')
          .select('*')
          .in('status', ['pending', 'in_progress', 'ready'])
          .order('created_at', { ascending: false });

        if (!oErr && orders) {
          if (orders.length === 0) {
            setLocalOrdersList([]);
            return [];
          }

          const orderIds = orders.map((o) => o.id);
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

          const remoteOrders = orders.map((o) => ({
            order: o,
            items: (items || []).filter((it) => it.order_id === o.id).map((it) => {
              const hasPlacedAddon = it.addons && Array.isArray(it.addons) && it.addons.includes('PLACED');
              return {
                ...it,
                stage: hasPlacedAddon ? ('PLACED' as const) : (it.stage as 'PLACED' | 'REC' | 'PREP' | 'READY' | 'SERVED'),
              };
            }),
          }));

          const remoteTickets = new Set(remoteOrders.map((ro) => ro.order.ticket_number));
          const merged = [
            ...remoteOrders,
            ...localOrders.filter((lo) => !remoteTickets.has(lo.order.ticket_number)),
          ];
          return merged;
        }
      }
      return localOrders;
    } catch (err) {
      console.error('Error fetching active orders:', err);
      return localOrders;
    }
  },

  // Clear all orders (for clean fresh slate)
  async clearAllOrders(): Promise<boolean> {
    try {
      setLocalOrdersList([]);
      setLocalOccupancyMap({});
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (
            key.startsWith('thoogudeepa') ||
            key.includes('session') ||
            key.includes('cart') ||
            key.includes('order') ||
            key.includes('stages')
          ) {
            localStorage.removeItem(key);
          }
        }
        sessionStorage.clear();
        try {
          fetch('/api/orders', { method: 'DELETE' }).catch(() => {});
        } catch {
          // Ignore network errors
        }
      }
      if (supabase) {
        try {
          await supabase
            .from('orders')
            .update({ status: 'completed', updated_at: new Date().toISOString() })
            .in('status', ['pending', 'in_progress', 'ready']);
          await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch (dbErr) {
          console.warn('Database remote delete notice:', dbErr);
        }
      }
      if (localChannel) {
        localChannel.postMessage({ type: 'CLEAR_ALL_ORDERS' });
      }
      return true;
    } catch (err) {
      console.error('Error clearing orders:', err);
      if (localChannel) {
        localChannel.postMessage({ type: 'CLEAR_ALL_ORDERS' });
      }
      return false;
    }
  },

  // Send Service Alert (Call Waiter, Water Refill, Bill Request, Kitchen Ready Pass)
  async sendServiceAlert(alert: Partial<ServiceAlertRecord> & { seatNumber: string; title: string }): Promise<ServiceAlertRecord> {
    const newAlert: ServiceAlertRecord = {
      id: alert.id || `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: alert.type || 'customer_call',
      seatNumber: alert.seatNumber,
      guestName: alert.guestName || 'Guest',
      title: alert.title,
      message: alert.message || alert.title,
      timeAgo: alert.timeAgo || 'Just now',
      billAmount: alert.billAmount,
      kotNumber: alert.kotNumber,
      isUrgent: Boolean(alert.isUrgent),
      isResolved: false,
      createdAt: Date.now()
    };

    const alerts = getLocalAlertsList();
    const updated = [newAlert, ...alerts.filter((a) => a.id !== newAlert.id)];
    setLocalAlertsList(updated);

    if (localChannel) {
      localChannel.postMessage({ type: 'NEW_ALERT', alert: newAlert });
    }

    if (supabase) {
      const liveChannel = supabase.channel('kitchen_realtime_feed');
      liveChannel.send({
        type: 'broadcast',
        event: 'NEW_ALERT',
        payload: newAlert
      });
    }

    return newAlert;
  },

  // Get active floor alerts
  async getServiceAlerts(): Promise<ServiceAlertRecord[]> {
    return getLocalAlertsList();
  },

  // Resolve Service Alert
  async resolveServiceAlert(alertId: string): Promise<boolean> {
    const alerts = getLocalAlertsList();
    const updated = alerts.map((a) => (a.id === alertId ? { ...a, isResolved: true } : a));
    setLocalAlertsList(updated);

    if (localChannel) {
      localChannel.postMessage({ type: 'RESOLVE_ALERT', alertId });
    }

    if (supabase) {
      const liveChannel = supabase.channel('kitchen_realtime_feed');
      liveChannel.send({
        type: 'broadcast',
        event: 'RESOLVE_ALERT',
        payload: { alertId }
      });
    }

    return true;
  },

  // Customer or Waiter requests bill settlement
  async requestBill(chairId: string, amount?: number): Promise<boolean> {
    const map = getLocalOccupancyMap();
    if (map[chairId]) {
      map[chairId].status = 'billing';
      setLocalOccupancyMap(map);
    }
    if (localChannel) {
      localChannel.postMessage({ type: 'BILL_REQUESTED', chairId, amount });
    }
    if (supabase) {
      const liveChannel = supabase.channel('kitchen_realtime_feed');
      liveChannel.send({
        type: 'broadcast',
        event: 'BILL_REQUESTED',
        payload: { chairId, amount }
      });
    }
    return true;
  },

  // Settle bill and vacate seat
  async settleBill(chairId: string, paymentMethod: string, amount: number): Promise<boolean> {
    // 1. Release seat in local registry
    await this.releaseSeat(chairId);

    // 2. Mark order completed in Supabase
    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('chair_id', chairId)
          .in('status', ['pending', 'in_progress', 'ready']);
      } catch (err) {
        console.warn('Remote settle bill update notice:', err);
      }
    }

    // 3. Update shift telemetry stats
    if (typeof window !== 'undefined') {
      try {
        const stats = JSON.parse(
          localStorage.getItem(STORAGE_SHIFT_STATS_KEY) ||
            '{"totalSales": 14850, "billsSettled": 18, "tipsEarned": 620, "kotsPunched": 28, "guestsServed": 42}'
        );
        stats.totalSales += amount;
        stats.billsSettled += 1;
        stats.guestsServed += 2;
        localStorage.setItem(STORAGE_SHIFT_STATS_KEY, JSON.stringify(stats));
      } catch {}
    }

    if (localChannel) {
      localChannel.postMessage({ type: 'BILL_SETTLED', chairId, paymentMethod, amount });
    }
    if (supabase) {
      const liveChannel = supabase.channel('kitchen_realtime_feed');
      liveChannel.send({
        type: 'broadcast',
        event: 'BILL_SETTLED',
        payload: { chairId, paymentMethod, amount }
      });
    }

    return true;
  },

  // Get current shift metrics
  getShiftStats(): { totalSales: number; billsSettled: number; tipsEarned: number; kotsPunched: number; guestsServed: number } {
    if (typeof window === 'undefined') {
      return { totalSales: 14850, billsSettled: 18, tipsEarned: 620, kotsPunched: 28, guestsServed: 42 };
    }
    try {
      const raw = localStorage.getItem(STORAGE_SHIFT_STATS_KEY);
      return raw
        ? JSON.parse(raw)
        : { totalSales: 14850, billsSettled: 18, tipsEarned: 620, kotsPunched: 28, guestsServed: 42 };
    } catch {
      return { totalSales: 14850, billsSettled: 18, tipsEarned: 620, kotsPunched: 28, guestsServed: 42 };
    }
  },

  // Get live status of floor seats (Seats 01-10 Zone 1, dynamically expandable)
  async getFloorSeats(start = 1, count = 10): Promise<
    Array<{
      id: string;
      seatNumber: string;
      numericId: number;
      status: 'vacant' | 'occupied' | 'billing';
      guestName: string;
      guestCount: number;
      diningDuration: string;
      itemCount: number;
      runningTotal: number;
      hasBillRequest: boolean;
      hasPendingAlert: boolean;
      alertMessage?: string;
      zone: string;
      orderId?: string;
      ticketNumber?: string;
    }>
  > {
    const occupancyMap = getLocalOccupancyMap();
    const activeOrders = await this.getActiveOrders();
    const alerts = getLocalAlertsList().filter((a) => !a.isResolved);

    const list = [];
    const end = start + count - 1;
    for (let i = start; i <= end; i++) {
      const chairId = i < 10 ? `0${i}` : `${i}`;
      const seatNumber = `Seat ${chairId}`;
      const occ = occupancyMap[chairId] || occupancyMap[String(i)];
      const foundOrder = activeOrders.find(
        (o) => o.order.chair_id === chairId || o.order.chair_id === String(i)
      );
      const seatAlert = alerts.find(
        (a) => a.seatNumber.includes(chairId) || a.seatNumber === seatNumber
      );

      const isBilling = occ?.status === 'billing' || seatAlert?.title?.toLowerCase().includes('bill');
      const isOccupied = Boolean(occ || foundOrder);

      const totalAmount = foundOrder ? foundOrder.order.total_amount : (occ ? 840 : 0);
      const itemCount = foundOrder
        ? foundOrder.items.reduce((acc, it) => acc + it.quantity, 0)
        : (isOccupied ? 2 : 0);
      const guestName =
        foundOrder?.order?.device_token?.replace('waiter-', '') ||
        (isOccupied ? `Guest (${seatNumber})` : 'Walk-In Guest');

      let diningDuration = 'Just seated';
      if (occ?.placedAt) {
        const mins = Math.max(1, Math.round((Date.now() - occ.placedAt) / 60000));
        diningDuration = `${mins}m`;
      }

      const zoneName = i <= 10 ? 'Zone 1 (Seats 01-10)' : i <= 20 ? 'Zone 2 (Seats 11-20)' : i <= 30 ? 'Zone 3 (Seats 21-30)' : 'Zone 4 (Seats 31-40)';

      list.push({
        id: chairId,
        seatNumber,
        numericId: i,
        status: isBilling ? ('billing' as const) : isOccupied ? ('occupied' as const) : ('vacant' as const),
        guestName: isOccupied ? guestName : 'Walk-In Guest',
        guestCount: isOccupied ? 2 : 0,
        diningDuration: isOccupied ? diningDuration : '--',
        itemCount,
        runningTotal: totalAmount,
        hasBillRequest: Boolean(isBilling),
        hasPendingAlert: Boolean(seatAlert),
        alertMessage: seatAlert?.title,
        zone: zoneName,
        orderId: foundOrder?.order?.id,
        ticketNumber: foundOrder?.order?.ticket_number
      });
    }
    return list;
  },

  // Get active order details for a specific seat
  async getOrderForSeat(chairId: string): Promise<{ order: OrderRecord | null; items: OrderItemRecord[] }> {
    const cleanId = chairId.replace(/[^0-9]/g, '');
    const padded = cleanId.padStart(2, '0');
    const unpadded = cleanId.replace(/^0+/, '');
    const activeOrders = await this.getActiveOrders();
    const found = activeOrders.find(
      (o) => o.order.chair_id === padded || o.order.chair_id === unpadded || o.order.chair_id === chairId
    );
    if (found) {
      return { order: found.order, items: found.items };
    }
    return { order: null, items: [] };
  },

  // Subscribe to KDS & Seat Occupancy changes
  subscribeKDS(callbacks: {
    onNewOrder?: (data: { order: OrderRecord; items: OrderItemRecord[] }) => void;
    onStageChange?: (data: { key: string; stage: 'PLACED' | 'REC' | 'PREP' | 'READY' | 'SERVED'; dishId?: string; chairId?: string; ticketNumber?: string; dishName?: string }) => void;
    onTicketDispatched?: (data: { ticketNumber: string; chairId?: string }) => void;
    onAvailabilityChange?: (data: { dishId: string; isAvailable: boolean }) => void;
    onSeatOccupancyChange?: (data: { chairId: string; isOccupied: boolean }) => void;
    onNewAlert?: (alert: ServiceAlertRecord) => void;
    onResolveAlert?: (alertId: string) => void;
    onBillRequested?: (data: { chairId: string; amount?: number }) => void;
    onBillSettled?: (data: { chairId: string; amount?: number; paymentMethod?: string }) => void;
    onClearAll?: () => void;
  }) {
    // 1. Supabase Realtime Channel
    let supabaseSub: ReturnType<SupabaseClient['channel']> | null = null;
    if (supabase) {
      supabaseSub = supabase
        .channel('kitchen_realtime_feed')
        // Cross-device broadcast listeners (instant sub-50ms latency)
        .on('broadcast', { event: 'NEW_ORDER' }, (msg) => {
          if (callbacks.onNewOrder && msg.payload) {
            callbacks.onNewOrder(msg.payload);
          }
          if (callbacks.onSeatOccupancyChange && msg.payload?.order?.chair_id) {
            callbacks.onSeatOccupancyChange({ chairId: msg.payload.order.chair_id, isOccupied: true });
          }
        })
        .on('broadcast', { event: 'STAGE_CHANGE' }, (msg) => {
          if (callbacks.onStageChange && msg.payload) {
            callbacks.onStageChange(msg.payload);
          }
        })
        .on('broadcast', { event: 'TICKET_DISPATCHED' }, (msg) => {
          if (callbacks.onTicketDispatched && msg.payload) {
            callbacks.onTicketDispatched(msg.payload);
          }
        })
        .on('broadcast', { event: 'NEW_ALERT' }, (msg) => {
          if (callbacks.onNewAlert && msg.payload) {
            callbacks.onNewAlert(msg.payload);
          }
        })
        .on('broadcast', { event: 'RESOLVE_ALERT' }, (msg) => {
          if (callbacks.onResolveAlert && msg.payload?.alertId) {
            callbacks.onResolveAlert(msg.payload.alertId);
          }
        })
        .on('broadcast', { event: 'BILL_REQUESTED' }, (msg) => {
          if (callbacks.onBillRequested && msg.payload) {
            callbacks.onBillRequested(msg.payload);
          }
        })
        .on('broadcast', { event: 'BILL_SETTLED' }, (msg) => {
          if (callbacks.onBillSettled && msg.payload) {
            callbacks.onBillSettled(msg.payload);
          }
        })
        .on('broadcast', { event: 'CLEAR_ALL_ORDERS' }, () => {
          if (callbacks.onClearAll) {
            callbacks.onClearAll();
          }
        })
        // Postgres change listeners (database synchronization)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
          const newOrder = payload.new as OrderRecord;
          if (supabase && newOrder.id) {
            supabase
              .from('order_items')
              .select('*')
              .eq('order_id', newOrder.id)
              .then(({ data: fetchedItems }) => {
                if (callbacks.onNewOrder) {
                  callbacks.onNewOrder({ order: newOrder, items: fetchedItems || [] });
                }
              });
          } else if (callbacks.onNewOrder) {
            callbacks.onNewOrder({ order: newOrder, items: [] });
          }
          if (callbacks.onSeatOccupancyChange && newOrder?.chair_id) {
            callbacks.onSeatOccupancyChange({ chairId: newOrder.chair_id, isOccupied: true });
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'order_items' }, (payload) => {
          if (callbacks.onStageChange) {
            const row = payload.new as any;
            const hasPlacedAddon = row.addons && Array.isArray(row.addons) && row.addons.includes('PLACED');
            const effStage: 'PLACED' | 'REC' | 'PREP' | 'READY' | 'SERVED' = hasPlacedAddon ? 'PLACED' : row.stage;
            callbacks.onStageChange({ key: row.id || row.dish_id, stage: effStage, dishId: row.dish_id, chairId: row.chair_id });
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'dish_inventory' }, (payload) => {
          if (callbacks.onAvailabilityChange) {
            const row = payload.new as DishAvailabilityRecord;
            callbacks.onAvailabilityChange({ dishId: row.dish_id, isAvailable: row.is_available });
          }
        })
        .subscribe();
    }

    // 2. Local Broadcast Channel handler
    const handleLocalMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'NEW_ORDER' && callbacks.onNewOrder) {
        callbacks.onNewOrder({ order: data.order, items: data.items });
      } else if (data.type === 'STAGE_CHANGE' && callbacks.onStageChange) {
        callbacks.onStageChange({
          key: data.key,
          stage: data.stage,
          dishId: data.dishId,
          chairId: data.chairId,
          ticketNumber: data.ticketNumber,
          dishName: data.dishName,
        });
      } else if (data.type === 'TICKET_DISPATCHED' && callbacks.onTicketDispatched) {
        callbacks.onTicketDispatched({ ticketNumber: data.ticketNumber, chairId: data.chairId });
      } else if (data.type === 'SEAT_OCCUPIED' && callbacks.onSeatOccupancyChange) {
        callbacks.onSeatOccupancyChange({ chairId: data.chairId, isOccupied: true });
      } else if (data.type === 'SEAT_RELEASED' && callbacks.onSeatOccupancyChange) {
        callbacks.onSeatOccupancyChange({ chairId: data.chairId, isOccupied: false });
      } else if (data.type === 'NEW_ALERT' && callbacks.onNewAlert) {
        callbacks.onNewAlert(data.alert);
      } else if (data.type === 'RESOLVE_ALERT' && callbacks.onResolveAlert) {
        callbacks.onResolveAlert(data.alertId);
      } else if (data.type === 'BILL_REQUESTED' && callbacks.onBillRequested) {
        callbacks.onBillRequested({ chairId: data.chairId, amount: data.amount });
      } else if (data.type === 'BILL_SETTLED' && callbacks.onBillSettled) {
        callbacks.onBillSettled({ chairId: data.chairId, amount: data.amount, paymentMethod: data.paymentMethod });
      } else if (data.type === 'AVAILABILITY_CHANGE' && callbacks.onAvailabilityChange) {
        callbacks.onAvailabilityChange({ dishId: data.dishId, isAvailable: data.isAvailable });
      } else if (data.type === 'CLEAR_ALL_ORDERS' && callbacks.onClearAll) {
        callbacks.onClearAll();
      }
    };

    if (localChannel) {
      localChannel.addEventListener('message', handleLocalMessage);
    }

    // Unsubscribe cleanup
    return () => {
      if (supabaseSub && supabase) {
        supabase.removeChannel(supabaseSub);
      }
      if (localChannel) {
        localChannel.removeEventListener('message', handleLocalMessage);
      }
    };
  },
};
