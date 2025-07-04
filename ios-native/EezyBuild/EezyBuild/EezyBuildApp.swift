import SwiftUI

@main
struct EezyBuildApp: App {
    @StateObject private var userManager = UserManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(userManager)
                .preferredColorScheme(.dark)
        }
    }
}