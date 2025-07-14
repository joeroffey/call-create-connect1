// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, FlatList } from "react-native";
import { supabase } from "../../../src/integrations/supabase/client";

export default function ConversationDrawerRN({
  visible,
  onClose,
  userId,
  onSelect,
  onNewConversation,
  projectId,
}: {
  visible: boolean;
  onClose: () => void;
  userId: string;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  projectId?: string | null;
}) {
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      let query = supabase
        .from("conversations")
        .select("id,title,updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (projectId) query = query.eq("project_id", projectId);
      const { data, error } = await query;
      if (!error) setConversations(data || []);
    })();
  }, [visible]);

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black pt-14 px-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-xl font-bold">Conversations</Text>
          <TouchableOpacity onPress={onClose} className="px-3 py-1 bg-gray-800 rounded-full">
            <Text className="text-white">Close</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item.id);
                onClose();
              }}
              className="py-4 border-b border-gray-700"
            >
              <Text className="text-white text-base">{item.title || "Untitled"}</Text>
              <Text className="text-gray-400 text-xs mt-1">
                {new Date(item.updated_at).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <Text className="text-gray-400 text-center mt-10">No conversations yet.</Text>
          )}
        />

        <TouchableOpacity
          className="mt-auto bg-emerald-500 py-4 rounded-xl items-center justify-center mb-8"
          onPress={() => {
            onNewConversation();
            onClose();
          }}
        >
          <Text className="text-white font-medium">New Conversation</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}