import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LandingLayout from "@/components/landing/LandingLayout";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <LandingLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Landing Page Temporarily Hidden
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            The landing page content is currently disabled for development purposes.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/app')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Go to App
          </Button>
        </div>
      </div>
    </LandingLayout>
  );
};

export default LandingPage;