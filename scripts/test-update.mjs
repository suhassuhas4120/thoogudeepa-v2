import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exscyhgniknezrjdpyxx.supabase.co';
const supabaseKey = 'sb_publishable_I60t2aP_TkIJfFulpcmu4w_rDo97_mN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  console.log('Testing update status to cancelled...');
  const res = await supabase.from('orders').update({ status: 'completed' }).neq('id', '00000000-0000-0000-0000-000000000000').select();
  console.log('Update result:', res);
}

testUpdate();
