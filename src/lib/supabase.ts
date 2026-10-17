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
}

export interface DishAvailabilityRecord {
  dish_id: string;
  dish_name: string;
  is_available: boolean;
  updated_at?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local BroadcastChannel for real-time synchronization across browser tabs when Supabase keys are not set
const localChannel = typeof window !== 'undefined' ? new BroadcastChannel('thoogudeepa_kds_sync') : null;

export const realtimeBridge = {
  // Post order to Supabase and broadcast locally
  async placeOrder(order: OrderRecord, items: OrderItemRecord[]): Promise<{ success: boolean; orderId?: string }> {
    try {
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

        return { success: true, orderId };
      }

      // Local fallback broadcast
      if (localChannel) {
        localChannel.postMessage({
          type: 'NEW_ORDER',
          order: { ...order, id: `local-${Date.now()}` },
          items,
        });
      }

      return { success: true, orderId: `local-${Date.now()}` };
    } catch (err) {
      console.error('Error placing order:', err);
      // Fallback to local channel if remote call fails
      if (localChannel) {
        localChannel.postMessage({
          type: 'NEW_ORDER',
          order: { ...order, id: `local-${Date.now()}` },
          items,
        });
      }
      return { success: true, orderId: `local-${Date.now()}` };
    }
  },

  // Update item stage with seat and dish metadata
  async updateStage(
    itemIdOrKey: string,
    stage: 'REC' | 'PREP' | 'READY',
    meta?: { chairId?: string; dishId?: string; ticketNumber?: string }
  ): Promise<boolean> {
    try {
      if (supabase && itemIdOrKey.includes('-') && itemIdOrKey.length === 36) {
        await supabase.from('order_items').update({ stage, updated_at: new Date().toISOString() }).eq('id', itemIdOrKey);
      }
      if (localChannel) {
        localChannel.postMessage({
          type: 'STAGE_CHANGE',
          key: itemIdOrKey,
          stage,
          ...meta,
        });
      }
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
      return true;
    } catch (err) {
      console.error('Error updating stage:', err);
      return false;
    }
  },

  // Dispatch / Complete order from pass
  async dispatchTicket(ticketNumber: string, chairId?: string): Promise<boolean> {
    try {
      if (supabase) {
        await supabase.from('orders').update({ status: 'ready', updated_at: new Date().toISOString() }).eq('ticket_number', ticketNumber);
      }
      if (localChannel) {
        localChannel.postMessage({
          type: 'TICKET_DISPATCHED',
          ticketNumber,
          chairId,
        });
      }
      if (typeof window !== 'undefined' && chairId) {
        try {
          const key = `thoogudeepa_ticket_dispatched_${chairId}`;
          localStorage.setItem(key, JSON.stringify({ ticketNumber, dispatchedAt: Date.now() }));
        } catch {
          // Ignore storage errors
        }
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

  // Fetch active orders (pending, in_progress, ready) with their line items
  async getActiveOrders(): Promise<{ order: OrderRecord; items: OrderItemRecord[] }[]> {
    try {
      if (supabase) {
        const { data: orders, error: oErr } = await supabase
          .from('orders')
          .select('*')
          .in('status', ['pending', 'in_progress', 'ready'])
          .order('created_at', { ascending: false });

        if (oErr || !orders) return [];

        const orderIds = orders.map((o) => o.id);
        if (orderIds.length === 0) return [];

        const { data: items, error: iErr } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);

        if (iErr || !items) {
          return orders.map((o) => ({ order: o, items: [] }));
        }

        return orders.map((o) => ({
          order: o,
          items: items.filter((it) => it.order_id === o.id),
        }));
      }
      return [];
    } catch (err) {
      console.error('Error fetching active orders:', err);
      return [];
    }
  },

  // Clear all orders (for clean fresh slate)
  async clearAllOrders(): Promise<boolean> {
    try {
      if (supabase) {
        await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
      if (localChannel) {
        localChannel.postMessage({ type: 'CLEAR_ALL_ORDERS' });
      }
      return true;
    } catch (err) {
      console.error('Error clearing orders:', err);
      return false;
    }
  },

  // Subscribe to KDS changes
  subscribeKDS(callbacks: {
    onNewOrder?: (data: { order: OrderRecord; items: OrderItemRecord[] }) => void;
    onStageChange?: (data: { key: string; stage: 'REC' | 'PREP' | 'READY'; dishId?: string; chairId?: string; ticketNumber?: string }) => void;
    onTicketDispatched?: (data: { ticketNumber: string; chairId?: string }) => void;
    onAvailabilityChange?: (data: { dishId: string; isAvailable: boolean }) => void;
    onClearAll?: () => void;
  }) {
    // 1. Supabase Realtime Channel
    let supabaseSub: ReturnType<SupabaseClient['channel']> | null = null;
    if (supabase) {
      supabaseSub = supabase
        .channel('kitchen_realtime_feed')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
          if (callbacks.onNewOrder) {
            callbacks.onNewOrder({ order: payload.new as OrderRecord, items: [] });
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
