// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { supabase } from "../../../src/integrations/supabase/client";
import InviteModalRN from "./InviteModalRN";
import { Plus } from "lucide-react-native";

export default function TeamScreenRN({ userId }: { userId: string }) {
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invModal, setInvModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // assuming one team per user for simplicity
      const { data: t } = await supabase.from("teams").select("id,name").eq("owner_id", userId).single();
      setTeam(t);
      if (t) {
        const { data: mem } = await supabase.from("team_members").select("id,email,role").eq("team_id", t.id);
        setMembers(mem || []);
      }
      setLoading(false);
    })();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View className="py-3 border-b border-gray-700 flex-row justify-between">
      <Text className="text-white">{item.email}</Text>
      <Text className="text-gray-400 text-xs">{item.role}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator className="flex-1" />;

  if (!team)
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-gray-400">No team found</Text>
      </View>
    );

  return (
    <View className="flex-1 bg-black px-4 py-6">
      <Text className="text-white text-2xl font-bold mb-4">{team.name}</Text>
      <FlatList data={members} keyExtractor={(i) => i.id} renderItem={renderItem} ListEmptyComponent={() => <Text className="text-gray-400">No members</Text>} />
      <TouchableOpacity onPress={() => setInvModal(true)} className="absolute bottom-8 right-8 bg-emerald-500 p-4 rounded-full">
        <Plus color="#fff" />
      </TouchableOpacity>
      <InviteModalRN visible={invModal} onClose={() => setInvModal(false)} teamId={team.id} />
    </View>
  );
}