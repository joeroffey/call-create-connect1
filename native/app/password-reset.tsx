// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../src/integrations/supabase/client";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react-native";

export default function PasswordReset() {
  const router = useRouter();
  // Query params from deep-link: ?access_token=...&refresh_token=...
  const { access_token, refresh_token } = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If tokens exist, set session so the user can update password.
    if (access_token && refresh_token) {
      supabase.auth.setSession({
        access_token: String(access_token),
        refresh_token: String(refresh_token),
      });
    }
  }, [access_token, refresh_token]);

  const handlePasswordReset = async () => {
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully. Please sign in.");
      router.replace("/");
    }
  };

  if (!access_token || !refresh_token) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-red-400 text-xl mb-4">Invalid reset link</Text>
        <TouchableOpacity
          onPress={() => router.replace("/")}
          className="bg-emerald-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-medium">Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center px-6 py-10">
          <View className="w-full max-w-md bg-gray-900/70 p-6 rounded-2xl">
            <View className="items-center mb-6">
              <View className="items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 mb-3">
                <Lock color="#10b981" size={28} />
              </View>
              <Text className="text-2xl font-bold text-white mb-1">Reset Password</Text>
              <Text className="text-gray-400 text-sm text-center">
                Enter your new password below
              </Text>
            </View>

            {/* New password */}
            <View className="mb-4">
              <Text className="text-emerald-300 mb-1">New Password</Text>
              <View className="flex-row items-center bg-gray-800/50 rounded-lg px-3">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  className="flex-1 text-white py-3"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff color="#10b981" size={20} />
                  ) : (
                    <Eye color="#10b981" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm password */}
            <View className="mb-6">
              <Text className="text-emerald-300 mb-1">Confirm Password</Text>
              <View className="flex-row items-center bg-gray-800/50 rounded-lg px-3">
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPassword}
                  className="flex-1 text-white py-3"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff color="#10b981" size={20} />
                  ) : (
                    <Eye color="#10b981" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handlePasswordReset}
              disabled={loading}
              className="w-full bg-emerald-500 py-4 rounded-xl items-center justify-center mb-3"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-medium">Update Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/")}
              className="w-full border border-emerald-500/40 py-4 rounded-xl items-center justify-center"
            >
              <Text className="text-emerald-300 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}