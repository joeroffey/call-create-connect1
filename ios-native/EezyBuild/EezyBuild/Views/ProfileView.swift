import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var userManager: UserManager
    @State private var showingEditProfile = false
    @State private var showingSubscriptionView = false
    @State private var showingSignOutAlert = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile Header
                    profileHeader
                    
                    // Subscription Status
                    subscriptionSection
                    
                    // Account Settings
                    accountSettingsSection
                    
                    // Support & Info
                    supportSection
                    
                    // Sign Out
                    signOutSection
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
            }
            .background(Color.black.ignoresSafeArea())
            .navigationBarHidden(true)
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .sheet(isPresented: $showingEditProfile) {
            EditProfileView()
        }
        .sheet(isPresented: $showingSubscriptionView) {
            SubscriptionView()
        }
        .alert("Sign Out", isPresented: $showingSignOutAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Sign Out", role: .destructive) {
                Task {
                    await userManager.signOut()
                }
            }
        } message: {
            Text("Are you sure you want to sign out?")
        }
    }
    
    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Avatar
            Circle()
                .fill(
                    LinearGradient(
                        colors: [.green, Color.green.opacity(0.7)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 100, height: 100)
                .overlay(
                    Text(userInitials)
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.black)
                )
            
            // User Info
            VStack(spacing: 4) {
                Text(userManager.currentUser?.name ?? "User")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Text(userManager.currentUser?.email ?? "")
                    .font(.body)
                    .foregroundColor(.gray)
            }
            
            // Edit Profile Button
            Button("Edit Profile") {
                showingEditProfile = true
            }
            .font(.subheadline)
            .fontWeight(.medium)
            .foregroundColor(.green)
            .padding(.horizontal, 20)
            .padding(.vertical, 8)
            .background(Color.green.opacity(0.2))
            .cornerRadius(20)
        }
    }
    
    private var subscriptionSection: some View {
        VStack(spacing: 16) {
            SectionHeader(title: "Subscription", icon: "crown")
            
            SubscriptionCard(
                planName: userManager.subscriptionDisplayName,
                isActive: userManager.hasActiveSubscription,
                onUpgrade: {
                    showingSubscriptionView = true
                },
                onManage: {
                    showingSubscriptionView = true
                }
            )
        }
    }
    
    private var accountSettingsSection: some View {
        VStack(spacing: 16) {
            SectionHeader(title: "Account", icon: "gear")
            
            VStack(spacing: 12) {
                SettingsRow(
                    title: "Notifications",
                    icon: "bell",
                    action: {
                        // TODO: Navigate to notifications settings
                    }
                )
                
                SettingsRow(
                    title: "Privacy & Security",
                    icon: "lock.shield",
                    action: {
                        // TODO: Navigate to privacy settings
                    }
                )
                
                SettingsRow(
                    title: "Data & Storage",
                    icon: "externaldrive",
                    action: {
                        // TODO: Navigate to data settings
                    }
                )
            }
        }
    }
    
    private var supportSection: some View {
        VStack(spacing: 16) {
            SectionHeader(title: "Support & Info", icon: "questionmark.circle")
            
            VStack(spacing: 12) {
                SettingsRow(
                    title: "Help Center",
                    icon: "questionmark.circle",
                    action: {
                        // TODO: Open help center
                    }
                )
                
                SettingsRow(
                    title: "Contact Support",
                    icon: "envelope",
                    action: {
                        // TODO: Open contact support
                    }
                )
                
                SettingsRow(
                    title: "About EezyBuild",
                    icon: "info.circle",
                    action: {
                        // TODO: Show about page
                    }
                )
                
                SettingsRow(
                    title: "Terms & Privacy",
                    icon: "doc.text",
                    action: {
                        // TODO: Show terms and privacy
                    }
                )
            }
        }
    }
    
    private var signOutSection: some View {
        VStack(spacing: 16) {
            Button("Sign Out") {
                showingSignOutAlert = true
            }
            .font(.headline)
            .fontWeight(.medium)
            .foregroundColor(.red)
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(Color.red.opacity(0.1))
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.red.opacity(0.3), lineWidth: 1)
            )
            
            Text("Version 1.0.0")
                .font(.caption)
                .foregroundColor(.gray)
        }
    }
    
    private var userInitials: String {
        guard let name = userManager.currentUser?.name else { return "U" }
        let components = name.split(separator: " ")
        let initials = components.compactMap { $0.first }.prefix(2)
        return String(initials).uppercased()
    }
}

struct SectionHeader: View {
    let title: String
    let icon: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.green)
            
            Text(title)
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(.white)
            
            Spacer()
        }
    }
}

struct SubscriptionCard: View {
    let planName: String
    let isActive: Bool
    let onUpgrade: () -> Void
    let onManage: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(planName)
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text(isActive ? "Active subscription" : "No active plan")
                        .font(.subheadline)
                        .foregroundColor(isActive ? .green : .gray)
                }
                
                Spacer()
                
                if isActive {
                    Image(systemName: "crown.fill")
                        .foregroundColor(.green)
                        .font(.title2)
                }
            }
            
            if isActive {
                Button("Manage Subscription") {
                    onManage()
                }
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(Color.gray.opacity(0.2))
                .cornerRadius(12)
            } else {
                Button("Upgrade to Pro") {
                    onUpgrade()
                }
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.black)
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(
                    LinearGradient(
                        colors: [.green, Color.green.opacity(0.8)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(12)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
        )
    }
}

struct SettingsRow: View {
    let title: String
    let icon: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.green)
                    .frame(width: 24)
                
                Text(title)
                    .font(.body)
                    .foregroundColor(.white)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundColor(.gray)
                    .font(.caption)
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct EditProfileView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var userManager: UserManager
    
    @State private var name: String = ""
    @State private var isLoading = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 16) {
                    Text("Edit Profile")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text("Update your personal information")
                        .font(.body)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                }
                
                // Form
                VStack(spacing: 16) {
                    CustomTextField(
                        placeholder: "Full Name",
                        text: $name,
                        iconName: "person"
                    )
                    
                    // Email (read-only)
                    HStack {
                        Image(systemName: "envelope")
                            .foregroundColor(.gray)
                            .frame(width: 24)
                        
                        Text(userManager.currentUser?.email ?? "")
                            .foregroundColor(.gray)
                        
                        Spacer()
                        
                        Text("Verified")
                            .font(.caption)
                            .foregroundColor(.green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.green.opacity(0.2))
                            .cornerRadius(8)
                    }
                    .padding()
                    .background(Color.gray.opacity(0.05))
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                    )
                }
                
                // Actions
                VStack(spacing: 12) {
                    Button(action: updateProfile) {
                        HStack {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .black))
                                    .scaleEffect(0.8)
                            } else {
                                Text("Update Profile")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(
                            LinearGradient(
                                colors: [.green, Color.green.opacity(0.8)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .foregroundColor(.black)
                        .cornerRadius(16)
                    }
                    .disabled(isLoading || !hasChanges)
                    .opacity(hasChanges ? 1.0 : 0.6)
                    
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.gray)
                }
                
                Spacer()
            }
            .padding(24)
            .background(Color.black.ignoresSafeArea())
            .navigationBarHidden(true)
            .onAppear {
                name = userManager.currentUser?.name ?? ""
            }
        }
    }
    
    private var hasChanges: Bool {
        name != (userManager.currentUser?.name ?? "")
    }
    
    private func updateProfile() {
        guard hasChanges else { return }
        
        isLoading = true
        
        Task {
            await userManager.updateProfile(name: name)
            isLoading = false
            
            if userManager.errorMessage == nil {
                dismiss()
            }
        }
    }
}

struct SubscriptionView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var userManager: UserManager
    
    let plans: [SubscriptionTier] = [.free, .pro, .enterprise]
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 16) {
                        Image(systemName: "crown.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.green)
                        
                        Text("Choose Your Plan")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text("Unlock the full potential of EezyBuild with our professional plans")
                            .font(.body)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                    }
                    
                    // Plans
                    VStack(spacing: 16) {
                        ForEach(plans, id: \.self) { plan in
                            PlanCard(
                                plan: plan,
                                isCurrentPlan: userManager.subscription?.tier == plan,
                                onSelect: {
                                    // TODO: Implement subscription purchase
                                }
                            )
                        }
                    }
                    
                    // Features
                    VStack(spacing: 16) {
                        Text("All Plans Include")
                            .font(.headline)
                            .foregroundColor(.white)
                        
                        VStack(spacing: 8) {
                            FeatureRow(icon: "message", title: "AI Building Regulations Assistant")
                            FeatureRow(icon: "shield", title: "Secure Data Storage")
                            FeatureRow(icon: "iphone", title: "Cross-Platform Access")
                            FeatureRow(icon: "arrow.clockwise", title: "Regular Updates")
                        }
                    }
                    
                    Button("Close") {
                        dismiss()
                    }
                    .foregroundColor(.gray)
                    .padding(.top)
                }
                .padding(24)
            }
            .background(Color.black.ignoresSafeArea())
            .navigationBarHidden(true)
        }
    }
}

struct PlanCard: View {
    let plan: SubscriptionTier
    let isCurrentPlan: Bool
    let onSelect: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(plan.displayName)
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text(plan.monthlyPrice)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                }
                
                Spacer()
                
                if isCurrentPlan {
                    Text("Current")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.green)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 4)
                        .background(Color.green.opacity(0.2))
                        .cornerRadius(12)
                }
            }
            
            VStack(spacing: 8) {
                FeatureItem(text: planFeatures(for: plan))
            }
            
            if !isCurrentPlan {
                Button(plan == .free ? "Downgrade" : "Upgrade") {
                    onSelect()
                }
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(plan == .free ? .gray : .black)
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(
                    plan == .free ? Color.gray.opacity(0.2) : 
                    LinearGradient(
                        colors: [.green, Color.green.opacity(0.8)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(12)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(isCurrentPlan ? Color.green : Color.gray.opacity(0.3), lineWidth: isCurrentPlan ? 2 : 1)
        )
    }
    
    private func planFeatures(for plan: SubscriptionTier) -> [String] {
        switch plan {
        case .free:
            return ["Basic chat access", "Limited daily queries"]
        case .pro:
            return ["Unlimited chat", "Basic calculators", "Unlimited projects"]
        case .enterprise:
            return ["Everything in Pro", "Advanced search", "Priority support", "Custom integrations"]
        }
    }
}

struct FeatureItem: View {
    let text: [String]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            ForEach(text, id: \.self) { feature in
                HStack {
                    Image(systemName: "checkmark")
                        .foregroundColor(.green)
                        .font(.caption)
                    
                    Text(feature)
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Spacer()
                }
            }
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(UserManager())
}