// @ts-nocheck
import React, { useState, useEffect } from "react";
import { supabase } from "../../../../src/integrations/supabase/client";
import TeamScreenRN from "../../../components/team/TeamScreenRN";

export default function TeamTab() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);
  if (!user) return null;
  return <TeamScreenRN userId={user.id} />;
}