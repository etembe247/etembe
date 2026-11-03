ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS career text NOT NULL DEFAULT 'Software Engineer';
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
DROP POLICY IF EXISTS "Users update own profile career" ON public.profiles;
CREATE POLICY "Users update own profile career" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE OR REPLACE FUNCTION public.handle_new_user_career() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET career = COALESCE(NULLIF(NEW.raw_user_meta_data->>'career',''), career) WHERE id = NEW.id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_auth_user_created_career ON auth.users;
CREATE TRIGGER on_auth_user_created_career AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_career();