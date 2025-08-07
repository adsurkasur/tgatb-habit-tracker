"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  offset?: { x: number; y: number };
}

interface WelcomeOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
  hasHabits?: boolean;
  onStepChange?: (step: number) => void;
}

export function WelcomeOverlay({ isVisible, onClose, onComplete, hasHabits = false, onStepChange }: WelcomeOverlayProps) {
  // Hide overlay immediately if user has already skipped the tour
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('welcome-overlay-shown') === 'true' && isVisible) {
      onClose();
    }
  }, [isVisible, onClose]);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isPositionReady, setIsPositionReady] = useState(false);
  const [cardOpacity, setCardOpacity] = useState(0);
  const [allPositions, setAllPositions] = useState<{ [key: number]: { x: number; y: number; width: number; height: number } | null }>({});
  
  // Function to calculate step-specific initial positions
  const getInitialCardPosition = (step: number) => {
    if (step === 3) { // Step 4 (0-indexed) - habit card step
      return {
        top: '15%', // Position above the habit card center (~54-56% from top)
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }
    // Default center position for other steps
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  };

  const [cardPosition, setCardPosition] = useState<{ top: string | number; left: string | number; transform: string }>(
    getInitialCardPosition(0)
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset to first step whenever overlay becomes visible
  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
    }
  }, [isVisible]);

  // Update card position when step changes to use appropriate initial position
  useEffect(() => {
    if (isVisible) {
      const newPosition = getInitialCardPosition(currentStep);
      setCardPosition(newPosition);
    }
  }, [currentStep, isVisible]);

  // Notify parent of step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  // Dynamic steps based on whether user has habits
  const getWelcomeSteps = (): WelcomeStep[] => [
    {
      id: 'welcome',
      title: '🎉 Welcome to Habit Tracker!',
      description: 'Let\'s take a quick tour to help you get started with tracking your habits effectively.',
      targetSelector: '',
      position: 'bottom'
    },
    {
      id: 'navigation',
      title: 'Navigation Menu',
      description: 'Access all your habits, view history, and adjust settings from this menu.',
      targetSelector: '[data-tour="navigation"]',
      position: 'bottom',
      offset: { x: 135, y: 10 }
    },
    {
      id: 'add-button',
      title: hasHabits ? 'Add More Habits' : 'Add Your First Habit',
      description: hasHabits 
        ? 'Use this floating button to add more habits anytime.'
        : 'Tap this button to create your first habit. You can add both good habits to build and bad habits to break.',
      targetSelector: hasHabits ? '[data-tour="add-habit-fab"]' : '[data-tour="add-habit-empty"]',
      position: hasHabits ? 'left' : 'right',
      offset: hasHabits ? { x: -10, y: -125 } : { x: 10, y: 0 }
    },
    {
      id: 'habit-card',
      title: 'Track Your Progress',
      description: hasHabits 
        ? 'Here are your habits! Tap them to mark as complete for the day.'
        : 'Once you add habits, they\'ll appear here. Tap to mark them as complete for the day.',
      targetSelector: '[data-tour="habit-card"]',
      position: 'right',
      offset: { x: 0, y: 0 } // Centered for better alignment
    },
    {
      id: 'complete',
      title: '🚀 You\'re All Set!',
      description: 'Start building better habits today. Remember, consistency is key to success!',
      targetSelector: '',
      position: 'bottom'
    }
  ];

  const welcomeSteps = getWelcomeSteps();
  const currentStepData = welcomeSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === welcomeSteps.length - 1;

  // Calculate position for current step only when needed
  useEffect(() => {
    if (!isVisible) {
      setAllPositions({});
      setIsPositionReady(false);
      return;
    }

    const calculateCurrentStepPosition = () => {
      const steps = getWelcomeSteps();
      const currentStepData = steps[currentStep];
      
      if (!currentStepData?.targetSelector) {
        // No target selector, use center position
        setAllPositions(prev => ({
          ...prev,
          [currentStep]: null
        }));
        setIsPositionReady(true);
        return;
      }

      // Find the element for current step
      let element = document.querySelector(currentStepData.targetSelector);
      
      // Special handling for habit-card step to target the actual card
      if (currentStepData.id === 'habit-card') {
        element = document.querySelector('[data-tour="habit-card"]') || 
                 document.querySelector('.habit-card-animated') ||
                 document.querySelector('div[data-tour="habit-card"]');
        
        if (!element) {
          const habitArea = document.querySelector('[data-tour="habit-area"]');
          if (habitArea) {
            element = habitArea.querySelector('[data-tour="habit-card"]') ||
                     habitArea.querySelector('.habit-card-animated') ||
                     habitArea.querySelector('[class*="card"]');
          }
        }
      }
      
      if (element) {
        const rect = element.getBoundingClientRect();
        setAllPositions(prev => ({
          ...prev,
          [currentStep]: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          }
        }));
      } else {
        setAllPositions(prev => ({
          ...prev,
          [currentStep]: null
        }));
      }
      
      setIsPositionReady(true);
    };

    // Give time for step transition and element rendering
    // For habit-card step, wait longer for the card animation to complete (250ms + buffer)
    const delay = currentStepData.id === 'habit-card' ? 300 : 50;
    const timer = setTimeout(calculateCurrentStepPosition, delay);

    // Handle resize and scroll events
    const handleResize = () => {
      if (isVisible) {
        calculateCurrentStepPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isVisible, currentStep]);

  // Calculate and set card position when position data is ready
  useEffect(() => {
    if (!isVisible || !isPositionReady) {
      return;
    }

    const stepTargetPosition = allPositions[currentStep];
    const steps = getWelcomeSteps();
    const step = steps[currentStep];
    
    if (!stepTargetPosition) {
      // For center-positioned steps (welcome, complete)
      setCardPosition({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      });
    } else {
      const { x, y, width, height } = stepTargetPosition;
      const offset = step.offset || { x: 0, y: 0 };
      const margin = 20;
      const isMobile = window.innerWidth < 640;
      
      // Apply viewport clipping detection
      let shouldPositionAbove = false;
      const cardWidth = isMobile ? 288 : 320;
      const cardHeight = 250;
      
      switch (step.position) {
        case 'right':
          if (x + width + margin + offset.x + cardWidth > window.innerWidth - 20) {
            shouldPositionAbove = true;
          }
          break;
        case 'left':
          if (x - margin + offset.x - cardWidth < 20) {
            shouldPositionAbove = true;
          }
          break;
        case 'bottom':
          if (step.id !== 'navigation' && y + height + margin + offset.y + cardHeight > window.innerHeight - 20) {
            shouldPositionAbove = true;
          }
          break;
        case 'top':
          if (y - margin + offset.y - cardHeight < 20) {
            shouldPositionAbove = true;
          }
          break;
      }
      
      // Device-specific positioning
      const isStep4OnMobile = isMobile && step.id === 'habit-card';
      const isStep3OnMobileButNotFab = isMobile && step.id === 'add-button' && step.targetSelector !== '[data-tour="add-habit-fab"]';
      const isHabitCardOnDesktop = !isMobile && step.id === 'habit-card';
      
      shouldPositionAbove = shouldPositionAbove || isStep4OnMobile || isStep3OnMobileButNotFab || isHabitCardOnDesktop;

      // Calculate positions
      let calculatedTop: string | number;
      let calculatedLeft: string | number;
      let calculatedTransform: string;

      if (shouldPositionAbove) {
        let finalY = y - margin - 15;
        if (step.id === 'navigation') {
          finalY = y - margin - 20;
        }
        const minY = cardHeight + 30;
        if (finalY < minY) {
          finalY = minY;
        }
        calculatedTop = finalY;
        
        let finalX = x + width / 2;
        const halfCardWidth = cardWidth / 2;
        const safeMargin = 20;
        const minX = halfCardWidth + safeMargin;
        const maxX = window.innerWidth - halfCardWidth - safeMargin;
        
        if (finalX < minX) finalX = minX;
        if (finalX > maxX) finalX = maxX;
        calculatedLeft = finalX;
        calculatedTransform = 'translate(-50%, -100%)';
      } else {
        switch (step.position) {
          case 'top':
            calculatedTop = y - margin + offset.y;
            calculatedLeft = x + width / 2 + offset.x;
            calculatedTransform = 'translate(-50%, -100%)';
            break;
          case 'bottom':
            calculatedTop = y + height + margin + offset.y;
            calculatedLeft = x + width / 2 + offset.x;
            calculatedTransform = 'translate(-50%, 0)';
            break;
          case 'left':
            calculatedTop = y + height / 2 + offset.y;
            calculatedLeft = x - margin + offset.x;
            calculatedTransform = 'translate(-100%, -50%)';
            break;
          case 'right':
            calculatedTop = y + height / 2 + offset.y;
            calculatedLeft = x + width + margin + offset.x;
            calculatedTransform = 'translate(0, -50%)';
            break;
          default:
            calculatedTop = y + height + margin + offset.y;
            calculatedLeft = x + width / 2 + offset.x;
            calculatedTransform = 'translate(-50%, 0)';
        }
      }

      setCardPosition({
        top: calculatedTop,
        left: calculatedLeft,
        transform: calculatedTransform
      });
    }
  }, [isVisible, isPositionReady, allPositions, currentStep]);

  // Simple fade control - card fades in when position is ready
  useEffect(() => {
    if (!isVisible) {
      setCardOpacity(0);
      return;
    }

    if (isPositionReady) {
      // Position is ready, fade in the card
      const timer = setTimeout(() => setCardOpacity(1), 50);
      return () => clearTimeout(timer);
    } else {
      // Position not ready, keep card hidden
      setCardOpacity(0);
    }
  }, [isVisible, isPositionReady, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      onClose();
    } else {
      setCardOpacity(0); // Fade out current card
      setTimeout(() => {
        setCurrentStep(prev => prev + 1); // Change step after fade out
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCardOpacity(0); // Fade out current card
      setTimeout(() => {
        setCurrentStep(prev => prev - 1); // Change step after fade out
      }, 150);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('welcome-overlay-shown', 'true');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-black/20"
      style={{ 
        pointerEvents: 'auto'
      }}
    >
      {/* Highlight circle for target element */}
      {allPositions[currentStep] && isPositionReady && (
        <div
          className="absolute border-4 border-primary rounded-xl shadow-2xl shadow-primary/50 animate-pulse bg-primary/5"
          style={{
            left: allPositions[currentStep]!.x - 4,
            top: allPositions[currentStep]!.y - 4,
            width: allPositions[currentStep]!.width + 8,
            height: allPositions[currentStep]!.height + 8,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Welcome Tour Card - Always rendered but opacity controlled for smooth transitions */}
      <Card
        className="absolute w-80 max-w-[85vw] max-h-[80vh] p-6 max-sm:p-4 max-sm:w-72 max-sm:max-w-[90vw] max-sm:max-h-[75vh] shadow-2xl border-2 border-primary/20 bg-card overflow-y-auto transition-all duration-300 ease-out"
        style={{
          top: cardPosition.top,
          left: cardPosition.left,
          transform: cardPosition.transform,
          pointerEvents: cardOpacity > 0 ? 'auto' : 'none',
          opacity: cardOpacity,
          zIndex: 110
        }}
      >
          {/* Header */}
          <div className="flex items-start justify-between mb-6 max-sm:mb-4 min-w-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg max-sm:text-base font-semibold text-card-foreground mb-3 max-sm:mb-2 leading-tight break-words">
                {currentStepData.title}
              </h3>
              <Badge variant="secondary" className="text-xs max-sm:text-[10px] bg-primary/10 text-primary border-primary/20 px-3 py-1">
                Step {currentStep + 1} of {welcomeSteps.length}
              </Badge>
            </div>
            <button
              onClick={handleSkip}
              className="h-8 w-8 max-sm:h-7 max-sm:w-7 p-0 shrink-0 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 ml-3"
            >
              <X className="w-4 h-4 max-sm:w-3.5 max-sm:h-3.5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm max-sm:text-xs text-muted-foreground mb-6 max-sm:mb-4 leading-relaxed max-sm:leading-snug break-words">
            {currentStepData.description}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 max-sm:h-1.5 mb-6 max-sm:mb-4">
            <div
              className="bg-primary h-2 max-sm:h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / welcomeSteps.length) * 100}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 max-sm:gap-2 min-w-0">
            {/* Previous button - flexible width for perfect alignment */}
            <div className="flex justify-start min-w-0" style={{ minWidth: '80px' }}>
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  className="flex items-center justify-center gap-1.5 max-sm:gap-1 text-xs max-sm:text-[10px] h-9 max-sm:h-8 hover:bg-muted/50 font-medium px-3 max-sm:px-2 whitespace-nowrap"
                >
                  <ArrowLeft className="w-3.5 h-3.5 max-sm:w-3 max-sm:h-3 shrink-0" />
                  <span className="truncate">Previous</span>
                </Button>
              )}
            </div>

            {/* Skip tour button - center section with equal spacing */}
            <div className="flex-1 flex justify-center min-w-0">
              {currentStep < welcomeSteps.length - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/50 text-xs max-sm:text-[10px] h-9 max-sm:h-8 px-4 max-sm:px-3 font-medium whitespace-nowrap"
                >
                  Skip Tour
                </Button>
              )}
            </div>

            {/* Next button - flexible width matching previous button */}
            <div className="flex justify-end min-w-0" style={{ minWidth: '80px' }}>
              <Button
                onClick={handleNext}
                size="sm"
                variant="default"
                className="flex items-center justify-center gap-1.5 max-sm:gap-1 text-xs max-sm:text-[10px] h-9 max-sm:h-8 fab font-medium px-3 max-sm:px-2 whitespace-nowrap"
              >
                {currentStep === welcomeSteps.length - 1 ? (
                  <>
                    <Play className="w-3.5 h-3.5 max-sm:w-3 max-sm:h-3 shrink-0" />
                    <span className="max-sm:hidden truncate">Get Started</span>
                    <span className="sm:hidden truncate">Start</span>
                  </>
                ) : (
                  <>
                    <span className="truncate">Next</span>
                    <ArrowRight className="w-3.5 h-3.5 max-sm:w-3 max-sm:h-3 shrink-0" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
    </div>
  );
}
