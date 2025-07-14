// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Send } from "lucide-react-native";

interface ChatMessageData {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface Props {
  user: any;
  projectId?: string | null;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function ChatInterfaceRN({ user, projectId }: Props) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const addMessage = (msg: ChatMessageData) => setMessages((prev) => [...prev, msg]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const userMsg = { id: generateId(), text: newMessage, sender: "user", timestamp: new Date() };
    addMessage(userMsg);
    const text = newMessage;
    setNewMessage("");

    setLoading(true);
    try {
      // TODO: call backend API similar to web version
      // placeholder assistant response
      setTimeout(() => {
        const assistantMsg = {
          id: generateId(),
          text: `Echo: ${text}`,
          sender: "assistant",
          timestamp: new Date(),
        };
        addMessage(assistantMsg);
        setLoading(false);
      }, 1000);
    } catch (e) {
      console.error(e);
      setLoading(false);
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
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      {loading && (
        <ActivityIndicator color="#10b981" style={{ marginBottom: 8 }} />
      )}

      <View className="flex-row items-center px-4 pb-4">
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
          placeholderTextColor="#9ca3af"
          className="flex-1 bg-gray-800 text-white rounded-full px-4 py-3 mr-3"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!newMessage.trim() || loading}
          className="bg-emerald-500 p-3 rounded-full"
        >
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}