// @ts-nocheck
import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function TimberCalculator() {
  const router = useRouter();
  const [span, setSpan] = useState("");
  const [spacing, setSpacing] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calc = () => {
    const s = parseFloat(span) || 0;
    const spc = parseFloat(spacing) || 0.4;
    setResult(Math.round(s / spc) + 1);
  };

  return (
    <ScrollView className="flex-1 bg-black px-4 py-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-4"><Text className="text-emerald-400">← Back</Text></TouchableOpacity>
      <Text className="text-white text-2xl font-bold mb-4">Timber Joist Calculator</Text>
      <Text className="text-gray-400 mb-2">Span (m)</Text>
      <TextInput value={span} onChangeText={setSpan} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4" />
      <Text className="text-gray-400 mb-2">Spacing (m)</Text>
      <TextInput value={spacing} onChangeText={setSpacing} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4" />
      <TouchableOpacity onPress={calc} className="bg-emerald-500 py-3 rounded-xl items-center mb-6"><Text className="text-white font-medium">Calculate</Text></TouchableOpacity>
      {result !== null && <Text className="text-white text-lg">Number of joists: {result}</Text>}
    </ScrollView>
  );
}