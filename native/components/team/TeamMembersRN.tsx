// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput } from "react-native";
import { supabase } from "../../../src/integrations/supabase/client";
import InviteMemberModalRN from "./InviteMemberModalRN";

export default function TeamMembersRN({ team, onBack }: { team: any; onBack: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteVisible, setInviteVisible] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("team_members")
      .select("id, profiles(full_name,email)")
      .eq("team_id", team.id);
    if (!error) setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <ActivityIndicator className="flex-1" />;

  const renderItem = ({ item }: { item: any }) => (
    <View className="flex-row justify-between p-4 border-b border-gray-700">
      <Text className="text-white">{item.profiles?.full_name || item.profiles?.email}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
        <TouchableOpacity onPress={onBack}><Text className="text-emerald-400">← Back</Text></TouchableOpacity>
        <Text className="text-white font-semibold text-lg">{team.name}</Text>
        <TouchableOpacity onPress={() => setInviteVisible(true)}><Text className="text-emerald-400">Invite</Text></TouchableOpacity>
      </View>
      <FlatList data={members} keyExtractor={(m) => m.id} renderItem={renderItem} />

      <InviteMemberModalRN
        visible={inviteVisible}
        onClose={() => setInviteVisible(false)}
        teamId={team.id}
        onInvited={load}
      />
    </View>
  );
}