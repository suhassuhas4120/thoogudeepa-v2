import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exscyhgniknezrjdpyxx.supabase.co';
const supabaseKey = 'sb_publishable_I60t2aP_TkIJfFulpcmu4w_rDo97_mN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  console.log('Connecting to Supabase...');
  try {
    const { error: itemErr } = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (itemErr) console.error('order_items error:', itemErr.message);
    else console.log('Successfully deleted all order_items from database.');

    const { error: ordErr } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (ordErr) console.error('orders error:', ordErr.message);
    else console.log('Successfully deleted all orders from database.');
  } catch (e) {
    console.error('Exception during database purge:', e);
  }
}

clean();
