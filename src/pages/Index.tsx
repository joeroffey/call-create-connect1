import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import OnboardingScreen from '@/components/OnboardingScreen';
import ConversationSidebar from '@/components/ConversationSidebar';
import ChatScreen from '@/components/ChatScreen';
import ProjectsScreen from '@/components/ProjectsScreen';
import SettingsScreen from '@/components/SettingsScreen';
import { useRouter } from 'next/router';

const Index = () => {
  const user = useUser();
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'chat' | 'projects' | 'settings'>('onboarding');
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
      const storedScreen = localStorage.getItem('currentScreen');
      setCurrentScreen((storedScreen as 'onboarding' | 'chat' | 'projects' | 'settings') || 'chat');
    } else {
      setCurrentScreen('onboarding');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('currentScreen', currentScreen);
  }, [currentScreen]);

  const fetchConversations = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen('chat');
  };

  const handleStartNewChat = async (projectId: string | null = null) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{ user_id: user.id, title: 'New Chat', project_id: projectId }])
        .select()
        .single();

      if (error) throw error;

      setConversations(prevConversations => [data, ...prevConversations]);
      setSelectedConversationId(data.id);
      setCurrentScreen('chat');
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prevConversations => prevConversations.filter(conv => conv.id !== conversationId));
      setSelectedConversationId(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setCurrentScreen('chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex">
      {currentScreen !== 'onboarding' && (
        <ConversationSidebar
          user={user}
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onStartNewChat={handleStartNewChat}
          onDeleteConversation={handleDeleteConversation}
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
        />
      )}

      <div className="flex-1 flex flex-col">
        {currentScreen === 'onboarding' && (
          <OnboardingScreen user={user} onComplete={handleOnboardingComplete} />
        )}
        
        {currentScreen === 'projects' && (
          <ProjectsScreen 
            user={user} 
            onStartNewChat={handleStartNewChat}
            onSelectConversation={handleSelectConversation}
          />
        )}

        {currentScreen === 'chat' && (
          <ChatScreen
            user={user}
            selectedConversationId={selectedConversationId}
            onBack={() => setCurrentScreen('projects')}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen user={user} onBack={() => setCurrentScreen('chat')} />
        )}
      </div>
    </div>
  );
};

export default Index;
