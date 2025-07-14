// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { supabase } from "../../src/integrations/supabase/client";
import { Bell, CheckCircle } from "lucide-react-native";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  type: string;
}

export default function NotificationsScreenRN({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("id,title,message,read,created_at,type")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error) setList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userId]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => markAsRead(item.id)}
      className="p-4 border-b border-gray-700"
    >
      <View className="flex-row justify-between">
        <Text className={`text-white font-medium ${!item.read ? "" : "text-gray-400"}`}>{item.title}</Text>
        {!item.read && <View className="w-2 h-2 bg-emerald-400 rounded-full" />}
      </View>
      <Text className="text-gray-400 mt-1">{item.message}</Text>
      <Text className="text-gray-600 text-xs mt-1">{new Date(item.created_at).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator className="flex-1" />;

  return (
    <View className="flex-1 bg-black">
      <View className="px-4 py-4 flex-row items-center border-b border-gray-800">
        <Bell color="#10b981" size={24} />
        <Text className="text-white text-lg font-bold ml-3">Notifications</Text>
      </View>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center mt-20">
            <CheckCircle color="#4ade80" size={48} />
            <Text className="text-gray-400 mt-4">No notifications</Text>
          </View>
        )}
      />
    </View>
  );
}