import Foundation

// MARK: - User Models
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let avatar: String?
    let subscription: String?
    let createdAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id, email, name, avatar, subscription
        case createdAt = "created_at"
    }
}

struct AuthResponse: Codable {
    let user: User
    let session: Session
}

struct Session: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresAt: Date
    
    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token" 
        case expiresAt = "expires_at"
    }
}

// MARK: - Chat Models
struct ChatMessage: Codable, Identifiable {
    let id: String
    let conversationId: String?
    let content: String
    let role: MessageRole
    let timestamp: Date
    let projectId: String?
    
    enum CodingKeys: String, CodingKey {
        case id, content, role, timestamp
        case conversationId = "conversation_id"
        case projectId = "project_id"
    }
}

enum MessageRole: String, Codable, CaseIterable {
    case user = "user"
    case assistant = "assistant"
    case system = "system"
}

struct Conversation: Codable, Identifiable {
    let id: String
    let title: String?
    let userId: String
    let projectId: String?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, title
        case userId = "user_id"
        case projectId = "project_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - Project Models
struct Project: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let userId: String
    let address: String?
    let projectType: String?
    let status: ProjectStatus
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, address, status
        case userId = "user_id"
        case projectType = "project_type"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

enum ProjectStatus: String, Codable, CaseIterable {
    case planning = "planning"
    case inProgress = "in_progress"
    case completed = "completed"
    case onHold = "on_hold"
    
    var displayName: String {
        switch self {
        case .planning: return "Planning"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .onHold: return "On Hold"
        }
    }
}

// MARK: - Calculator Models
struct CalculationResult: Codable {
    let type: CalculationType
    let inputs: [String: Double]
    let results: [String: Double]
    let timestamp: Date
}

enum CalculationType: String, Codable, CaseIterable {
    case brick = "brick"
    case timber = "timber"
    case roofTiles = "roof_tiles"
    case volumetric = "volumetric"
    
    var displayName: String {
        switch self {
        case .brick: return "Brick Calculator"
        case .timber: return "Timber Calculator"
        case .roofTiles: return "Roof Tiles Calculator"
        case .volumetric: return "Volumetric Calculator"
        }
    }
    
    var iconName: String {
        switch self {
        case .brick: return "building.2"
        case .timber: return "tree"
        case .roofTiles: return "house"
        case .volumetric: return "cube"
        }
    }
}

// MARK: - Subscription Models
struct Subscription: Codable {
    let id: String
    let userId: String
    let planType: PlanType
    let status: SubscriptionStatus
    let currentPeriodStart: Date
    let currentPeriodEnd: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case planType = "plan_type"
        case status
        case currentPeriodStart = "current_period_start"
        case currentPeriodEnd = "current_period_end"
    }
}

enum PlanType: String, Codable, CaseIterable {
    case none = "none"
    case basic = "basic"
    case pro = "pro"
    case enterprise = "enterprise"
    
    var displayName: String {
        switch self {
        case .none: return "No Plan"
        case .basic: return "EezyBuild"
        case .pro: return "Pro"
        case .enterprise: return "ProMax"
        }
    }
    
    var price: String {
        switch self {
        case .none: return "Free"
        case .basic: return "£9.99/month"
        case .pro: return "£19.99/month"
        case .enterprise: return "£39.99/month"
        }
    }
}

enum SubscriptionStatus: String, Codable {
    case active = "active"
    case cancelled = "cancelled"
    case pastDue = "past_due"
    case unpaid = "unpaid"
}

// MARK: - Error Models
struct APIError: Codable, Error {
    let message: String
    let code: String?
    let details: String?
}

// MARK: - API Response Models
struct APIResponse<T: Codable>: Codable {
    let data: T?
    let error: APIError?
    let message: String?
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