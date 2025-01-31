import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { toast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'florist' | 'admin';

interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setState((prev) => ({ ...prev, error, loading: false }));
        return;
      }

      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setState((prev) => ({ ...prev, user: null, loading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        user: {
          id: userId,
          email: profile.email,
          role: profile.role,
          firstName: profile.first_name,
          lastName: profile.last_name,
          avatarUrl: profile.avatar_url,
        },
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error', (error as Error).message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: UserRole = 'customer') => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      });

      if (error) throw error;

      toast.success('Welcome to Bloomspace!', 'Please check your email to verify your account.');
      navigate('/verify-email');
    } catch (error) {
      toast.error('Error', (error as Error).message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setState((prev) => ({ ...prev, user: null }));
      toast.success('Goodbye!', 'You have been signed out.');
      navigate('/');
    } catch (error) {
      toast.error('Error', (error as Error).message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Check your email', 'We have sent you a password reset link.');
    } catch (error) {
      toast.error('Error', (error as Error).message);
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      toast.success('Password updated', 'Your password has been successfully updated.');
      navigate('/login');
    } catch (error) {
      toast.error('Error', (error as Error).message);
      throw error;
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}
