import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Upload, Lightbulb, Book, Milestone } from 'lucide-react';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import ChatSidebar from './chat/ChatSidebar';
import ImageGallery from './chat/ImageGallery';
import { useToast } from "@/hooks/use-toast"
import { useConversationMessages } from '../hooks/useConversationMessages';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessageData {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isWelcome?: boolean;
  images?: Array<{ url: string; title: string; source: string; }>;
}

interface ChatInterfaceProps {
  user: any;
  onViewPlans: () => void;
  projectId?: string | null;
  onChatComplete?: () => void;
}

// Simple ID generator to replace uuid
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const ChatInterface = ({ user, onViewPlans, projectId, onChatComplete }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [relatedImages, setRelatedImages] = useState<Array<{ url: string; title: string; source: string; }>>([]);
  const { toast } = useToast()

  // Load project details if projectId is provided
  useEffect(() => {
    if (projectId) {
      loadProjectDetails();
    }
  }, [projectId]);

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
    text: `Welcome to EezyBuild! 👋

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
      text: `Welcome to your project chat! 🏗️

Here I will take into account previous chats, review your images and documents, and assist with everything involving your project.

**Project: ${project?.name || 'Loading project...'}**
${project?.description ? `**Description:** ${project.description}` : ''}
${project?.label ? `**Category:** ${project.label}` : ''}

I have access to:
• Your previous conversations about this project
• Any documents and images you've uploaded
• Project-specific building regulations
• Your project timeline and milestones

All my responses will be tailored specifically to your project needs. Let's make your project a success!

What would you like to discuss about your project?`,
      sender: 'assistant' as const,
      timestamp: new Date(),
      isWelcome: true
    };
  };

  useEffect(() => {
    // Focus on input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Add welcome message on initial load - only if no conversation is selected and no messages exist
    if (messages.length === 0 && !currentConversationId) {
      const welcomeMsg = projectId ? getProjectWelcomeMessage() : welcomeMessage;
      setMessages([welcomeMsg]);
    }
  }, [projectId, project, currentConversationId]);

  // Update welcome message when project data loads
  useEffect(() => {
    if (projectId && project && messages.length === 1 && messages[0].id === 'project-welcome') {
      const updatedWelcomeMsg = getProjectWelcomeMessage();
      setMessages([updatedWelcomeMsg]);
    }
  }, [project]);

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
      const conversationData: any = {
        user_id: user.id,
        title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : ''),
      };

      // Add project_id if this is a project-specific chat
      if (projectId) {
        conversationData.project_id = projectId;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert([conversationData])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
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
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleNewConversation = () => {
    const welcomeMsg = projectId ? getProjectWelcomeMessage() : welcomeMessage;
    setMessages([welcomeMsg]);
    setCurrentConversationId(null);
    setRelatedImages([]);
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const userMessage: ChatMessageData = {
      id: generateId(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    const messageText = newMessage;
    setNewMessage('');

    // Create new conversation if needed
    let conversationId = currentConversationId;
    if (!conversationId && user) {
      conversationId = await createNewConversation(messageText);
      setCurrentConversationId(conversationId);
    }

    // Save user message
    if (conversationId && user) {
      await saveMessage(conversationId, messageText, 'user');
    }

    setIsLoading(true);
    try {
      // Include project context in the request if available
      const requestBody: any = { message: messageText };
      if (projectId && project) {
        requestBody.projectContext = {
          id: projectId,
          name: project.name,
          description: project.description,
          label: project.label,
          status: project.status
        };
      }

      const response = await fetch('https://srwbgkssoatrhxdrrtff.supabase.co/functions/v1/building-regulations-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyd2Jna3Nzb2F0cmh4ZHJydGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzE0OTcsImV4cCI6MjA2NTkwNzQ5N30.FxPPrtKlz5MZxnS_6kAHMOMJiT25DYXOKzT1V9k-KhU'
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessageData = {
        id: generateId(),
        text: data.response,
        sender: 'assistant',
        timestamp: new Date(),
        images: data.images
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      setRelatedImages(data.images || []);

      // Save assistant message
      if (conversationId && user) {
        await saveMessage(conversationId, data.response, 'assistant');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with the server. Please try again later.",
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
      // Create file path: userId/projectId/filename
      const filePath = `${user.id}/${projectId}/${Date.now()}-${file.name}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document metadata to database
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

  const handleMilestones = () => {
    toast({
      title: "Milestones Feature",
      description: "Project milestones tracking will be available in the next update.",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-black to-gray-950">
      {/* Header */}
      <ChatHeader 
        title={projectId && project ? project.name : ""}
        subtitle={projectId && project ? `Building regulations assistance for ${project.name}` : ""}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sidebarOpen={isSidebarOpen}
        onNewConversation={handleNewConversation}
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
          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <ChatMessage
                message={{
                  id: 'loading',
                  text: 'Thinking...',
                  sender: 'assistant',
                  timestamp: new Date(),
                }}
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

          {/* Fixed Input Area */}
          <div className="border-t border-gray-800/30 p-4 bg-gradient-to-r from-gray-950/80 via-black/80 to-gray-950/80 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-3">
                {projectId && (
                  <button
                    onClick={handleDocumentUpload}
                    disabled={isUploading}
                    className="p-3 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload documents"
                  >
                    <Upload className={`w-5 h-5 ${isUploading ? 'animate-pulse' : ''}`} />
                  </button>
                )}
                {projectId && (
                  <button
                    onClick={handleMilestones}
                    className="p-3 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400 hover:text-emerald-400"
                    title="Project milestones"
                  >
                    <Milestone className="w-5 h-5" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.doc,.docx,.txt,.csv,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex-1 relative flex items-center">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder={projectId && project ? `Ask about ${project.name}...` : "Ask me a question..."}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-900/70 border border-gray-700/50 text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 resize-none backdrop-blur-sm shadow-lg text-sm leading-relaxed font-medium min-h-[48px] max-h-[120px]"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    className="absolute right-3 w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg p-0 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
