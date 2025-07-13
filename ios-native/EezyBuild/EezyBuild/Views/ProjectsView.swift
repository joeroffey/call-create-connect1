import SwiftUI

struct ProjectsView: View {
    @EnvironmentObject var userManager: UserManager
    @StateObject private var projectManager = ProjectManager()
    @State private var showingCreateProject = false
    @State private var selectedProject: Project?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                headerSection
                
                // Projects List
                projectsList
            }
            .background(Color.black.ignoresSafeArea())
            .navigationBarHidden(true)
            .onAppear {
                Task {
                    await projectManager.loadProjects()
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .sheet(isPresented: $showingCreateProject) {
            CreateProjectView()
                .environmentObject(projectManager)
        }
        .sheet(item: $selectedProject) { project in
            ProjectDetailView(project: project)
                .environmentObject(projectManager)
        }
    }
    
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Projects")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Text("\(projectManager.projects.count) total projects")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            
            Spacer()
            
            Button(action: {
                showingCreateProject = true
            }) {
                Image(systemName: "plus.circle.fill")
                    .font(.title2)
                    .foregroundColor(.green)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(Color.black)
    }
    
    private var projectsList: some View {
        Group {
            if projectManager.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .progressViewStyle(CircularProgressViewStyle(tint: .green))
            } else if projectManager.projects.isEmpty {
                emptyStateView
            } else {
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(projectManager.projects) { project in
                            ProjectCard(project: project) {
                                selectedProject = project
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
                }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "folder.badge.plus")
                .font(.system(size: 60))
                .foregroundColor(.green.opacity(0.6))
            
            VStack(spacing: 8) {
                Text("No Projects Yet")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Text("Create your first project to get started with organizing your building work")
                    .font(.body)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            
            Button("Create Project") {
                showingCreateProject = true
            }
            .font(.headline)
            .fontWeight(.semibold)
            .foregroundColor(.black)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .background(
                LinearGradient(
                    colors: [.green, Color.green.opacity(0.8)],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .cornerRadius(25)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(40)
    }
}

struct ProjectCard: View {
    let project: Project
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(project.name)
                            .font(.headline)
                            .foregroundColor(.white)
                            .lineLimit(1)
                        
                        if let description = project.description {
                            Text(description)
                                .font(.subheadline)
                                .foregroundColor(.gray)
                                .lineLimit(2)
                        }
                    }
                    
                    Spacer()
                    
                    StatusBadge(status: project.status)
                }
                
                if let address = project.address {
                    HStack {
                        Image(systemName: "location")
                            .foregroundColor(.green)
                            .font(.caption)
                        
                        Text(address)
                            .font(.caption)
                            .foregroundColor(.gray)
                            .lineLimit(1)
                    }
                }
                
                HStack {
                    HStack {
                        Image(systemName: "calendar")
                            .foregroundColor(.gray)
                            .font(.caption)
                        
                        Text("Created \(formatDate(project.createdAt))")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    
                    Spacer()
                    
                    if let projectType = project.projectType {
                        Text(projectType.capitalized)
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.green.opacity(0.2))
                            .cornerRadius(8)
                    }
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

struct StatusBadge: View {
    let status: ProjectStatus
    
    var body: some View {
        Text(status.displayName)
            .font(.caption)
            .fontWeight(.medium)
            .foregroundColor(statusColor)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(statusColor.opacity(0.2))
            .cornerRadius(8)
    }
    
    private var statusColor: Color {
        switch status {
        case .planning:
            return .blue
        case .active:
            return .orange
        case .completed:
            return .green
        case .onHold:
            return .gray
        case .cancelled:
            return .red
        }
    }
}

struct CreateProjectView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var projectManager: ProjectManager
    
    @State private var name = ""
    @State private var description = ""
    @State private var address = ""
    @State private var projectType = ""
    @State private var isLoading = false
    
    let projectTypes = ["Extension", "New Build", "Renovation", "Conversion", "Garage", "Conservatory", "Other"]
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    VStack(spacing: 16) {
                        Text("Create New Project")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text("Add a new building project to organize your work")
                            .font(.body)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                    }
                    
                    VStack(spacing: 16) {
                        CustomTextField(
                            placeholder: "Project Name",
                            text: $name,
                            iconName: "building.2"
                        )
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Description")
                                .font(.subheadline)
                                .foregroundColor(.white)
                            
                            TextField("Describe your project...", text: $description, axis: .vertical)
                                .lineLimit(3...6)
                                .foregroundColor(.white)
                                .padding()
                                .background(Color.gray.opacity(0.1))
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                )
                        }
                        
                        CustomTextField(
                            placeholder: "Address",
                            text: $address,
                            iconName: "location"
                        )
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Project Type")
                                .font(.subheadline)
                                .foregroundColor(.white)
                            
                            Menu {
                                ForEach(projectTypes, id: \.self) { type in
                                    Button(type) {
                                        projectType = type
                                    }
                                }
                            } label: {
                                HStack {
                                    Image(systemName: "hammer")
                                        .foregroundColor(.gray)
                                        .frame(width: 24)
                                    
                                    Text(projectType.isEmpty ? "Select project type" : projectType)
                                        .foregroundColor(projectType.isEmpty ? .gray : .white)
                                    
                                    Spacer()
                                    
                                    Image(systemName: "chevron.down")
                                        .foregroundColor(.gray)
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
                    
                    VStack(spacing: 12) {
                        Button(action: createProject) {
                            HStack {
                                if isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .black))
                                        .scaleEffect(0.8)
                                } else {
                                    Text("Create Project")
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
                        .disabled(isLoading || !isFormValid)
                        .opacity(isFormValid ? 1.0 : 0.6)
                        
                        Button("Cancel") {
                            dismiss()
                        }
                        .foregroundColor(.gray)
                    }
                }
                .padding(24)
            }
            .background(Color.black.ignoresSafeArea())
            .navigationBarHidden(true)
        }
    }
    
    private var isFormValid: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    private func createProject() {
        guard isFormValid else { return }
        
        isLoading = true
        
        Task {
            await projectManager.createProject(
                name: name.trimmingCharacters(in: .whitespacesAndNewlines),
                description: description.isEmpty ? nil : description.trimmingCharacters(in: .whitespacesAndNewlines),
                address: address.isEmpty ? nil : address.trimmingCharacters(in: .whitespacesAndNewlines),
                projectType: projectType.isEmpty ? nil : projectType
            )
            
            isLoading = false
            dismiss()
        }
    }
}

struct ProjectDetailView: View {
    let project: Project
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var projectManager: ProjectManager
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 12) {
                        Text(project.name)
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                        
                        StatusBadge(status: project.status)
                    }
                    
                    // Details
                    VStack(spacing: 16) {
                        if let description = project.description {
                            DetailRow(title: "Description", value: description)
                        }
                        
                        if let address = project.address {
                            DetailRow(title: "Address", value: address)
                        }
                        
                        if let projectType = project.projectType {
                            DetailRow(title: "Type", value: projectType.capitalized)
                        }
                        
                        DetailRow(title: "Created", value: formatDate(project.createdAt))
                        DetailRow(title: "Last Updated", value: formatDate(project.updatedAt))
                    }
                    
                    // Actions
                    VStack(spacing: 12) {
                        Button("Edit Project") {
                            // TODO: Implement edit functionality
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .background(Color.gray.opacity(0.2))
                        .cornerRadius(12)
                        
                        Button("Start Chat for this Project") {
                            // TODO: Implement chat navigation
                        }
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(
                            LinearGradient(
                                colors: [.green, Color.green.opacity(0.8)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(16)
                    }
                }
                .padding(24)
            }
            .background(Color.black.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                    .foregroundColor(.white)
                }
            }
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct DetailRow: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
                .textCase(.uppercase)
            
            Text(value)
                .font(.body)
                .foregroundColor(.white)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Project Manager

@MainActor
class ProjectManager: ObservableObject {
    @Published var projects: [Project] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let supabaseService = SupabaseService.shared
    
    func loadProjects() async {
        isLoading = true
        errorMessage = nil
        
        do {
            projects = try await supabaseService.getProjects()
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func createProject(name: String, description: String?, address: String?, projectType: String?) async {
        do {
            let newProject = try await supabaseService.createProject(
                name: name,
                description: description,
                address: address,
                projectType: projectType
            )
            
            projects.insert(newProject, at: 0)
            
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func updateProject(_ project: Project) async {
        do {
            let updatedProject = try await supabaseService.updateProject(project)
            
            if let index = projects.firstIndex(where: { $0.id == project.id }) {
                projects[index] = updatedProject
            }
            
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

#Preview {
    ProjectsView()
        .environmentObject(UserManager())
}