import Foundation
import Combine

class SupabaseService: ObservableObject {
    static let shared = SupabaseService()
    
    // Supabase configuration - using centralized Config
    private let supabaseURL = Config.supabaseURL
    private let supabaseAnonKey = Config.supabaseAnonKey
    
    private var session: URLSession
    private var currentSession: Session?
    
    private init() {
        // Validate configuration
        guard Config.validateSupabaseConfig() else {
            fatalError("Invalid Supabase configuration. Please check Config.swift")
        }
        
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = Config.requestTimeout
        config.timeoutIntervalForResource = Config.resourceTimeout
        self.session = URLSession(configuration: config)
        
        if Config.enableLogging {
            print("SupabaseService initialized with URL: \(supabaseURL)")
        }
    }
    
    // MARK: - Authentication
    
    func signUp(email: String, password: String, name: String) async throws -> AuthResponse {
        let url = URL(string: "\(supabaseURL)/auth/v1/signup")!
        
        let body = [
            "email": email,
            "password": password,
            "data": [
                "name": name
            ]
        ]
        
        return try await makeAuthRequest(url: url, body: body)
    }
    
    func signIn(email: String, password: String) async throws -> AuthResponse {
        let url = URL(string: "\(supabaseURL)/auth/v1/token?grant_type=password")!
        
        let body = [
            "email": email,
            "password": password
        ]
        
        return try await makeAuthRequest(url: url, body: body)
    }
    
    func signOut() async throws {
        guard let accessToken = currentSession?.accessToken else { return }
        
        let url = URL(string: "\(supabaseURL)/auth/v1/logout")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        
        let (_, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 204 else {
            throw APIError(message: "Sign out failed", code: "SIGNOUT_ERROR", details: nil)
        }
        
        currentSession = nil
    }
    
    func refreshSession() async throws -> AuthResponse {
        guard let refreshToken = currentSession?.refreshToken else {
            throw APIError(message: "No refresh token available", code: "NO_REFRESH_TOKEN", details: nil)
        }
        
        let url = URL(string: "\(supabaseURL)/auth/v1/token?grant_type=refresh_token")!
        
        let body = [
            "refresh_token": refreshToken
        ]
        
        return try await makeAuthRequest(url: url, body: body)
    }
    
    private func makeAuthRequest(url: URL, body: [String: Any]) async throws -> AuthResponse {
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        
        let jsonData = try JSONSerialization.data(withJSONObject: body)
        request.httpBody = jsonData
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(message: "Invalid response", code: "INVALID_RESPONSE", details: nil)
        }
        
        if httpResponse.statusCode >= 400 {
            if let errorData = try? JSONDecoder().decode(APIError.self, from: data) {
                throw errorData
            } else {
                throw APIError(message: "Authentication failed", code: "AUTH_ERROR", details: nil)
            }
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let authResponse = try decoder.decode(AuthResponse.self, from: data)
        currentSession = authResponse.session
        
        return authResponse
    }
    
    // MARK: - Chat API
    
    func sendChatMessage(content: String, conversationId: String? = nil, projectId: String? = nil) async throws -> ChatMessage {
        let url = URL(string: "\(supabaseURL)/rest/v1/chat_messages")!
        
        let body: [String: Any?] = [
            "content": content,
            "role": MessageRole.user.rawValue,
            "conversation_id": conversationId,
            "project_id": projectId,
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        
        return try await makeAuthorizedRequest(url: url, method: "POST", body: body)
    }
    
    func getChatMessages(conversationId: String) async throws -> [ChatMessage] {
        let url = URL(string: "\(supabaseURL)/rest/v1/chat_messages?conversation_id=eq.\(conversationId)&order=timestamp.asc")!
        
        return try await makeAuthorizedRequest(url: url, method: "GET")
    }
    
    func getConversations() async throws -> [Conversation] {
        let url = URL(string: "\(supabaseURL)/rest/v1/conversations?order=updated_at.desc")!
        
        return try await makeAuthorizedRequest(url: url, method: "GET")
    }
    
    // MARK: - Projects API
    
    func getProjects() async throws -> [Project] {
        let url = URL(string: "\(supabaseURL)/rest/v1/projects?order=updated_at.desc")!
        
        return try await makeAuthorizedRequest(url: url, method: "GET")
    }
    
    func createProject(name: String, description: String?, address: String?, projectType: String?) async throws -> Project {
        let url = URL(string: "\(supabaseURL)/rest/v1/projects")!
        
        let body: [String: Any?] = [
            "name": name,
            "description": description,
            "address": address,
            "project_type": projectType,
            "status": ProjectStatus.planning.rawValue,
            "created_at": ISO8601DateFormatter().string(from: Date()),
            "updated_at": ISO8601DateFormatter().string(from: Date())
        ]
        
        let response: [Project] = try await makeAuthorizedRequest(url: url, method: "POST", body: body)
        guard let project = response.first else {
            throw APIError(message: "Failed to create project", code: "CREATE_PROJECT_ERROR", details: nil)
        }
        
        return project
    }
    
    func updateProject(_ project: Project) async throws -> Project {
        let url = URL(string: "\(supabaseURL)/rest/v1/projects?id=eq.\(project.id)")!
        
        let body: [String: Any?] = [
            "name": project.name,
            "description": project.description,
            "address": project.address,
            "project_type": project.projectType,
            "status": project.status.rawValue,
            "updated_at": ISO8601DateFormatter().string(from: Date())
        ]
        
        let response: [Project] = try await makeAuthorizedRequest(url: url, method: "PATCH", body: body)
        guard let updatedProject = response.first else {
            throw APIError(message: "Failed to update project", code: "UPDATE_PROJECT_ERROR", details: nil)
        }
        
        return updatedProject
    }
    
    // MARK: - Subscription API
    
    func getSubscription() async throws -> Subscription? {
        let url = URL(string: "\(supabaseURL)/rest/v1/subscriptions?limit=1")!
        
        let subscriptions: [Subscription] = try await makeAuthorizedRequest(url: url, method: "GET")
        return subscriptions.first
    }
    
    // MARK: - User Profile API
    
    func updateUserProfile(name: String) async throws -> User {
        let url = URL(string: "\(supabaseURL)/auth/v1/user")!
        
        let body: [String: Any] = [
            "data": [
                "name": name
            ]
        ]
        
        return try await makeAuthorizedRequest(url: url, method: "PUT", body: body)
    }
    
    // MARK: - Helper Methods
    
    private func makeAuthorizedRequest<T: Codable>(
        url: URL,
        method: String,
        body: [String: Any?]? = nil
    ) async throws -> T {
        guard let accessToken = currentSession?.accessToken else {
            throw APIError(message: "Not authenticated", code: "NOT_AUTHENTICATED", details: nil)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")
        
        if let body = body {
            let jsonData = try JSONSerialization.data(withJSONObject: body)
            request.httpBody = jsonData
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(message: "Invalid response", code: "INVALID_RESPONSE", details: nil)
        }
        
        if httpResponse.statusCode >= 400 {
            if let errorData = try? JSONDecoder().decode(APIError.self, from: data) {
                throw errorData
            } else {
                throw APIError(message: "Request failed", code: "REQUEST_ERROR", details: nil)
            }
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        return try decoder.decode(T.self, from: data)
    }
    
    // MARK: - Session Management
    
    func setSession(_ session: Session) {
        self.currentSession = session
    }
    
    func getSession() -> Session? {
        return currentSession
    }
    
    func clearSession() {
        currentSession = nil
    }
}