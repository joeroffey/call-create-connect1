
import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import ChatInterface from './ChatInterface';
import SubscriptionPrompt from './SubscriptionPrompt';

interface ChatInterfaceWithSubscriptionProps {
  user: any;
  onViewPlans: () => void;
  projectId?: string | null;
  conversationId?: string | null;
  onChatComplete?: () => void;
}

const ChatInterfaceWithSubscription = ({ 
  user, 
  onViewPlans, 
  projectId,
  conversationId,
  onChatComplete 
}: ChatInterfaceWithSubscriptionProps) => {
  const { hasActiveSubscription, loading } = useSubscription(user?.id);

  console.log('ChatInterfaceWithSubscription render:', { hasActiveSubscription, loading });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasActiveSubscription) {
    console.log('No active subscription - showing subscription prompt');
    return (
      <SubscriptionPrompt
        onViewPlans={onViewPlans}
      />
    );
  }

  return (
    <ChatInterface 
      user={user} 
      onViewPlans={onViewPlans}
      projectId={projectId}
      conversationId={conversationId}
      onChatComplete={onChatComplete}
    />
  );
};

export default ChatInterfaceWithSubscription;
