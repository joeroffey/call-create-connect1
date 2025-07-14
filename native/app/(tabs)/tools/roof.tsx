// @ts-nocheck
import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function RoofTilesCalc() {
  const router = useRouter();
  const [area, setArea] = useState("");
  const [tilesPerSqM, setTilesPerSqM] = useState("60");
  const [result, setResult] = useState<number | null>(null);

  const calc = () => {
    const a = parseFloat(area) || 0;
    const rate = parseFloat(tilesPerSqM) || 60;
    setResult(Math.ceil(a * rate));
  };

  return (
    <ScrollView className="flex-1 bg-black px-4 py-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-4"><Text className="text-emerald-400">← Back</Text></TouchableOpacity>
      <Text className="text-white text-2xl font-bold mb-4">Roof Tiles Calculator</Text>
      <Text className="text-gray-400 mb-2">Roof area (m²)</Text>
      <TextInput value={area} onChangeText={setArea} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4" />
      <Text className="text-gray-400 mb-2">Tiles per m²</Text>
      <TextInput value={tilesPerSqM} onChangeText={setTilesPerSqM} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4" />
      <TouchableOpacity onPress={calc} className="bg-emerald-500 py-3 rounded-xl items-center mb-6"><Text className="text-white font-medium">Calculate</Text></TouchableOpacity>
      {result !== null && <Text className="text-white text-lg">Tiles required: {result}</Text>}
    </ScrollView>
  );
}