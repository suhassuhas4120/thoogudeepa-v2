import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exscyhgniknezrjdpyxx.supabase.co';
const supabaseKey = 'sb_publishable_I60t2aP_TkIJfFulpcmu4w_rDo97_mN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
  console.log('Testing delete with select count...');
  const res1 = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000').select();
  console.log('order_items delete result:', res1);

  const res2 = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000').select();
  console.log('orders delete result:', res2);
}

testDelete();
