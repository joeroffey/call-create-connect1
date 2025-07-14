// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import ImageGalleryRN from "./chat/ImageGalleryRN";
import ConversationDrawerRN from "./chat/ConversationDrawerRN";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Send, Upload, Menu } from "lucide-react-native";
import { supabase } from "../../src/integrations/supabase/client";
import * as DocumentPicker from "expo-document-picker";

// Polyfill atob for React Native if missing
import { Buffer } from "buffer";
if (typeof global.atob === "undefined") {
  // @ts-ignore
  global.atob = (b64) => Buffer.from(b64, "base64").toString("binary");
}

interface ChatMessageData {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface Props {
  user: any;
  projectId?: string | null;
  conversationId?: string | null;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function ChatInterfaceRN({ user, projectId, conversationId: initialConv }: Props) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(initialConv || null);
  const flatListRef = useRef<FlatList>(null);
  const [relatedImages, setRelatedImages] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Welcome message generation
  useEffect(() => {
    if (messages.length > 0) return;

    (async () => {
      let welcomeText = `Hi ${user?.user_metadata?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there"}! Welcome to EezyBuild! 👋\n\nAsk me anything about UK Building Regulations.`;

      if (projectId) {
        const { data, error } = await supabase.from("projects").select("name, description, label").eq("id", projectId).single();
        if (!error && data) {
          welcomeText = `Hi ${user?.user_metadata?.name?.split(" ")[0] || "there"}! Welcome to your project chat! 🏗️\n\n**Project: ${data.name}**\n${data.description ? `**Description:** ${data.description}\n` : ""}${data.label ? `**Category:** ${data.label}` : ""}\n\nAsk me anything about this project.`;
        }
      }

      addMessage({ id: generateId(), text: welcomeText, sender: "assistant", timestamp: new Date() });
    })();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const addMessage = (msg: ChatMessageData) => setMessages((prev) => [...prev, msg]);

  // Load existing messages if conversationId provided
  useEffect(() => {
    if (!conversationId) return;
    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, role, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) {
        console.error(error);
        return;
      }
      const formatted = data.map((m) => ({
        id: m.id,
        text: m.content,
        sender: m.role,
        timestamp: new Date(m.created_at),
      }));
      setMessages(formatted);
    })();

    // realtime subscription
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as any;
          addMessage({
            id: m.id,
            text: m.content,
            sender: m.role,
            timestamp: new Date(m.created_at),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const userMsg = { id: generateId(), text: newMessage, sender: "user", timestamp: new Date() };
    addMessage(userMsg);
    const text = newMessage;
    setNewMessage("");

    setLoading(true);
    try {
      // Create conversation if none
      let convId = conversationId;
      if (!convId) {
        const { data, error } = await supabase
          .from("conversations")
          .insert([
            {
              user_id: user.id,
              title: text.slice(0, 50),
              project_id: projectId || null,
            },
          ])
          .select()
          .single();
        if (error) throw error;
        convId = data.id;
        setConversationId(convId);
      }

      // save user message
      await supabase.from("messages").insert([
        {
          conversation_id: convId,
          content: text,
          role: "user",
        },
      ]);

      // Call serverless function
      const body: any = { message: text };
      if (projectId) body.projectContext = { id: projectId };

      const resp = await fetch(
        "https://srwbgkssoatrhxdrrtff.supabase.co/functions/v1/building-regulations-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await resp.json();

      const assistantMsg = {
        id: generateId(),
        text: data.response || "(no response)",
        sender: "assistant",
        timestamp: new Date(),
      };
      addMessage(assistantMsg);

      if (data.images) setRelatedImages(data.images);

      // save assistant message
      await supabase.from("messages").insert([
        {
          conversation_id: convId,
          content: assistantMsg.text,
          role: "assistant",
        },
      ]);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const pickFileAndUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (res.canceled) return;
      const file = res.assets[0];
      setUploading(true);

      // Read file into blob via fetch (works for RN file URIs)
      const fetched = await fetch(file.uri);
      const blob = await fetched.blob();

      const path = `${user.id}/${projectId || "general"}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("project-documents").upload(path, blob, {
        contentType: file.mimeType,
      });
      if (error) throw error;
      alert("Uploaded successfully");
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessageData }) => (
    <View
      className={`my-2 px-4 py-2 rounded-xl max-w-[80%] ${item.sender === "user" ? "self-end bg-emerald-600" : "self-start bg-gray-800"}`}
    >
      <Text className="text-white">{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
        <TouchableOpacity onPress={() => setDrawerOpen(true)} className="p-2">
          <Menu color="#10b981" size={24} />
        </TouchableOpacity>
        <Text className="text-white font-semibold text-lg">Chat</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      {relatedImages.length > 0 && <ImageGalleryRN images={relatedImages} />}

      {loading && (
        <ActivityIndicator color="#10b981" style={{ marginBottom: 8 }} />
      )}

      <View className="flex-row items-center px-4 pb-4 space-x-2">
        {projectId && (
          <TouchableOpacity
            onPress={pickFileAndUpload}
            disabled={uploading}
            className="p-3 bg-gray-800 rounded-full"
          >
            <Upload color="#10b981" size={20} />
          </TouchableOpacity>
        )}
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
          placeholderTextColor="#9ca3af"
          className="flex-1 bg-gray-800 text-white rounded-full px-4 py-3"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!newMessage.trim() || loading}
          className="bg-emerald-500 p-3 rounded-full"
        >
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <ConversationDrawerRN
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userId={user.id}
        onSelect={(id) => {
          setConversationId(id);
          setMessages([]);
          setRelatedImages([]);
        }}
        onNewConversation={() => {
          setConversationId(null);
          setMessages([]);
          setRelatedImages([]);
        }}
        projectId={projectId}
      />
    </KeyboardAvoidingView>
  );
}