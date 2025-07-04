import SwiftUI

struct ChatView: View {
    @EnvironmentObject var userManager: UserManager
    @StateObject private var chatManager = ChatManager()
    @State private var messageText = ""
    @State private var showingProjectSelector = false
    @FocusState private var isTextFieldFocused: Bool
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                headerSection
                
                // Messages
                messagesSection
                
                // Input
                inputSection
            }
            .background(Color.black.ignoresSafeArea())
            .navigationBarHidden(true)
            .onAppear {
                Task {
                    await chatManager.loadConversations()
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
    
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("EezyBuild Assistant")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                if let currentProject = chatManager.currentProject {
                    HStack {
                        Image(systemName: "folder.fill")
                            .foregroundColor(.green)
                        Text(currentProject.name)
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
            }
            
            Spacer()
            
            Menu {
                Button(action: {
                    showingProjectSelector = true
                }) {
                    Label("Select Project", systemImage: "folder")
                }
                
                Button(action: {
                    Task {
                        await chatManager.createNewConversation()
                    }
                }) {
                    Label("New Conversation", systemImage: "plus.message")
                }
                
                if !chatManager.conversations.isEmpty {
                    Menu("Previous Chats") {
                        ForEach(chatManager.conversations.prefix(5)) { conversation in
                            Button(conversation.title ?? "Untitled Chat") {
                                Task {
                                    await chatManager.loadConversation(conversation.id)
                                }
                            }
                        }
                    }
                }
            } label: {
                Image(systemName: "ellipsis.circle")
                    .font(.title2)
                    .foregroundColor(.white)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(Color.black)
    }
    
    private var messagesSection: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 16) {
                    if chatManager.messages.isEmpty {
                        emptyStateView
                    } else {
                        ForEach(chatManager.messages) { message in
                            MessageRow(message: message)
                        }
                    }
                    
                    if chatManager.isLoading {
                        TypingIndicator()
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
            }
            .onChange(of: chatManager.messages.count) { _ in
                if let lastMessage = chatManager.messages.last {
                    withAnimation(.easeOut(duration: 0.3)) {
                        proxy.scrollTo(lastMessage.id, anchor: .bottom)
                    }
                }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "message.badge.waveform")
                .font(.system(size: 60))
                .foregroundColor(.green.opacity(0.6))
            
            VStack(spacing: 8) {
                Text("Ask me anything about building regulations!")
                    .font(.headline)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                
                Text("I can help with planning permissions, building codes, safety requirements, and much more.")
                    .font(.body)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 12) {
                SuggestionButton(
                    title: "Planning permission requirements",
                    icon: "doc.text.below.ecg"
                ) {
                    messageText = "What are the planning permission requirements for a home extension?"
                }
                
                SuggestionButton(
                    title: "Building regulations overview",
                    icon: "building.2"
                ) {
                    messageText = "Can you explain the key building regulations I need to know?"
                }
                
                SuggestionButton(
                    title: "Safety requirements",
                    icon: "shield.checkered"
                ) {
                    messageText = "What are the fire safety requirements for residential buildings?"
                }
            }
        }
        .padding(.top, 60)
    }
    
    private var inputSection: some View {
        VStack(spacing: 0) {
            Divider()
                .background(Color.gray.opacity(0.3))
            
            HStack(spacing: 12) {
                HStack {
                    TextField("Ask about building regulations...", text: $messageText, axis: .vertical)
                        .focused($isTextFieldFocused)
                        .foregroundColor(.white)
                        .lineLimit(1...4)
                    
                    if !messageText.isEmpty {
                        Button(action: clearMessage) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.gray)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(24)
                
                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundColor(messageText.isEmpty ? .gray : .green)
                }
                .disabled(messageText.isEmpty || chatManager.isLoading)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color.black)
        }
    }
    
    private func sendMessage() {
        guard !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        
        let content = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
        messageText = ""
        isTextFieldFocused = false
        
        Task {
            await chatManager.sendMessage(content: content)
        }
    }
    
    private func clearMessage() {
        messageText = ""
    }
}

// MARK: - Supporting Views

struct MessageRow: View {
    let message: ChatMessage
    
    var body: some View {
        HStack {
            if message.role == .user {
                Spacer()
                UserMessageBubble(message: message)
            } else {
                AssistantMessageBubble(message: message)
                Spacer()
            }
        }
    }
}

struct UserMessageBubble: View {
    let message: ChatMessage
    
    var body: some View {
        Text(message.content)
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(
                LinearGradient(
                    colors: [.green, Color.green.opacity(0.8)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .foregroundColor(.black)
            .cornerRadius(20, corners: [.topLeft, .topRight, .bottomLeft])
            .frame(maxWidth: UIScreen.main.bounds.width * 0.75, alignment: .trailing)
    }
}

struct AssistantMessageBubble: View {
    let message: ChatMessage
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "building.2.crop.circle.fill")
                .font(.title3)
                .foregroundColor(.green)
                .padding(.top, 2)
            
            Text(message.content)
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.gray.opacity(0.15))
                .foregroundColor(.white)
                .cornerRadius(20, corners: [.topLeft, .topRight, .bottomRight])
                .frame(maxWidth: UIScreen.main.bounds.width * 0.75, alignment: .leading)
        }
    }
}

struct TypingIndicator: View {
    @State private var animationOffset: CGFloat = -30
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "building.2.crop.circle.fill")
                .font(.title3)
                .foregroundColor(.green)
                .padding(.top, 2)
            
            HStack(spacing: 4) {
                ForEach(0..<3) { index in
                    Circle()
                        .fill(Color.gray)
                        .frame(width: 8, height: 8)
                        .offset(y: animationOffset)
                        .animation(
                            .easeInOut(duration: 0.6)
                            .repeatForever()
                            .delay(Double(index) * 0.2),
                            value: animationOffset
                        )
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color.gray.opacity(0.15))
            .cornerRadius(20, corners: [.topLeft, .topRight, .bottomRight])
            
            Spacer()
        }
        .onAppear {
            animationOffset = 0
        }
    }
}

struct SuggestionButton: View {
    let title: String
    let icon: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.green)
                
                Text(title)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.leading)
                
                Spacer()
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
            )
        }
    }
}

// MARK: - Chat Manager

@MainActor
class ChatManager: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var conversations: [Conversation] = []
    @Published var currentConversationId: String?
    @Published var currentProject: Project?
    @Published var isLoading = false
    
    private let supabaseService = SupabaseService.shared
    
    func loadConversations() async {
        do {
            conversations = try await supabaseService.getConversations()
        } catch {
            print("Failed to load conversations: \(error)")
        }
    }
    
    func loadConversation(_ conversationId: String) async {
        currentConversationId = conversationId
        
        do {
            messages = try await supabaseService.getChatMessages(conversationId: conversationId)
        } catch {
            print("Failed to load messages: \(error)")
        }
    }
    
    func createNewConversation() async {
        currentConversationId = nil
        messages = []
    }
    
    func sendMessage(content: String) async {
        // Add user message immediately
        let userMessage = ChatMessage(
            id: UUID().uuidString,
            conversationId: currentConversationId,
            content: content,
            role: .user,
            timestamp: Date(),
            projectId: currentProject?.id
        )
        
        messages.append(userMessage)
        isLoading = true
        
        do {
            // Send message to backend
            let _ = try await supabaseService.sendChatMessage(
                content: content,
                conversationId: currentConversationId,
                projectId: currentProject?.id
            )
            
            // Simulate AI response (replace with actual API call)
            await simulateAIResponse(to: content)
            
        } catch {
            print("Failed to send message: \(error)")
        }
        
        isLoading = false
    }
    
    private func simulateAIResponse(to userMessage: String) async {
        // Simulate API delay
        try? await Task.sleep(nanoseconds: 1_500_000_000) // 1.5 seconds
        
        let responses = [
            "Based on current UK building regulations, here's what you need to know...",
            "For your specific question about building regulations, the key requirements are...",
            "According to the latest building codes, you'll need to consider the following...",
            "That's a great question about building regulations. Let me break this down for you...",
            "The building regulations for this situation require several important considerations..."
        ]
        
        let response = responses.randomElement() ?? "I'd be happy to help with your building regulations question."
        
        let aiMessage = ChatMessage(
            id: UUID().uuidString,
            conversationId: currentConversationId,
            content: response,
            role: .assistant,
            timestamp: Date(),
            projectId: currentProject?.id
        )
        
        messages.append(aiMessage)
    }
}

// MARK: - View Extensions

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

#Preview {
    ChatView()
        .environmentObject(UserManager())
}