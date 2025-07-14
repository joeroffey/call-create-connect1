// @ts-nocheck
import React, { useState, useEffect } from "react";
import NotificationsScreenRN from "../components/NotificationsScreenRN";
import { supabase } from "../../src/integrations/supabase/client";

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!user) return null;

  return <NotificationsScreenRN userId={user.id} />;
}