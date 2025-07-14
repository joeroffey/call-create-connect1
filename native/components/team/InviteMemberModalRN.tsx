// @ts-nocheck
import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { supabase } from "../../../src/integrations/supabase/client";

export default function InviteMemberModalRN({ visible, onClose, teamId, onInvited }: { visible: boolean; onClose: () => void; teamId: string; onInvited: () => void }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const invite = async () => {
    if (!email) return;
    setSending(true);
    await supabase.from("team_invites").insert({ team_id: teamId, email });
    setSending(false);
    setEmail("");
    onInvited();
    onClose();
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 items-center justify-center px-6">
        <View className="w-full bg-gray-900 p-6 rounded-2xl">
          <Text className="text-white text-lg font-semibold mb-4">Invite member</Text>
          <TextInput
            placeholder="user@example.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
          />
          <View className="flex-row justify-between">
            <TouchableOpacity onPress={onClose} className="py-3 px-4 bg-gray-700 rounded-lg"><Text className="text-white">Cancel</Text></TouchableOpacity>
            <TouchableOpacity disabled={!email || sending} onPress={invite} className="py-3 px-4 bg-emerald-500 rounded-lg"><Text className="text-white">Invite</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}