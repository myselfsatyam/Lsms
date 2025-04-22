import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  const checkIsAdmin = (email?: string | null) => email === 'satyamsharma21589@gmail.com';

  // Initialize auth state
  supabase.auth.getSession().then(({ data: { session } }) => {
    set({ 
      user: session?.user ?? null, 
      loading: false,
      isAdmin: checkIsAdmin(session?.user?.email)
    });
  });

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((_event, session) => {
    set({ 
      user: session?.user ?? null,
      isAdmin: checkIsAdmin(session?.user?.email)
    });
  });

  return {
    user: null,
    loading: true,
    isAdmin: false,
    signIn: async (email: string, password: string) => {
      try {
        // Sign out first to ensure clean state
        await supabase.auth.signOut();

        // Attempt to sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });

        if (error) {
          // If login fails and it's the admin email, try to create the account
          if (email.toLowerCase().trim() === 'satyamsharma21589@gmail.com') {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: email.toLowerCase().trim(),
              password,
              options: {
                data: {
                  is_admin: true
                }
              }
            });

            if (signUpError) throw signUpError;

            // Try signing in again after creating the account
            const { data: secondSignInData, error: secondSignInError } = await supabase.auth.signInWithPassword({
              email: email.toLowerCase().trim(),
              password,
            });

            if (secondSignInError) throw secondSignInError;

            set({ 
              user: secondSignInData.user,
              isAdmin: checkIsAdmin(secondSignInData.user?.email)
            });
            return;
          }

          throw error;
        }
        
        set({ 
          user: data.user,
          isAdmin: checkIsAdmin(data.user?.email)
        });
      } catch (error: any) {
        console.error('Auth error:', error);
        throw new Error('Invalid email or password');
      }
    },
    signUp: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
        });
        if (error) throw error;
        
        set({ 
          user: data.user,
          isAdmin: checkIsAdmin(data.user?.email)
        });
      } catch (error: any) {
        console.error('Sign up error:', error);
        throw error;
      }
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isAdmin: false });
    },
  };
});