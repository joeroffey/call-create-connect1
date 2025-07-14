import React from "react";
import { Stack } from "expo-router";
import { TailwindProvider } from "nativewind";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <TailwindProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </TailwindProvider>
  );
}