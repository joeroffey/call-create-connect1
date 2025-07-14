// @ts-nocheck
import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";

export default function ScalerPlaceholder() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-black items-center justify-center px-4">
      <Text className="text-white text-xl mb-4">Drawing Scaler (coming soon)</Text>
      <Text className="text-gray-400" onPress={() => router.back()}>← Back</Text>
    </View>
  );
}