import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://wqphvrlkjemfzozqimny.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcGh2cmxramVtZnpvenFpbW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0ODk2NjYsImV4cCI6MjA0NjA2NTY2Nn0.NOYIR7O1SeneBtKZe0b1wEQRuEIo0cPNWUlqMRzRFCk';

// ExpoSecureStoreAdapter for session persistence
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});