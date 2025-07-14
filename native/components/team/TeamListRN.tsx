// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { supabase } from "../../../src/integrations/supabase/client";

export default function TeamListRN({ userId, onSelect }: { userId: string; onSelect: (team: any) => void }) {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    // Fetch teams where the user is a member
    const { data, error } = await supabase
      .from("team_members")
      .select("team_id, teams ( id, name )")
      .eq("user_id", userId);

    if (!error) {
      const mapped = data.map((d) => d.teams);
      setTeams(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <ActivityIndicator className="flex-1" />;

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity className="p-4 border-b border-gray-700" onPress={() => onSelect(item)}>
      <Text className="text-white text-lg font-medium">{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={teams}
      keyExtractor={(t) => t.id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={() => (
        <View className="items-center mt-20">
          <Text className="text-gray-400">Not part of any team</Text>
        </View>
      )}
    />
  );
}