-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Mağaza ve Entegrasyonlar (Core)
CREATE TABLE public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL, -- references Supabase auth user IDs (which are typically UUID, but TEXT is safer if we don't link auth schema directly for some reason, standard is UUID linking auth.users(id), assuming that:
    -- owner_id UUID NOT NULL REFERENCES auth.users(id), (Note: assuming auth.users is present in typical Supabase). If auth schema is restricted, we'll just keep it UUID.
    subscription_plan TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We assume owner_id maps to auth.uid() directly. To avoid referencing auth.users which might break on some local setups, we just use UUID.
ALTER TABLE public.stores ALTER COLUMN owner_id TYPE UUID USING owner_id::UUID;

CREATE TABLE public.warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    platform_name TEXT NOT NULL, -- 'trendyol', 'hepsiburada'
    api_credentials JSONB NOT NULL DEFAULT '{}'::jsonb, -- (Encrypted JSON)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ürün Yönetimi
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    barcode TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, sku)
);

CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES public.variants(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(variant_id, warehouse_id)
);

CREATE TABLE public.product_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES public.variants(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
    remote_product_id TEXT,
    remote_sku TEXT,
    sync_status TEXT DEFAULT 'pending', -- pending, synced, error
    overridden_price NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CRM ve Siparişler
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    full_name TEXT NOT NULL,
    total_spent NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'new', -- new, processing, shipped, delivered, cancelled
    original_order_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Otomasyon
CREATE TABLE public.automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL, -- LOW_STOCK, ORDER_RECEIVED vb.
    trigger_value JSONB,
    action_type TEXT NOT NULL, -- STOP_SALES, ADJUST_PRICE vb.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    result_message TEXT
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- 1. STORES
-- Only store owners can view/edit their own store
CREATE POLICY "Users can manage their own stores" ON public.stores
    FOR ALL USING (auth.uid() = owner_id);

-- 2. CORE ENTITIES directly linked to store_id
CREATE POLICY "Users can manage warehouses of their stores" ON public.warehouses
    FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage integrations of their stores" ON public.integrations
    FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage products of their stores" ON public.products
    FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage customers of their stores" ON public.customers
    FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage orders of their stores" ON public.orders
    FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage automation rules of their stores" ON public.automation_rules
    FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

-- 3. NESTED ENTITIES (Variants, Inventory, Listings, Order Items, Automation Logs)
-- Accessed via their parent's store_id

CREATE POLICY "Users can manage variants via products" ON public.variants
    FOR ALL USING (
        product_id IN (SELECT id FROM public.products WHERE store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()))
    );

CREATE POLICY "Users can manage inventory via variants" ON public.inventory
    FOR ALL USING (
        variant_id IN (SELECT id FROM public.variants WHERE product_id IN (SELECT id FROM public.products WHERE store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())))
    );

CREATE POLICY "Users can manage listings via variants" ON public.product_listings
    FOR ALL USING (
        variant_id IN (SELECT id FROM public.variants WHERE product_id IN (SELECT id FROM public.products WHERE store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())))
    );

CREATE POLICY "Users can manage order items via orders" ON public.order_items
    FOR ALL USING (
        order_id IN (SELECT id FROM public.orders WHERE store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()))
    );

CREATE POLICY "Users can manage logs via automation rules" ON public.automation_logs
    FOR ALL USING (
        rule_id IN (SELECT id FROM public.automation_rules WHERE store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()))
    );

-- ==========================================
-- DATABASE TRIGGERS & FUNCTIONS
-- ==========================================

-- Function to notify automation changes via pg_notify
-- The backend (Node.js/Upstash Redis) can listen or we can poll. Typically Supabase Realtime is used,
-- but a pure Postgres trigger is great for raw LISTEN/NOTIFY.
CREATE OR REPLACE FUNCTION public.notify_automation_rule_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('automation_rules_channel', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'data', row_to_json(NEW)
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_automation_rule_change
  AFTER INSERT OR UPDATE OR DELETE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.notify_automation_rule_changes();
