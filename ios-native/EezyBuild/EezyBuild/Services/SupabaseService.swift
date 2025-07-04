import Foundation
import Combine

// MARK: - Simplified Models for Testing
struct SimpleUser: Codable {
    let id: String
    let email: String
    let name: String?
}

struct SimpleAuthResponse: Codable {
    let user: SimpleUser
    let accessToken: String
    let refreshToken: String
}

struct SimpleProject: Codable {
    let id: String
    let name: String
    let description: String?
    let status: String
}

struct SimpleAPIError: Error, Codable {
    let message: String
    let code: String
}

class SupabaseService: ObservableObject {
    static let shared = SupabaseService()
    
    // Simplified configuration - no external dependencies
    private let supabaseURL = "https://srwbgkssoatrhxdrrtff.supabase.co"
    private let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyd2Jna3Nzb2F0cmh4ZHJydGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzE0OTcsImV4cCI6MjA2NTkwNzQ5N30.FxPPrtKlz5MZxnS_6kAHMOMJiT25DYXOKzT1V9k-KhU"
    
    private var session: URLSession
    private var currentAccessToken: String?
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
        
        print("SupabaseService initialized with URL: \(supabaseURL)")
    }
    
    // MARK: - Authentication (Simplified)
    
    func signUp(email: String, password: String, name: String) async throws -> SimpleAuthResponse {
        let url = URL(string: "\(supabaseURL)/auth/v1/signup")!
        
        let body = [
            "email": email,
            "password": password,
            "data": [
                "name": name
            ]
        ] as [String : Any]
        
        return try await makeAuthRequest(url: url, body: body)
    }
    
    func signIn(email: String, password: String) async throws -> SimpleAuthResponse {
        let url = URL(string: "\(supabaseURL)/auth/v1/token?grant_type=password")!
        
        let body = [
            "email": email,
            "password": password
        ]
        
        return try await makeAuthRequest(url: url, body: body)
    }
    
    func signOut() async throws {
        guard let accessToken = currentAccessToken else { return }
        
        let url = URL(string: "\(supabaseURL)/auth/v1/logout")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        
        let (_, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 204 else {
            throw SimpleAPIError(message: "Sign out failed", code: "SIGNOUT_ERROR")
        }
        
        currentAccessToken = nil
    }
    
    private func makeAuthRequest(url: URL, body: [String: Any]) async throws -> SimpleAuthResponse {
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        
        let jsonData = try JSONSerialization.data(withJSONObject: body)
        request.httpBody = jsonData
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw SimpleAPIError(message: "Invalid response", code: "INVALID_RESPONSE")
        }
        
        if httpResponse.statusCode >= 400 {
            throw SimpleAPIError(message: "Authentication failed", code: "AUTH_ERROR")
        }
        
        // For testing, return a mock response
        let mockUser = SimpleUser(id: "test-id", email: "test@example.com", name: "Test User")
        let mockResponse = SimpleAuthResponse(
            user: mockUser,
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token"
        )
        
        currentAccessToken = mockResponse.accessToken
        return mockResponse
    }
    
    // MARK: - Projects API (Simplified)
    
    func getProjects() async throws -> [SimpleProject] {
        // Return mock data for testing
        return [
            SimpleProject(id: "1", name: "Sample Project", description: "A test project", status: "active")
        ]
    }
    
    func createProject(name: String, description: String?) async throws -> SimpleProject {
        // Return mock data for testing
        return SimpleProject(
            id: UUID().uuidString,
            name: name,
            description: description,
            status: "planning"
        )
    }
    
    // MARK: - Session Management
    
    func isAuthenticated() -> Bool {
        return currentAccessToken != nil
    }
    
    func clearSession() {
        currentAccessToken = nil
    }
}