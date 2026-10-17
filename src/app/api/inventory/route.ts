import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (supabase) {
      const { data: inventory, error } = await supabase
        .from('dish_inventory')
        .select('*')
        .order('dish_name');

      if (error) throw error;
      return NextResponse.json({ success: true, inventory });
    }

    return NextResponse.json({
      success: true,
      inventory: [
        { dish_id: 'chicken-biryani', dish_name: 'Chicken Biryani', is_available: true },
        { dish_id: 'mutton-biryani', dish_name: 'Mutton Biryani', is_available: true },
        { dish_id: 'donne-egg-biryani', dish_name: 'Donne Egg Biryani', is_available: true },
        { dish_id: 'gunfire-kebab', dish_name: 'Gunfire Kebab', is_available: false },
        { dish_id: 'chicken-sukka', dish_name: 'Chicken Sukka', is_available: true },
        { dish_id: 'donne-khushka', dish_name: 'Donne Khushka', is_available: true },
        { dish_id: 'mutton-chukka', dish_name: 'Mutton Chukka', is_available: true },
        { dish_id: 'guntur-chicken', dish_name: 'Guntur Chicken', is_available: true },
      ],
      source: 'local-in-memory',
    });
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return NextResponse.json({ success: false, error: 'Inventory query failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { dish_id, is_available } = body;

    if (!dish_id || typeof is_available !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Invalid inventory payload' }, { status: 400 });
    }

    if (supabase) {
      const { error } = await supabase
        .from('dish_inventory')
        .upsert({ dish_id, is_available, updated_at: new Date().toISOString() });

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      dish_id,
      is_available,
    });
  } catch (error) {
    console.error('Failed to update inventory:', error);
    return NextResponse.json({ success: false, error: 'Inventory update failed' }, { status: 500 });
  }
}
