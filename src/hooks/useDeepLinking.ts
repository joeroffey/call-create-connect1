import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nativeCapabilities } from '@/services/nativeCapabilities';

export const useDeepLinking = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let urlListener: (() => void) | null = null;

    if (nativeCapabilities.isNative) {
      // Set up URL listener for deep links
      urlListener = nativeCapabilities.addUrlOpenListener((url: string) => {
        handleDeepLink(url);
      });

      console.log('Deep linking initialized for mobile app');
    } else {
      // Handle web-based deep linking via URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const deepLink = urlParams.get('link');
      
      if (deepLink) {
        try {
          const decodedLink = decodeURIComponent(deepLink);
          handleDeepLink(decodedLink);
          
          // Clean up URL parameters
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } catch (error) {
          console.warn('Error handling web deep link:', error);
        }
      }
    }

    // Cleanup
    return () => {
      if (urlListener) {
        urlListener();
      }
    };
  }, [navigate]);

  const handleDeepLink = (url: string) => {
    try {
      console.log('Handling deep link:', url);
      
      // Parse the URL
      const urlObj = new URL(url);
      let path = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      // Handle different URL schemes
      if (urlObj.protocol === 'eezybuild:') {
        // Custom scheme: eezybuild://profile/123
        path = urlObj.pathname || urlObj.hostname;
      } else if (urlObj.protocol === 'https:' && urlObj.hostname === 'eezybuild.com') {
        // HTTPS scheme: https://eezybuild.com/profile/123
        path = urlObj.pathname;
      }

      // Route to appropriate page based on path
      if (path.startsWith('/')) {
        path = path.substring(1); // Remove leading slash
      }

      // Handle specific routes
      if (path === '' || path === '/') {
        navigate('/');
      } else if (path.startsWith('profile/')) {
        const profileId = path.split('/')[1];
        navigate(`/profile/${profileId}`);
      } else if (path.startsWith('notifications')) {
        navigate('/notifications');
      } else if (path.startsWith('team-invite')) {
        const token = searchParams.get('token');
        if (token) {
          navigate(`/team-invite?token=${token}`);
        } else {
          navigate('/team-invite');
        }
      } else if (path.startsWith('password-reset')) {
        const token = searchParams.get('token');
        if (token) {
          navigate(`/password-reset?token=${token}`);
        } else {
          navigate('/password-reset');
        }
      } else if (path.startsWith('project/')) {
        const projectId = path.split('/')[1];
        if (projectId) {
          // Navigate to main app and let it handle project opening
          navigate(`/?project=${projectId}`);
        } else {
          navigate('/');
        }
      } else if (path.startsWith('chat/')) {
        const conversationId = path.split('/')[1];
        if (conversationId) {
          navigate(`/?conversation=${conversationId}`);
        } else {
          navigate('/');
        }
      } else {
        // Fallback: try to navigate to the path directly
        navigate(`/${path}`);
      }

      // Provide haptic feedback on successful deep link handling (mobile only)
      if (nativeCapabilities.isNative) {
        nativeCapabilities.lightImpact();
      }

    } catch (error) {
      console.error('Error handling deep link:', error);
      
      // Fallback to home page
      navigate('/');
      
      // Provide error feedback on mobile
      if (nativeCapabilities.isNative) {
        nativeCapabilities.errorFeedback();
      }
    }
  };

  // Utility function to create deep links
  const createDeepLink = (path: string, params?: Record<string, string>) => {
    const baseUrl = nativeCapabilities.isNative 
      ? 'eezybuild://' 
      : 'https://eezybuild.com/';
    
    let fullPath = path.startsWith('/') ? path.substring(1) : path;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      fullPath += `?${searchParams.toString()}`;
    }
    
    return `${baseUrl}${fullPath}`;
  };

  // Share a deep link (for native sharing)
  const shareDeepLink = async (path: string, params?: Record<string, string>, title?: string) => {
    const link = createDeepLink(path, params);
    
    if (nativeCapabilities.isNative && navigator.share) {
      try {
        await navigator.share({
          title: title || 'EezyBuild',
          url: link,
        });
        
        // Provide success feedback
        nativeCapabilities.successFeedback();
      } catch (error) {
        console.error('Error sharing deep link:', error);
        
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(link);
        nativeCapabilities.warningFeedback();
      }
    } else {
      // Web fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(link);
        console.log('Deep link copied to clipboard:', link);
      } catch (error) {
        console.error('Error copying deep link to clipboard:', error);
      }
    }
  };

  return {
    createDeepLink,
    shareDeepLink,
    handleDeepLink,
  };
};

export default useDeepLinking;