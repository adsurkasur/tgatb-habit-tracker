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
          
          // For step 4 on mobile, and step 3 only if it's NOT the FAB, force them to appear above the highlighted component
          const isStep4OnMobile = isMobile && step.id === 'habit-card';
          const isStep3OnMobileButNotFab = isMobile && step.id === 'add-button' && step.targetSelector !== '[data-tour="add-habit-fab"]';
          const shouldPositionAbove = isStep4OnMobile || isStep3OnMobileButNotFab;

          let finalX, finalY, transform;

          if (shouldPositionAbove) {
            // Force step 4 and step 3 (when not FAB) to appear above the highlighted component on mobile
            finalX = x + width / 2;
            finalY = y - margin - 10; // Extra margin for mobile
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
            className="absolute w-80 max-w-[90vw] max-h-[90vh] p-6 shadow-2xl border-2 border-primary/20 bg-card overflow-y-auto transition-opacity duration-300 ease-out"
            style={{
              top: stepPosition.top,
              left: stepPosition.left,
              transform: stepPosition.transform,
              pointerEvents: shouldShow ? 'auto' : 'none',
              opacity: shouldShow ? 1 : 0,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {step.title}
                </h3>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Step {stepIndex + 1} of {welcomeSteps.length}
                </Badge>
              </div>
              <button
                onClick={handleSkip}
                className="h-8 w-8 p-0 shrink-0 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {step.description}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-6">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((stepIndex + 1) / welcomeSteps.length) * 100}%` }}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {/* Main action button - always full width */}
              <Button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {stepIndex === welcomeSteps.length - 1 ? (
                  <>
                    <Play className="w-4 h-4" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              {/* Secondary actions row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {stepIndex > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {stepIndex < welcomeSteps.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs"
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
