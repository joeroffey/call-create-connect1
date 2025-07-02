import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate } from 'react-router-dom';

export const useDeepLinking = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle app launch with URL
    App.addListener('appUrlOpen', (event) => {
      console.log('Deep link received:', event.url);
      
      // Parse the URL to extract the path and query parameters
      try {
        const url = new URL(event.url);
        const path = url.pathname;
        const search = url.search;
        
        console.log('Navigating to:', path + search);
        
        // Navigate to the appropriate route
        navigate(path + search);
      } catch (error) {
        console.error('Error parsing deep link URL:', error);
      }
    });

    // Check if app was launched with a URL
    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        console.log('App launched with URL:', result.url);
        
        try {
          const url = new URL(result.url);
          const path = url.pathname;
          const search = url.search;
          
          console.log('Initial navigation to:', path + search);
          
          // Navigate to the appropriate route
          navigate(path + search);
        } catch (error) {
          console.error('Error parsing launch URL:', error);
        }
      }
    });

    return () => {
      App.removeAllListeners();
    };
  }, [navigate]);
};