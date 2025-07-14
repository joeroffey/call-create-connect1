// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from "react-native";
import { supabase } from "../../../src/integrations/supabase/client";
import { Upload } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";

export default function ProjectDetailsRN({ project, onBack }: { project: any; onBack: () => void }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await loadDocs();
      await loadSchedule();
      setLoading(false);
    })();
  }, []);

  const loadDocs = async () => {
    const { data } = await supabase
      .from("project_documents")
      .select("id,file_name,file_path")
      .eq("project_id", project.id);
    setDocuments(data || []);
  };

  const loadSchedule = async () => {
    const { data } = await supabase
      .from("project_schedule_of_works")
      .select("id,title,completed")
      .eq("project_id", project.id)
      .order("created_at");
    setSchedule(data || []);
  };

  const uploadDoc = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.canceled) return;
    const file = res.assets[0];
    const fetched = await fetch(file.uri);
    const blob = await fetched.blob();
    const path = `${project.user_id}/${project.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("project-documents").upload(path, blob, { contentType: file.mimeType });
    if (!error) {
      await supabase.from("project_documents").insert({ project_id: project.id, user_id: project.user_id, file_name: file.name, file_path: path });
      loadDocs();
    }
  };

  if (loading) return <ActivityIndicator className="flex-1" />;

  return (
    <ScrollView className="flex-1 bg-black px-4 py-6">
      <TouchableOpacity onPress={onBack} className="mb-4">
        <Text className="text-emerald-400">← Back</Text>
      </TouchableOpacity>
      <Text className="text-white text-2xl font-bold mb-1">{project.name}</Text>
      {project.description ? <Text className="text-gray-400 mb-4">{project.description}</Text> : null}

      {/* Documents */}
      <View className="mb-8">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-lg font-semibold">Documents</Text>
          <TouchableOpacity onPress={uploadDoc} className="p-2 bg-gray-800 rounded-full"><Upload color="#10b981" size={20} /></TouchableOpacity>
        </View>
        {documents.length === 0 ? (
          <Text className="text-gray-500">No documents</Text>
        ) : (
          documents.map((d) => (
            <TouchableOpacity key={d.id} className="py-2 border-b border-gray-700" onPress={async () => {
              const { data } = supabase.storage.from("project-documents").getPublicUrl(d.file_path);
              // open url with Linking
            }}>
              <Text className="text-emerald-400">{d.file_name}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Schedule */}
      <View>
        <Text className="text-white text-lg font-semibold mb-3">Schedule of Works</Text>
        {schedule.length === 0 ? (
          <Text className="text-gray-500">No work items</Text>
        ) : (
          schedule.map((item) => (
            <View key={item.id} className="py-2 border-b border-gray-700 flex-row justify-between items-center">
              <Text className="text-white flex-1">{item.title}</Text>
              {item.completed && <Text className="text-emerald-400 text-xs">Done</Text>}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}