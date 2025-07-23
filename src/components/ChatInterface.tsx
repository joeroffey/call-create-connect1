import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Upload, Clock } from 'lucide-react';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import ChatSidebar from './chat/ChatSidebar';
import ImageGallery from './chat/ImageGallery';
import MobileChatInput from './chat/MobileChatInput';
import { useToast } from "@/hooks/use-toast"
import { useConversationMessages } from '../hooks/useConversationMessages';
import { useConversationAnalytics } from '../hooks/useConversationAnalytics';
import { usePineconeAnalytics } from '../hooks/usePineconeAnalytics';
import { useContentGapAnalysis } from '../hooks/useContentGapAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import ENVIRONMENT from '@/utils/environment';

interface ChatMessageData {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isWelcome?: boolean;
  images?: Array<{ url: string; title: string; source: string; }>;
  documentsAnalyzed?: number;
}

interface ChatInterfaceProps {
  user: any;
  onViewPlans: () => void;
  projectId?: string | null;
  conversationId?: string | null;
  onChatComplete?: () => void;
}

// Simple ID generator to replace uuid
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const ChatInterface = ({ user, onViewPlans, projectId, conversationId, onChatComplete }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState<string>('');
  const [project, setProject] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [relatedImages, setRelatedImages] = useState<Array<{ url: string; title: string; source: string; }>>([]);
  const { toast } = useToast()
  
  // Analytics hooks
  const { incrementMessageCount, trackPineconeUsage, updateAnalytics } = useConversationAnalytics(currentConversationId);
  const { trackPineconeQuery } = usePineconeAnalytics();
  const { analyzeContentGap } = useContentGapAnalysis();

  // Sidebar Default open in PC Browser
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024; // 1024px and up is usually considered desktop (Tailwind `lg`)
    setIsSidebarOpen(isDesktop);
  }, []);

  // Initialize with conversationId from props if provided
  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId);
    }
  }, [conversationId]);

  // Load user's first name from profile
  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user?.id]);

  // Load project details if projectId is provided
  useEffect(() => {
    if (projectId) {
      loadProjectDetails();
    }
  }, [projectId]);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        // Fallback to user email name if profile doesn't exist
        const emailName = user.email?.split('@')[0] || '';
        setUserFirstName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        return;
      }

      if (data?.full_name) {
        // Extract first name from full name
        const firstName = data.full_name.split(' ')[0];
        setUserFirstName(firstName);
      } else {
        // Fallback to user email name
        const emailName = user.email?.split('@')[0] || '';
        setUserFirstName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Use generic greeting if all else fails
      setUserFirstName('');
    }
  };

  const loadProjectDetails = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error loading project details:', error);
    }
  };

  // Load messages from selected conversation
  const { messages: conversationMessages } = useConversationMessages(currentConversationId);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const welcomeMessage = {
    id: 'welcome',
    text: `Hi ${userFirstName || 'there'}! Welcome to EezyBuild! 👋

I'm your UK Building Regulations specialist, here to help you navigate construction requirements, planning permissions, and building standards.

**What I can help with:**
• Building Regulations compliance (Parts A-P)
• Planning permission requirements
• Fire safety regulations
• Accessibility standards
• Energy efficiency requirements
• Structural requirements
• And much more!

Feel free to ask me anything about UK Building Regulations. I'm here to make compliance simple and straightforward.`,
    sender: 'assistant' as const,
    timestamp: new Date(),
    isWelcome: true
  };

  const getProjectWelcomeMessage = () => {
    return {
      id: 'project-welcome',
      text: `Hi ${userFirstName || 'there'}! Welcome to your project chat! 🏗️

Here I will take into account previous chats, review your images and documents, and assist with everything involving your project.

**Project: ${project?.name || 'Loading project...'}**
${project?.description ? `**Description:** ${project.description}` : ''}
${project?.label ? `**Category:** ${project.label}` : ''}

I have access to:
• Your previous conversations about this project
• Any documents and images you've uploaded
• Project-specific building regulations
• Your project timeline and Schedule of Works

All my responses will be tailored specifically to your project needs. Let's make your project a success!

What would you like to discuss about your project?`,
      sender: 'assistant' as const,
      timestamp: new Date(),
      isWelcome: true
    };
  };

  useEffect(() => {
    // Add welcome message on initial load - only if no conversation is selected and no messages exist
    if (messages.length === 0 && !currentConversationId) {
      const welcomeMsg = projectId ? getProjectWelcomeMessage() : welcomeMessage;
      setMessages([welcomeMsg]);
    }
  }, [projectId, project, currentConversationId, userFirstName]);

  // Update welcome message when project data loads
  useEffect(() => {
    if (projectId && project && messages.length === 1 && messages[0].id === 'project-welcome') {
      const updatedWelcomeMsg = getProjectWelcomeMessage();
      setMessages([updatedWelcomeMsg]);
    }
  }, [project, userFirstName]);

  // Update welcome message when userFirstName changes
  useEffect(() => {
    if (messages.length === 1 && (messages[0].id === 'welcome' || messages[0].id === 'project-welcome') && !currentConversationId) {
      const welcomeMsg = projectId ? getProjectWelcomeMessage() : welcomeMessage;
      setMessages([welcomeMsg]);
    }
  }, [userFirstName]);

  // Load conversation messages when a conversation is selected
  useEffect(() => {
    if (conversationMessages.length > 0) {
      const formattedMessages: ChatMessageData[] = conversationMessages.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.role,
        timestamp: new Date(msg.created_at),
      }));
      setMessages(formattedMessages);
      setRelatedImages([]);
    }
  }, [conversationMessages]);

  const createNewConversation = async (firstMessage: string) => {
    try {
      console.log('Creating new conversation with message:', firstMessage);
      console.log('Project ID:', projectId);
      console.log('User ID:', user?.id);

      if (!user?.id) {
        console.error('No user ID available for conversation creation');
        throw new Error('User authentication required');
      }

      const conversationData: any = {
        user_id: user.id,
        title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : ''),
      };

      // Add project_id if this is a project-specific chat
      if (projectId) {
        conversationData.project_id = projectId;
        console.log('Adding project_id to conversation:', projectId);
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert([conversationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }

      console.log('Created conversation:', data);

      // If this is a project chat, update the project's updated_at timestamp immediately
      if (projectId) {
        try {
          console.log(`Updating project ${projectId} timestamp after creating conversation`);

          // Update the project's updated_at timestamp to reflect activity
          const { error: updateError } = await supabase
            .from('projects')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', projectId);

          if (updateError) {
            console.error('Error updating project timestamp:', updateError);
          } else {
            console.log(`Successfully updated project ${projectId} timestamp`);

            // Also log the conversation count for this project
            const { count, error: countError } = await supabase
              .from('conversations')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', projectId);

            if (countError) {
              console.error('Error getting conversation count:', countError);
            } else {
              console.log(`Project ${projectId} now has ${count} conversations`);
            }
          }

        } catch (updateError) {
          console.error('Error updating project stats:', updateError);
        }
      }

      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        variant: "destructive",
        title: "Error creating conversation",
        description: "Failed to create new conversation. Please try again.",
      });
      return null;
    }
  };

  const saveMessage = async (conversationId: string, content: string, role: 'user' | 'assistant') => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            content,
            role,
          }
        ]);

      if (error) throw error;
      console.log('Message saved successfully');
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleNewConversation = () => {
    const welcomeMsg = projectId ? getProjectWelcomeMessage() : welcomeMessage;
    setMessages([welcomeMsg]);
    setCurrentConversationId(null);
    setCurrentConversationTitle('');
    setRelatedImages([]);
  };

  const handleExitProjectChat = () => {
    // Exit project chat mode and return to normal chat
    if (onChatComplete) {
      onChatComplete();
    }
    // Immediately show the normal welcome message
    setMessages([welcomeMessage]);
    setCurrentConversationId(null);
    setCurrentConversationTitle('');
    setRelatedImages([]);
  };

  const handleSelectConversation = async (conversationId: string) => {
    console.log('Selecting conversation:', conversationId);

    // Immediately close sidebar and set the conversation
    const isDesktop = window.innerWidth >= 1024; // 1024px and up is usually considered desktop (Tailwind `lg`)

    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
    setCurrentConversationId(conversationId);

    // Clear current messages while loading
    setMessages([]);

    // Load conversation title
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('title')
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      setCurrentConversationTitle(data.title);
      console.log('Loaded conversation title:', data.title);
    } catch (error) {
      console.error('Error loading conversation title:', error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    console.log('Sending message:', newMessage);
    console.log('Current conversation ID:', currentConversationId);
    console.log('User:', user?.id);

    const userMessage: ChatMessageData = {
      id: generateId(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    const messageText = newMessage;
    setNewMessage('');
    
    // Track user message in analytics
    await incrementMessageCount('user');

    // Create new conversation if needed
    let conversationId = currentConversationId;
    if (!conversationId && user) {
      console.log('Creating new conversation...');
      conversationId = await createNewConversation(messageText);
      if (!conversationId) {
        console.error('Failed to create conversation, aborting message send');
        return;
      }
      setCurrentConversationId(conversationId);
      console.log('New conversation created with ID:', conversationId);
    }

    // Save user message
    if (conversationId && user) {
      console.log('Saving user message to conversation:', conversationId);
      await saveMessage(conversationId, messageText, 'user');
    }

    setIsLoading(true);
    try {
      // FIXED: Only include project context if we have both projectId and user
      const requestBody: any = { message: messageText };

      if (projectId && project && user?.id) {
        // Fetch project documents to provide context to AI
        const { data: projectDocuments, error: docError } = await supabase
          .from('project_documents')
          .select('*')
          .eq('project_id', projectId)
          .eq('user_id', user.id); // CRITICAL: Only this user's documents

        if (docError) {
          console.error('Error fetching project documents:', docError);
        }

        // Also fetch conversation history for this project to provide more context
        const { data: projectConversations, error: convError } = await supabase
          .from('conversations')
          .select(`
            id,
            title,
            messages (
              role,
              content,
              created_at
            )
          `)
          .eq('project_id', projectId)
          .eq('user_id', user.id) // CRITICAL: Only this user's conversations
          .order('created_at', { ascending: false })
          .limit(5);

        if (convError) {
          console.error('Error fetching project conversations:', convError);
        }

        // Include project context only when we have a project
        requestBody.projectContext = {
          id: projectId,
          userId: user.id, // CRITICAL: Include user ID for security
          name: project.name,
          description: project.description,
          label: project.label,
          status: project.status,
          documents: projectDocuments || [],
          recentConversations: projectConversations || []
        };

        console.log('Including enhanced project context with security - Project:', projectId, 'User:', user.id, 'Documents:', projectDocuments?.length || 0, 'Conversations:', projectConversations?.length || 0);
      } else {
        console.log('Sending general chat request without project context');
      }

      console.log('Sending request to AI function');

      const response = await fetch('https://srwbgkssoatrhxdrrtff.supabase.co/functions/v1/building-regulations-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyd2Jna3Nzb2F0cmh4ZHJydGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzE0OTcsImV4cCI6MjA2NTkwNzQ5N30.FxPPrtKlz5MZxnS_6kAHMOMJiT25DYXOKzT1V9k-KhU'
        },
        body: JSON.stringify(requestBody),
      });

      console.log('AI function response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI function error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('AI function response data:', data);

      // SECURITY VERIFICATION: Check that response is for correct project (only if we sent project context)
      if (requestBody.projectContext && data.projectId && data.projectId !== projectId) {
        console.error('SECURITY VIOLATION: Response projectId does not match request projectId');
        throw new Error('Security violation detected in response');
      }

      const assistantMessage: ChatMessageData = {
        id: generateId(),
        text: data.response,
        sender: 'assistant',
        timestamp: new Date(),
        images: data.images,
        documentsAnalyzed: data.documentsAnalyzed
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      setRelatedImages(data.images || []);

      // Track assistant message and Pinecone usage in analytics
      await incrementMessageCount('assistant');
      
      if (data.pineconeMatches && data.avgConfidence) {
        await trackPineconeUsage(data.pineconeMatches, data.avgConfidence);
        
        // Track detailed Pinecone query analytics
        await trackPineconeQuery({
          conversation_id: conversationId,
          message_id: assistantMessage.id,
          query_text: messageText,
          pinecone_matches: data.pineconeMatches,
          avg_confidence_score: data.avgConfidence,
          top_match_confidence: data.topMatchConfidence || data.avgConfidence,
        });
        
        // Analyze content gaps for low confidence responses
        if (data.avgConfidence < 0.6) {
          await analyzeContentGap(messageText, data.avgConfidence);
        }
      }

      // Save assistant message
      if (conversationId && user) {
        console.log('Saving assistant message to conversation:', conversationId);
        await saveMessage(conversationId, data.response, 'assistant');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);

      let errorMessage = "There was a problem with the server. Please try again later.";
      if (error.message.includes('Security violation')) {
        errorMessage = "Security error detected. Please contact support immediately.";
      }

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleDocumentUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadDocument = async (file: File) => {
    if (!projectId || !user) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Project ID and user authentication required for document upload.",
      });
      return;
    }

    setIsUploading(true);
    try {
      // SECURITY FIX: Create secure file path with proper project isolation
      const filePath = `${user.id}/${projectId}/${Date.now()}-${file.name}`;

      console.log(`Uploading document to secure path: ${filePath} for project ${projectId} and user ${user.id}`);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // SECURITY FIX: Save document metadata with proper project and user association
      const { error: dbError } = await supabase
        .from('project_documents')
        .insert([
          {
            project_id: projectId,
            user_id: user.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
          }
        ]);

      if (dbError) throw dbError;

      console.log(`Document uploaded successfully to project ${projectId} for user ${user.id}`);

      toast({
        title: "Document uploaded successfully",
        description: `${file.name} has been uploaded to your project. The AI can now analyze it to help answer your questions.`,
      });
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check if it's a supported file type
      const supportedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/csv', 'text/markdown'
      ];

      if (!supportedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image, PDF, Word document, or text file.",
        });
        return;
      }

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
        });
        return;
      }

      uploadDocument(file);

      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };

  const handleScheduleOfWorks = async () => {
    if (!projectId || !user) {
      toast({
        title: "Error",
        description: "Project context required for schedule of works management.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if schedule of works items exist for this project
      const { data: scheduleItems, error } = await supabase
        .from('project_schedule_of_works')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      const itemCount = scheduleItems?.length || 0;

      // Create a message about the project's schedule of works
      const scheduleMessage = `**Project Schedule of Works Summary**

You currently have **${itemCount}** work item${itemCount !== 1 ? 's' : ''} in your schedule of works.

${itemCount > 0 ?
          `Here are your work items:\n${scheduleItems.map((item, index) =>
            `${index + 1}. **${item.title}** ${item.completed ? '✅' : '⏳'}\n   ${item.description || 'No description'}\n   ${item.due_date ? `Due: ${new Date(item.due_date).toLocaleDateString()}` : 'No due date'}`
          ).join('\n\n')}` :
          'No work items have been created yet.'
        }

You can manage your project schedule of works by going to the Projects page and clicking on this project to view details.

Would you like me to help you plan any work items or discuss project timeline management?`;

      const assistantMessage: ChatMessageData = {
        id: generateId(),
        text: scheduleMessage,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);

    } catch (error) {
      console.error('Error fetching schedule of works:', error);
      toast({
        title: "Error",
        description: "Failed to load project schedule of works. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-black to-gray-950">
      {/* Header */}
      <ChatHeader
        title={projectId && project ? project.name : ""}
        subtitle={projectId && project ? `Building regulations assistance for ${project.name}` : ""}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sidebarOpen={isSidebarOpen}
        onNewConversation={handleNewConversation}
        onExitProjectChat={handleExitProjectChat}
        isProjectChat={!!projectId}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex min-h-0">
        <ChatSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onViewPlans={onViewPlans}
          user={user}
          onSelectConversation={handleSelectConversation}
          currentConversationId={currentConversationId}
          projectId={projectId}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <div className='relative w-full'>
            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 py-4 pb-32 overflow-y-auto">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  conversationId={currentConversationId || 'temp'} 
                  isProjectChat={!!projectId} 
                />
              ))}
              {isLoading && (
                <ChatMessage
                  message={{
                    id: 'loading',
                    text: 'Thinking...',
                    sender: 'assistant',
                    timestamp: new Date(),
                  }}
                  conversationId={currentConversationId || 'temp'}
                  isProjectChat={!!projectId}
                />
              )}
            </div>

            {/* Image Gallery */}
            {relatedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 pb-4"
              >
                <ImageGallery images={relatedImages} />
              </motion.div>
            )}

            {/* Mobile-Optimized Chat Input */}
            {ENVIRONMENT.IS_MOBILE_APP ? (
              <MobileChatInput
                value={newMessage}
                onChange={setNewMessage}
                onSend={handleSendMessage}
                onDocumentUpload={projectId ? handleDocumentUpload : undefined}
                onScheduleOfWorks={projectId ? handleScheduleOfWorks : undefined}
                placeholder={
                  projectId && project
                    ? `Ask about ${project.name}...`
                    : "Ask me a question..."
                }
                isLoading={isLoading}
                isUploading={isUploading}
                projectId={projectId}
                disabled={false}
              />
            ) : (
              /* Legacy Web Chat Input */
              <div id='floating-chatinput' className="fixed mx-auto border rounded-full border-gray-800/30 p-4 bg-gradient-to-r from-gray-950/80 via-black/80 to-gray-950/80 backdrop-blur-xl z-50">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center space-x-3">
                    {projectId && (
                      <button
                        onClick={handleDocumentUpload}
                        disabled={isUploading}
                        className="p-3 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Upload Document"
                      >
                        <Upload className={`w-5 h-5 ${isUploading ? 'animate-pulse' : ''}`} />
                      </button>
                    )}
                    {projectId && (
                      <button
                        onClick={handleScheduleOfWorks}
                        className="p-3 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400 hover:text-emerald-400"
                        title="Schedule of Works"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                    )}

                    <div className="flex-1 relative flex items-center">
                      <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder={
                          projectId && project
                            ? `Ask about ${project.name}...`
                            : "Ask me a question..."
                        }
                        className="w-full px-4 py-3 pr-12 rounded-full bg-gray-900/70 border border-gray-700/50 text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 resize-none backdrop-blur-sm shadow-lg text-sm leading-relaxed font-medium min-h-[48px] max-h-[120px]"
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isLoading}
                        className="absolute right-3 w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-full p-0 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden file input for both mobile and web */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatInterface;
