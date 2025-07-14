// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { supabase } from "../../../src/integrations/supabase/client";

export default function TeamListRN({ userId, onSelect }: { userId: string; onSelect: (team: any) => void }) {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("teams")
      .select("id,name,description,updated_at")
      .contains("members", [userId]); // assuming members is array
    setTeams(data || []);
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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity className="p-4 border-b border-gray-700" onPress={() => onSelect(item)}>
      <Text className="text-white text-lg font-medium">{item.name}</Text>
      {item.description && <Text className="text-gray-400" numberOfLines={2}>{item.description}</Text>}
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator className="flex-1" />;

  return (
    <FlatList
      data={teams}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={() => (
        <View className="flex-1 items-center justify-center mt-20"><Text className="text-gray-400">No teams</Text></View>
      )}
    />
  );
}