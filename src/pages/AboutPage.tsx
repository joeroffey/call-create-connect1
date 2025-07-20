
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LandingLayout from "@/components/landing/LandingLayout";
import { Target, Users, Award, ArrowRight } from "lucide-react";

const AboutPage = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To simplify UK building regulations and make compliance accessible to everyone in the construction industry."
    },
    {
      icon: Users,
      title: "Our Team",
      description: "Expert building professionals and AI specialists working together to revolutionize regulatory compliance."
    },
    {
      icon: Award,
      title: "Our Commitment",
      description: "Providing accurate, up-to-date information and exceptional support to help you succeed in your projects."
    }
  ];

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 animate-fade-in">
            About EezyBuild
          </h1>
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
            We're transforming how construction professionals navigate UK building regulations 
            through innovative AI technology and expert knowledge.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <p className="text-muted-foreground mb-6">
              EezyBuild was born from the frustration experienced by countless construction professionals 
              who spend hours navigating complex building regulations. We recognized that accessing 
              accurate, relevant information about UK building codes shouldn't be a barrier to 
              successful project completion.
            </p>
            <p className="text-muted-foreground mb-6">
              Our team combines deep expertise in UK building regulations with cutting-edge AI technology 
              to create an intelligent assistant that understands your specific needs and provides 
              instant, accurate guidance.
            </p>
            <p className="text-muted-foreground">
              Today, EezyBuild serves thousands of construction professionals, from independent builders 
              to large construction firms, helping them save time, reduce risks, and ensure compliance 
              with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              What Drives Us
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our core values guide everything we do and shape how we serve our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-card border-border text-center animate-fade-in">
                <CardContent className="p-8">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Built by Experts, For Experts
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Our team includes qualified building control professionals, experienced construction 
            managers, and AI specialists who understand both the technical requirements and 
            practical challenges of building regulation compliance.
          </p>
          <div className="bg-card border border-border rounded-2xl p-8">
            <blockquote className="text-lg text-muted-foreground italic mb-4">
              "We've walked in your shoes. We understand the pressure of deadlines, the complexity 
              of regulations, and the importance of getting it right the first time."
            </blockquote>
            <cite className="text-foreground font-semibold">- The EezyBuild Team</cite>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join our community of construction professionals who trust EezyBuild 
            for their building regulation needs.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/app')}
            className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-4"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </LandingLayout>
  );
};

export default AboutPage;
