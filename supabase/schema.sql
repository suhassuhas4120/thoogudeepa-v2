-- ==============================================================================
-- THOOGUDEEPA V2 - RESTAURANT OPERATING SYSTEM SCHEMA
-- Realtime Customer QR Ordering <-> Kitchen Display System (KDS) Live Sync
-- ==============================================================================

-- 1. Orders Master Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL,
    chair_id TEXT NOT NULL,
    seat_label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'ready', 'completed', 'cancelled')),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    chair_id TEXT NOT NULL,
    seat_label TEXT NOT NULL,
    dish_id TEXT NOT NULL,
    dish_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stage TEXT NOT NULL DEFAULT 'REC' CHECK (stage IN ('REC', 'PREP', 'READY')),
    notes TEXT,
    addons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Dish Inventory & Availability Table
CREATE TABLE IF NOT EXISTS public.dish_inventory (
    dish_id TEXT PRIMARY KEY,
    dish_name TEXT NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Initial Seed for Dish Availability
INSERT INTO public.dish_inventory (dish_id, dish_name, is_available)
VALUES 
    ('chicken-biryani', 'Chicken Biryani', true),
    ('mutton-biryani', 'Mutton Biryani', true),
    ('donne-egg-biryani', 'Donne Egg Biryani', true),
    ('gunfire-kebab', 'Gunfire Kebab', false),
    ('chicken-sukka', 'Chicken Sukka', true),
    ('donne-khushka', 'Donne Khushka', true),
    ('mutton-chukka', 'Mutton Chukka', true),
    ('guntur-chicken', 'Guntur Chicken', true)
ON CONFLICT (dish_id) DO NOTHING;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_inventory ENABLE ROW LEVEL SECURITY;

-- 6. Create Permissive Policies for Restaurant KDS & Customer Terminals
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Public Read Order Items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Public Insert Order Items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Order Items" ON public.order_items FOR UPDATE USING (true);

CREATE POLICY "Public Read Dish Inventory" ON public.dish_inventory FOR SELECT USING (true);
CREATE POLICY "Public Update Dish Inventory" ON public.dish_inventory FOR UPDATE USING (true);

-- 7. Add Tables to Supabase Realtime Publication for Live WebSockets Streaming
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dish_inventory;
