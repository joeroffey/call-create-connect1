// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Share } from "react-native";
import { supabase } from "../../../src/integrations/supabase/client";
import { MailPlus } from "lucide-react-native";

export default function TeamDetailsRN({ team, userId, onBack }: { team: any; userId: string; onBack: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("team_members")
        .select("id,role,profiles(full_name,email)")
        .eq("team_id", team.id);
      setMembers(data || []);
      setLoading(false);
    })();
  }, []);

  const invite = async () => {
    const { data, error } = await supabase
      .from("team_invites")
      .insert({ team_id: team.id, invited_by: userId })
      .select()
      .single();
    if (error) return;
    const link = `${supabase.supabaseUrl.replace("https://", "https://")}/team-invite?id=${data.id}`;
    await Share.share({ message: `Join my team ${team.name} on EezyBuild: ${link}` });
  };

  if (loading) return <ActivityIndicator className="flex-1" />;

  return (
    <ScrollView className="flex-1 bg-black px-4 py-6">
      <TouchableOpacity onPress={onBack} className="mb-4"><Text className="text-emerald-400">← Back</Text></TouchableOpacity>
      <Text className="text-white text-2xl font-bold mb-1">{team.name}</Text>
      {team.description && <Text className="text-gray-400 mb-4">{team.description}</Text>}

      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-lg font-semibold">Members</Text>
          <TouchableOpacity onPress={invite} className="p-2 bg-gray-800 rounded-full"><MailPlus color="#10b981" size={20} /></TouchableOpacity>
        </View>
        {members.map((m) => (
          <View key={m.id} className="py-2 border-b border-gray-700 flex-row justify-between">
            <View>
              <Text className="text-white">{m.profiles?.full_name || m.profiles?.email}</Text>
              <Text className="text-gray-500 text-xs">{m.profiles?.email}</Text>
            </View>
            <Text className="text-emerald-400 uppercase text-xs">{m.role}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}