import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '../../data/remote/client';
import { AuthService } from '../../data/remote/auth.service';

const DEV_AUTH_ENABLED = process.env.EXPO_PUBLIC_DEV_AUTH === '1';

// Session simulada para desarrollo local (sin Supabase).
// Solo activa cuando EXPO_PUBLIC_DEV_AUTH=1.
function createDevSession(): Session | null {
  return {
    access_token: 'dev-token',
    refresh_token: 'dev-token',
    token_type: 'bearer',
    expires_in: 86400,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    user: {
      id: 'dev-user',
      aud: 'authenticated',
      email: 'dev@local',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
    },
  } as Session;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(DEV_AUTH_ENABLED ? createDevSession() : null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();
  const authService = new AuthService(supabase);

  useEffect(() => {
    if (DEV_AUTH_ENABLED) {
      setLoading(false);
      return;
    }

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
