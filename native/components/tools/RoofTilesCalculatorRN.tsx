// @ts-nocheck
import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RoofTilesCalculatorRN() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [coverage, setCoverage] = useState("10"); // tiles per m2
  const [result, setResult] = useState<number | null>(null);

  const calc = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const cov = parseFloat(coverage);
    if (!l || !w || !cov) return;
    const area = l * w;
    const tiles = Math.ceil(area * cov);
    setResult(tiles);
  };

  return (
    <ScrollView className="flex-1 bg-black px-6 py-8">
      <Text className="text-white text-2xl font-bold mb-6">Roof Tiles Calculator</Text>
      <View className="mb-4">
        <Text className="text-gray-400 mb-1">Roof length (m)</Text>
        <TextInput value={length} onChangeText={setLength} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3" />
      </View>
      <View className="mb-4">
        <Text className="text-gray-400 mb-1">Roof width (m)</Text>
        <TextInput value={width} onChangeText={setWidth} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3" />
      </View>
      <View className="mb-4">
        <Text className="text-gray-400 mb-1">Tiles per m²</Text>
        <TextInput value={coverage} onChangeText={setCoverage} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3" />
      </View>
      <TouchableOpacity onPress={calc} className="bg-emerald-500 py-4 rounded-xl items-center mb-6"><Text className="text-white">Calculate</Text></TouchableOpacity>
      {result !== null && <View className="bg-gray-900 p-6 rounded-2xl border border-gray-700"><Text className="text-white text-lg">Tiles required: <Text className="text-emerald-400 font-bold">{result}</Text></Text></View>}
    </ScrollView>
  );
}