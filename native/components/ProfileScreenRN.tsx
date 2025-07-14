// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../src/integrations/supabase/client";
import { User as UserIcon, Crown, LogOut, Settings } from "lucide-react-native";

export default function ProfileScreenRN({ user }: { user: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const { data } = await supabase.from("profiles").select("full_name, occupation").eq("user_id", user.id).single();
      setProfile(data || null);
      setLoading(false);
    })();
  }, []);

  const memberSince = new Date(user?.created_at || Date.now()).toLocaleDateString();

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
  };

  if (loading) return <ActivityIndicator className="flex-1" />;

  return (
    <ScrollView className="flex-1 bg-black px-6 py-8">
      {/* header */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 rounded-full bg-emerald-500 items-center justify-center mb-4">
          <UserIcon color="#fff" size={48} />
        </View>
        <Text className="text-white text-2xl font-bold mb-1">
          {profile?.full_name || user.email?.split("@")[0]}
        </Text>
        <Text className="text-gray-400 mb-1">{user.email}</Text>
        <Text className="text-gray-500 text-sm">Member since {memberSince}</Text>
      </View>

      {/* subscription */}
      <View className="bg-gray-900 p-6 rounded-2xl mb-8 border border-gray-700">
        <View className="flex-row items-center mb-4">
          <Crown color="#10b981" size={20} />
          <Text className="text-emerald-300 ml-2 font-medium">Subscription</Text>
        </View>
        <Text className="text-white text-lg font-semibold mb-2">Free Plan</Text>
        <TouchableOpacity className="mt-2 bg-emerald-500 py-3 rounded-xl items-center">
          <Text className="text-white">Upgrade</Text>
        </TouchableOpacity>
      </View>

      {/* personal info */}
      <View className="bg-gray-900 p-6 rounded-2xl mb-8 border border-gray-700">
        <Text className="text-white text-lg font-semibold mb-4">Personal Info</Text>
        <View className="flex-row items-center mb-4">
          <UserIcon color="#10b981" size={20} />
          <View className="ml-3">
            <Text className="text-gray-400 text-sm">Full Name</Text>
            <Text className="text-white">{profile?.full_name || "Not provided"}</Text>
          </View>
        </View>
        {profile?.occupation && (
          <View className="flex-row items-center">
            <UserIcon color="#10b981" size={20} />
            <View className="ml-3">
              <Text className="text-gray-400 text-sm">Occupation</Text>
              <Text className="text-white">{profile.occupation}</Text>
            </View>
          </View>
        )}
      </View>

      {/* actions */}
      <TouchableOpacity className="bg-gray-800 py-4 rounded-xl items-center flex-row justify-center mb-3">
        <Settings color="#fff" size={20} />
        <Text className="text-white ml-2">Account Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-red-700/60 py-4 rounded-xl items-center flex-row justify-center mb-20"
        onPress={handleSignOut}
        disabled={signingOut}
      >
        <LogOut color="#fff" size={20} />
        <Text className="text-white ml-2">{signingOut ? "Signing out" : "Sign Out"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}