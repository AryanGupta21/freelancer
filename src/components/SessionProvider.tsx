'use client'; // This component will run on the client

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path if your client is elsewhere
import { Session } from '@supabase/supabase-js';

// Create the context
const SessionContext = createContext<{ session: Session | null }>({ session: null });

// Create the Provider component
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Avoid rendering children until the session is loaded to prevent flashes of incorrect UI
  if (loading) {
    return null; // Or return a loading spinner
  }

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};

// Create a custom hook to easily access the session
export const useSession = () => useContext(SessionContext);