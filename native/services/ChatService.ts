import { supabase } from './supabase';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  conversationId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  lastMessageAt: Date;
  userId: string;
}

export class ChatService {
  private static instance: ChatService;
  
  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data?.map(conv => ({
        id: conv.id,
        title: conv.title || 'New Conversation',
        lastMessage: conv.last_message,
        lastMessageAt: new Date(conv.updated_at),
        userId: conv.user_id,
      })) || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data?.map(msg => ({
        id: msg.id,
        text: msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.created_at),
        conversationId: msg.conversation_id,
      })) || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async sendMessage(
    conversationId: string | null,
    text: string,
    userId: string
  ): Promise<{
    conversationId: string;
    userMessage: ChatMessage;
    aiMessage?: ChatMessage;
  }> {
    try {
      let actualConversationId = conversationId;

      // Create new conversation if needed
      if (!actualConversationId) {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: userId,
            title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
          })
          .select()
          .single();

        if (convError) throw convError;
        actualConversationId = newConv.id;
      }

      // Save user message
      const { data: userMsgData, error: userMsgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: actualConversationId,
          content: text,
          role: 'user',
        })
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      const userMessage: ChatMessage = {
        id: userMsgData.id,
        text: userMsgData.content,
        isUser: true,
        timestamp: new Date(userMsgData.created_at),
        conversationId: actualConversationId,
      };

      // Generate AI response (simulated for now)
      const aiResponse = await this.generateAIResponse(text);
      
      // Save AI message
      const { data: aiMsgData, error: aiMsgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: actualConversationId,
          content: aiResponse,
          role: 'assistant',
        })
        .select()
        .single();

      if (aiMsgError) throw aiMsgError;

      const aiMessage: ChatMessage = {
        id: aiMsgData.id,
        text: aiMsgData.content,
        isUser: false,
        timestamp: new Date(aiMsgData.created_at),
        conversationId: actualConversationId,
      };

      // Update conversation last message
      await supabase
        .from('conversations')
        .update({
          last_message: aiResponse,
          updated_at: new Date().toISOString(),
        })
        .eq('id', actualConversationId);

      return {
        conversationId: actualConversationId,
        userMessage,
        aiMessage,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  private async generateAIResponse(userMessage: string): Promise<string> {
    // This is a simplified AI response. In production, you would:
    // 1. Call your AI service (OpenAI, Claude, etc.)
    // 2. Include context about UK building regulations
    // 3. Use RAG (Retrieval Augmented Generation) for accurate responses
    
    const responses = [
      `Thank you for asking about "${userMessage}". For UK building regulations, I recommend checking the specific Part of the Building Regulations that applies to your situation. Could you provide more details about your project type and location?`,
      
      `That's a great question about "${userMessage}". In the UK, building regulations are quite specific about this area. Let me help you understand the requirements. What type of building or project are you working on?`,
      
      `Regarding "${userMessage}", this typically falls under UK Building Regulations Part [relevant part]. The specific requirements depend on factors like building type, size, and intended use. Can you share more details about your project?`,
      
      `For questions about "${userMessage}", you'll need to consider both Building Regulations and potentially Planning Permission. The requirements vary by region in the UK. Which area are you working in, and what's the scope of your project?`,
      
      `Good question about "${userMessage}". This is an important aspect of UK building compliance. The regulations have been updated recently, so it's crucial to use the latest guidance. What specific aspect would you like me to focus on?`,
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async createConversation(userId: string, title?: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title: title || 'New Conversation',
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      // Delete messages first
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      // Delete conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
}