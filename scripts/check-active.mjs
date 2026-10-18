import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exscyhgniknezrjdpyxx.supabase.co';
const supabaseKey = 'sb_publishable_I60t2aP_TkIJfFulpcmu4w_rDo97_mN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActive() {
  const { data: orders, error: oErr } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['pending', 'in_progress', 'ready']);

  console.log('Active orders remaining in Supabase:', orders?.length, 'error:', oErr);
}

checkActive();
