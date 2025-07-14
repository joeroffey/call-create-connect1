// @ts-nocheck
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-2xl font-bold text-black dark:text-white mb-4">
        EezyBuild (Native)
      </Text>
      <Text className="text-center text-gray-700 dark:text-gray-300 mb-8 px-6">
        Welcome to the new React Native version of the app! Screens will be
        ported over here gradually.
      </Text>
      <Link href="/about" asChild>
        <Pressable className="px-4 py-2 bg-emerald-500 rounded-lg">
          <Text className="text-white font-medium">Learn More</Text>
        </Pressable>
      </Link>
    </View>
  );
}