// @ts-nocheck
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react-native";
import { supabase } from "../../src/integrations/supabase/client";

interface AuthScreenProps {
  onAuth: (isAuth: boolean) => void;
  setUser: (user: any) => void;
}

export default function AuthScreen({ onAuth, setUser }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${supabaseUrlScheme()}/password-reset`,
      });
      if (error) {
        alert(error.message);
      } else {
        alert("Password reset email sent. Check your inbox.");
      }
    } finally {
      setLoading(false);
    }
  };

  const supabaseUrlScheme = () => {
    // Use native Linking URL scheme if configured, else fallback to https origin
    return "https://example.com"; // TODO: replace with your deep link URL
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setAuthError(error.message);
          return;
        }
        if (data.user) {
          const userData = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email.split("@")[0],
            subscription: "pro",
          };
          setUser(userData);
          onAuth(true);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
            emailRedirectTo: `${supabaseUrlScheme()}/`,
          },
        });
        if (error) {
          setAuthError(error.message);
          return;
        }
        if (data.user) {
          alert("Account created. Please confirm via email.");
          setIsLogin(true);
        }
      }
    } catch (e) {
      setAuthError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center px-6 py-10">
          {/* Logo */}
          <Text className="text-3xl font-bold text-emerald-400 mb-8">
            EezyBuild
          </Text>

          {/* Toggle buttons */}
          <View className="flex-row bg-gray-800/30 rounded-xl mb-6 overflow-hidden">
            <TouchableOpacity
              className={`flex-1 py-3 items-center ${
                isLogin ? "bg-emerald-500" : ""
              }`}
              onPress={() => setIsLogin(true)}
            >
              <Text className="text-white font-medium">Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 items-center ${
                !isLogin ? "bg-emerald-500" : ""
              }`}
              onPress={() => setIsLogin(false)}
            >
              <Text className="text-white font-medium">Sign Up</Text>
            </TouchableOpacity>
          </View>

          {authError ? (
            <Text className="text-red-400 mb-4 text-center">{authError}</Text>
          ) : null}

          {/* Form */}
          <View className="w-full max-w-md">
            {!isLogin && (
              <View className="mb-4">
                <Text className="text-emerald-300 mb-1">Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={(t) => setName(t)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-800/50 text-white rounded-lg px-4 py-3"
                />
              </View>
            )}
            <View className="mb-4">
              <Text className="text-emerald-300 mb-1">Email</Text>
              <View className="flex-row items-center bg-gray-800/50 rounded-lg px-3">
                <Mail color="#10b981" size={20} />
                <TextInput
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (authError) setAuthError("");
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 text-white ml-2 py-3"
                />
              </View>
            </View>
            <View className="mb-6">
              <Text className="text-emerald-300 mb-1">Password</Text>
              <View className="flex-row items-center bg-gray-800/50 rounded-lg px-3">
                <Lock color="#10b981" size={20} />
                <TextInput
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (authError) setAuthError("");
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  className="flex-1 text-white ml-2 py-3"
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

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="w-full bg-emerald-500 py-4 rounded-xl items-center justify-center mb-3"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View className="flex-row items-center space-x-2">
                  <Text className="text-white font-medium">
                    {isLogin ? "Sign In" : "Create Account"}
                  </Text>
                  <ArrowRight color="#ffffff" size={18} />
                </View>
              )}
            </TouchableOpacity>

            {isLogin && (
              <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
                <Text className="text-emerald-400 text-center">Forgot your password?</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}