CREATE TABLE public.etembe_memory (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  memory JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.etembe_memory TO authenticated;
GRANT ALL ON public.etembe_memory TO service_role;
ALTER TABLE public.etembe_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memory own" ON public.etembe_memory FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
COMMENT ON TABLE public.user_ai_credentials IS 'DEPRECATED: Gemini key storage retired; ETEMBE AI runs key-free via Puter.js.';