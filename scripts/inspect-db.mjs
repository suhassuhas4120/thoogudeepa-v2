import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exscyhgniknezrjdpyxx.supabase.co';
const supabaseKey = 'sb_publishable_I60t2aP_TkIJfFulpcmu4w_rDo97_mN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data: orders, error: oErr } = await supabase.from('orders').select('*');
  console.log('Orders count in Supabase:', orders?.length, 'error:', oErr);
  if (orders && orders.length > 0) {
    console.log('Orders tickets:', orders.map(o => o.ticket_number));
  }

  const { data: items, error: iErr } = await supabase.from('order_items').select('*');
  console.log('Order items count in Supabase:', items?.length, 'error:', iErr);
}

inspect();
