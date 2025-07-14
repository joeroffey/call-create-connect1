// @ts-nocheck
import React, { useState, useEffect } from "react";
import { supabase } from "../../../../src/integrations/supabase/client";
import TeamListRN from "../../../components/team/TeamListRN";
import TeamMembersRN from "../../../components/team/TeamMembersRN";

export default function TeamTab() {
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!user) return null;

  if (team) return <TeamMembersRN team={team} onBack={() => setTeam(null)} />;

  return <TeamListRN userId={user.id} onSelect={(t) => setTeam(t)} />;
}