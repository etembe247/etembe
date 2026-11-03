CREATE TABLE public.user_ai_credentials (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 gemini_api_key text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.user_ai_credentials TO service_role;
REVOKE ALL ON public.user_ai_credentials FROM anon, authenticated;
ALTER TABLE public.user_ai_credentials ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public.user_ai_credentials.gemini_api_key IS 'AES-GCM encrypted user credential. Never exposed through browser reads.';