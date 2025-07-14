// @ts-nocheck
import React, { useState, useEffect } from "react";
import { supabase } from "../../../../src/integrations/supabase/client";
import TeamListRN from "../../../components/team/TeamListRN";
import TeamDetailsRN from "../../../components/team/TeamDetailsRN";

export default function TeamTab() {
  const [user, setUser] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!user) return null;

  if (selected) return <TeamDetailsRN team={selected} userId={user.id} onBack={() => setSelected(null)} />;

  return <TeamListRN userId={user.id} onSelect={(team) => setSelected(team)} />;
}