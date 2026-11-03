import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { isSignedIn, signIn, signOut, getUser, loadProgress, saveProgress, deleteProgress, loadSyncedSlot, saveSyncedSlot, clearSyncedSlot, syncOfflineQueue, type PuterUser, type Progress } from '@/lib/puter-account';
import { Button } from '@/components/ui/button';
import { recognitionSettings, imagePrompt, WEEKLY_GOAL, type ChatKind } from '@/lib/learnwell-rules';
import { emptyMemory, loadMemory, saveMemoryLocal, recordCompletion, memoryContext, memoryStats, welcomeBack, type EtembeMemory } from '@/lib/etembe-memory';
import { parseUserIntent, extractExtras, formatTask, buildSystemPrompt } from '@/lib/etembe-intent';
import { askAI as puterChat, lastAiMode, puterImage, puterSpeech, PuterAuthError } from '@/lib/puter';
import learningArt from '@/assets/learning-still-life.png';
import { InstallApp } from '@/components/install-app';
import { Leaderboard } from '@/components/Leaderboard';
import { awardCompletion, badgesFor, emptyGamification, levelForXp, levelProgress, loadGamification, loadLeaderboard, saveGamification, scoreSummary, updateLeaderboard, type GamificationState } from '@/lib/gamification';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'ETEMBE — AI Career & Education Coach' },
    { name: 'description', content: 'Your ETEMBE career and education conversations, progress, and live voice calls.' },
    { property: 'og:title', content: 'ETEMBE — AI Career & Education Coach' },
    { property: 'og:description', content: 'Learn with your Career Coach and Education Professor through chat and voice.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Etembe,
});

type Screen = 'landing' | 'auth' | 'signin' | 'home' | 'profile' | 'settings' | ChatKind;
type Message = { id: string; role: 'user' | 'assistant'; text: string; image?: string | null; audio?: string | null; pending?: boolean; error?: boolean };
type Mode = { emoji: string; name: string; description: string };
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>>; resultIndex: number }) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null; start: () => void; stop: () => void; abort: () => void };
type VoiceWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
const labels = { career: 'Career Coach', education: 'Education Professor' };

function Etembe() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<PuterUser | null>(null);
  const [name, setName] = useState('Learner');
  const [displayNameDraft, setDisplayNameDraft] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gamification, setGamification] = useState<GamificationState>(emptyGamification);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const [profileTab, setProfileTab] = useState<'progress' | 'leaderboard'>('progress');
  const [autoRead, setAutoRead] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [career, setCareer] = useState('');
  const [subject, setSubject] = useState('');
  const [klass, setKlass] = useState('');
  useEffect(() => { try { setKlass(localStorage.getItem('etembe_class') || ''); } catch { /* blocked */ } }, []);
  const [initial, setInitial] = useState('');
  const [memory, setMemory] = useState<EtembeMemory>(emptyMemory);
  const [chats, setChats] = useState<Record<ChatKind, Message[]>>({ career: [], education: [] });
  const [messageCounts, setMessageCounts] = useState<Record<ChatKind, number>>({ career: 0, education: 0 });
  const [drafts, setDrafts] = useState({ career: '', education: '' });
  const [photos, setPhotos] = useState<Record<ChatKind, string | null>>({ career: null, education: null });
  const [modes, setModes] = useState<Record<ChatKind, Mode[]>>({ career: [], education: [] });
  const [currentMode, setCurrentMode] = useState<Record<ChatKind, string>>({ career: '', education: '' });
  const [modesBusy, setModesBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  const [offlineAi, setOfflineAi] = useState(false);
  const [aiBlocked, setAiBlocked] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [isLiveCall, setIsLiveCall] = useState(false);
  const [callStatus, setCallStatus] = useState('Listening…');
  const [callError, setCallError] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const profileFileInput = useRef<HTMLInputElement>(null);
  const recognition = useRef<Recognition | null>(null);
  const callAudio = useRef<HTMLAudioElement | null>(null);
  const live = useRef(false);
  const processing = useRef(false);
  const callGeneration = useRef(0);
  const currentUser = useRef<string | null>(null);
  const lastRequest = useRef<{ target: ChatKind; text: string; photo: string | null } | null>(null);
  const memoryRef = useRef(memory);
  memoryRef.current = memory;
  const kind: ChatKind = screen === 'career' ? 'career' : 'education';
  const isChat = screen === 'career' || screen === 'education';
  const areaName = kind === 'career' ? career : subject;
  const area = kind === 'career' ? 'careers' : 'subjects';

  function endCall() {
    live.current = false; callGeneration.current++;
    setIsLiveCall(false); setMicOn(false);
    recognition.current?.abort(); recognition.current = null;
    callAudio.current?.pause(); callAudio.current = null;
    window.speechSynthesis?.cancel(); setSpeaking(false);
  }
  function navigate(next: Screen) { endCall(); setNotice(''); setScreen(next); }

  const progress = useRef<Progress>({});
  async function saveAccount(patch: Partial<Progress>) {
    progress.current = { ...progress.current, ...patch };
    const username = currentUser.current;
    if (!username) return;
    try {
      try { await saveProgress(username, progress.current); } catch { /* the synced slots below are the source of truth */ }
      await saveSyncedSlot(username, 'profile', { name, career: progress.current.career ?? career, subject: (progress.current.memory as Partial<EtembeMemory> | undefined)?.subject ?? subject, klass, avatar_initial: progress.current.avatar_initial ?? initial, avatar: avatarUrl, referrer: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') || undefined : undefined });
      await saveSyncedSlot(username, 'progress', progress.current);
      if (progress.current.memory) await saveSyncedSlot(username, 'activities', progress.current.memory);
    } catch { setNotice('Your progress could not be saved.'); }
  }
  function saveMemory(next: EtembeMemory) {
    setMemory(next); saveMemoryLocal(next);
    void saveAccount({ memory: next });
  }

  async function enterApp(account: PuterUser) {
    currentUser.current = account.username; setUser(account);
    const restoredGamification = await loadGamification(account.username);
    setGamification(restoredGamification);
    void updateLeaderboard({ displayName: account.username, avatar: '', XP: restoredGamification.xp, level: levelForXp(restoredGamification.xp), username: account.username }).then(() => setLeaderboardRefresh(value => value + 1));
    setChats({ career: [], education: [] });
    const local = loadMemory();
    let saved: Progress = {};
    try { saved = await loadProgress(account.username); } catch { setNotice('Your saved learning could not be loaded.'); }
    if (currentUser.current !== account.username) return;
    const profile = await loadSyncedSlot<{ name?: string; career?: string; subject?: string; klass?: string; avatar_initial?: string; avatar?: string; referrer?: string }>(account.username, 'profile');
    const referrer = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') : null;
    if (referrer && referrer !== account.username && !profile?.referrer) {
      const inviter = await loadGamification(referrer); inviter.xp += 50; await saveGamification(referrer, inviter);
      const board = await loadLeaderboard(); const found = board.find(entry => entry.username === referrer);
      await updateLeaderboard({ displayName: found?.displayName || referrer, avatar: found?.avatar || '', XP: inviter.xp, level: levelForXp(inviter.xp), username: referrer });
      await saveSyncedSlot(account.username, 'profile', { ...(profile || {}), referrer });
    }
    const syncedDisplayName = await loadSyncedSlot<string>(account.username, 'displayName');
    const syncedAvatar = await loadSyncedSlot<string>(account.username, 'avatar');
    const syncedProgress = await loadSyncedSlot<Progress>(account.username, 'progress');
    const activities = await loadSyncedSlot<EtembeMemory>(account.username, 'activities');
    const syncedChats = await loadSyncedSlot<Record<ChatKind, Message[]>>(account.username, 'chat_history');
    saved = { ...saved, ...(syncedProgress ?? {}), ...(profile ? { career: profile.career, avatar_initial: profile.avatar_initial, memory: activities ?? syncedProgress?.memory } : {}) };
    if (syncedChats) saved.chats = (['career', 'education'] as ChatKind[]).flatMap(chatKind => (syncedChats[chatKind] ?? []).map(message => ({ id: message.id, kind: chatKind, role: message.role, content: message.text, image: message.image ?? null })));
    progress.current = saved;
    const remote = (saved.memory ?? null) as Partial<EtembeMemory> | null;
    const merged = remote && (remote.totalLessons ?? 0) >= local.totalLessons ? { ...emptyMemory(), ...local, ...remote } : local;
    setMemory(merged); saveMemoryLocal(merged);
    const displayName = syncedDisplayName || profile?.name || account.username || 'Learner';
    setName(displayName); setDisplayNameDraft(displayName); setAvatarUrl(syncedAvatar || profile?.avatar || '');
    void updateLeaderboard({ displayName, avatar: syncedAvatar || profile?.avatar || '', XP: restoredGamification.xp, level: levelForXp(restoredGamification.xp), username: account.username });
    setCareer(profile?.career || saved.career || ''); setSubject(profile?.subject || merged.subject || ''); setKlass(profile?.klass || ''); setInitial(profile?.avatar_initial || saved.avatar_initial || '');
    const history: Record<ChatKind, Message[]> = { career: [], education: [] };
    for (const row of saved.chats || []) if ((row.kind === 'career' || row.kind === 'education') && (row.role === 'user' || row.role === 'assistant')) history[row.kind].push({ id: row.id, role: row.role, text: row.content, image: row.image ?? null });
    const restoredChats = syncedChats ?? history;
    setChats(restoredChats);
    setMessageCounts({ career: restoredChats.career.filter(message => message.role === 'user').length, education: restoredChats.education.filter(message => message.role === 'user').length });
    setScreen('home');
  }
  async function puterLogin() {
    if (authBusy) return;
    setAuthBusy(true); setNotice('');
    try { await enterApp(await signIn()); }
    catch { setNotice('Sign in was cancelled. Tap Get Started to try again.'); }
    finally { setAuthBusy(false); }
  }
  async function logOut() {
    endCall();
    try { await signOut(); } catch { /* already signed out */ }
    currentUser.current = null; progress.current = {}; setUser(null); setChats({ career: [], education: [] }); setScreen('landing');
  }
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (await isSignedIn()) { const account = await getUser(); if (mounted) await enterApp(account); }
        // not signed in: stay on ETEMBE's own landing and sign-in pages
      } catch { if (mounted) setNotice('ETEMBE could not connect. Check your internet and tap Get Started.'); }
    })();
    return () => { mounted = false; live.current = false; recognition.current?.abort(); callAudio.current?.pause(); };
  }, []);
  useEffect(() => {
    const online = () => { setOffline(false); void syncOfflineQueue(); };
    const offlineNow = () => setOffline(true);
    window.addEventListener('online', online); window.addEventListener('offline', offlineNow);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offlineNow); };
  }, []);
  useEffect(() => { try { setAutoRead(localStorage.getItem('etembe:autoRead') === 'true'); } catch { /* blocked */ } }, []);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ block: 'end' }); }, [chats, screen]);

  async function persist(message: Message, target: ChatKind) {
    if (!user) return;
    const chats = [...(progress.current.chats ?? []), { id: message.id, kind: target, role: message.role, content: message.text, image: message.image || null }];
    progress.current = { ...progress.current, chats };
    const byKind = chats.reduce((all, item) => { all[item.kind].push({ id: item.id, role: item.role, text: item.content, image: item.image ?? null }); return all; }, { career: [], education: [] } as Record<ChatKind, Message[]>);
    await saveSyncedSlot(user.username, 'chat_history', byKind);
    await saveAccount({ chats });
  }
  function append(target: ChatKind, message: Message, save = true) {
    setChats(old => ({ ...old, [target]: [...old[target], message] }));
    if (save) void persist(message, target);
  }
  function quickAction(prompt: string) { navigate('career'); setDrafts(d => ({ ...d, career: prompt })); }
  async function changeInitial() {
    const value = window.prompt('Choose your avatar letter', initial || name[0] || 'E');
    if (!value?.trim() || !user) return;
    const firstCharacter = Array.from(value.trim())[0];
    if (!firstCharacter) return;
    const letter = firstCharacter.toUpperCase(); setInitial(letter);
    await saveAccount({ avatar_initial: letter });
  }
  async function saveDisplayName() {
    if (!user) return;
    const next = displayNameDraft.trim() || user.username || 'Learner';
    setName(next); setDisplayNameDraft(next);
    await saveSyncedSlot(user.username, 'displayName', next);
    await saveSyncedSlot(user.username, 'profile', { name: next, career, subject, klass, avatar_initial: initial, avatar: avatarUrl });
  }
  async function pickAvatar(file?: File) {
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { setNotice('Choose an image file.'); return; }
    try {
      const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = data; });
      const scale = Math.min(1, 512 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Avatar unavailable');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const next = canvas.toDataURL('image/jpeg', 0.84);
      setAvatarUrl(next); await saveSyncedSlot(user.username, 'avatar', next);
      await saveSyncedSlot(user.username, 'profile', { name, career, subject, klass, avatar_initial: initial, avatar: next });
      setNotice('Profile picture saved.');
    } catch { setNotice('That picture could not be saved. Try a JPG or PNG.'); }
  }
  async function changeCareer() {
    const value = window.prompt('What do you want to change to?', career);
    if (!value?.trim() || !user) return;
    const next = value.trim(); setCareer(next);
    await saveAccount({ career: next });
    append('career', { id: crypto.randomUUID(), role: 'assistant', text: `Great choice! I am now your ${next} coach. What would you like to learn first?` });
  }
  function changeSubject() {
    const value = window.prompt('What do you want to change to? (any subject, or subject + class)', subject);
    if (!value?.trim()) return;
    const next = value.trim(); setSubject(next);
    saveMemory({ ...memoryRef.current, subject: next });
    append('education', { id: crypto.randomUUID(), role: 'assistant', text: `Wonderful! I am now your ${next} professor. What would you like to learn first?` });
  }
  async function pickPhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setNotice('Choose an image file.'); return; }
    try {
      const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = data; });
      const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Photo unavailable');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      setPhotos(old => ({ ...old, [kind]: canvas.toDataURL('image/jpeg', 0.82) })); setNotice('');
    } catch { setNotice('That photo could not be opened. Try a JPG or PNG.'); }
  }

  const scoreFrom = (answer: string): number | null => {
    const ten = answer.match(/(?:score|got|result)?\s*[:\s]*(\d{1,2})\s*\/\s*10\b/i);
    const match = answer.match(/(?:score[:\s]*|got\s+)(\d{1,3})\s*(?:%|\/\s*100)/i) ?? answer.match(/(\d{1,3})\s*%/);
    if (ten) return Number(ten[1]) * 10;
    if (!match) return null;
    const value = Number(match[1]);
    return value >= 0 && value <= 100 ? value : null;
  };

  function answerCacheKey() { return 'etembe:cache'; }
  function readCachedAnswer(target: ChatKind, question: string) {
    try {
      const entries = JSON.parse(localStorage.getItem(answerCacheKey()) || '[]') as Array<{ target: ChatKind; question: string; answer: string }>;
      const normalized = question.trim().toLowerCase();
      return entries.find(entry => entry.target === target && entry.question === normalized)?.answer || null;
    } catch { return null; }
  }
  function cacheAnswer(target: ChatKind, question: string, answer: string) {
    try {
      const entries = JSON.parse(localStorage.getItem(answerCacheKey()) || '[]') as Array<{ target: ChatKind; question: string; answer: string }>;
      const normalized = question.trim().toLowerCase();
      const next = [{ target, question: normalized, answer }, ...entries.filter(entry => !(entry.target === target && entry.question === normalized))].slice(0, 30);
      localStorage.setItem(answerCacheKey(), JSON.stringify(next));
    } catch { /* cache is best effort */ }
  }
  async function completeActivity(target: ChatKind, topic: string, score?: number | null) {
    const username = currentUser.current;
    if (!username) return;
    const next = await awardCompletion(username, gamification, { topic: topic || 'General learning', ...(score !== undefined ? { score } : {}), kind: target });
    setGamification(next);
    await saveAccount({ topic, ...(score !== undefined && score !== null ? { score } : {}), date: new Date().toISOString(), completed: true });
    await updateLeaderboard({ displayName: name, avatar: avatarUrl, XP: next.xp, level: levelForXp(next.xp), username });
    setLeaderboardRefresh(value => value + 1);
  }
  function copyText(value: string, message = 'Link copied') {
    if (!navigator.clipboard) { setNotice('Copy is not available on this device.'); return; }
    void navigator.clipboard.writeText(value).then(() => setNotice(message)).catch(() => { setNotice('Copy is not available on this device.'); });
  }
  function inviteLink() { return `${window.location.origin}/?ref=${encodeURIComponent(currentUser.current || '')}`; }
  function shareStreak() { copyText(`I'm on a ${gamification.streak}-day streak on ETEMBE! 🔥 ${window.location.origin}`, 'Streak message copied'); }
  function shareWhatsApp() { window.open(`https://wa.me/?text=${encodeURIComponent(`I just scored ${Math.round(scoreSummary(gamification.scores).average / 10)}/10 on ETEMBE! 🔥 Learn any career free - ${window.location.origin}`)}`, '_blank', 'noopener,noreferrer'); }
  function shareXOrInstagram() { copyText(`${window.location.origin} — I learn any career and subject free with ETEMBE!`, 'Share link copied'); }
  function downloadCertificate() {
    const summary = scoreSummary(gamification.scores); const topic = career || subject || 'Career and Education'; const date = new Date().toLocaleDateString();
    const esc = (value: string) => value.replace(/[\\()]/g, '\\$&');
    const lines = [`ETEMBE AI`, `Certificate of Learning`, `Presented to ${name}`, `Topic: ${topic}`, `Average Score: ${summary.average}%`, `Date: ${date}`];
    const stream = `BT /F1 24 Tf 72 700 Td (${esc(lines[0]!)}) Tj /F1 18 Tf 0 -50 Td (${esc(lines[1]!)}) Tj /F1 14 Tf 0 -55 Td (${esc(lines[2]!)}) Tj 0 -35 Td (${esc(lines[3]!)}) Tj 0 -25 Td (${esc(lines[4]!)}) Tj 0 -25 Td (${esc(lines[5]!)}) Tj ET`;
    const objects = [`<< /Type /Catalog /Pages 2 0 R >>`, `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
    let pdf = '%PDF-1.4\n'; const offsets = [0]; objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; }); const xref = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' })); const link = document.createElement('a'); link.href = url; link.download = 'etembe-certificate.pdf'; link.click(); URL.revokeObjectURL(url);
  }

  async function send(target: ChatKind, spoken?: string): Promise<string | null> {
    if (processing.current) return null;
    const text = spoken ?? drafts[target].trim(), photo = spoken === undefined ? photos[target] : null;
    if (!text && !photo) return null;
    const lower = text.toLowerCase();
    if (!photo && (lower.includes('new chat') || lower.includes('clear chat'))) {
      const username = currentUser.current;
      if (username) await clearSyncedSlot(username, 'chat_history');
      setChats({ career: [], education: [] });
      setMessageCounts({ career: 0, education: 0 });
      try { localStorage.removeItem(username ? `etembe:${username}:chat_history` : 'chat_history'); } catch { /* blocked */ }
      setDrafts(old => ({ ...old, [target]: '' }));
      return null;
    }
    processing.current = true; setBusy(true); setNotice(''); setAiBlocked(false);
    setDrafts(old => ({ ...old, [target]: '' })); setPhotos(old => ({ ...old, [target]: null }));
    lastRequest.current = { target, text, photo };
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text, image: photo };
    append(target, userMessage);
    const id = crypto.randomUUID(); append(target, { id, role: 'assistant', text: '', pending: true }, false);
    const finish = (answer: string, image?: string | null, error = false) => setChats(old => ({ ...old, [target]: old[target].map(m => m.id === id ? { id, role: 'assistant', text: answer, image: image ?? null, error } : m) }));
    try {
      const targetArea = target === 'career' ? 'careers' : 'subjects';
      let targetName = target === 'career' ? career : subject;
      const parsedIntent = photo ? null : parseUserIntent(text);
      const intent = photo || parsedIntent?.action === 'generate_image_and_quiz' || /\bchange my (?:career|subject) to\s+.+|\bchange topic to\s+.+/i.test(text) ? parsedIntent : null;
      const done = async (answer: string) => { finish(answer); await persist({ id, role: 'assistant', text: answer }, target); return answer; };
      if (intent?.action === 'change_career' && intent.career) {
        const next = intent.career; setCareer(next); targetName = next;
        setMessageCounts(old => ({ ...old, [target]: 0 }));
        void saveAccount({ career: next });
        if (target === 'career') return await done(`Career changed to ${next}! What do you want to learn today in ${next}?`);
      }
      if (intent?.action === 'change_subject' && intent.subject) {
        setSubject(intent.subject); saveMemory({ ...memoryRef.current, subject: intent.subject });
        setMessageCounts(old => ({ ...old, [target]: 0 }));
        return await done(`Subject changed to ${intent.subject}! What would you like to learn first?`);
      }
      if (intent?.action === 'change_class' && intent.class) {
        setKlass(intent.class); try { localStorage.setItem('etembe_class', intent.class); } catch { /* blocked */ }
        return await done(`Class changed to ${intent.class}! I'll teach at that level. What shall we start with?`);
      }
      let mode = currentMode[target];
      if (intent?.action === 'change_mode' && intent.mode) { mode = intent.roleplay ? `Roleplay: you are ${intent.roleplay}` : intent.mode; setCurrentMode(old => ({ ...old, [target]: mode })); }
      const generationPrompt = photo || intent?.action === 'generate_image_and_quiz' ? null : imagePrompt(text);
      if (generationPrompt) {
        const url = await puterImage(generationPrompt);
        finish(`Here is your image of ${generationPrompt}.`, url);
        await persist({ id, role: 'assistant', text: `Here is your image of ${generationPrompt}.`, image: url }, target);
        return generationPrompt;
      }
      const nextMessageCount = (messageCounts[target] || 0) + 1;
      const cached = !photo && text ? readCachedAnswer(target, text) : null;
      if (cached) { finish(cached); setMessageCounts(old => ({ ...old, [target]: nextMessageCount })); await persist({ id, role: 'assistant', text: cached }, target); return cached; }
      const history = chats[target].filter(m => !m.pending && !m.error).slice(-10).map(m => `${m.role === 'user' ? 'Learner' : 'Tutor'}: ${m.text}`).join('\n');
      const areaLabel = target === 'career' ? targetName : [targetName, klass && `class ${klass}`].filter(Boolean).join(', ');
      const prompt = buildSystemPrompt({ teacher: labels[target], area: areaLabel, mode, inputType: photo ? 'IMAGE uploaded' : spoken !== undefined ? 'VOICE' : 'TEXT', history, memory: memoryContext(memoryRef.current, targetArea, targetName || 'General'), raw: text || 'What is in this image? What should I do?', messageCount: nextMessageCount, longTopic: nextMessageCount >= 3 || history.split(/\s+/).filter(Boolean).length > 400 });
      const raw = await puterChat(prompt, photo, partial => setChats(old => ({ ...old, [target]: old[target].map(m => m.id === id ? { ...m, text: extractExtras(partial).text.replace(/\{[^}]*$/, '') } : m) })));
      setOfflineAi(lastAiMode() === 'offline');
      if (!raw.trim()) throw new Error('ETEMBE AI returned no answer.');
      const extras = extractExtras(raw);
      const answer = extras.text + (extras.task ? formatTask(extras.task) : '');
      if (!photo && text) cacheAnswer(target, text, answer);
      let image: string | null = null;
      if (extras.imagePrompt) { try { image = await puterImage(extras.imagePrompt); } catch { /* text still useful */ } }
      let audio: string | null = null;
      if (!live.current && (spoken !== undefined || mode.startsWith('Roleplay'))) { try { const a = await puterSpeech(extras.text.slice(0, 500)); audio = a.src; } catch { /* voice optional */ } }
      setChats(old => ({ ...old, [target]: old[target].map(m => m.id === id ? { id, role: 'assistant', text: answer, image, audio } : m) }));
      if (autoRead) speak(answer);
      setMessageCounts(old => ({ ...old, [target]: nextMessageCount }));
      await persist({ id, role: 'assistant', text: answer, image }, target);
      const score = scoreFrom(raw);
      if (extras.task || score !== null || answer.length >= 180) void completeActivity(target, targetName || (target === 'career' ? 'Career learning' : 'Education learning'), score);
      if (mode || extras.task) saveMemory(recordCompletion(memoryRef.current, targetArea, targetName || 'General', `${mode || extras.task?.title || 'Task'}: ${text.slice(0, 60) || 'photo task'}`, scoreFrom(raw), mode || 'Task'));
      return extras.text;
    } catch (error) {
      const blocked = error instanceof PuterAuthError;
      if (blocked) setAiBlocked(true);
      const message = blocked ? 'Please Allow ETEMBE AI' : error instanceof Error ? error.message : 'Connection problem. Please check your internet.';
      finish(message, null, true); if (live.current) setCallError(message);
      return null;
    } finally { processing.current = false; setBusy(false); }
  }

  function pickMode(mode: Mode) {
    setCurrentMode(old => ({ ...old, [kind]: mode.name }));
    setDrafts(old => ({ ...old, [kind]: `Start ${mode.name} mode: ${mode.description}` }));
  }
  function customMode() {
    const value = window.prompt('Type any mode you want — for example "Negotiation" or "Angry boss yelling"');
    if (!value?.trim()) return;
    pickMode({ emoji: '✨', name: value.trim(), description: `Custom mode chosen by ${name}` });
  }
  async function generateModes() {
    if (modesBusy) return;
    setModesBusy(true); setNotice('');
    try {
      const what = kind === 'career' ? `career '${career || 'any career'}'` : `subject '${subject || 'any subject'}'`;
      const raw = await puterChat(`For ${what} generate 15 unique learning modes ONLY for this ${kind === 'career' ? 'career' : 'subject'}. Return JSON ONLY array [{emoji,name,description}] No markdown Seed ${Date.now()}`);
      const match = raw.match(/\[[\s\S]*\]/);
      const parsed = match ? JSON.parse(match[0]) as Mode[] : [];
      const clean = parsed.filter(m => m && typeof m.name === 'string').slice(0, 15).map(m => ({ emoji: String(m.emoji || '✨'), name: String(m.name), description: String(m.description || '') }));
      if (!clean.length) throw new Error('no modes');
      setModes(old => ({ ...old, [kind]: clean }));
    } catch { setNotice('Could not create new modes right now. Try again.'); }
    finally { setModesBusy(false); }
  }

  function startMic() {
    if (micOn) { recognition.current?.stop(); return; }
    const R = (window as VoiceWindow).SpeechRecognition || (window as VoiceWindow).webkitSpeechRecognition;
    if (!R) { setNotice('Voice typing is not supported in this browser. Try Chrome.'); return; }
    const r = new R(); Object.assign(r, recognitionSettings(false)); recognition.current = r;
    r.onresult = e => { const text = e.results[0]?.[0]?.transcript || ''; setDrafts(old => ({ ...old, [kind]: `${old[kind]} ${text}`.trim() })); if (text) void send(kind, text); };
    r.onerror = e => setNotice(e.error === 'not-allowed' ? 'Microphone permission was denied.' : `Voice typing stopped: ${e.error}.`);
    r.onend = () => { setMicOn(false); recognition.current = null; };
    try { r.start(); setMicOn(true); } catch { setNotice('Could not start the microphone.'); }
  }
  function cleanSpeech(text: string) { return text.replace(/\[[^\]]+\]/g, '').replace(/[*_`#>~-]/g, '').replace(/[🎯🌱🔥🏆⭐💎📚⚡✅❌]/gu, '').replace(/\s+/g, ' ').trim(); }
  function speak(text: string) {
    if (!('speechSynthesis' in window)) { setNotice('Read aloud is not supported on this device.'); return; }
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(cleanSpeech(text));
    utterance.onstart = () => setSpeaking(true); utterance.onend = () => setSpeaking(false); utterance.onerror = () => setSpeaking(false); window.speechSynthesis.speak(utterance);
  }
  function stopSpeaking() { window.speechSynthesis?.cancel(); setSpeaking(false); }
  function startLiveCall() {
    const R = (window as VoiceWindow).SpeechRecognition || (window as VoiceWindow).webkitSpeechRecognition;
    if (!R) { setNotice('Live calls are not supported in this browser. Try Chrome.'); return; }
    if (busy) return;
    recognition.current?.abort(); setMicOn(false); setCallError('');
    live.current = true; const generation = ++callGeneration.current; setIsLiveCall(true); setCallStatus('Listening…');
    const target = kind;
    const active = () => live.current && generation === callGeneration.current;
    const r = new R(); Object.assign(r, recognitionSettings(true)); recognition.current = r;
    let waiting = false, failed = false;
    const listen = () => { if (!active() || waiting || failed) return; setCallStatus('Listening…'); try { r.start(); } catch { failed = true; setCallError('Could not restart the microphone. End this call and try again.'); } };
    r.onresult = async e => {
      if (!active() || waiting) return;
      const text = e.results[e.resultIndex]?.[0]?.transcript?.trim(); if (!text) return;
      waiting = true; r.stop(); setCallStatus('Thinking…');
      const answer = await send(target, text);
      if (!active()) return;
      if (!answer) { failed = true; setCallStatus('Call paused'); return; }
      setCallStatus('Speaking…');
      try {
        const audio = await puterSpeech(answer);
        if (!active()) { audio.pause(); return; }
        callAudio.current = audio;
        audio.onended = () => { callAudio.current = null; waiting = false; listen(); };
        audio.onerror = () => { if (active()) { failed = true; setCallError('Speech playback failed. End this call and try again.'); } };
      } catch (error) {
        if (active()) { failed = true; setCallError(error instanceof PuterAuthError ? 'Please Allow ETEMBE AI' : 'Speech playback failed. End this call and try again.'); }
      }
    };
    r.onend = () => { if (active() && !waiting && !failed) window.setTimeout(listen, 300); };
    r.onerror = e => { if (!active() || e.error === 'aborted') return; if (e.error === 'no-speech') return; failed = true; setCallStatus('Call paused'); setCallError(e.error === 'not-allowed' ? 'Allow microphone access to start a live call.' : `Microphone stopped: ${e.error}.`); };
    listen();
  }

  const stats = memoryStats(memory);
  const scoreData = scoreSummary(gamification.scores);
  const currentLevel = levelForXp(gamification.xp);
  const certEligible = scoreData.completedTopics >= 5 && scoreData.average >= 70;
  const back = (to: Screen) => <Button variant="outline" size="icon" className="lw-round" aria-label="Go back" onClick={() => navigate(to)}>←</Button>;
  const avatarContent = (alt = 'Profile picture') => avatarUrl ? <img src={avatarUrl} alt={alt} className="lw-avatar-image" /> : initial || name[0]?.toUpperCase();
  const avatar = (large = false) => <Button className={`lw-avatar ${large ? 'lw-avatar-large' : ''}`} onClick={changeInitial} aria-label="Change avatar">{avatarContent()}</Button>;
  const statsBar = (home = true) => <div className={`lw-stats ${home ? '' : 'lw-stats-profile'}`}>{[['Score', stats.score], ['Lessons', stats.lessons], ...(home ? [['Streak', stats.streak]] : [])].map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>;
  const greeting = kind === 'career' ? career ? `Hi ${name}! I am your Career Coach for ${career}. What would you like to learn?` : `Hi ${name}! Which career do you want to learn? Type any career — for example Nurse, Pilot or Fashion Designer.` : `Hi ${name}! I am your Education Professor. What subject would you like to learn today?`;
  const back2 = welcomeBack(memory, area, areaName || 'General');
  const allModes = modes[kind];

  return <main className="learnwell">
    {offline && <div className="lw-notice" role="status">Offline Mode</div>}
    <div className="lw-blob lw-blob-one" /><div className="lw-blob lw-blob-two" />
    <section className={`lw-screen ${screen === 'landing' ? 'lw-landing' : ''}`}>
      {screen === 'landing' && <div className="lw-landing-inner"><img className="lw-landing-art" src={learningArt} alt="Purple books, a graduation cap, and a glowing light bulb" width={1024} height={1024}/><img className="lw-landing-mark" src="/book-logo.svg" alt="" width={72} height={72}/><h1>ETEMBE</h1><p className="lw-tagline">Your future starts here.</p><p className="lw-subtitle">Master any skill. Achieve anything.</p><div className="lw-landing-actions"><Button className="lw-full lw-black" onClick={() => navigate('auth')}>Get Started</Button><Button variant="outline" className="lw-full" onClick={() => navigate('signin')}>Log In</Button></div><InstallApp/></div>}
      {(screen === 'auth' || screen === 'signin') && <div className="lw-scroll"><div className="lw-auth lw-inner">{back('landing')}<h2>{screen === 'auth' ? <>Create your<br/><em>account</em></> : <>Welcome<br/><em>back</em></>}</h2><p className="lw-muted">{screen === 'auth' ? 'Sign up with Google, Apple, Yahoo, Microsoft or email.' : 'Log in to continue learning.'}</p><form onSubmit={e => { e.preventDefault(); void puterLogin(); }} className="lw-form"><Button disabled={authBusy} type="submit" className="lw-full">{authBusy ? 'Please wait…' : screen === 'auth' ? 'Continue to App →' : 'Log In →'}</Button></form>{screen === 'signin' ? <p className="lw-new">New here? <Button variant="link" onClick={() => navigate('auth')}>Create an account</Button></p> : <p className="lw-new">Have an account? <Button variant="link" onClick={() => navigate('signin')}>Log in</Button></p>}</div></div>}
      {screen === 'home' && <><div className="lw-scroll"><div className="lw-inner">
        <div className="lw-welcome"><div><p>WELCOME BACK</p><h2>Hello {name} 👋</h2><div className="lw-chips"><span>🔥 {gamification.streak} days</span><span>⚡ Level {currentLevel}</span><span>{gamification.xp} XP</span></div><div className="lw-xp-bar"><i style={{ width: `${levelProgress(gamification.xp)}%` }} /></div></div>{avatar()}</div>
        <div className="lw-grid">{([['🔥', 'Streak', `${stats.streak} days`], ['📚', 'Lessons', stats.lessons], ['🎯', 'Avg Score', `${stats.score}%`], ['⏱️', 'Hours', `${stats.hours.toFixed(1)}h`]] as const).map(([icon, label, value]) => <div key={label}><span>{icon}</span><strong>{value}</strong><small>{label}</small></div>)}</div>
        <div className="lw-goal"><div><strong>Weekly goal</strong><span>{stats.weekDays}/{WEEKLY_GOAL} days</span></div><div className="lw-bar"><i style={{ width: `${(stats.weekDays / WEEKLY_GOAL) * 100}%` }} /></div></div>
        <Button className="lw-continue" onClick={() => navigate(career ? 'career' : 'education')}><div><small>CONTINUE LEARNING</small><strong>{career ? `${career} path` : 'Education Professor'}</strong></div><span>{Math.min(100, stats.lessons * 10)}%</span></Button>
        <div className="lw-coaches"><Button className="lw-coach" onClick={() => navigate('career')}><span>💼</span><strong>AI Career Coach</strong><small>{career ? `Ask me about ${career}` : 'Type any career'}</small></Button><Button className="lw-coach lw-education" onClick={() => navigate('education')}><span>🎓</span><strong>Education Professor</strong><small>Any subject, any homework</small></Button></div>
        <p className="lw-section">Quick actions</p>
        <div className="lw-quick">{([['📝', 'Start Quiz', 'Give me a 5-question quiz for my career, one question at a time.'], ['🎤', 'Mock Interview', 'Run a mock job interview for my career. Ask one question at a time and score my answers.'], ['📄', 'Resume Review', 'Help me improve my resume for my career. Ask me for what you need.'], ['⚡', 'Daily Challenge', "Give me today's short career challenge."]] as const).map(([icon, label, prompt]) => <Button key={label} variant="outline" onClick={() => quickAction(prompt)}><span>{icon}</span>{label}</Button>)}</div>
      </div></div><nav className="lw-nav">{([['home', '🏠', 'Home'], ['career', '💼', 'Career'], ['education', '🎓', 'Education'], ['profile', '👤', 'Profile']] as const).map(([to, icon, label]) => <Button variant="ghost" key={to} className={to === screen ? 'lw-nav-active' : ''} onClick={() => navigate(to)}><span>{icon}</span><small>{label}</small></Button>)}</nav></>}
      {isChat && <><header className="lw-chat-header">{back('home')}<div className={`lw-chat-avatar ${kind === 'education' ? 'lw-dark' : ''}`}>{avatarContent(labels[kind])}</div><div className="lw-chat-title"><strong>{labels[kind]}</strong><small>{name} · 🔥 {gamification.streak} days · Level {currentLevel} · {back2 ?? (kind === 'career' ? career || 'Type any career' : [subject || 'Any subject', klass].filter(Boolean).join(' · '))}{currentMode[kind] ? ` · ${currentMode[kind]}` : ''}{offlineAi ? ' · Offline AI' : ''}</small></div><Button variant="secondary" size="icon" className="lw-round" title="Live Voice" aria-label="Live Voice" disabled={busy} onClick={startLiveCall}>📞</Button></header><div className="lw-modes">{currentMode[kind] && <Button variant="outline" className="lw-mode" onClick={() => setCurrentMode(old => ({ ...old, [kind]: '' }))}>✕ Normal teaching</Button>}{allModes.map(mode => <Button key={mode.name} variant="outline" className={`lw-mode ${currentMode[kind] === mode.name ? 'lw-mode-active' : ''}`} title={mode.description} onClick={() => pickMode(mode)}><span>{mode.emoji}</span>{mode.name}</Button>)}<Button variant="outline" className="lw-mode" onClick={customMode}>＋ Custom</Button><Button variant="outline" className="lw-mode" disabled={modesBusy} onClick={() => void generateModes()}>{modesBusy ? '…' : '✨ Ideas'}</Button></div><div className="lw-messages lw-scroll">{!chats[kind].length && <div className="lw-row"><div className="lw-bubble">{greeting}</div></div>}{chats[kind].map(message => <div key={message.id} className={`lw-row ${message.role === 'user' ? 'lw-row-user' : ''}`}><div className={`lw-bubble ${message.role === 'user' ? `lw-bubble-user ${kind === 'education' ? 'lw-dark' : ''}` : ''} ${message.error ? 'lw-error' : ''}`}>{message.image && <img src={message.image} alt={message.role === 'user' ? 'Uploaded homework photo' : 'Generated image'} />}{message.pending && !message.text ? <><span className="lw-typing" aria-label="Thinking"><i/><i/><i/></span><span> ETEMBE is typing…</span></> : message.text}{message.role === 'assistant' && !message.pending && message.text && <span className="lw-message-actions"><Button variant="ghost" size="icon" aria-label="Read aloud" title="Read aloud" onClick={() => speaking ? stopSpeaking() : speak(message.text)}> {speaking ? '⏹' : '🔊'} </Button></span>}{message.audio && <audio controls src={message.audio} />}</div></div>)}<div ref={messagesEnd}/></div><form className="lw-composer" onSubmit={e => { e.preventDefault(); void send(kind); }}>{photos[kind] && <div className="lw-photo-preview"><img src={photos[kind] || ''} alt="Photo preview"/><Button size="icon" className="lw-remove lw-black" aria-label="Remove photo" onClick={() => setPhotos(old => ({ ...old, [kind]: null }))}>×</Button></div>}<div className="lw-input-row"><input ref={fileInput} type="file" accept="image/*" aria-label="Upload photo" hidden onChange={e => { void pickPhoto(e.target.files?.[0]); e.target.value = ''; }}/><Button variant="secondary" size="icon" className="lw-round" aria-label="Attach photo" title="Attach photo" onClick={() => fileInput.current?.click()}>📸</Button><input aria-label="Chat message" value={drafts[kind]} onChange={e => setDrafts(old => ({ ...old, [kind]: e.target.value }))} placeholder="Type anything… or send a photo/voice"/><Button variant="secondary" size="icon" className={`lw-round ${micOn ? 'lw-mic-on' : ''}`} aria-label={micOn ? 'Stop voice typing' : 'Voice typing'} title="Voice typing" onClick={startMic}>🎤</Button><Button type="submit" size="icon" className={`lw-round ${kind === 'education' ? 'lw-black' : ''}`} disabled={busy || (!drafts[kind].trim() && !photos[kind])} aria-label="Send message">↑</Button></div></form></>}
      {screen === 'profile' && <div className="lw-scroll"><div className="lw-inner">{back('home')}<h2 className="lw-page-title">Profile</h2><div className="lw-profile">{avatar(true)}<div><strong>{name}</strong><p>{user?.email}</p><small>{career || 'Type any career'}</small></div></div><div className="lw-form lw-profile-editor"><label className="lw-muted" htmlFor="display-name">Display Name</label><input id="display-name" value={displayNameDraft} onChange={e => setDisplayNameDraft(e.target.value)} onBlur={() => void saveDisplayName()} placeholder={user?.username || 'Display name'} /><input ref={profileFileInput} type="file" accept="image/*" aria-label="Profile picture" hidden onChange={e => { void pickAvatar(e.target.files?.[0]); e.target.value = ''; }} /><Button type="button" variant="outline" className="lw-full" onClick={() => profileFileInput.current?.click()}>Change Profile Picture</Button></div><div className="lw-gamification-card"><strong>Level {currentLevel}</strong><span>{gamification.xp} XP · 🔥 {gamification.streak} days</span><div className="lw-xp-bar"><i style={{ width: `${levelProgress(gamification.xp)}%` }} /></div></div>{statsBar(false)}<div className="lw-profile-tabs"><Button variant={profileTab === 'progress' ? 'default' : 'outline'} onClick={() => setProfileTab('progress')}>Progress</Button><Button variant={profileTab === 'leaderboard' ? 'default' : 'outline'} onClick={() => setProfileTab('leaderboard')}>Leaderboard</Button></div>{profileTab === 'leaderboard' ? <Leaderboard username={user?.username || ''} refreshKey={leaderboardRefresh} /> : <><div className="lw-badge-grid">{badgesFor(gamification).map(badge => <div key={badge.id} className={`lw-badge ${badge.unlocked ? 'lw-badge-unlocked' : 'lw-badge-locked'}`} title={badge.label}><span>{badge.unlocked ? badge.emoji : '🔒'}</span><small>{badge.label}</small></div>)}</div><div className="lw-score-summary"><strong>Recent Scores</strong><span>Total Quizzes: {scoreData.totalQuizzes}</span><span>Average Score: {scoreData.average}%</span><span>Completed Topics: {scoreData.completedTopics}</span>{gamification.scores.slice(-5).reverse().map((item, index) => <div key={`${item.topic}-${item.date}-${index}`} className="lw-score-row"><span>{item.topic}</span><strong>{item.score}/100</strong><small>{new Date(item.date).toLocaleDateString()}</small><span>{item.score}% complete</span><div className="lw-progress-line"><i style={{ width: `${item.score}%` }} /></div></div>)}</div>{certEligible && <Button className="lw-full lw-black" onClick={downloadCertificate}>Claim Certificate</Button>}<div className="lw-share-actions"><Button variant="outline" onClick={shareWhatsApp}>Share to WhatsApp</Button><Button variant="outline" onClick={shareXOrInstagram}>Share to X/Instagram</Button><Button variant="outline" onClick={() => copyText(inviteLink())}>Copy Invite Link</Button><Button variant="outline" onClick={shareStreak}>Share Streak</Button></div></>}</div></div>}
      {screen === 'settings' && <div className="lw-scroll"><div className="lw-inner">{back('profile')}<h2 className="lw-page-title">Settings</h2><p className="lw-muted">ETEMBE AI is free forever — no API key needed. The first time you chat, tap <strong>Allow</strong> in the popup so ETEMBE AI can answer.</p><label className="lw-setting-toggle"><input type="checkbox" checked={autoRead} onChange={e => { setAutoRead(e.target.checked); try { localStorage.setItem('etembe:autoRead', String(e.target.checked)); } catch { /* blocked */ } }} /> Auto-read AI replies</label>{speaking && <Button variant="outline" className="lw-full" onClick={stopSpeaking}>Stop Read Aloud</Button>}<InstallApp/><Button className="lw-full lw-black" onClick={() => void logOut()}>Log Out</Button><Button variant="outline" className="lw-full lw-delete" onClick={async () => { if (!window.confirm('Delete account? This cannot be undone.') || !user) return; try { await deleteProgress(user.username); } catch { setNotice('Could not delete account. Please try again.'); return; } await logOut(); }}>Delete Account</Button></div></div>}
      {notice && <div className="lw-notice" role="status">{notice}<Button variant="ghost" size="icon" aria-label="Dismiss message" onClick={() => setNotice('')}>×</Button></div>}
      {aiBlocked && <div className="lw-notice" role="alert">Please Allow ETEMBE AI in the popup, then retry.<Button variant="ghost" onClick={() => { setAiBlocked(false); const last = lastRequest.current; if (last) void send(last.target, last.text || undefined); }}>Retry</Button><Button variant="ghost" size="icon" aria-label="Dismiss" onClick={() => setAiBlocked(false)}>×</Button></div>}
    </section>
    {isLiveCall && <div className="lw-call" role="dialog" aria-modal="true" aria-label="Live Call"><p>Live Call</p><div className="lw-call-icon">{kind === 'career' ? '💼' : '🎓'}</div><h2>{labels[kind]}</h2><div className={`lw-wave ${callError ? 'lw-wave-paused' : ''}`} aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i}/>)}</div><p role="status">{callStatus}</p>{callError && <p className="lw-call-error" role="alert">{callError}</p>}<Button className="lw-end-call" onClick={endCall}>📞 End Call</Button></div>}
  </main>;
}
