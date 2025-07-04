import Foundation
import Combine
import SwiftUI

@MainActor
class UserManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var subscription: Subscription?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let supabaseService = SupabaseService.shared
    private let keychain = KeychainHelper()
    
    init() {
        checkAuthenticationStatus()
    }
    
    // MARK: - Authentication
    
    func signUp(email: String, password: String, name: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let authResponse = try await supabaseService.signUp(email: email, password: password, name: name)
            
            // Store auth token securely
            try keychain.store(authResponse.accessToken, forKey: "access_token")
            try keychain.store(authResponse.refreshToken, forKey: "refresh_token")
            
            // Create User from SimpleUser
            currentUser = User(
                id: authResponse.user.id,
                email: authResponse.user.email,
                name: authResponse.user.name
            )
            isAuthenticated = true
            
            // Load additional user data
            await loadUserData()
            
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let authResponse = try await supabaseService.signIn(email: email, password: password)
            
            // Store auth token securely
            try keychain.store(authResponse.accessToken, forKey: "access_token")
            try keychain.store(authResponse.refreshToken, forKey: "refresh_token")
            
            // Create User from SimpleUser
            currentUser = User(
                id: authResponse.user.id,
                email: authResponse.user.email,
                name: authResponse.user.name
            )
            isAuthenticated = true
            
            // Load additional user data
            await loadUserData()
            
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func signOut() async {
        isLoading = true
        
        do {
            try await supabaseService.signOut()
            
            // Clear stored tokens
            try keychain.delete(forKey: "access_token")
            try keychain.delete(forKey: "refresh_token")
            
            // Clear state
            currentUser = nil
            subscription = nil
            isAuthenticated = false
            
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func checkAuthenticationStatus() {
        Task {
            // Check for stored access token
            if let _: String = try? keychain.retrieve(forKey: "access_token") {
                // For now, assume token is valid (simplified)
                isAuthenticated = supabaseService.isAuthenticated()
                if isAuthenticated {
                    await loadUserData()
                }
            }
        }
    }
    
    // MARK: - User Data
    
    func loadUserData() async {
        do {
            // Load mock subscription for now
            subscription = Subscription(
                userId: currentUser?.id ?? "mock-user",
                tier: .free
            )
            
        } catch {
            print("Failed to load user data: \(error)")
        }
    }
    
    func updateProfile(name: String) async {
        isLoading = true
        errorMessage = nil
        
        // For simplified version, just update local user
        if var user = currentUser {
            currentUser = User(
                id: user.id,
                email: user.email,
                name: name,
                createdAt: user.createdAt,
                updatedAt: Date()
            )
        }
        
        isLoading = false
    }
    
    // MARK: - Subscription Helpers
    
    var hasActiveSubscription: Bool {
        guard let subscription = subscription else { return false }
        return subscription.status == "active" && subscription.currentPeriodEnd > Date()
    }
    
    var subscriptionDisplayName: String {
        subscription?.tier.displayName ?? "Free"
    }
    
    func canAccessFeature(_ feature: AppFeature) -> Bool {
        switch feature {
        case .chat:
            return true // Everyone can access basic chat
        case .calculators:
            return hasActiveSubscription
        case .projects:
            return subscription?.tier == .enterprise || subscription?.tier == .pro
        case .advancedSearch:
            return subscription?.tier == .enterprise
        case .team:
            return hasActiveSubscription
        }
    }
    
    // MARK: - Error Handling
    
    func clearError() {
        errorMessage = nil
    }
}

// MARK: - App Features Enum

enum AppFeature {
    case chat
    case calculators
    case projects
    case advancedSearch
    case team
}

// MARK: - Keychain Helper

class KeychainHelper {
    private let serviceName = "com.eezybuild.app"
    
    func store<T: Codable>(_ item: T, forKey key: String) throws {
        let data = try JSONEncoder().encode(item)
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]
        
        // Delete existing item first
        SecItemDelete(query as CFDictionary)
        
        // Add new item
        let status = SecItemAdd(query as CFDictionary, nil)
        
        guard status == errSecSuccess else {
            throw KeychainError.unableToStore
        }
    }
    
    func retrieve<T: Codable>(forKey key: String) throws -> T {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        guard status == errSecSuccess,
              let data = dataTypeRef as? Data else {
            throw KeychainError.unableToRetrieve
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
    
    func delete(forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.unableToDelete
        }
    }
}

// MARK: - Keychain Errors

enum KeychainError: Error, LocalizedError {
    case unableToStore
    case unableToRetrieve
    case unableToDelete
    
    var errorDescription: String? {
        switch self {
        case .unableToStore:
            return "Unable to store item in keychain"
        case .unableToRetrieve:
            return "Unable to retrieve item from keychain"
        case .unableToDelete:
            return "Unable to delete item from keychain"
        }
    }
}