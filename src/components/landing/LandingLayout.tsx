import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface LandingLayoutProps {
  children: React.ReactNode;
}

const LandingLayout = ({ children }: LandingLayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Set body class for landing pages to enable scrolling
    document.body.classList.remove('app-mode');
    document.body.classList.add('landing-mode');
    
    return () => {
      // Cleanup on unmount
      document.body.classList.remove('landing-mode');
      document.body.classList.add('app-mode');
    };
  }, []);

  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-foreground font-inter">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-40 h-24 flex items-center">
                  <img 
                    src="/lovable-uploads/60efe7f3-1624-45e4-bea6-55cacb90fa21.png" 
                    alt="Logo" 
                    className="w-full h-full object-contain hover:opacity-80 transition-opacity"
                  />
                </div>
              </Link>
            </div>

            {/* Right side - Hamburger Menu and Sign In */}
            <div className="flex items-center space-x-4">
              {/* Sign In Button */}
              <Button 
                onClick={() => navigate('/app')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm sm:text-base px-3 sm:px-4"
              >
                Sign In
              </Button>

              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Overlay - Show on all screen sizes when menu is open */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={closeMenu}
          />
          
          {/* Menu Panel - Responsive width and positioning */}
          <div className="fixed top-16 right-0 w-64 md:w-80 h-full bg-black/95 backdrop-blur-lg border-l border-white/10 animate-slide-in-right">
            <nav className="flex flex-col p-6 space-y-4">
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-primary transition-colors py-2 story-link"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className="text-muted-foreground hover:text-primary transition-colors py-2 story-link"
                onClick={closeMenu}
              >
                Features
              </Link>
              <Link 
                to="/subscriptions" 
                className="text-muted-foreground hover:text-primary transition-colors py-2 story-link"
                onClick={closeMenu}
              >
                Subscriptions
              </Link>
              <Link 
                to="/about" 
                className="text-muted-foreground hover:text-primary transition-colors py-2 story-link"
                onClick={closeMenu}
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-16">
        {children}
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