import SwiftUI

struct CalculatorsView: View {
    @EnvironmentObject var userManager: UserManager
    @State private var selectedCalculator: CalculationType?
    @State private var showingSubscriptionPrompt = false
    
    let calculatorItems = CalculationType.allCases
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                headerSection
                
                // Calculator Grid
                ScrollView {
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        ForEach(calculatorItems, id: \.self) { calculator in
                            CalculatorCard(
                                calculator: calculator,
                                isLocked: !userManager.canAccessFeature(.calculators)
                            ) {
                                if userManager.canAccessFeature(.calculators) {
                                    selectedCalculator = calculator
                                } else {
                                    showingSubscriptionPrompt = true
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
                }
            }
            .background(Color.black.ignoresSafeArea())
            .navigationBarHidden(true)
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .sheet(item: $selectedCalculator) { calculator in
            CalculatorDetailView(calculator: calculator)
        }
        .sheet(isPresented: $showingSubscriptionPrompt) {
            SubscriptionPromptView()
        }
    }
    
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Building Calculators")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Text("Professional calculation tools")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            
            Spacer()
            
            if !userManager.canAccessFeature(.calculators) {
                Button("Upgrade") {
                    showingSubscriptionPrompt = true
                }
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.black)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    LinearGradient(
                        colors: [.green, Color.green.opacity(0.8)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(20)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(Color.black)
    }
}

struct CalculatorCard: View {
    let calculator: CalculationType
    let isLocked: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(LinearGradient(
                            colors: isLocked ? [.gray.opacity(0.3)] : [.green.opacity(0.2), .green.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ))
                        .frame(width: 60, height: 60)
                    
                    Image(systemName: isLocked ? "lock.fill" : calculator.iconName)
                        .font(.title2)
                        .foregroundColor(isLocked ? .gray : .green)
                }
                
                VStack(spacing: 4) {
                    Text(calculator.displayName)
                        .font(.headline)
                        .foregroundColor(isLocked ? .gray : .white)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                    
                    if isLocked {
                        Text("Pro Feature")
                            .font(.caption)
                            .foregroundColor(.orange)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.orange.opacity(0.2))
                            .cornerRadius(8)
                    }
                }
            }
            .frame(maxWidth: .infinity)
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.gray.opacity(isLocked ? 0.05 : 0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct CalculatorDetailView: View {
    let calculator: CalculationType
    @Environment(\.dismiss) private var dismiss
    @State private var inputs: [String: String] = [:]
    @State private var results: [String: Double] = [:]
    @State private var showingResults = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    headerInfo
                    
                    // Input Fields
                    inputSection
                    
                    // Calculate Button
                    calculateButton
                    
                    // Results
                    if showingResults {
                        resultsSection
                    }
                }
                .padding(20)
            }
            .background(Color.black.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.white)
                }
                
                ToolbarItem(placement: .principal) {
                    Text(calculator.displayName)
                        .font(.headline)
                        .foregroundColor(.white)
                }
            }
        }
    }
    
    private var headerInfo: some View {
        VStack(spacing: 12) {
            Image(systemName: calculator.iconName)
                .font(.system(size: 50))
                .foregroundColor(.green)
            
            Text(calculator.displayName)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            Text(calculatorDescription)
                .font(.body)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
    }
    
    private var inputSection: some View {
        VStack(spacing: 16) {
            Text("Input Parameters")
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(spacing: 12) {
                ForEach(inputFields, id: \.key) { field in
                    InputField(
                        title: field.title,
                        value: Binding(
                            get: { inputs[field.key] ?? "" },
                            set: { inputs[field.key] = $0 }
                        ),
                        unit: field.unit,
                        placeholder: field.placeholder
                    )
                }
            }
        }
    }
    
    private var calculateButton: some View {
        Button(action: calculate) {
            Text("Calculate")
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
        .disabled(!canCalculate)
        .opacity(canCalculate ? 1.0 : 0.6)
    }
    
    private var resultsSection: some View {
        VStack(spacing: 16) {
            Text("Results")
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(spacing: 12) {
                ForEach(Array(results.keys.sorted()), id: \.self) { key in
                    ResultRow(
                        title: formatResultKey(key),
                        value: results[key] ?? 0,
                        unit: getResultUnit(for: key)
                    )
                }
            }
            
            Button("Save Results") {
                // TODO: Implement save functionality
            }
            .font(.subheadline)
            .foregroundColor(.green)
            .padding(.top, 8)
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
    
    // MARK: - Computed Properties
    
    private var calculatorDescription: String {
        switch calculator {
        case .brick:
            return "Calculate the number of bricks needed for your construction project"
        case .timber:
            return "Calculate timber requirements for framing and construction"
        case .roofTiles:
            return "Calculate the number of roof tiles needed for your roof area"
        case .volumetric:
            return "Calculate volumes for concrete, aggregates, and other materials"
        }
    }
    
    private var inputFields: [(key: String, title: String, unit: String, placeholder: String)] {
        switch calculator {
        case .brick:
            return [
                ("length", "Wall Length", "m", "10.0"),
                ("height", "Wall Height", "m", "2.5"),
                ("thickness", "Wall Thickness", "mm", "102"),
                ("brickLength", "Brick Length", "mm", "215"),
                ("brickHeight", "Brick Height", "mm", "65"),
                ("mortarThickness", "Mortar Thickness", "mm", "10")
            ]
        case .timber:
            return [
                ("length", "Span Length", "m", "4.0"),
                ("spacing", "Joist Spacing", "mm", "400"),
                ("width", "Room Width", "m", "3.0"),
                ("depth", "Joist Depth", "mm", "47"),
                ("thickness", "Joist Thickness", "mm", "200")
            ]
        case .roofTiles:
            return [
                ("length", "Roof Length", "m", "8.0"),
                ("width", "Roof Width", "m", "6.0"),
                ("pitch", "Roof Pitch", "degrees", "30"),
                ("tileLength", "Tile Length", "mm", "420"),
                ("tileWidth", "Tile Width", "mm", "330"),
                ("overlap", "Tile Overlap", "mm", "75")
            ]
        case .volumetric:
            return [
                ("length", "Length", "m", "3.0"),
                ("width", "Width", "m", "2.0"),
                ("depth", "Depth", "m", "0.15"),
                ("wastage", "Wastage Factor", "%", "10")
            ]
        }
    }
    
    private var canCalculate: Bool {
        return inputFields.allSatisfy { field in
            if let value = inputs[field.key], !value.isEmpty {
                return Double(value) != nil
            }
            return false
        }
    }
    
    // MARK: - Methods
    
    private func calculate() {
        let doubleInputs = inputs.compactMapValues { Double($0) }
        
        switch calculator {
        case .brick:
            calculateBricks(doubleInputs)
        case .timber:
            calculateTimber(doubleInputs)
        case .roofTiles:
            calculateRoofTiles(doubleInputs)
        case .volumetric:
            calculateVolumetric(doubleInputs)
        }
        
        withAnimation(.easeInOut(duration: 0.3)) {
            showingResults = true
        }
    }
    
    private func calculateBricks(_ inputs: [String: Double]) {
        let wallArea = (inputs["length"] ?? 0) * (inputs["height"] ?? 0)
        let brickArea = ((inputs["brickLength"] ?? 0) / 1000) * ((inputs["brickHeight"] ?? 0) / 1000)
        let mortarArea = ((inputs["mortarThickness"] ?? 0) / 1000) * ((inputs["brickLength"] ?? 0) / 1000)
        let effectiveBrickArea = brickArea + mortarArea
        
        let bricksNeeded = wallArea / effectiveBrickArea
        let wasteAllowance = bricksNeeded * 0.05 // 5% waste
        
        results = [
            "bricksNeeded": bricksNeeded,
            "bricksWithWaste": bricksNeeded + wasteAllowance,
            "wallArea": wallArea,
            "mortarRequired": bricksNeeded * 0.02 // Rough estimate
        ]
    }
    
    private func calculateTimber(_ inputs: [String: Double]) {
        let spanLength = inputs["length"] ?? 0
        let spacing = (inputs["spacing"] ?? 0) / 1000 // Convert to meters
        let roomWidth = inputs["width"] ?? 0
        
        let numberOfJoists = Int((roomWidth / spacing) + 1)
        let totalLinearMeters = Double(numberOfJoists) * spanLength
        
        results = [
            "numberOfJoists": Double(numberOfJoists),
            "totalLinearMeters": totalLinearMeters,
            "volume": totalLinearMeters * ((inputs["depth"] ?? 0) / 1000) * ((inputs["thickness"] ?? 0) / 1000)
        ]
    }
    
    private func calculateRoofTiles(_ inputs: [String: Double]) {
        let roofLength = inputs["length"] ?? 0
        let roofWidth = inputs["width"] ?? 0
        let pitch = inputs["pitch"] ?? 0
        
        // Calculate actual roof area considering pitch
        let pitchFactor = 1 / cos(pitch * .pi / 180)
        let roofArea = roofLength * roofWidth * pitchFactor
        
        let tileLength = (inputs["tileLength"] ?? 0) / 1000
        let tileWidth = (inputs["tileWidth"] ?? 0) / 1000
        let overlap = (inputs["overlap"] ?? 0) / 1000
        
        let effectiveTileArea = (tileLength - overlap) * tileWidth
        let tilesNeeded = roofArea / effectiveTileArea
        
        results = [
            "tilesNeeded": tilesNeeded,
            "tilesWithWaste": tilesNeeded * 1.1, // 10% waste
            "roofArea": roofArea,
            "battensRequired": (roofLength / (tileLength - overlap)) * roofWidth
        ]
    }
    
    private func calculateVolumetric(_ inputs: [String: Double]) {
        let volume = (inputs["length"] ?? 0) * (inputs["width"] ?? 0) * (inputs["depth"] ?? 0)
        let wastage = (inputs["wastage"] ?? 0) / 100
        let volumeWithWastage = volume * (1 + wastage)
        
        results = [
            "volume": volume,
            "volumeWithWastage": volumeWithWastage,
            "concreteNeeded": volumeWithWastage,
            "aggregateNeeded": volumeWithWastage * 1.5 // Rough estimate
        ]
    }
    
    private func formatResultKey(_ key: String) -> String {
        switch key {
        case "bricksNeeded": return "Bricks Needed"
        case "bricksWithWaste": return "Bricks (with waste)"
        case "wallArea": return "Wall Area"
        case "mortarRequired": return "Mortar Required"
        case "numberOfJoists": return "Number of Joists"
        case "totalLinearMeters": return "Total Linear Meters"
        case "volume": return "Volume"
        case "volumeWithWastage": return "Volume (with wastage)"
        case "tilesNeeded": return "Tiles Needed"
        case "tilesWithWaste": return "Tiles (with waste)"
        case "roofArea": return "Roof Area"
        case "battensRequired": return "Battens Required"
        case "concreteNeeded": return "Concrete Needed"
        case "aggregateNeeded": return "Aggregate Needed"
        default: return key.capitalized
        }
    }
    
    private func getResultUnit(for key: String) -> String {
        switch key {
        case "bricksNeeded", "bricksWithWaste", "numberOfJoists", "tilesNeeded", "tilesWithWaste":
            return "units"
        case "wallArea", "roofArea":
            return "m²"
        case "volume", "volumeWithWastage", "concreteNeeded", "aggregateNeeded", "mortarRequired":
            return "m³"
        case "totalLinearMeters", "battensRequired":
            return "m"
        default:
            return ""
        }
    }
}

struct InputField: View {
    let title: String
    @Binding var value: String
    let unit: String
    let placeholder: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.subheadline)
                .foregroundColor(.white)
            
            HStack {
                TextField(placeholder, text: $value)
                    .keyboardType(.decimalPad)
                    .foregroundColor(.white)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                
                Text(unit)
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .frame(width: 40, alignment: .leading)
            }
        }
    }
}

struct ResultRow: View {
    let title: String
    let value: Double
    let unit: String
    
    var body: some View {
        HStack {
            Text(title)
                .foregroundColor(.white)
            
            Spacer()
            
            HStack(spacing: 4) {
                Text(String(format: "%.2f", value))
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.green)
                
                Text(unit)
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
        }
        .padding(.vertical, 4)
    }
}

struct SubscriptionPromptView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 16) {
                Image(systemName: "crown.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.green)
                
                Text("Upgrade to Pro")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Text("Access all professional calculators and advanced features")
                    .font(.body)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 12) {
                FeatureRow(icon: "function", title: "All Building Calculators")
                FeatureRow(icon: "folder", title: "Unlimited Projects")
                FeatureRow(icon: "person.2", title: "Team Collaboration")
                FeatureRow(icon: "chart.bar", title: "Advanced Analytics")
            }
            
            VStack(spacing: 12) {
                Button("Upgrade to Pro - £19.99/month") {
                    // TODO: Implement subscription upgrade
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
                
                Button("Maybe Later") {
                    dismiss()
                }
                .foregroundColor(.gray)
            }
        }
        .padding(24)
        .background(Color.black)
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.green)
                .frame(width: 24)
            
            Text(title)
                .foregroundColor(.white)
            
            Spacer()
            
            Image(systemName: "checkmark")
                .foregroundColor(.green)
        }
    }
}

#Preview {
    CalculatorsView()
        .environmentObject(UserManager())
}