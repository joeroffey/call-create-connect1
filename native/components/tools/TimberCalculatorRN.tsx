// @ts-nocheck
import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function TimberCalculatorRN() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [thickness, setThickness] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const t = parseFloat(thickness);
    if (!l || !w || !t) return;
    // cubic meters
    const volume = (l * w * t) / 1000000; // assuming mm inputs
    setResult(volume);
  };

  return (
    <ScrollView className="flex-1 bg-black px-4 py-6">
      <Text className="text-white text-2xl font-bold mb-6">Timber Volume Calculator</Text>
      <View className="mb-4">
        <Text className="text-gray-400 mb-1">Length (mm)</Text>
        <TextInput value={length} onChangeText={setLength} keyboardType="numeric" className="bg-gray-800 text-white px-4 py-3 rounded-lg" />
      </View>
      <View className="mb-4">
        <Text className="text-gray-400 mb-1">Width (mm)</Text>
        <TextInput value={width} onChangeText={setWidth} keyboardType="numeric" className="bg-gray-800 text-white px-4 py-3 rounded-lg" />
      </View>
      <View className="mb-6">
        <Text className="text-gray-400 mb-1">Thickness (mm)</Text>
        <TextInput value={thickness} onChangeText={setThickness} keyboardType="numeric" className="bg-gray-800 text-white px-4 py-3 rounded-lg" />
      </View>
      <TouchableOpacity onPress={calculate} className="bg-emerald-500 py-4 rounded-xl items-center mb-6">
        <Text className="text-white font-medium">Calculate</Text>
      </TouchableOpacity>
      {result !== null && (
        <View className="p-4 bg-gray-900 rounded-xl">
          <Text className="text-white text-lg">Volume (m³):</Text>
          <Text className="text-emerald-400 text-3xl font-bold mt-2">{result.toFixed(3)}</Text>
        </View>
      )}
    </ScrollView>
  );
}