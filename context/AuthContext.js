import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabase';
import { logSupabaseError } from '../lib/networkLog';
import { getNetworkErrorHint, testSupabaseConnection } from '../lib/supabaseFetch';
import { getProfile } from '../services/profileService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    const { data, error } = await getProfile(userId);
    if (error) {
      logSupabaseError('getProfile', error, { userId });
    }
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          logSupabaseError('auth.getSession', error);
        }

        setSession(data.session);
        if (data.session?.user?.id) {
          refreshProfile(data.session.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        logSupabaseError('auth.getSession (unhandled)', error);
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // if (__DEV__) {
      //   console.log('[Supabase] auth state:', event, nextSession?.user?.id ?? 'no-user');
      // }

      setSession(nextSession);
      if (nextSession?.user?.id) {
        refreshProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [refreshProfile]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logSupabaseError('auth.signInWithPassword', error, { email });

      // if (error.name === 'AuthRetryableFetchError' && __DEV__) {
      //   const probe = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
      //   console.warn('[Supabase] bağlantı testi', probe);
      // }
    }
    return { data, error, message: error ? getNetworkErrorHint(error) : null };
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      logSupabaseError('auth.signUp', error, { email });
    }
    return { data, error, message: error ? getNetworkErrorHint(error) : null };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logSupabaseError('auth.signOut', error);
    }
    setProfile(null);
    return { error };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [session, profile, loading, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth AuthProvider içinde kullanılmalı');
  }
  return context;
}
