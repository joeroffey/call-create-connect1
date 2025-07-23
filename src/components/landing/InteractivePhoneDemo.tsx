import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Home, MessageSquare, Search, Wrench, Building, User } from "lucide-react";

const InteractivePhoneDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState("");

  const demoSteps = [
    {
      title: "Ask Questions",
      description: "Type any building regulation question",
      inputPlaceholder: "What are Part A structural requirements?",
      response: "Part A covers structural safety requirements for buildings. Key aspects include foundation design, load-bearing elements, and stability provisions..."
    },
    {
      title: "Get Instant Answers",
      description: "AI provides detailed regulation guidance",
      inputPlaceholder: "Fire safety requirements for stairs?",
      response: "Part B fire safety regulations require stairs to have minimum widths, protected routes, and specific fire resistance ratings depending on building height..."
    },
    {
      title: "Manage Projects",
      description: "Upload and organize your documents",
      inputPlaceholder: "How do I calculate ventilation rates?",
      response: "Part F ventilation requirements specify minimum air change rates. For dwellings, you'll need 0.5 air changes per hour for background ventilation..."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const currentDemo = demoSteps[currentStep];

  return (
    <div className="relative max-w-sm mx-auto">
      {/* Phone Frame */}
      <div className="relative bg-black rounded-[2.5rem] p-2 shadow-2xl">
        {/* Phone Screen */}
        <div className="bg-background rounded-[2rem] overflow-hidden h-[600px] w-[300px] relative">
          {/* Status Bar */}
          <div className="flex justify-between items-center px-6 py-2 text-xs text-muted-foreground bg-background">
            <span>9:41</span>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-2 border border-muted-foreground rounded-sm">
                <div className="w-3 h-1 bg-primary rounded-sm"></div>
              </div>
              <span>100%</span>
            </div>
          </div>

          {/* App Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-2">
              <Building className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">EEZYBUILD</span>
            </div>
            <span className="text-xs bg-muted px-2 py-1 rounded-full">Free</span>
          </div>

          {/* Workspace Header */}
          <div className="px-4 py-2 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Workspace:</span>
              <span className="text-sm">Personal ▼</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-background border-b border-border">
            <div className="flex-1 text-center py-3 text-sm text-muted-foreground">
              Overview
            </div>
            <div className="flex-1 text-center py-3 text-sm text-muted-foreground">
              Projects  
            </div>
            <div className="flex-1 text-center py-3 text-sm bg-primary text-primary-foreground rounded-t-lg">
              Chat
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto h-[300px]">
            {/* Demo Question */}
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg max-w-[80%] text-sm">
                {currentDemo.inputPlaceholder}
              </div>
            </div>

            {/* AI Response */}
            <div className="flex justify-start">
              <div className="bg-muted px-3 py-2 rounded-lg max-w-[80%] text-sm">
                {isTyping ? (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                ) : (
                  currentDemo.response
                )}
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about building regulations..."
                className="flex-1 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                size="sm" 
                onClick={handleSendMessage}
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-around py-2 border-t border-border bg-background">
            <div className="flex flex-col items-center p-2 text-muted-foreground">
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">Home</span>
            </div>
            <div className="flex flex-col items-center p-2 text-primary">
              <MessageSquare className="h-5 w-5 mb-1" />
              <span className="text-xs">Chat</span>
            </div>
            <div className="flex flex-col items-center p-2 text-muted-foreground">
              <Search className="h-5 w-5 mb-1" />
              <span className="text-xs">Search</span>
            </div>
            <div className="flex flex-col items-center p-2 text-muted-foreground">
              <Wrench className="h-5 w-5 mb-1" />
              <span className="text-xs">Tools</span>
            </div>
            <div className="flex flex-col items-center p-2 text-muted-foreground">
              <User className="h-5 w-5 mb-1" />
              <span className="text-xs">Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Step Indicator */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <div className="flex justify-center space-x-2 mb-2">
          {demoSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{currentDemo.title}</p>
      </div>
    </div>
  );
};

export default InteractivePhoneDemo;