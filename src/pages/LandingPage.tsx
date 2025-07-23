import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LandingLayout from "@/components/landing/LandingLayout";
import InteractivePhoneDemo from "@/components/landing/InteractivePhoneDemo";
import { BookOpen, Shield, Zap, Users, CheckCircle, ArrowRight } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "UK Building Regulations Expert",
      description: "AI-powered guidance on all UK building regulations, codes, and compliance requirements."
    },
    {
      icon: BookOpen,
      title: "Document Management",
      description: "Organize, track, and manage all your building regulation documents in one place."
    },
    {
      icon: Zap,
      title: "Instant Answers",
      description: "Get immediate answers to complex building regulation questions with AI assistance."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share projects and collaborate with your team members seamlessly."
    }
  ];

  const benefits = [
    "Save hours of research time",
    "Reduce compliance risks",
    "Stay updated with latest regulations",
    "Professional documentation support",
    "Expert AI guidance 24/7"
  ];

  return (
    <LandingLayout>
      <div className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 animate-fade-in">
                  Your AI-Powered
                  <span className="text-primary block mt-2">Building Regulations</span>
                  Assistant
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 animate-fade-in leading-relaxed">
                  Navigate UK building regulations with confidence. Get instant answers, manage documents, 
                  and ensure compliance with our intelligent AI assistant.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/app')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold w-full sm:w-auto"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/features')}
                    className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
              
              {/* Right Column - Interactive Phone Demo */}
              <div className="flex justify-center lg:justify-end mt-8 lg:mt-0 animate-fade-in">
                <InteractivePhoneDemo />
              </div>
            </div>
          </div>
        </section>


        {/* Features Section */}
        <section className="py-16 sm:py-20 bg-black/20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Everything You Need for Building Compliance
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Streamline your building regulation workflow with powerful AI-driven tools
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-black/40 border-white/10 hover:border-primary/50 transition-all duration-300 animate-fade-in backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="p-3 bg-primary/20 rounded-full">
                        <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                How EezyBuild Works
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes with our simple three-step process
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <span className="text-xl sm:text-2xl font-bold text-primary-foreground">1</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Ask Your Question</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Simply type your building regulation question in plain English. Our AI understands context and technical terminology.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <span className="text-xl sm:text-2xl font-bold text-primary-foreground">2</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Get Instant Answers</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Receive detailed, accurate responses based on the latest UK building regulations and approved documents.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <span className="text-xl sm:text-2xl font-bold text-primary-foreground">3</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Stay Compliant</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Use our tools to manage documents, track compliance, and ensure your projects meet all requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
                  Why Choose EezyBuild?
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8">
                  Streamline your building regulation compliance with our comprehensive AI-powered platform.
                </p>
                <ul className="space-y-3 sm:space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                      <span className="text-base sm:text-lg text-white">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                  <div className="bg-black/60 rounded-lg p-4 sm:p-6 shadow-lg border border-white/5">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                      </div>
                      <span className="font-semibold text-white text-sm sm:text-base">Building Regulations Query</span>
                    </div>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                      "What are the requirements for Part L energy efficiency in new residential builds?"
                    </p>
                    <div className="bg-primary/10 rounded-lg p-3 sm:p-4 border border-primary/20">
                      <p className="text-xs sm:text-sm text-white">
                        Part L of the Building Regulations covers energy efficiency and requires new dwellings to achieve specific SAP ratings...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-primary/10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Simplify Building Regulations?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8">
              Start your free trial today and experience the power of AI-assisted building compliance.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/app')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold w-full sm:w-auto"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default LandingPage;