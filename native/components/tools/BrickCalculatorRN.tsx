// @ts-nocheck
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";

export default function BrickCalculatorRN() {
  const [length, setLength] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const l = parseFloat(length);
    const h = parseFloat(height);
    if (!l || !h) return;
    const bricksPerSqM = 60; // standard metric brick with mortar
    const total = l * h * bricksPerSqM;
    setResult(Math.ceil(total));
  };

  return (
    <ScrollView className="flex-1 bg-black px-6 py-8">
      <Text className="text-white text-2xl font-bold mb-6">Brick Calculator</Text>

      <View className="mb-4">
        <Text className="text-gray-400 mb-1">Wall length (m)</Text>
        <TextInput
          value={length}
          onChangeText={setLength}
          keyboardType="decimal-pad"
          className="bg-gray-800 text-white rounded-lg px-4 py-3"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-1">Wall height (m)</Text>
        <TextInput
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
          className="bg-gray-800 text-white rounded-lg px-4 py-3"
        />
      </View>

      <TouchableOpacity onPress={calculate} className="bg-emerald-500 py-4 rounded-xl items-center mb-6">
        <Text className="text-white font-medium">Calculate</Text>
      </TouchableOpacity>

      {result !== null && (
        <View className="bg-gray-900 p-6 rounded-2xl border border-gray-700">
          <Text className="text-white text-lg font-semibold mb-2">Result</Text>
          <Text className="text-emerald-400 text-3xl font-bold">{result} bricks</Text>
        </View>
      )}
    </ScrollView>
  );
}