// @ts-nocheck
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";

export default function BrickCalculatorRN() {
  const [wallLength, setWallLength] = useState("");
  const [wallHeight, setWallHeight] = useState("");
  const [brickArea, setBrickArea] = useState<number | null>(null);

  const calculate = () => {
    const length = parseFloat(wallLength);
    const height = parseFloat(wallHeight);
    if (!length || !height) return;
    const bricksPerSqM = 60; // UK standard stretcher bond
    const area = length * height;
    setBrickArea(Math.ceil(area * bricksPerSqM));
  };

  return (
    <ScrollView className="flex-1 bg-black px-4 py-6">
      <Text className="text-white text-2xl font-bold mb-6">Brick Calculator</Text>
      <View className="mb-4">
        <Text className="text-gray-400 mb-1">Wall Length (m)</Text>
        <TextInput
          value={wallLength}
          onChangeText={setWallLength}
          keyboardType="numeric"
          className="bg-gray-800 text-white px-4 py-3 rounded-lg"
        />
      </View>
      <View className="mb-6">
        <Text className="text-gray-400 mb-1">Wall Height (m)</Text>
        <TextInput
          value={wallHeight}
          onChangeText={setWallHeight}
          keyboardType="numeric"
          className="bg-gray-800 text-white px-4 py-3 rounded-lg"
        />
      </View>
      <TouchableOpacity onPress={calculate} className="bg-emerald-500 py-4 rounded-xl items-center mb-6">
        <Text className="text-white font-medium">Calculate</Text>
      </TouchableOpacity>
      {brickArea !== null && (
        <View className="p-4 bg-gray-900 rounded-xl">
          <Text className="text-white text-lg">Approx bricks needed:</Text>
          <Text className="text-emerald-400 text-3xl font-bold mt-2">{brickArea}</Text>
        </View>
      )}
    </ScrollView>
  );
}