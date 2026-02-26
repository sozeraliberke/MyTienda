-- This script can be run in Supabase SQL Editor to insert mock test data.
-- It bypasses RLS if run as a super_user or disables it temporarily.

-- We assume you have a user id '00000000-0000-0000-0000-000000000001' from auth.users
-- Or we just generate random UUIDs for manual testing bypassing the auth link check.

INSERT INTO public.stores (id, name, owner_id, subscription_plan)
VALUES ('11111111-1111-1111-1111-111111111111', 'Mock Tienda', '00000000-0000-0000-0000-000000000001', 'free')
ON CONFLICT DO NOTHING;

INSERT INTO public.warehouses (id, store_id, name, address)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Market Depo', 'Istanbul')
ON CONFLICT DO NOTHING;

INSERT INTO public.products (id, store_id, name, description, brand, attributes)
VALUES ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Test T-Shirt', 'Pamuklu T-Shirt', 'BrandX', '{"material": "cotton"}')
ON CONFLICT DO NOTHING;

INSERT INTO public.variants (id, product_id, sku, price, stock_code)
VALUES ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'TSHIRT-M-BLK', 199.99, 'TSC-01')
ON CONFLICT DO NOTHING;

INSERT INTO public.inventory (variant_id, warehouse_id, quantity)
VALUES ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 15)
ON CONFLICT DO NOTHING;

-- Testing RLS
-- To test RLS, one would query with `set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', true);`
-- and then `SELECT * FROM public.products;`
