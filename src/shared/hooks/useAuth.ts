import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '../../data/remote/client';
import { AuthService } from '../../data/remote/auth.service';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();
  const authService = new AuthService(supabase);

  useEffect(() => {
    // Get initial session
    authService.getSession().then((session) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await authService.signIn(email, password);
    setSession(data.session);
    return data;
  };

  const signUp = async (email: string, password: string) => {
    const data = await authService.signUp(email, password);
    if (data.session) {
      setSession(data.session);
    }
    return data;
  };

  const signOut = async () => {
    await authService.signOut();
    setSession(null);
  };

  return {
    session,
    user: session?.user ?? null,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!session,
  };
}
