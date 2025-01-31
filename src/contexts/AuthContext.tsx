import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import type { AuthContextType, AuthState, AuthUser, UserRole, UserMetadata } from '@/types/auth';
import { AuthError } from '@supabase/supabase-js';

interface UserData extends User {
  role: 'customer' | 'florist' | 'admin';
  floristId?: string;
}

interface AuthContextType {
  user: UserData | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'customer' | 'florist') => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REFRESH_MARGIN = 5 * 60 * 1000; // 5 minutes in milliseconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (session) {
        setSession(session);
        if (session.user) {
          await fetchUserData(session.user.id);
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setSession(null);
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserData(userId: string) {
    try {
      // First check if user is an admin
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (adminData) {
        setUser({ ...session!.user, role: 'admin' });
        return;
      }

      // Check if user is a florist
      const { data: floristData } = await supabase
        .from('florists')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (floristData) {
        setUser({ ...session!.user, role: 'florist', floristId: floristData.id });
        return;
      }

      // Default to customer role
      setUser({ ...session!.user, role: 'customer' });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, role: 'customer' | 'florist') => {
    const { error: signUpError, data } = await supabase.auth.signUp({ email, password });
    if (signUpError) throw signUpError;

    if (data.user) {
      // Create role-specific profile
      if (role === 'florist') {
        const { error: profileError } = await supabase
          .from('florists')
          .insert([{ user_id: data.user.id, status: 'pending' }]);
        if (profileError) throw profileError;
      } else {
        const { error: profileError } = await supabase
          .from('customers')
          .insert([{ user_id: data.user.id }]);
        if (profileError) throw profileError;
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const refreshUser = async () => {
    if (session?.user) {
      await fetchUserData(session.user.id);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
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
