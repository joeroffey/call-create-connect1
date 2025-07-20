
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LandingLayout from "@/components/landing/LandingLayout";
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-muted/20 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              Your AI-Powered
              <span className="text-primary block">Building Regulations</span>
              Assistant
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in">
              Navigate UK building regulations with confidence. Get instant answers, manage documents, 
              and ensure compliance with our intelligent AI assistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button 
                size="lg" 
                onClick={() => navigate('/app')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/features')}
                className="text-lg px-8 py-4"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Building Compliance
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your building regulation workflow with powerful AI-driven tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow duration-300 animate-fade-in">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Why Choose EezyBuild?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of construction professionals who trust EezyBuild to navigate 
                UK building regulations efficiently and accurately.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-lg text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 border border-border">
                <div className="bg-card rounded-lg p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold">Building Regulations Query</span>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "What are the requirements for Part L energy efficiency in new residential builds?"
                  </p>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-sm text-foreground">
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
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Simplify Building Regulations?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Start your free trial today and experience the power of AI-assisted building compliance.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/app')}
            className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-4"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </LandingLayout>
  );
};

export default LandingPage;
