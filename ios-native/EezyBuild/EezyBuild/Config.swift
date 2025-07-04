import Foundation

struct Config {
    // MARK: - Supabase Configuration
    static let supabaseURL = "https://srwbgkssoatrhxdrrtff.supabase.co"
    static let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyd2Jna3Nzb2F0cmh4ZHJydGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzE0OTcsImV4cCI6MjA2NTkwNzQ5N30.FxPPrtKlz5MZxnS_6kAHMOMJiT25DYXOKzT1V9k-KhU"
    
    // MARK: - App Configuration
    static let appName = "EezyBuild"
    static let appVersion = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0.0"
    
    // MARK: - API Configuration
    static let requestTimeout: TimeInterval = 30
    static let resourceTimeout: TimeInterval = 60
    
    // MARK: - Environment Detection
    static var isDebug: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }
    
    // MARK: - Feature Flags
    static let enableLogging = isDebug
    static let enableAnalytics = !isDebug
    
    // MARK: - Helper Methods
    static func validateSupabaseConfig() -> Bool {
        return !supabaseURL.isEmpty && 
               !supabaseAnonKey.isEmpty && 
               supabaseURL.hasPrefix("https://") &&
               supabaseURL.contains(".supabase.co")
    }
}