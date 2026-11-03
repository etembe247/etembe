import { useEffect, useState } from 'react';
import { loadLeaderboard, type LeaderboardEntry } from '@/lib/gamification';

type Props = { username?: string; refreshKey?: number };

export function Leaderboard({ username, refreshKey = 0 }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  useEffect(() => { let active = true; void loadLeaderboard().then(value => { if (active) setEntries(value.slice(0, 10)); }); return () => { active = false; }; }, [refreshKey]);
  return <section className="lw-leaderboard" aria-label="Leaderboard"><h3>Leaderboard</h3>{entries.length ? entries.map((entry, index) => <div key={`${entry.username || entry.displayName}-${index}`} className={`lw-leader-row ${entry.username === username ? 'lw-leader-current' : ''}`}><span>{index + 1}</span><span className="lw-leader-avatar">{entry.avatar?.startsWith('data:') ? <img src={entry.avatar} alt="" /> : entry.avatar || '👤'}</span><strong>{entry.displayName || 'Learner'}</strong><small>Level {entry.level} · {entry.XP} XP</small></div>) : <p className="lw-muted">Complete a lesson to appear here.</p>}</section>;
}
