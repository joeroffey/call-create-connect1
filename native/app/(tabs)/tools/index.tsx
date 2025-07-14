// @ts-nocheck
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function ToolsList() {
  const router = useRouter();
  const tools = [
    { id: "brick", name: "Brick Calculator" },
    { id: "timber", name: "Timber Calculator" },
    { id: "roof", name: "Roof Tiles Calculator" },
    { id: "volume", name: "Volume Calculator" },
  ];
  return (
    <ScrollView className="flex-1 bg-black px-4 py-6">
      {tools.map((t) => (
        <TouchableOpacity
          key={t.id}
          className="p-4 border-b border-gray-700"
          onPress={() => router.push(`/tools/${t.id}`)}
        >
          <Text className="text-white text-lg">{t.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}