
import React, { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NotificationsPage from "./pages/NotificationsPage";
import TeamInvitePage from "./pages/TeamInvitePage";
import PasswordResetPage from "./pages/PasswordResetPage";
import { ENVIRONMENT, initializeViewportCSS } from "./utils/environment";
import { MobileNativeEnhancer } from "./components/MobileNativeEnhancer";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize viewport CSS custom properties
    initializeViewportCSS();
    
    // Add platform-specific classes to body
    const body = document.body;
    const html = document.documentElement;
    
    // Remove any existing platform classes
    body.className = body.className.replace(/\b(mobile-app|mobile-browser|desktop-browser)\b/g, '').trim();
    html.className = html.className.replace(/\b(mobile-app|mobile-browser|desktop-browser)\b/g, '').trim();
    
    // Add appropriate platform class
    if (ENVIRONMENT.IS_MOBILE_APP) {
      body.classList.add('mobile-app');
      html.classList.add('mobile-app');
    } else if (ENVIRONMENT.IS_MOBILE_BROWSER) {
      body.classList.add('mobile-browser');
      html.classList.add('mobile-browser');
    } else {
      body.classList.add('desktop-browser');
      html.classList.add('desktop-browser');
    }
    
    // Add PWA detection
    if (ENVIRONMENT.IS_PWA) {
      body.classList.add('is-pwa');
    }
    
    // Add visual viewport support detection
    if (window.visualViewport) {
      body.classList.add('visual-viewport-support');
    }
    
    console.log('Environment initialized:', {
      IS_MOBILE_APP: ENVIRONMENT.IS_MOBILE_APP,
      IS_MOBILE_BROWSER: ENVIRONMENT.IS_MOBILE_BROWSER,
      IS_DESKTOP_BROWSER: ENVIRONMENT.IS_DESKTOP_BROWSER,
      IS_PWA: ENVIRONMENT.IS_PWA,
      userAgent: navigator.userAgent
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MobileNativeEnhancer 
          enableHaptics={true}
          enableKeyboardOptimization={true}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/team-invite" element={<TeamInvitePage />} />
              <Route path="/password-reset" element={<PasswordResetPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MobileNativeEnhancer>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
