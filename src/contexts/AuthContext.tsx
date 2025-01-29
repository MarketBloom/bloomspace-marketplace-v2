import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AuthContextType, AuthState, AuthUser, UserRole, UserMetadata } from '@/types/auth';
import { AuthError } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REFRESH_MARGIN = 5 * 60 * 1000; // 5 minutes in milliseconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (session) {
        setState(prev => ({
          ...prev,
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          },
          user: session.user as AuthUser,
        }));
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setState(prev => ({ ...prev, error: error as Error }));
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return;
      }

      if (session) {
        setState({
          user: session.user as AuthUser,
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          },
          loading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setState({
            user: session.user as AuthUser,
            session: {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
            },
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    // Set up session refresh
    const checkSessionExpiry = () => {
      const { session } = state;
      if (session?.expires_at) {
        const expiresAt = session.expires_at * 1000; // Convert to milliseconds
        const shouldRefresh = expiresAt - Date.now() <= REFRESH_MARGIN;
        
        if (shouldRefresh) {
          refreshSession();
        }
      }
    };

    const refreshInterval = setInterval(checkSessionExpiry, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile from the database
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, phone')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          // Update user metadata
          await supabase.auth.updateUser({
            data: profileData
          });
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, metadata: Partial<UserMetadata>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            role: metadata.role,
            full_name: metadata.full_name,
            phone: metadata.phone,
          });

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setState(prev => ({ ...prev, error: error as Error }));
    }
  };

  const updateProfile = async (updates: Partial<UserMetadata>) => {
    try {
      if (!state.user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id)
        .select()
        .single();

      if (error) throw error;

      // Update user metadata
      await supabase.auth.updateUser({
        data: updates
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error: error as Error };
    }
  };

  const isAuthorized = (requiredRoles?: UserRole[]) => {
    if (!state.user) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    
    const userRole = state.user.user_metadata.role;
    return requiredRoles.includes(userRole);
  };

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthorized,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
