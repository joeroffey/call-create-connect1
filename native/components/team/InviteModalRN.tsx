// @ts-nocheck
import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { supabase } from "../../../src/integrations/supabase/client";

export default function InviteModalRN({ visible, onClose, teamId }: { visible: boolean; onClose: () => void; teamId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendInvite = async () => {
    if (!email) return;
    setLoading(true);
    await supabase.from("team_invites").insert({ team_id: teamId, email });
    setLoading(false);
    setEmail("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 items-center justify-center px-6">
        <View className="bg-gray-900 w-full rounded-2xl p-6">
          <Text className="text-white text-lg font-semibold mb-4">Invite Member</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
          />
          <TouchableOpacity onPress={sendInvite} disabled={loading} className="bg-emerald-500 py-3 rounded-xl items-center">
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-medium">Send Invite</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} className="mt-4 items-center">
            <Text className="text-gray-400">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}