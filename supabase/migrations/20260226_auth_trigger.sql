-- Migration: Auth Trigger - Auto-create store on new user registration
-- Date: 2026-02-26

-- Function that runs after a new user is inserted into auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  store_name TEXT;
BEGIN
  -- Extract the part of the email before '@' to use as default store name
  -- If no email, fall back to 'My Store'
  store_name := COALESCE(
    SPLIT_PART(NEW.email, '@', 1),
    'My Store'
  );

  -- Capitalize first letter for a nicer default name
  store_name := UPPER(SUBSTRING(store_name, 1, 1)) || SUBSTRING(store_name, 2);

  -- Create the store record automatically
  INSERT INTO public.stores (owner_id, name, subscription_plan)
  VALUES (NEW.id, store_name, 'free_trial');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to auth.users
CREATE OR REPLACE TRIGGER create_new_store_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
