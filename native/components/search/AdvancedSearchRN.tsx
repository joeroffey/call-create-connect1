// @ts-nocheck
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { supabase } from "../../src/integrations/supabase/client";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";

export default function AdvancedSearchRN() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const router = useRouter();

  const search = async () => {
    if (!term) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("search_documents", { query: term });
      if (error) {
        console.error('Search error:', error);
        setResults([]);
      } else {
        setResults(data || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    }
    setLoading(false);
  };

  if (selectedUrl)
    return (
      <WebView
        source={{ uri: selectedUrl }}
        style={{ flex: 1 }}
        startInLoadingState
        onError={() => setSelectedUrl(null)}
      />
    );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="p-4 border-b border-gray-700"
      onPress={() => {
        const { data } = supabase.storage.from("project-documents").getPublicUrl(item.file_path);
        setSelectedUrl(data.publicUrl);
      }}
    >
      <Text className="text-white font-medium mb-1">{item.title}</Text>
      <Text className="text-gray-400" numberOfLines={2}>{item.snippet}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black px-6 py-8">
      <Text className="text-white text-2xl font-bold mb-4">Advanced Search</Text>
      <View className="flex-row mb-4">
        <TextInput value={term} onChangeText={setTerm} placeholder="Search..." placeholderTextColor="#9ca3af" className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 mr-2" />
        <TouchableOpacity onPress={search} className="bg-emerald-500 rounded-lg px-4 justify-center"><Text className="text-white">Go</Text></TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator /> : <FlatList data={results} keyExtractor={(i)=>i.id} renderItem={renderItem} />}    
    </View>
  );
}