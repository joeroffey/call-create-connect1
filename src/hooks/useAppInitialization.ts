import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AppInitializationState {
  isInitializing: boolean;
  isAuthenticated: boolean;
  user: any;
  session: Session | null;
  authLoading: boolean;
  needsOnboarding: boolean;
}

export const useAppInitialization = () => {
  const [state, setState] = useState<AppInitializationState>({
    isInitializing: true,
    isAuthenticated: false,
    user: null,
    session: null,
    authLoading: true,
    needsOnboarding: false
  });

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Error getting session:', error);
          setState(prev => ({
            ...prev,
            isInitializing: false,
            authLoading: false
          }));
          return;
        }

        const user = session?.user || null;
        const isAuthenticated = !!user;

        // Check if user needs onboarding
        let needsOnboarding = false;
        if (user) {
          const name = user.user_metadata?.name;
          needsOnboarding = !name || name.trim() === '';
        }

        setState({
          isInitializing: false,
          isAuthenticated,
          user,
          session,
          authLoading: false,
          needsOnboarding
        });

      } catch (error) {
        console.error('Error initializing app:', error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            isInitializing: false,
            authLoading: false
          }));
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        const user = session?.user || null;
        const isAuthenticated = !!user;

        // Check onboarding status for authenticated users
        let needsOnboarding = false;
        if (user) {
          const name = user.user_metadata?.name;
          needsOnboarding = !name || name.trim() === '';
        }

        setState(prev => ({
          ...prev,
          isAuthenticated,
          user,
          session,
          authLoading: false,
          needsOnboarding
        }));
      }
    );

    initializeApp();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...state,
    updateOnboardingStatus: (completed: boolean) => {
      setState(prev => ({
        ...prev,
        needsOnboarding: !completed
      }));
    }
  };
};