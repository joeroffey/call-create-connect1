// @ts-nocheck
import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Linking, Platform } from "react-native";
import { supabase } from "../../../../src/integrations/supabase/client";
import * as WebBrowser from "expo-web-browser";

export default function SearchScreen() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!term) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("rpc_search_documents", { query: term });
    setResults(data || []);
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-black px-4 py-6">
      <Text className="text-white text-2xl font-bold mb-4">Advanced Search</Text>
      <TextInput value={term} onChangeText={setTerm} placeholder="Search..." placeholderTextColor="#9ca3af" className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4" onSubmitEditing={search} />
      <TouchableOpacity onPress={search} className="bg-emerald-500 py-3 rounded-xl items-center mb-4"><Text className="text-white font-medium">Search</Text></TouchableOpacity>
      {loading && <ActivityIndicator />}
      <FlatList data={results} keyExtractor={(i)=>i.id} renderItem={({ item })=> (
        <TouchableOpacity className="py-3 border-b border-gray-700" onPress={async ()=>{
          if (item.url) {
            if (Platform.OS === "web") {
              Linking.openURL(item.url);
            } else {
              await WebBrowser.openBrowserAsync(item.url);
            }
          }
        }}>
          <Text className="text-emerald-400 font-medium mb-1">{item.title}</Text>
          <Text className="text-gray-400" numberOfLines={2}>{item.snippet}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}