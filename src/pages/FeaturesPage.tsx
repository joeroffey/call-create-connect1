import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LandingLayout from "@/components/landing/LandingLayout";
import { 
  Building2, 
  FolderOpen, 
  Calendar, 
  Users, 
  BarChart3, 
  Clock, 
  FileText, 
  CheckCircle,
  ArrowRight,
  Brain,
  Layout,
  Target,
  GitBranch
} from "lucide-react";

const FeaturesPage = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: Layout,
      title: "Individual & Team Workspaces",
      description: "Create dedicated workspaces for personal projects or collaborate with your team in shared workspaces. Switch seamlessly between individual and team environments.",
      benefits: [
        "Personal workspace for individual projects",
        "Team workspaces for collaborative work",
        "Role-based access control",
        "Seamless workspace switching"
      ]
    },
    {
      icon: Building2,
      title: "Project Management",
      description: "Organize and manage all your construction projects with comprehensive project tracking, status updates, and milestone management.",
      benefits: [
        "Complete project lifecycle management",
        "Status tracking and updates",
        "Project milestone management",
        "Team collaboration within projects"
      ]
    },
    {
      icon: FileText,
      title: "Document Management & AI Analysis",
      description: "Store, organize, and analyze all your project documents with AI-powered insights. Upload completion documents and get intelligent analysis.",
      benefits: [
        "Secure cloud document storage",
        "AI-powered document analysis",
        "Completion document management",
        "Smart categorization and search"
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: Calendar,
      title: "Schedule Management",
      description: "Create and manage detailed project schedules with task assignments, deadlines, and progress tracking."
    },
    {
      icon: Clock,
      title: "Project Timelines",
      description: "Visualize project timelines with Gantt charts, milestone tracking, and deadline management."
    },
    {
      icon: BarChart3,
      title: "Widget Statistics",
      description: "Get real-time insights with customizable dashboard widgets showing project progress and team performance."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Collaborate seamlessly with team members through shared workspaces, comments, and real-time updates."
    },
    {
      icon: FolderOpen,
      title: "Completion Documents",
      description: "Manage project completion documentation with structured folders and automated organization."
    },
    {
      icon: Brain,
      title: "AI Document Analysis",
      description: "Get intelligent insights and analysis from your uploaded documents using advanced AI technology."
    }
  ];

  return (
    <LandingLayout>
      <div>
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 animate-fade-in">
              Complete Project Management
              <span className="text-primary block">& Team Collaboration</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
              Discover all the tools and capabilities that make our platform the most comprehensive 
              project management solution for construction teams and professionals.
            </p>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Core Features That Drive Productivity
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage projects, collaborate with teams, and track progress
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
                Advanced Project Tools
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Enhanced features to optimize your project management and team collaboration
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
              The Platform Advantage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 rounded-lg bg-black/40 border border-white/10">
                <div className="text-4xl font-bold text-primary mb-2">85%</div>
                <p className="text-muted-foreground">Faster Project Setup</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-black/40 border border-white/10">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Team Collaboration</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-black/40 border border-white/10">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground">Project Visibility</p>
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
              Start your free trial and discover how our platform can transform your project management workflow.
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