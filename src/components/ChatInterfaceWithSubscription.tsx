
import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import ChatInterface from './ChatInterface';
import SubscriptionPrompt from './SubscriptionPrompt';

interface ChatInterfaceWithSubscriptionProps {
  user: any;
  onViewPlans: () => void;
  projectId?: string | null;
  onChatComplete?: () => void;
}

const ChatInterfaceWithSubscription = ({ 
  user, 
  onViewPlans, 
  projectId, 
  onChatComplete 
}: ChatInterfaceWithSubscriptionProps) => {
  const { hasActiveSubscription, loading } = useSubscription(user?.id);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasActiveSubscription) {
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
      onChatComplete={onChatComplete}
    />
  );
};

export default ChatInterfaceWithSubscription;
