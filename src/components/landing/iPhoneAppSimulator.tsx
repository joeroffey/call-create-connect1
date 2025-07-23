import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Index from "@/pages/Index";

const iPhoneAppSimulator = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add demo mode to body to help with styling if needed
    document.body.classList.add('demo-mode');
    setIsLoaded(true);
    
    return () => {
      document.body.classList.remove('demo-mode');
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="relative max-w-sm mx-auto">
        <div className="relative bg-black rounded-[2.5rem] p-2 shadow-2xl">
          <div className="bg-background rounded-[2rem] overflow-hidden h-[700px] w-[350px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-sm mx-auto">
      {/* iPhone 14 Pro Frame */}
      <div className="relative bg-black rounded-[2.5rem] p-2 shadow-2xl">
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-full z-50"></div>
        
        {/* Phone Screen */}
        <div className="bg-background rounded-[2rem] overflow-hidden h-[700px] w-[350px] relative">
          {/* Embedded Real App */}
          <div className="h-full w-full scale-[0.85] origin-top-left transform-gpu">
            <div className="h-[824px] w-[412px] overflow-hidden">
              <Index />
            </div>
          </div>
        </div>
      </div>

      {/* Demo Labels */}
      <div className="absolute -bottom-12 left-0 right-0 text-center space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center space-x-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-muted-foreground">Live Demo - Real App</p>
        </motion.div>
        <p className="text-xs text-muted-foreground/70">
          Fully functional EezyBuild experience
        </p>
      </div>
    </div>
  );
};

export default iPhoneAppSimulator;