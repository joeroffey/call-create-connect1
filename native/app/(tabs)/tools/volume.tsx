// @ts-nocheck
import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function VolumeCalc() {
  const router = useRouter();
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calc = () => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const d = parseFloat(depth) || 0;
    setResult(parseFloat((l * w * d).toFixed(2)));
  };

  return (
    <ScrollView className="flex-1 bg-black px-4 py-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-4"><Text className="text-emerald-400">← Back</Text></TouchableOpacity>
      <Text className="text-white text-2xl font-bold mb-4">Concrete Volume Calculator</Text>
      <Text className="text-gray-400 mb-2">Length (m)</Text>
      <TextInput value={length} onChangeText={setLength} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4" />
      <Text className="text-gray-400 mb-2">Width (m)</Text>
      <TextInput value={width} onChangeText={setWidth} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4" />
      <Text className="text-gray-400 mb-2">Depth (m)</Text>
      <TextInput value={depth} onChangeText={setDepth} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4" />
      <TouchableOpacity onPress={calc} className="bg-emerald-500 py-3 rounded-xl items-center mb-6"><Text className="text-white font-medium">Calculate</Text></TouchableOpacity>
      {result !== null && <Text className="text-white text-lg">Volume: {result} m³</Text>}
    </ScrollView>
  );
}