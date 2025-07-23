import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search, User, Crown, Wrench, Briefcase, ArrowLeft, Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Mock user for demo
const demoUser = {
  id: "demo-user",
  email: "demo@eezybuild.com",
  name: "Demo User",
  subscription: "pro",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo"
};

// Mock subscription for demo
const demoSubscription = {
  plan_type: "pro",
  status: "active"
};

const InteractivePhoneDemo = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Building Regulations assistant. Ask me anything about UK building regulations!",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Demo responses for different questions
  const getDemoResponse = (question: string) => {
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('part a') || lowerQ.includes('structural')) {
      return "Part A covers structural safety requirements. Key provisions include:\n\n• Foundation design must consider ground conditions\n• Load-bearing elements must be adequately sized\n• Stability provisions for walls and roofs\n• Disproportionate collapse resistance for buildings over 4 storeys\n\nWould you like specific guidance on any of these areas?";
    }
    
    if (lowerQ.includes('part l') || lowerQ.includes('energy')) {
      return "Part L focuses on energy efficiency:\n\n• New dwellings must achieve specific SAP ratings\n• Fabric performance standards for walls, roofs, windows\n• Air permeability limits (10 m³/h.m² @ 50Pa for dwellings)\n• Thermal bridging considerations\n\nThe latest 2021 amendments have tightened these requirements significantly.";
    }
    
    if (lowerQ.includes('fire') || lowerQ.includes('part b')) {
      return "Part B covers fire safety requirements:\n\n• Means of escape provisions\n• Fire resistance ratings for elements\n• Compartmentation to limit fire spread\n• Access for fire service\n• Special provisions for high-rise buildings\n\nPost-Grenfell regulations have introduced additional requirements for buildings over 11m.";
    }
    
    if (lowerQ.includes('planning') || lowerQ.includes('permitted development')) {
      return "Planning permission and building regulations are separate:\n\n• Building regulations ensure safety and standards\n• Planning permission covers land use and appearance\n• Some work may need both approvals\n• Permitted development rights may apply for smaller extensions\n\nAlways check with your local authority for specific requirements.";
    }
    
    return "That's a great question! Building regulations cover many areas including structural safety, fire protection, energy efficiency, ventilation, and accessibility. Could you be more specific about which aspect you'd like to know about? For example:\n\n• Structural requirements (Part A)\n• Fire safety (Part B) \n• Energy efficiency (Part L)\n• Ventilation (Part F)\n• Accessibility (Part M)";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getDemoResponse(inputMessage),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const tabs = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'tools', icon: Wrench, label: 'Tools' },
    { id: 'workspace', icon: Briefcase, label: 'Workspace' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'subscription', icon: Crown, label: 'Tiers' }
  ];

  const renderChatContent = () => (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">AI Assistant</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                message.isBot
                  ? 'bg-muted text-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/95 backdrop-blur">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about building regulations..."
            className="flex-1 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            size="sm" 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {["Part A structural", "Fire safety Part B", "Energy efficiency Part L"].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInputMessage(suggestion)}
              className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded text-muted-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderToolsContent = () => (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold mb-4">Building Tools</h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "Foundation Calculator", desc: "Calculate foundation requirements" },
          { name: "Beam Calculator", desc: "Steel and timber beam sizing" },
          { name: "Insulation Calculator", desc: "U-value calculations" },
          { name: "Ventilation Calculator", desc: "Air change requirements" }
        ].map((tool) => (
          <Card key={tool.name} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-3">
              <h3 className="font-medium text-sm">{tool.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderWorkspaceContent = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Workspace</h2>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          New Project
        </Button>
      </div>
      
      <div className="space-y-3">
        {[
          { name: "Residential Extension", type: "House Extension", status: "Active" },
          { name: "Office Building", type: "Commercial", status: "Planning" },
          { name: "Garage Conversion", type: "Conversion", status: "Complete" }
        ].map((project) => (
          <Card key={project.name} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-sm">{project.name}</h3>
                  <p className="text-xs text-muted-foreground">{project.type}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  project.status === 'Active' ? 'bg-green-500/20 text-green-600' :
                  project.status === 'Planning' ? 'bg-yellow-500/20 text-yellow-600' :
                  'bg-gray-500/20 text-gray-600'
                }`}>
                  {project.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProfileContent = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <img 
          src={demoUser.avatar} 
          alt="Profile" 
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h3 className="font-medium">{demoUser.name}</h3>
          <p className="text-sm text-muted-foreground">{demoUser.email}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {[
          "Account Settings",
          "Notification Preferences", 
          "Usage Statistics",
          "Help & Support",
          "Privacy Policy"
        ].map((item) => (
          <div key={item} className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubscriptionContent = () => (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold mb-4">Subscription Plans</h2>
      
      <div className="space-y-3">
        {[
          { name: "EezyBuild", price: "£9.99/month", features: ["AI Chat", "Basic Tools", "5 Projects"], current: false },
          { name: "Pro", price: "£19.99/month", features: ["Everything in EezyBuild", "Advanced Tools", "Unlimited Projects"], current: true },
          { name: "ProMax", price: "£39.99/month", features: ["Everything in Pro", "Advanced Search", "Team Collaboration"], current: false }
        ].map((plan) => (
          <Card key={plan.name} className={`${plan.current ? 'border-primary' : ''}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{plan.name}</h3>
                {plan.current && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{plan.price}</p>
              <ul className="text-xs space-y-1">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return renderChatContent();
      case 'tools':
        return renderToolsContent();
      case 'workspace':
        return renderWorkspaceContent();
      case 'profile':
        return renderProfileContent();
      case 'subscription':
        return renderSubscriptionContent();
      default:
        return renderChatContent();
    }
  };

  return (
    <div className="relative max-w-sm mx-auto">
      {/* iPhone Frame */}
      <div className="relative bg-black rounded-[2.5rem] p-2 shadow-2xl">
        {/* Phone Screen */}
        <div className="bg-background rounded-[2rem] overflow-hidden h-[600px] w-[300px] relative flex flex-col">
          {/* Status Bar */}
          <div className="flex justify-between items-center px-6 py-2 text-xs text-muted-foreground bg-background">
            <span>9:41</span>
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-foreground rounded-full"></div>
                <div className="w-1 h-1 bg-foreground rounded-full"></div>
                <div className="w-1 h-1 bg-foreground rounded-full"></div>
              </div>
              <div className="w-4 h-2 border border-foreground rounded-sm">
                <div className="w-3 h-1 bg-green-500 rounded-sm m-0.5"></div>
              </div>
            </div>
          </div>

          {/* App Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">E</span>
              </div>
              <span className="font-bold text-sm">EEZYBUILD</span>
            </div>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Pro</span>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-around py-2 border-t border-border bg-background/95 backdrop-blur">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center p-2 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Demo Label */}
      <div className="absolute -bottom-6 left-0 right-0 text-center">
        <p className="text-sm text-muted-foreground">Interactive Demo - Try the features!</p>
      </div>
    </div>
  );
};

export default InteractivePhoneDemo;