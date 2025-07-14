// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../src/integrations/supabase/client";

export default function TeamInvite() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [state, setState] = useState<"loading"|"accepted"|"error">("loading");
  const [message, setMessage] = useState("Accepting invite…");

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setState("error");
          setMessage("You must be signed in to accept the invite.");
          return;
        }
        const { data: invite, error } = await supabase.from("team_invites").select("*").eq("id", id).single();
        if (error || !invite) {
          setState("error");
          setMessage("Invite not found or expired.");
          return;
        }
        // Add member row
        await supabase.from("team_members").insert({ team_id: invite.team_id, user_id: user.id, role: "member" });
        // Mark invite accepted
        await supabase.from("team_invites").update({ accepted_at: new Date().toISOString() }).eq("id", id);
        setState("accepted");
      } catch (e) {
        setState("error");
        setMessage("Something went wrong.");
      }
    })();
  }, [id]);

  if (state === "loading") return <ActivityIndicator className="flex-1" />;

  return (
    <View className="flex-1 bg-black items-center justify-center px-6">
      <Text className="text-white text-lg mb-6">{message}</Text>
      <TouchableOpacity onPress={() => router.replace("/(tabs)/team") } className="bg-emerald-500 px-6 py-3 rounded-xl">
        <Text className="text-white">Go to Team</Text>
      </TouchableOpacity>
    </View>
  );
}