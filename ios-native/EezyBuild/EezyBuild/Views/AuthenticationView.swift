import SwiftUI

struct AuthenticationView: View {
    @EnvironmentObject var userManager: UserManager
    @State private var isSignUpMode = false
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var confirmPassword = ""
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Logo and Header
                    headerSection
                    
                    // Form
                    formSection
                    
                    // Action Button
                    actionButton
                    
                    // Mode Toggle
                    modeToggle
                    
                    // Error Message
                    if let errorMessage = userManager.errorMessage {
                        errorSection(errorMessage)
                    }
                    
                    Spacer()
                }
                .padding(24)
            }
            .background(Color.black.ignoresSafeArea())
            .navigationBarHidden(true)
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
    
    private var headerSection: some View {
        VStack(spacing: 16) {
            // Logo placeholder - replace with your actual logo
            Image(systemName: "building.2.crop.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(.green)
            
            Text("EezyBuild")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            Text("Building Regulations Assistant")
                .font(.headline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 40)
    }
    
    private var formSection: some View {
        VStack(spacing: 16) {
            if isSignUpMode {
                CustomTextField(
                    placeholder: "Full Name",
                    text: $name,
                    iconName: "person"
                )
            }
            
            CustomTextField(
                placeholder: "Email",
                text: $email,
                iconName: "envelope",
                keyboardType: .emailAddress
            )
            
            CustomSecureField(
                placeholder: "Password",
                text: $password,
                iconName: "lock"
            )
            
            if isSignUpMode {
                CustomSecureField(
                    placeholder: "Confirm Password",
                    text: $confirmPassword,
                    iconName: "lock"
                )
            }
        }
    }
    
    private var actionButton: some View {
        Button(action: {
            Task {
                if isSignUpMode {
                    await signUp()
                } else {
                    await signIn()
                }
            }
        }) {
            HStack {
                if userManager.isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .black))
                        .scaleEffect(0.8)
                } else {
                    Text(isSignUpMode ? "Create Account" : "Sign In")
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
        .disabled(userManager.isLoading || !isFormValid)
        .opacity(isFormValid ? 1.0 : 0.6)
    }
    
    private var modeToggle: some View {
        HStack {
            Text(isSignUpMode ? "Already have an account?" : "Don't have an account?")
                .foregroundColor(.gray)
            
            Button(action: {
                withAnimation(.easeInOut(duration: 0.3)) {
                    isSignUpMode.toggle()
                    clearForm()
                }
            }) {
                Text(isSignUpMode ? "Sign In" : "Sign Up")
                    .foregroundColor(.green)
                    .fontWeight(.semibold)
            }
        }
        .font(.body)
    }
    
    private func errorSection(_ message: String) -> some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.red)
            
            Text(message)
                .foregroundColor(.red)
                .font(.body)
            
            Spacer()
        }
        .padding()
        .background(Color.red.opacity(0.1))
        .cornerRadius(12)
        .onTapGesture {
            userManager.clearError()
        }
    }
    
    // MARK: - Computed Properties
    
    private var isFormValid: Bool {
        if isSignUpMode {
            return !email.isEmpty &&
                   !password.isEmpty &&
                   !name.isEmpty &&
                   !confirmPassword.isEmpty &&
                   password == confirmPassword &&
                   isValidEmail(email) &&
                   password.count >= 6
        } else {
            return !email.isEmpty &&
                   !password.isEmpty &&
                   isValidEmail(email)
        }
    }
    
    // MARK: - Methods
    
    private func signUp() async {
        guard password == confirmPassword else {
            userManager.errorMessage = "Passwords don't match"
            return
        }
        
        await userManager.signUp(email: email, password: password, name: name)
    }
    
    private func signIn() async {
        await userManager.signIn(email: email, password: password)
    }
    
    private func clearForm() {
        email = ""
        password = ""
        name = ""
        confirmPassword = ""
        userManager.clearError()
    }
    
    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format:"SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
}

// MARK: - Custom Text Field Components

struct CustomTextField: View {
    let placeholder: String
    @Binding var text: String
    let iconName: String
    var keyboardType: UIKeyboardType = .default
    
    var body: some View {
        HStack {
            Image(systemName: iconName)
                .foregroundColor(.gray)
                .frame(width: 24)
            
            TextField(placeholder, text: $text)
                .keyboardType(keyboardType)
                .autocapitalization(.none)
                .disableAutocorrection(true)
                .foregroundColor(.white)
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

struct CustomSecureField: View {
    let placeholder: String
    @Binding var text: String
    let iconName: String
    @State private var isSecured = true
    
    var body: some View {
        HStack {
            Image(systemName: iconName)
                .foregroundColor(.gray)
                .frame(width: 24)
            
            if isSecured {
                SecureField(placeholder, text: $text)
                    .foregroundColor(.white)
            } else {
                TextField(placeholder, text: $text)
                    .foregroundColor(.white)
            }
            
            Button(action: {
                isSecured.toggle()
            }) {
                Image(systemName: isSecured ? "eye.slash" : "eye")
                    .foregroundColor(.gray)
            }
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

#Preview {
    AuthenticationView()
        .environmentObject(UserManager())
}