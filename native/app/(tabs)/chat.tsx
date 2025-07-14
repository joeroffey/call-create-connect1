// @ts-nocheck
import React, { useEffect, useState } from "react";
import ChatInterfaceRN from "../../components/ChatInterfaceRN";
import { supabase } from "../../../src/integrations/supabase/client";

export default function ChatScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!user) return null;

  return <ChatInterfaceRN user={user} />;
}