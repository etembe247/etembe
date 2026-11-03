<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- PWA uses vite-plugin-pwa generateSW in the served public output with one preview-guarded native registration module; this prevents offline caches from trapping editor previews.
- Static assets use CacheFirst and API GETs use NetworkFirst; private account data stays in localStorage/queued KV sync and is never precached.
- Keep the install control separate from the main ETEMBE screen logic so browser-only install events remain hydration-safe.
- AI lives client-side in src/lib/puter.ts: Puter.js first, Pollinations.ai fallback while online, and lazily loaded web-llm Qwen2 1.5B only when offline; no API keys or server AI route.
- Per-user learning memory lives in src/lib/etembe-memory.ts (localStorage 'etembe_memory' + public.etembe_memory table); stats derive only from recorded completions.
- Accounts use Puter.js auth only (puter.auth) and per-user profile/progress/activity/chat sync in etembe:<username>:* Puter KV keys via src/lib/puter-account.ts; the app's own sign-in pages trigger the Puter popup so the design stays.
