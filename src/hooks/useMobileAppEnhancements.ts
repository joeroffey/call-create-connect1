import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import nativeCapabilities from '@/services/nativeCapabilities';

/**
 * useMobileAppEnhancements
 *
 * Centralised hook that enables a set of native–only behaviours which
 * greatly improve the "feel" of the Capacitor wrapped application while **not**
 * touching the regular web experience.
 *
 * 1. Android hardware back–button navigation that mirrors browser history.
 * 2. Automatic scroll-into-view & body class toggling when the soft-keyboard
 *    appears / disappears.
 * 3. Lightweight haptic feedback for every primary tap-interaction.
 */
export const useMobileAppEnhancements = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!nativeCapabilities.isNative) {
      return;
    }

    /* ───────────────────────── Android BACK button ───────────────────────── */
    let backListener: { remove: () => void } | undefined;
    App.addListener('backButton', () => {
      // If we have a navigation stack to go back to, use it first.
      if (window.history.length > 1) {
        // Browser-style back navigation keeps query-params, etc.
        navigate(-1);
      } else {
        // At root – allow the OS to minimise / close the app.
        App.exitApp();
      }
    }).then(handle => {
      backListener = handle;
    });

    /* ───────────────────────── Keyboard visibility ───────────────────────── */
    let kbShow: { remove: () => void } | undefined;
    let kbHide: { remove: () => void } | undefined;

    const addKeyboardPadding = (keyboardHeight: number) => {
      // Dynamically expose the keyboard height for CSS (`env(keyboard-inset-height)`
      // is still experimental on Android web-view).
      document.body.style.setProperty('--keyboard-offset', `${keyboardHeight}px`);
      document.body.classList.add('keyboard-visible');
      // Ensure the focused element is not obscured.
      const el = document.activeElement as HTMLElement | null;
      if (el && typeof el.scrollIntoView === 'function') {
        // Give the web-view a frame to recalc layout first.
        setTimeout(() => {
          try {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch {
            /* silence */
          }
        }, 50);
      }
    };

    const removeKeyboardPadding = () => {
      document.body.classList.remove('keyboard-visible');
      document.body.style.removeProperty('--keyboard-offset');
    };

    Keyboard.addListener('keyboardWillShow', (info) => {
      addKeyboardPadding(info.keyboardHeight ?? 0);
    }).then(handle => { kbShow = handle; });

    Keyboard.addListener('keyboardWillHide', () => {
      removeKeyboardPadding();
    }).then(handle => { kbHide = handle; });

    /* ───────────────────────── Global haptic feedback ─────────────────────── */
    const tapHandler = (e: Event) => {
      // Only trigger for obvious interactive elements.
      const target = (e.target as HTMLElement)?.closest('button, a, [role="button"], [data-haptic]');
      if (target) {
        nativeCapabilities.lightImpact();
      }
    };
    document.addEventListener('pointerdown', tapHandler, { passive: true });

    /* ───────────────────────── CLEAN-UP ───────────────────────── */
    return () => {
      backListener?.remove();
      kbShow?.remove();
      kbHide?.remove();
      document.removeEventListener('pointerdown', tapHandler);
    };
  // Re-run if route changes so that navigate() reference stays fresh.
  }, [navigate, location]);
};

export default useMobileAppEnhancements;