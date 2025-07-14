// @ts-nocheck
import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function VolumeCalculatorRN() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calc = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const d = parseFloat(depth);
    if (!l || !w || !d) return;
    const volume = l * w * d; // m3
    setResult(volume);
  };

  return (
    <ScrollView className="flex-1 bg-black px-6 py-8">
      <Text className="text-white text-2xl font-bold mb-6">Volume Calculator</Text>
      {[{label:"Length (m)", val:length, set:setLength},{label:"Width (m)",val:width,set:setWidth},{label:"Depth (m)",val:depth,set:setDepth}].map((f,i)=>(
        <View key={i} className="mb-4"><Text className="text-gray-400 mb-1">{f.label}</Text><TextInput value={f.val} onChangeText={f.set} keyboardType="decimal-pad" className="bg-gray-800 text-white rounded-lg px-4 py-3"/></View>))}
      <TouchableOpacity onPress={calc} className="bg-emerald-500 py-4 rounded-xl items-center mb-6"><Text className="text-white">Calculate</Text></TouchableOpacity>
      {result!==null&&<View className="bg-gray-900 p-6 rounded-2xl border border-gray-700"><Text className="text-white">Volume: <Text className="text-emerald-400 font-bold">{result.toFixed(2)} m³</Text></Text></View>}
    </ScrollView>
  );
}