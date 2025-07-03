import { useState, useEffect } from 'react';

interface PlatformInfo {
  isCapacitor: boolean;
  isMobileBrowser: boolean;
  isDesktop: boolean;
  platform: 'ios' | 'android' | 'web' | 'desktop';
}

export const usePlatformDetection = (): PlatformInfo => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    isCapacitor: false,
    isMobileBrowser: false,
    isDesktop: false,
    platform: 'web'
  });

  useEffect(() => {
    const detectPlatform = () => {
      // Check if running in Capacitor
      const isCapacitor = !!(window as any).Capacitor;
      
      // Mobile device detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768;
      
      // More specific mobile browser detection (excluding tablets)
      const isMobileBrowser = isMobile && !isTablet && !isCapacitor;
      
      // Desktop detection
      const isDesktop = !isMobile || isTablet;
      
      // Platform detection
      let platform: 'ios' | 'android' | 'web' | 'desktop' = 'web';
      
      if (isCapacitor) {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          platform = 'ios';
        } else if (/Android/.test(navigator.userAgent)) {
          platform = 'android';
        }
      } else if (isDesktop) {
        platform = 'desktop';
      }

      setPlatformInfo({
        isCapacitor,
        isMobileBrowser,
        isDesktop,
        platform
      });
    };

    detectPlatform();
    
    // Listen for window resize to handle orientation changes
    window.addEventListener('resize', detectPlatform);
    
    return () => {
      window.removeEventListener('resize', detectPlatform);
    };
  }, []);

  return platformInfo;
};