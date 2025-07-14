// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { supabase } from "../../../src/integrations/supabase/client";

export default function ProjectsListRN({ userId, onSelect }: { userId: string; onSelect: (id: string, project: any) => void }) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id,name,description,label,updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (!error) setProjects(data || []);
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
    <TouchableOpacity
      className="p-4 border-b border-gray-700"
      onPress={() => onSelect(item.id, item)}
    >
      <Text className="text-white text-lg font-medium">{item.name}</Text>
      {item.description ? (
        <Text className="text-gray-400" numberOfLines={2}>{item.description}</Text>
      ) : null}
      <Text className="text-gray-600 text-xs mt-1">Updated {new Date(item.updated_at).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator className="flex-1" />;

  return (
    <FlatList
      data={projects}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={() => (
        <View className="flex-1 items-center justify-center mt-20">
          <Text className="text-gray-400">No projects yet</Text>
        </View>
      )}
    />
  );
}