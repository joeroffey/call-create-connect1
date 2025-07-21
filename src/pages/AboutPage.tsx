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
      description: "Placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder."
    },
    {
      icon: Users,
      title: "Our Team",
      description: "Placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder."
    },
    {
      icon: Award,
      title: "Our Commitment",
      description: "Placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder."
    }
  ];

  return (
    <LandingLayout>
      <div>
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 animate-fade-in">
              About EezyBuild
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
              Placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder 
              placeholder placeholder placeholder placeholder placeholder placeholder.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-6">
                Placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder 
                placeholder placeholder placeholder placeholder placeholder placeholder. Placeholder placeholder placeholder placeholder 
                placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder 
                placeholder placeholder placeholder.
              </p>
              <p className="text-muted-foreground mb-6">
                Placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder 
                placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder 
                placeholder placeholder placeholder.
              </p>
              <p className="text-muted-foreground">
                Placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder 
                placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder 
                placeholder placeholder.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                What Drives Us
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="bg-black/40 border-white/10 text-center animate-fade-in backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="mb-6 flex justify-center">
                      <div className="p-4 bg-primary/20 rounded-full">
                        <value.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">
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
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Built by Experts, For Experts
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder 
              placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder 
              placeholder placeholder placeholder placeholder placeholder.
            </p>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <blockquote className="text-lg text-muted-foreground italic mb-4">
                "Placeholder placeholder placeholder placeholder. Placeholder placeholder placeholder placeholder placeholder placeholder 
                placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder."
              </blockquote>
              <cite className="text-white font-semibold">- Placeholder Placeholder Placeholder</cite>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Placeholder placeholder placeholder placeholder placeholder placeholder placeholder placeholder.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/app')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 font-semibold"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default AboutPage;