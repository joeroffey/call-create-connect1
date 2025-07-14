// @ts-nocheck
import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function TimberCalculatorRN() {
  const [span, setSpan] = useState("");
  const [spacing, setSpacing] = useState("0.4");
  const [result, setResult] = useState<number | null>(null);

  const calc = () => {
    const s = parseFloat(span);
    const sp = parseFloat(spacing);
    if (!s || !sp) return;
    const count = Math.ceil(s / sp) + 1; // joists incl both ends
    setResult(count);
  };

  return (
    <ScrollView className="flex-1 bg-black px-6 py-8">
      <Text className="text-white text-2xl font-bold mb-6">Timber Joist Calculator</Text>

      <View className="mb-4">
        <Text className="text-gray-400 mb-1">Span length (m)</Text>
        <TextInput value={span} onChangeText={setSpan} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3" />
      </View>
      <View className="mb-4">
        <Text className="text-gray-400 mb-1">Joist spacing (m)</Text>
        <TextInput value={spacing} onChangeText={setSpacing} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3" />
      </View>
      <TouchableOpacity onPress={calc} className="bg-emerald-500 py-4 rounded-xl items-center mb-6"><Text className="text-white">Calculate</Text></TouchableOpacity>
      {result !== null && (
        <View className="bg-gray-900 p-6 rounded-2xl border border-gray-700"><Text className="text-white text-lg">Joists required: <Text className="text-emerald-400 font-bold">{result}</Text></Text></View>
      )}
    </ScrollView>
  );
}