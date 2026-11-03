import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { registerAppWorker } from '@/lib/pwa';

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [instructions, setInstructions] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    void registerAppWorker().catch(() => setError('Offline opening is unavailable. Try again when connected.'));
    const standalone = window.matchMedia('(display-mode: standalone)');
    const update = () => setInstalled(standalone.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    update(); standalone.addEventListener('change', update);
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    const capture = (event: Event) => { event.preventDefault(); setPrompt(event as InstallEvent); };
    const done = () => { setInstalled(true); setPrompt(null); setInstructions(false); };
    window.addEventListener('beforeinstallprompt', capture);
    window.addEventListener('appinstalled', done);
    return () => { standalone.removeEventListener('change', update); window.removeEventListener('beforeinstallprompt', capture); window.removeEventListener('appinstalled', done); };
  }, []);
  if (installed) return null;
  async function install() {
    if (!prompt) { setInstructions(true); return; }
    try { await prompt.prompt(); await prompt.userChoice; setPrompt(null); }
    catch { setError('The install request could not open. Use your browser menu instead.'); }
  }
  return <div className="lw-install">
    <Button variant="ghost" className="lw-install-trigger" onClick={install}><Download size={15}/> Install ETEMBE</Button>
    {error && <p role="status">{error}</p>}
    {instructions && <div className="lw-install-sheet" role="dialog" aria-modal="true" aria-label="Install ETEMBE">
      <Button variant="ghost" size="icon" className="lw-install-close" aria-label="Close installation instructions" onClick={() => setInstructions(false)}><X size={18}/></Button>
      <img src="/icon-192.png" alt="" width={56} height={56}/><h2>Install ETEMBE</h2>
      <p>{ios ? 'In Safari, tap Share, then Add to Home Screen and Add.' : 'Open your browser menu, then choose Install app or Add to Home screen.'}</p>
      {ios && <Share size={22} aria-hidden="true"/>}
      <small>Offline opening is available after your first online visit to the published app. Sign-in, AI answers, and account syncing need internet.</small>
    </div>}
  </div>;
}