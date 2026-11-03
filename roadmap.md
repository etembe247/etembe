# ETEMBE Final
Stage 1
- [x] Landing title in Playfair Display, no V10.
- [x] Saved stats, activities, lessons and quiz records per account; new accounts get stats automatically.
- [x] Home: Hello + streak + XP, 2x2 stats, weekly goal bar, continue card, coach card, quick actions; live updates.
ETEMBE patch
- [x] Rename LearnWell → ETEMBE everywhere (UI, manifest, PWA, head meta).
- [x] Remove Pollinations/Gemini/server AI route and all API-key UI; AI via Puter.js only (chat stream, txt2img, txt2speech).
- [x] Real user memory (etembe_memory, localStorage + account sync); stats only from real completions; AI never repeats lessons.
- [x] No hardcoded modes: free-text chat with explicit typed career/subject/topic commands; no quick-reply chips.
- [x] Dynamic system prompt per reply: memory + mode + input type; AI ends every reply with a task JSON; [IMAGE_GENERATE] tag renders a picture in chat; roleplay/voice replies get a spoken audio player.
- [x] Homework photo help via Puter vision; live voice call via Puter speech.
Uploaded spec (BUILD_ETEMBE_FINAL_V1)
- [ ] Decide: spec wants "allow all" database policies (would expose every user's data) and Puter accounts as main login (second account system). Skipped both for now — kept per-user private tables and current sign-in.
- [ ] Spec's new pages (Daily lesson auto-start, Tasks panel, Generate page, leaderboard) not yet built.
Open blockers
- [ ] Verify signed-in flows end-to-end. Blocker: no accounts exist yet.
- [ ] Verify real phone install/offline. Blocker: app not published.
- [ ] Verify Puter.js "Allow" popup flow on a real device. Blocker: needs a signed-in user in a browser.
- [x] Keep own signup/signin pages; buttons use Puter sign-in behind the scenes
- [x] askAI(): Puter qwen/qwen3-0.6b -> Pollinations while online; offline Qwen2 1.5B only when offline, with Offline Mode badge
