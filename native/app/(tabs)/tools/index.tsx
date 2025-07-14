// @ts-nocheck
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import { Hammer, Ruler, Calculator, Image as Img } from "lucide-react-native";

const tools = [
  { id: "brick", title: "Brick Calculator", icon: Hammer },
  { id: "timber", title: "Timber Calculator", icon: Hammer },
  { id: "roof", title: "Roof Tiles Calculator", icon: Hammer },
  { id: "volume", title: "Volume Calculator", icon: Calculator },
  { id: "scaler", title: "Drawing Scaler", icon: Ruler },
];

export default function ToolsIndex() {
  return (
    <ScrollView className="flex-1 bg-black px-4 py-6">
      <Text className="text-white text-2xl font-bold mb-6">Tools</Text>
      {tools.map((t) => {
        const Ico = t.icon;
        return (
          <Link key={t.id} href={`/tools/${t.id}`} asChild>
            <TouchableOpacity className="flex-row items-center p-4 mb-3 bg-gray-900 rounded-xl border border-gray-700">
              <Ico color="#10b981" size={24} />
              <Text className="text-white text-lg ml-4">{t.title}</Text>
            </TouchableOpacity>
          </Link>
        );
      })}
    </ScrollView>
  );
}