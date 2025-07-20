import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LandingLayout from "@/components/landing/LandingLayout";
import { 
  MessageSquare, 
  FileText, 
  Search, 
  Users, 
  Shield, 
  Clock, 
  BookOpen, 
  CheckCircle,
  ArrowRight,
  Zap
} from "lucide-react";

const FeaturesPage = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      description: "Get instant answers to complex building regulation questions with our intelligent AI assistant trained on UK building codes.",
      benefits: [
        "24/7 availability",
        "Instant responses", 
        "Context-aware answers",
        "Multi-language support"
      ]
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Organize, store, and manage all your building regulation documents in one secure, searchable location.",
      benefits: [
        "Cloud storage",
        "Version control",
        "Smart categorization",
        "Easy sharing"
      ]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share projects, assign tasks, and collaborate with team members seamlessly across all your building projects.",
      benefits: [
        "Real-time collaboration",
        "Role-based access",
        "Project timelines",
        "Team notifications"
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find relevant regulations and guidance quickly with AI-powered search capabilities."
    },
    {
      icon: Shield,
      title: "Compliance Tracking",
      description: "Track compliance status and get alerts for upcoming deadlines and requirements."
    },
    {
      icon: Clock,
      title: "Project Timelines",
      description: "Manage project milestones and regulatory approval timelines in one place."
    },
    {
      icon: BookOpen,
      title: "Regulation Library",
      description: "Access the complete UK building regulations library with smart categorization."
    },
    {
      icon: Zap,
      title: "Quick Actions",
      description: "Perform common tasks quickly with smart shortcuts and automation features."
    },
    {
      icon: CheckCircle,
      title: "Compliance Checklist",
      description: "Never miss a requirement with automated compliance checklists for your projects."
    }
  ];

  return (
    <LandingLayout>
      <div className="overflow-y-auto h-full">
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 animate-fade-in">
              Powerful Features for
              <span className="text-primary block">Building Compliance</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
              Discover all the tools and capabilities that make EezyBuild the most comprehensive 
              building regulations assistant for UK construction professionals.
            </p>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Core Features That Drive Results
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to streamline your building regulation workflow
              </p>
            </div>
            
            <div className="space-y-16">
              {mainFeatures.map((feature, index) => (
                <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="mb-6">
                      <div className="inline-flex p-3 bg-primary/20 rounded-full mb-4">
                        <feature.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-muted-foreground mb-6">
                        {feature.description}
                      </p>
                      <ul className="space-y-3">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="text-white">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                      <div className="bg-black/60 rounded-lg p-6 shadow-lg border border-white/5">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <feature.icon className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <span className="font-semibold text-white">{feature.title}</span>
                        </div>
                        <div className="space-y-3">
                          <div className="h-3 bg-white/10 rounded w-full"></div>
                          <div className="h-3 bg-white/10 rounded w-3/4"></div>
                          <div className="h-3 bg-primary/30 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features Grid */}
        <section className="py-20 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Additional Powerful Tools
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Even more features to enhance your building regulation workflow
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {additionalFeatures.map((feature, index) => (
                <Card key={index} className="bg-black/40 border-white/10 hover:border-primary/50 transition-all duration-300 animate-fade-in backdrop-blur-sm">
                  <CardHeader>
                    <div className="mb-2">
                      <div className="inline-flex p-2 bg-primary/20 rounded-lg">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              The EezyBuild Advantage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 rounded-lg bg-black/40 border border-white/10">
                <div className="text-4xl font-bold text-primary mb-2">90%</div>
                <p className="text-muted-foreground">Time Saved on Research</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-black/40 border border-white/10">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">AI Assistant Availability</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-black/40 border border-white/10">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground">UK Regulation Coverage</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Experience All Features Today
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your free trial and discover how EezyBuild can transform your building regulation workflow.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/app')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 font-semibold"
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

export default FeaturesPage;