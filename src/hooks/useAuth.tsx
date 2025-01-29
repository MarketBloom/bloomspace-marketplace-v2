import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User, AuthError, AuthApiError } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: "customer" | "florist" = "customer") => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("No user data returned");
      }

      if (role === "florist") {
        const { error: profileError } = await supabase
          .from("florist_profiles")
          .insert({
            id: authData.user.id,
            store_name: "",
            street_address: "",
            suburb: "",
            state: "",
            postcode: "",
            store_status: "private",
            setup_progress: 0
          });

        if (profileError) throw profileError;
      }
      
      if (role === "florist") {
        navigate("/become-florist");
      } else {
        navigate("/dashboard");
      }

      return { data: authData, error: null };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const role = data.user?.user_metadata?.role;
      
      if (role === "florist") {
        navigate("/florist-dashboard");
      } else if (role === "customer") {
        navigate("/customer-dashboard");
      } else {
        navigate("/dashboard");
      }

      return { data, error: null };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      navigate("/");
      return { error: null };
    } catch (error: any) {
      console.error("Sign out error:", error);
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};