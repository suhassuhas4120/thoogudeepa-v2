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
  stage: 'REC' | 'PREP' | 'READY';
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
      const newEntry = { order: { ...order, id: generatedId }, items };
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
          items,
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
        const itemsToInsert = items.map((it) => ({
          order_id: orderId,
          chair_id: it.chair_id,
          seat_label: it.seat_label,
          dish_id: it.dish_id,
          dish_name: it.dish_name,
          quantity: it.quantity,
          price: it.price,
          stage: it.stage || 'REC',
          notes: it.notes || '',
          addons: it.addons || [],
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert);
        if (itemsErr) throw itemsErr;

        // Broadcast cross-device via Supabase Realtime channel
        const liveChannel = supabase.channel('kitchen_realtime_feed');
        liveChannel.send({
          type: 'broadcast',
          event: 'NEW_ORDER',
          payload: { order: { ...order, id: orderId }, items: itemsToInsert },
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
    stage: 'REC' | 'PREP' | 'READY',
    meta?: { chairId?: string; dishId?: string; ticketNumber?: string }
  ): Promise<boolean> {
    try {
      // 1. Update in local orders list
      const orders = getLocalOrdersList();
      orders.forEach((o) => {
        if (!meta?.chairId || o.order.chair_id === meta.chairId) {
          o.items.forEach((it) => {
            const matches =
              it.id === itemIdOrKey ||
              it.dish_id === itemIdOrKey ||
              `${it.dish_id}-${it.chair_id}` === itemIdOrKey ||
              (meta?.dishId && it.dish_id === meta.dishId);
            if (matches) {
              it.stage = stage;
            }
          });
        }
      });
      setLocalOrdersList(orders);

      // 2. Persist to seat-specific stage cache
      if (typeof window !== 'undefined') {
        const chair = meta?.chairId || '';
        if (chair) {
          try {
            const key = `thoogudeepa_item_stages_${chair}`;
            const existing = JSON.parse(localStorage.getItem(key) || '{}');
            existing[itemIdOrKey] = stage;
            if (meta?.dishId) existing[meta.dishId] = stage;
            localStorage.setItem(key, JSON.stringify(existing));
          } catch {
            // Ignore storage errors
          }
        }
      }

      // 3. Remote update if Supabase is connected
      if (supabase) {
        if (itemIdOrKey.includes('-') && itemIdOrKey.length === 36) {
          await supabase.from('order_items').update({ stage, updated_at: new Date().toISOString() }).eq('id', itemIdOrKey);
        } else if (meta?.chairId) {
          const dId = meta.dishId || itemIdOrKey;
          await supabase.from('order_items').update({ stage, updated_at: new Date().toISOString() }).match({ chair_id: meta.chairId, dish_id: dId });
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
            items: (items || []).filter((it) => it.order_id === o.id),
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

  // Subscribe to KDS & Seat Occupancy changes
  subscribeKDS(callbacks: {
    onNewOrder?: (data: { order: OrderRecord; items: OrderItemRecord[] }) => void;
    onStageChange?: (data: { key: string; stage: 'REC' | 'PREP' | 'READY'; dishId?: string; chairId?: string; ticketNumber?: string }) => void;
    onTicketDispatched?: (data: { ticketNumber: string; chairId?: string }) => void;
    onAvailabilityChange?: (data: { dishId: string; isAvailable: boolean }) => void;
    onSeatOccupancyChange?: (data: { chairId: string; isOccupied: boolean }) => void;
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
            const row = payload.new as OrderItemRecord;
            callbacks.onStageChange({ key: row.id || row.dish_id, stage: row.stage, dishId: row.dish_id, chairId: row.chair_id });
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
        });
      } else if (data.type === 'TICKET_DISPATCHED' && callbacks.onTicketDispatched) {
        callbacks.onTicketDispatched({ ticketNumber: data.ticketNumber, chairId: data.chairId });
      } else if (data.type === 'SEAT_OCCUPIED' && callbacks.onSeatOccupancyChange) {
        callbacks.onSeatOccupancyChange({ chairId: data.chairId, isOccupied: true });
      } else if (data.type === 'SEAT_RELEASED' && callbacks.onSeatOccupancyChange) {
        callbacks.onSeatOccupancyChange({ chairId: data.chairId, isOccupied: false });
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
