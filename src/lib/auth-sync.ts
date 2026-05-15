import { supabase } from './supabase';
import { useAppStore, User } from './store';

export const syncAuth = () => {
  const store = useAppStore.getState();

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      // Fetch profile from public.profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        store.login({
          id: profile.id,
          name: profile.name || '',
          email: session.user.email || '',
          username: profile.username || '',
          avatar: profile.avatar_url || '',
          bio: profile.bio || '',
          followers: profile.followers || [],
          following: profile.following || [],
          createdAt: profile.created_at || new Date().toISOString(),
        });
      } else {
        // Handle case where profile doesn't exist yet (signup flow)
        // We might want to create it here or wait for the signup form
      }
    } else if (event === 'SIGNED_OUT') {
      store.logout();
    }
  });
};
