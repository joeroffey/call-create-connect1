
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LandingLayoutProps {
  children: React.ReactNode;
}

const LandingLayout = ({ children }: LandingLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-foreground font-inter flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-10 h-10 flex items-center">
                  <img 
                    src="/lovable-uploads/60efe7f3-1624-45e4-bea6-55cacb90fa21.png" 
                    alt="EezyBuild" 
                    className="w-full h-full object-contain hover:opacity-80 transition-opacity"
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/about" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </Link>
            </nav>

            {/* Sign In Button */}
            <div className="flex items-center">
              <Button 
                onClick={() => navigate('/app')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 flex-1 overflow-y-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 mr-3">
                  <img 
                    src="/lovable-uploads/60efe7f3-1624-45e4-bea6-55cacb90fa21.png" 
                    alt="EezyBuild" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <p className="text-muted-foreground max-w-md">
                Your AI-powered assistant for UK building regulations. Simplifying construction compliance and documentation.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/app" className="text-muted-foreground hover:text-primary transition-colors">Get Started</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><a href="mailto:support@eezybuild.co.uk" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 EezyBuild. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;
