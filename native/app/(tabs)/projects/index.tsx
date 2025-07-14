// @ts-nocheck
import React, { useState, useEffect } from "react";
import { supabase } from "../../../../src/integrations/supabase/client";
import ProjectsListRN from "../../../components/projects/ProjectsListRN";
import ProjectDetailsRN from "../../../components/projects/ProjectDetailsRN";

export default function ProjectsTab() {
  const [user, setUser] = useState<any>(null);
  const [selected, setSelected] = useState<{id:string, project:any}|null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!user) return null;

  if (selected)
    return <ProjectDetailsRN project={selected.project} onBack={() => setSelected(null)} />;

  return <ProjectsListRN userId={user.id} onSelect={(id, p) => setSelected({ id, project: p })} />;
}