
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import OnboardingScreen from '@/components/OnboardingScreen';
import ConversationSidebar from '@/components/ConversationSidebar';
import ProjectsScreen from '@/components/ProjectsScreen';

const Index = () => {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'chat' | 'projects' | 'settings'>('onboarding');
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchConversations();
        const storedScreen = localStorage.getItem('currentScreen');
        setCurrentScreen((storedScreen as 'onboarding' | 'chat' | 'projects' | 'settings') || 'projects');
      } else {
        setCurrentScreen('onboarding');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchConversations();
          setCurrentScreen('projects');
        } else {
          setCurrentScreen('onboarding');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentScreen', currentScreen);
    }
  }, [currentScreen, user]);

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
    setCurrentScreen('projects');
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
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setCurrentScreen('chat');
    setSidebarVisible(false);
  };

  const handleNewConversation = () => {
    setSelectedConversationId(null);
    setCurrentScreen('chat');
    setSidebarVisible(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex">
      {currentScreen !== 'onboarding' && (
        <ConversationSidebar
          user={user}
          currentConversationId={selectedConversationId}
          onConversationSelect={handleSelectConversation}
          onNewConversation={handleNewConversation}
          isVisible={sidebarVisible}
          onToggle={() => setSidebarVisible(!sidebarVisible)}
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Chat Interface</h2>
              <p className="text-gray-400">
                {selectedConversationId ? `Conversation: ${selectedConversationId}` : 'No conversation selected'}
              </p>
              <button
                onClick={() => setSidebarVisible(true)}
                className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
              >
                Open Chat History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
