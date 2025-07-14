// @ts-nocheck
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function BrickCalculator() {
  const router = useRouter();
  const [length, setLength] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calc = () => {
    const l = parseFloat(length) || 0;
    const h = parseFloat(height) || 0;
    const bricksPerSqM = 60; // placeholder rate
    setResult(Math.round(l * h * bricksPerSqM));
  };

  return (
    <ScrollView className="flex-1 bg-black px-4 py-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-emerald-400">← Back</Text>
      </TouchableOpacity>
      <Text className="text-white text-2xl font-bold mb-4">Brick Calculator</Text>
      <Text className="text-gray-400 mb-2">Wall length (m)</Text>
      <TextInput value={length} onChangeText={setLength} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4" />
      <Text className="text-gray-400 mb-2">Wall height (m)</Text>
      <TextInput value={height} onChangeText={setHeight} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4" />
      <TouchableOpacity onPress={calc} className="bg-emerald-500 py-3 rounded-xl items-center mb-6"><Text className="text-white font-medium">Calculate</Text></TouchableOpacity>
      {result !== null && <Text className="text-white text-lg">Approx bricks needed: {result}</Text>}
    </ScrollView>
  );
}