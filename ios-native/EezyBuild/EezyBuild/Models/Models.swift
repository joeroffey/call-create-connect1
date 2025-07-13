import Foundation

// MARK: - User & Authentication Models
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let createdAt: Date?
    let updatedAt: Date?
    
    init(id: String, email: String, name: String? = nil, createdAt: Date? = nil, updatedAt: Date? = nil) {
        self.id = id
        self.email = email
        self.name = name
        self.createdAt = createdAt ?? Date()
        self.updatedAt = updatedAt ?? Date()
    }
}

struct Session: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresIn: Int?
    let user: User
    
    init(accessToken: String, refreshToken: String, expiresIn: Int? = nil, user: User) {
        self.accessToken = accessToken
        self.refreshToken = refreshToken
        self.expiresIn = expiresIn
        self.user = user
    }
}

struct AuthResponse: Codable {
    let session: Session
    let user: User
    
    init(session: Session, user: User) {
        self.session = session
        self.user = user
    }
}

// MARK: - Project Models
enum ProjectStatus: String, CaseIterable, Codable {
    case planning = "planning"
    case active = "active"
    case onHold = "on_hold"
    case completed = "completed"
    case cancelled = "cancelled"
    
    var displayName: String {
        switch self {
        case .planning: return "Planning"
        case .active: return "Active"
        case .onHold: return "On Hold"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        }
    }
}

struct Project: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let address: String?
    let projectType: String?
    let status: ProjectStatus
    let userId: String?
    let createdAt: Date
    let updatedAt: Date
    
    init(id: String = UUID().uuidString, 
         name: String, 
         description: String? = nil, 
         address: String? = nil, 
         projectType: String? = nil, 
         status: ProjectStatus = .planning, 
         userId: String? = nil, 
         createdAt: Date = Date(), 
         updatedAt: Date = Date()) {
        self.id = id
        self.name = name
        self.description = description
        self.address = address
        self.projectType = projectType
        self.status = status
        self.userId = userId
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

// MARK: - Chat Models
enum MessageRole: String, Codable, CaseIterable {
    case user = "user"
    case assistant = "assistant"
    case system = "system"
    
    var displayName: String {
        switch self {
        case .user: return "You"
        case .assistant: return "EezyBuild Assistant"
        case .system: return "System"
        }
    }
}

struct ChatMessage: Codable, Identifiable {
    let id: String
    let content: String
    let role: MessageRole
    let timestamp: Date
    let conversationId: String?
    let projectId: String?
    let userId: String?
    
    init(id: String = UUID().uuidString,
         content: String,
         role: MessageRole,
         timestamp: Date = Date(),
         conversationId: String? = nil,
         projectId: String? = nil,
         userId: String? = nil) {
        self.id = id
        self.content = content
        self.role = role
        self.timestamp = timestamp
        self.conversationId = conversationId
        self.projectId = projectId
        self.userId = userId
    }
}

struct Conversation: Codable, Identifiable {
    let id: String
    let title: String
    let projectId: String?
    let userId: String
    let createdAt: Date
    let updatedAt: Date
    let lastMessage: String?
    
    init(id: String = UUID().uuidString,
         title: String,
         projectId: String? = nil,
         userId: String,
         createdAt: Date = Date(),
         updatedAt: Date = Date(),
         lastMessage: String? = nil) {
        self.id = id
        self.title = title
        self.projectId = projectId
        self.userId = userId
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.lastMessage = lastMessage
    }
}

// MARK: - Subscription Models
enum SubscriptionTier: String, Codable, CaseIterable {
    case free = "free"
    case pro = "pro"
    case enterprise = "enterprise"
    
    var displayName: String {
        switch self {
        case .free: return "Free"
        case .pro: return "Pro"
        case .enterprise: return "Enterprise"
        }
    }
    
    var monthlyPrice: String {
        switch self {
        case .free: return "£0"
        case .pro: return "£9.99"
        case .enterprise: return "£29.99"
        }
    }
}

struct Subscription: Codable, Identifiable {
    let id: String
    let userId: String
    let tier: SubscriptionTier
    let status: String
    let currentPeriodStart: Date
    let currentPeriodEnd: Date
    let createdAt: Date
    let updatedAt: Date
    
    init(id: String = UUID().uuidString,
         userId: String,
         tier: SubscriptionTier = .free,
         status: String = "active",
         currentPeriodStart: Date = Date(),
         currentPeriodEnd: Date = Calendar.current.date(byAdding: .month, value: 1, to: Date()) ?? Date(),
         createdAt: Date = Date(),
         updatedAt: Date = Date()) {
        self.id = id
        self.userId = userId
        self.tier = tier
        self.status = status
        self.currentPeriodStart = currentPeriodStart
        self.currentPeriodEnd = currentPeriodEnd
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

// MARK: - Error Models
struct APIError: Error, Codable {
    let message: String
    let code: String
    let details: String?
    
    init(message: String, code: String, details: String? = nil) {
        self.message = message
        self.code = code
        self.details = details
    }
}

// MARK: - View State Models
enum LoadingState {
    case idle
    case loading
    case loaded
    case error(String)
}

// MARK: - Sample Data for Testing
extension Project {
    static let sampleProjects: [Project] = [
        Project(
            name: "Kitchen Extension",
            description: "Single storey rear extension to create open plan kitchen/dining area",
            address: "123 Oak Street, London",
            projectType: "Extension",
            status: .active
        ),
        Project(
            name: "Loft Conversion",
            description: "Convert loft space into two bedrooms with en-suite",
            address: "456 Elm Avenue, Manchester",
            projectType: "Conversion",
            status: .planning
        ),
        Project(
            name: "Garden Office",
            description: "Detached garden office with electricity and heating",
            address: "789 Pine Road, Birmingham",
            projectType: "New Build",
            status: .completed
        )
    ]
}

extension ChatMessage {
    static let sampleMessages: [ChatMessage] = [
        ChatMessage(
            content: "I'm planning a kitchen extension. What building regulations do I need to consider?",
            role: .user
        ),
        ChatMessage(
            content: "For a kitchen extension, you'll need to consider several building regulations including structural safety, insulation, ventilation, and drainage. I can help you understand each requirement in detail.",
            role: .assistant
        ),
        ChatMessage(
            content: "What about planning permission?",
            role: .user
        ),
        ChatMessage(
            content: "Single storey rear extensions often fall under Permitted Development Rights if they meet certain criteria. The extension should not exceed 6 metres for terraced/semi-detached houses or 8 metres for detached houses.",
            role: .assistant
        )
    ]
}

// MARK: - Building Regulations Models
struct BuildingRegulation: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let category: String
    let content: String
    let lastUpdated: Date
    
    enum CodingKeys: String, CodingKey {
        case id, title, description, category, content
        case lastUpdated = "last_updated"
    }
}

// MARK: - Notification Models
struct AppNotification: Codable, Identifiable {
    let id: String
    let userId: String
    let title: String
    let message: String
    let type: NotificationType
    let isRead: Bool
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, title, message, type
        case userId = "user_id"
        case isRead = "is_read"
        case createdAt = "created_at"
    }
}

enum NotificationType: String, Codable {
    case general = "general"
    case projectUpdate = "project_update"
    case subscription = "subscription"
    case regulation = "regulation"
    case system = "system"
    
    var iconName: String {
        switch self {
        case .general: return "bell"
        case .projectUpdate: return "folder.badge"
        case .subscription: return "crown"
        case .regulation: return "doc.text"
        case .system: return "gear"
        }
    }
}