import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (supabase) {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return NextResponse.json({ success: true, orders });
    }

    return NextResponse.json({
      success: true,
      orders: [],
      source: 'local-in-memory',
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ success: false, error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticket_number, chair_id, seat_label, items, total_amount } = body;

    if (!chair_id || !items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Invalid order payload' }, { status: 400 });
    }

    const ticket = ticket_number || `TK-${Math.floor(1000 + Math.random() * 9000)}`;

    if (supabase) {
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          ticket_number: ticket,
          chair_id,
          seat_label: seat_label || chair_id,
          status: 'pending',
          total_amount: total_amount || 0,
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      const orderItemsToInsert = items.map((item: {
        dish_id: string;
        dish_name: string;
        quantity: number;
        price: number;
        notes?: string;
        addons?: string[];
      }) => ({
        order_id: orderData.id,
        chair_id,
        seat_label: seat_label || chair_id,
        dish_id: item.dish_id,
        dish_name: item.dish_name,
        quantity: item.quantity,
        price: item.price,
        stage: 'REC',
        notes: item.notes || '',
        addons: item.addons || [],
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsToInsert);
      if (itemsErr) throw itemsErr;

      return NextResponse.json({
        success: true,
        orderId: orderData.id,
        ticketNumber: ticket,
      });
    }

    // Local mode success response
    return NextResponse.json({
      success: true,
      orderId: `local-${Date.now()}`,
      ticketNumber: ticket,
      source: 'local-in-memory',
    });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ success: false, error: 'Order creation failed' }, { status: 500 });
  }
}
