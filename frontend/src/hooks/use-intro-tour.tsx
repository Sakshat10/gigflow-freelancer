import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';

export type TourStep = {
  element: string;
  intro: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'auto';
  title?: string;
};

export type TourConfig = {
  steps: TourStep[];
  initialStep?: number;
  enabled: boolean;
  onComplete?: () => void;
  onExit?: () => void;
  options?: {
    doneLabel?: string;
    nextLabel?: string;
    prevLabel?: string;
    skipLabel?: string;
    hidePrev?: boolean;
    hideNext?: boolean;
    exitOnEsc?: boolean;
    exitOnOverlayClick?: boolean;
    showStepNumbers?: boolean;
    keyboardNavigation?: boolean;
    showButtons?: boolean;
    showBullets?: boolean;
    showProgress?: boolean;
    scrollToElement?: boolean;
    overlayOpacity?: number;
    disableInteraction?: boolean;
  };
};

const defaultOptions = {
  doneLabel: 'Finish',
  nextLabel: 'Next',
  prevLabel: 'Back',
  skipLabel: 'Skip',
  hidePrev: false,
  exitOnEsc: true,
  exitOnOverlayClick: true,
  showStepNumbers: false,
  keyboardNavigation: true,
  showButtons: true,
  showBullets: true,
  showProgress: false,
  scrollToElement: true,
  overlayOpacity: 0.8,
  disableInteraction: false,
};

export const useIntroTour = (tourKey: string) => {
  const [tourConfig, setTourConfig] = useState<TourConfig>({
    steps: [],
    enabled: false,
    initialStep: 0,
    options: defaultOptions,
  });
  
  const location = useLocation();
  
  // Check localStorage for tour status
  const hasSeenTour = localStorage.getItem(`tour_completed_${tourKey}`) === 'true';
  const isFirstTimeUser = localStorage.getItem('first_time_user') === 'true';
  const isFirstWorkspace = localStorage.getItem('first_workspace_created') !== 'true';

  const startTour = useCallback((steps: TourStep[], options?: TourConfig['options']) => {
    console.log('startTour called with', steps.length, 'steps');
    
    // Use functional update to avoid stale closure
    setTourConfig(prevConfig => ({
      ...prevConfig,
      steps,
      enabled: true,
      options: {
        ...defaultOptions,
        ...options,
      },
    }));
  }, []);
  
  const endTour = useCallback(() => {
    console.log('endTour called for', tourKey);
    setTourConfig(prev => ({ ...prev, enabled: false, steps: [] }));
    localStorage.setItem(`tour_completed_${tourKey}`, 'true');
    
    // Mark as not first time anymore if this was the dashboard tour
    if (tourKey === 'dashboard') {
      localStorage.setItem('first_time_user', 'false');
    }
    
    // Mark that first workspace tour was completed if this was a workspace tour
    if (tourKey.startsWith('workspace-')) {
      localStorage.setItem('first_workspace_created', 'true');
    }
  }, [tourKey]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(`tour_completed_${tourKey}`);
  }, [tourKey]);
  
  const onExit = useCallback(() => {
    console.log('onExit called');
    endTour();
  }, [endTour]);
  
  const onComplete = useCallback(() => {
    console.log('onComplete called');
    endTour();
  }, [endTour]);

  // Reset tour config when location changes
  useEffect(() => {
    setTourConfig(prev => ({ ...prev, enabled: false, steps: [] }));
  }, [location.pathname]);
  
  return {
    tourConfig,
    startTour,
    endTour,
    resetTour,
    hasSeenTour,
    isFirstTimeUser,
    isFirstWorkspace,
    onExit,
    onComplete,
  };
};
