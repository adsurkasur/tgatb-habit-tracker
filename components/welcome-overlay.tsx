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
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isPositionReady, setIsPositionReady] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [allPositions, setAllPositions] = useState<{ [key: number]: { x: number; y: number; width: number; height: number } | null }>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset to first step whenever overlay becomes visible
  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
    }
  }, [isVisible]);

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
      offset: { x: 135, y: 0 }
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
      targetSelector: '.habit-card-animated',
      position: 'right',
      offset: { x: 10, y: 0 }
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

  // Pre-calculate all step positions
  useEffect(() => {
    if (!isVisible) {
      setAllPositions({});
      setIsPositionReady(false);
      return;
    }

    const calculateAllPositions = async () => {
      const steps = getWelcomeSteps();
      const positions: { [key: number]: { x: number; y: number; width: number; height: number } | null } = {};
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (!step.targetSelector) {
          positions[i] = null; // Will use center position
        } else {
          const element = document.querySelector(step.targetSelector);
          if (element) {
            const rect = element.getBoundingClientRect();
            positions[i] = {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height
            };
          } else {
            // Try fallback for habit-card step
            if (step.id === 'habit-card') {
              const fallback = document.querySelector('[data-tour="habit-area"]');
              if (fallback) {
                const rect = fallback.getBoundingClientRect();
                positions[i] = {
                  x: rect.left,
                  y: rect.top,
                  width: rect.width,
                  height: rect.height
                };
              } else {
                positions[i] = null;
              }
            } else {
              positions[i] = null;
            }
          }
        }
      }
      
      setAllPositions(positions);
      setIsPositionReady(true);
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(calculateAllPositions, 50);

    const handleResize = () => {
      if (isVisible) {
        calculateAllPositions();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isVisible]);

  // Recalculate position for step 3 (add-button) and step 4 (habit-card) when they become active
  useEffect(() => {
    if (!isVisible || !isPositionReady) return;
    
    const steps = getWelcomeSteps();
    const currentStepData = steps[currentStep];
    if (currentStepData?.id === 'add-button' || currentStepData?.id === 'habit-card') {
      const recalculatePosition = () => {
        if (!currentStepData.targetSelector) {
          setAllPositions(prev => ({
            ...prev,
            [currentStep]: null
          }));
          return;
        }

        const element = document.querySelector(currentStepData.targetSelector);
        
        if (element) {
          const rect = element.getBoundingClientRect();
          // Only update if the position is actually different to prevent infinite loops
          setAllPositions(prev => {
            const currentPos = prev[currentStep];
            if (!currentPos || 
                currentPos.x !== rect.left || 
                currentPos.y !== rect.top || 
                currentPos.width !== rect.width || 
                currentPos.height !== rect.height) {
              return {
                ...prev,
                [currentStep]: {
                  x: rect.left,
                  y: rect.top,
                  width: rect.width,
                  height: rect.height
                }
              };
            }
            return prev;
          });
        } else {
          // Try fallback for habit-card step
          if (currentStepData.id === 'habit-card') {
            const fallback = document.querySelector('[data-tour="habit-area"]');
            if (fallback) {
              const rect = fallback.getBoundingClientRect();
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
          } else {
            setAllPositions(prev => ({
              ...prev,
              [currentStep]: null
            }));
          }
        }
      };

      // Small delay to let elements render
      const timer = setTimeout(recalculatePosition, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isVisible, isPositionReady]);

  // Show cards only after positions are calculated
  useEffect(() => {
    if (isVisible && isPositionReady) {
      setIsCardVisible(true);
    } else {
      setIsCardVisible(false);
    }
  }, [isVisible, isPositionReady]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
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

      {/* Individual Cards for Each Step */}
      {welcomeSteps.map((step, stepIndex) => {
        const isCurrentStep = stepIndex === currentStep;
        const stepTargetPosition = allPositions[stepIndex];
        
        // Calculate position for this specific step
        const getStepPosition = () => {
          if (!stepTargetPosition) {
            return {
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            };
          }

          const { x, y, width, height } = stepTargetPosition;
          const offset = step.offset || { x: 0, y: 0 };
          const margin = 20;
          
          // Check if we're on mobile (viewport width < 640px)
          const isMobile = window.innerWidth < 640;
          
          // For specific steps, check if they would be clipped by viewport
          const shouldCheckViewportClipping = step.id === 'add-button' || step.id === 'habit-card';
          let shouldPositionAbove = false;
          
          if (shouldCheckViewportClipping) {
            // Calculate where the card would be positioned with original logic
            let testX, testY;
            const cardWidth = isMobile ? 288 : 320; // w-72 (288px) on mobile, w-80 (320px) on desktop
            const cardHeight = 200; // Approximate card height
            
            switch (step.position) {
              case 'right':
                testX = x + width + margin + offset.x;
                testY = y + height / 2 + offset.y;
                // Check if card would extend beyond right edge of viewport
                if (testX + cardWidth > window.innerWidth) {
                  shouldPositionAbove = true;
                }
                break;
              case 'left':
                testX = x - margin + offset.x;
                testY = y + height / 2 + offset.y;
                // Check if card would extend beyond left edge of viewport
                if (testX - cardWidth < 0) {
                  shouldPositionAbove = true;
                }
                break;
              case 'bottom':
                testX = x + width / 2 + offset.x;
                testY = y + height + margin + offset.y;
                // Check if card would extend beyond bottom edge of viewport
                if (testY + cardHeight > window.innerHeight) {
                  shouldPositionAbove = true;
                }
                break;
              case 'top':
                testX = x + width / 2 + offset.x;
                testY = y - margin + offset.y;
                // Check if card would extend beyond top edge of viewport
                if (testY - cardHeight < 0) {
                  shouldPositionAbove = true;
                }
                break;
            }
            
            // Also check horizontal clipping for all positions
            if (!shouldPositionAbove) {
              if (step.position === 'top' || step.position === 'bottom') {
                testX = x + width / 2 + offset.x;
                // Check if centered card would be clipped horizontally
                if (testX - cardWidth / 2 < 20 || testX + cardWidth / 2 > window.innerWidth - 20) {
                  shouldPositionAbove = true;
                }
              }
            }
          }
          
          // On mobile, always position step 4 above, and step 3 above if it's not the FAB
          const isStep4OnMobile = isMobile && step.id === 'habit-card';
          const isStep3OnMobileButNotFab = isMobile && step.id === 'add-button' && step.targetSelector !== '[data-tour="add-habit-fab"]';
          
          // Combine viewport clipping logic with mobile-specific logic
          shouldPositionAbove = shouldPositionAbove || isStep4OnMobile || isStep3OnMobileButNotFab;

          let finalX, finalY, transform;

          if (shouldPositionAbove) {
            // Force the card to appear above the highlighted component
            finalX = x + width / 2;
            finalY = y - margin - 10; // Extra margin for better spacing
            transform = 'translate(-50%, -100%)';
          } else {
            switch (step.position) {
              case 'top':
                finalX = x + width / 2 + offset.x;
                finalY = y - margin + offset.y;
                transform = 'translate(-50%, -100%)';
                break;
              case 'bottom':
                finalX = x + width / 2 + offset.x;
                finalY = y + height + margin + offset.y;
                transform = 'translate(-50%, 0)';
                break;
              case 'left':
                finalX = x - margin + offset.x;
                finalY = y + height / 2 + offset.y;
                transform = 'translate(-100%, -50%)';
                break;
              case 'right':
                finalX = x + width + margin + offset.x;
                finalY = y + height / 2 + offset.y;
                transform = 'translate(0, -50%)';
                break;
              default:
                finalX = x + width / 2 + offset.x;
                finalY = y + height + margin + offset.y;
                transform = 'translate(-50%, 0)';
            }
          }

          return {
            top: finalY,
            left: finalX,
            transform: transform
          };
        };

        const stepPosition = getStepPosition();
        const shouldShow = isCurrentStep && isCardVisible;

        return (
          <Card
            key={stepIndex}
            className="absolute w-80 max-w-[85vw] max-h-[80vh] p-4 max-sm:p-3 max-sm:w-72 max-sm:max-w-[80vw] max-sm:max-h-[70vh] shadow-2xl border-2 border-primary/20 bg-card overflow-y-auto transition-opacity duration-300 ease-out"
            style={{
              top: stepPosition.top,
              left: stepPosition.left,
              transform: stepPosition.transform,
              pointerEvents: shouldShow ? 'auto' : 'none',
              opacity: shouldShow ? 1 : 0,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3 max-sm:mb-2">
              <div className="flex-1">
                <h3 className="text-lg max-sm:text-base font-semibold text-card-foreground mb-2 max-sm:mb-1 leading-tight">
                  {step.title}
                </h3>
                <Badge variant="secondary" className="text-xs max-sm:text-[10px] bg-primary/10 text-primary border-primary/20">
                  Step {stepIndex + 1} of {welcomeSteps.length}
                </Badge>
              </div>
              <button
                onClick={handleSkip}
                className="h-7 w-7 max-sm:h-6 max-sm:w-6 p-0 shrink-0 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 max-sm:w-3 max-sm:h-3" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm max-sm:text-xs text-muted-foreground mb-4 max-sm:mb-3 leading-relaxed max-sm:leading-snug">
              {step.description}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 max-sm:h-1.5 mb-4 max-sm:mb-3">
              <div
                className="bg-primary h-2 max-sm:h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((stepIndex + 1) / welcomeSteps.length) * 100}%` }}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 max-sm:gap-1.5">
              {/* Main action button - always full width */}
              <Button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 max-sm:gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground max-sm:h-9 max-sm:text-sm"
              >
                {stepIndex === welcomeSteps.length - 1 ? (
                  <>
                    <Play className="w-4 h-4 max-sm:w-3.5 max-sm:h-3.5" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 max-sm:w-3.5 max-sm:h-3.5" />
                  </>
                )}
              </Button>

              {/* Secondary actions row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 max-sm:gap-1">
                  {stepIndex > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      className="flex items-center gap-1.5 max-sm:gap-1 text-xs max-sm:text-[10px] max-sm:h-7 max-sm:px-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 max-sm:w-3 max-sm:h-3" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 max-sm:gap-1">
                  {stepIndex < welcomeSteps.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs max-sm:text-[10px] max-sm:h-7 max-sm:px-2"
                    >
                      Skip Tour
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
