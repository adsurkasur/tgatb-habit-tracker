"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Play } from 'lucide-react';
import { CloseButton } from '@/components/ui/close-button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('WelcomeOverlay');
  const [currentStep, setCurrentStep] = useState(0);
  // targetPosition was unused; removed to reduce warnings
  const [isPositionReady, setIsPositionReady] = useState(false);
  const [cardOpacity, setCardOpacity] = useState(0);
  const [allPositions, setAllPositions] = useState<{ [key: number]: { x: number; y: number; width: number; height: number } | null }>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldMoveToFinalPosition, setShouldMoveToFinalPosition] = useState(false);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  
  // Function to calculate step-specific initial positions
  const getInitialCardPosition = useCallback((step: number) => {
    if (step === 3) { // Step 4 (0-indexed) - habit card step
      // Use the same logic as the viewport clipping detection
      const isMobile = window.innerWidth < 640;
  // Removed unused local cardWidth to satisfy lint; sizing handled later
      
      if (!isMobile) {
        // On desktop, assume we have enough space for right positioning initially
        // The actual clipping detection will happen later in the positioning logic
        // This is just to set a reasonable initial position
        const hasEnoughSpace = window.innerWidth > 1200; // Conservative estimate
        
        if (hasEnoughSpace) {
          // Start from center-right area for smooth transition to right side
          return {
            top: '50%',
            left: '70%',
            transform: 'translate(-50%, -50%)'
          };
        }
      }
      
      // Mobile or smaller desktop - start from top center
      return {
        top: '20%',
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
  }, []);

  // cardPosition is derived via useMemo below (not state)
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    const updateSize = () => {
      const node = cardRef.current;
      if (!node) return;
      const nextWidth = Math.round(node.offsetWidth);
      const nextHeight = Math.round(node.offsetHeight);
      setCardSize((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight },
      );
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && cardRef.current) {
      observer = new ResizeObserver(() => updateSize());
      observer.observe(cardRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      observer?.disconnect();
    };
  }, [isVisible, currentStep]);

  // Adjust state during render for visibility and step changes (React-approved pattern)
  const [prevIsVisible, setPrevIsVisible] = useState(isVisible);
  const [prevCurrentStep, setPrevCurrentStep] = useState(currentStep);
  const [prevIsPositionReady, setPrevIsPositionReady] = useState(isPositionReady);

  if (isVisible !== prevIsVisible) {
    setPrevIsVisible(isVisible);
    if (isVisible) {
      setCurrentStep(0);
    } else {
      setAllPositions({});
      setIsPositionReady(false);
      setCardOpacity(0);
      setIsTransitioning(false);
      setShouldMoveToFinalPosition(false);
    }
  }

  if (isVisible && currentStep !== prevCurrentStep) {
    setPrevCurrentStep(currentStep);
    setIsPositionReady(false);
    setShouldMoveToFinalPosition(false);
  }

  // Detect isPositionReady going true → trigger final position calculation
  if (isPositionReady !== prevIsPositionReady) {
    setPrevIsPositionReady(isPositionReady);
    if (isPositionReady && isVisible) {
      setShouldMoveToFinalPosition(true);
    }
  }

  // Notify parent of step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  const welcomeSteps = useMemo((): WelcomeStep[] => [
    {
      id: 'welcome',
      title: t('steps.welcome.title'),
      description: t('steps.welcome.description'),
      targetSelector: '',
      position: 'bottom'
    },
    {
      id: 'navigation',
      title: t('steps.navigation.title'),
      description: t('steps.navigation.description'),
      targetSelector: '[data-tour="navigation"]',
      position: 'bottom',
      offset: { x: 135, y: 10 }
    },
    {
      id: 'add-button',
      title: hasHabits ? t('steps.addButton.hasHabitsTitle') : t('steps.addButton.emptyTitle'),
      description: hasHabits
        ? t('steps.addButton.hasHabitsDescription')
        : t('steps.addButton.emptyDescription'),
      targetSelector: hasHabits ? '[data-tour="add-habit-fab"]' : '[data-tour="add-habit-empty"]',
      position: hasHabits ? 'left' : 'right',
      offset: hasHabits ? { x: -10, y: -125 } : { x: 10, y: 0 }
    },
    {
      id: 'habit-card',
      title: t('steps.habitCard.title'),
      description: hasHabits
        ? t('steps.habitCard.hasHabitsDescription')
        : t('steps.habitCard.emptyDescription'),
      targetSelector: '[data-tour="habit-card"]',
      position: 'right',
      offset: { x: 0, y: 0 }
    },
    {
      id: 'complete',
      title: t('steps.complete.title'),
      description: t('steps.complete.description'),
      targetSelector: '',
      position: 'bottom'
    }
  ], [hasHabits, t]);
  const currentStepData = welcomeSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === welcomeSteps.length - 1;

  // Calculate position for current step only when needed
  useEffect(() => {
    if (!isVisible) return;

    const calculateCurrentStepPosition = () => {
      const stepData = currentStepData;

      if (!stepData?.targetSelector) {
        // No target selector, use center position
        setAllPositions(prev => ({
          ...prev,
          [currentStep]: null
        }));
        setIsPositionReady(true);
        return;
      }

      // Find the element for current step
      let element: Element | null = document.querySelector(stepData.targetSelector);

      // Special handling for habit-card step to target the actual card
      if (stepData.id === 'habit-card') {
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
        const rect = (element as HTMLElement).getBoundingClientRect();
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
    const delay = currentStepData.id === 'habit-card' ? 400 : 50;
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
  }, [isVisible, currentStep, currentStepData, currentStepData.id]);

  // Card position is derived from allPositions + step data (no effect needed)
  const cardPosition = useMemo(() => {
    if (!isVisible || !isPositionReady || !shouldMoveToFinalPosition) {
      return getInitialCardPosition(currentStep);
    }

    const stepTargetPosition = allPositions[currentStep];
    const step = currentStepData;

    if (!stepTargetPosition) {
      return getInitialCardPosition(currentStep);
    }

    const { x, y, width, height } = stepTargetPosition;
    const offset = step.offset || { x: 0, y: 0 };
    const margin = 20;
    const isMobile = window.innerWidth < 640;
    const safeMargin = 16;

    // Apply viewport clipping detection
    let shouldPositionAbove = false;
    const cardWidth = cardSize.width > 0
      ? cardSize.width
      : (isMobile ? Math.floor(window.innerWidth * 0.88) : Math.min(416, Math.floor(window.innerWidth * 0.9)));
    const cardHeight = cardSize.height > 0 ? cardSize.height : (isMobile ? 300 : 340);

    switch (step.position) {
      case 'right':
        if (x + width + margin + offset.x + cardWidth > window.innerWidth - safeMargin) {
          shouldPositionAbove = true;
        }
        break;
      case 'left':
        if (x - margin + offset.x - cardWidth < safeMargin) {
          shouldPositionAbove = true;
        }
        break;
      case 'bottom':
        if (step.id !== 'navigation' && y + height + margin + offset.y + cardHeight > window.innerHeight - safeMargin) {
          shouldPositionAbove = true;
        }
        break;
      case 'top':
        if (y - margin + offset.y - cardHeight < safeMargin) {
          shouldPositionAbove = true;
        }
        break;
    }

    // Device-specific positioning
    const isStep4OnMobile = isMobile && step.id === 'habit-card';
    const isStep3OnMobileButNotFab = isMobile && step.id === 'add-button' && step.targetSelector !== '[data-tour="add-habit-fab"]';
    shouldPositionAbove = shouldPositionAbove || isStep4OnMobile || isStep3OnMobileButNotFab;

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

    const nextPosition = {
      top: calculatedTop,
      left: calculatedLeft,
      transform: calculatedTransform
    };

    // Final horizontal safety clamp by transform mode to avoid viewport overflow.
    if (typeof nextPosition.left === 'number') {
      if (nextPosition.transform.startsWith('translate(0')) {
        // Left edge anchored
        const minLeft = safeMargin;
        const maxLeft = window.innerWidth - cardWidth - safeMargin;
        nextPosition.left = Math.min(Math.max(nextPosition.left, minLeft), Math.max(minLeft, maxLeft));
      } else if (nextPosition.transform.startsWith('translate(-100%')) {
        // Right edge anchored
        const minLeft = cardWidth + safeMargin;
        const maxLeft = window.innerWidth - safeMargin;
        nextPosition.left = Math.min(Math.max(nextPosition.left, minLeft), Math.max(minLeft, maxLeft));
      } else if (nextPosition.transform.startsWith('translate(-50%')) {
        // Center anchored
        const half = cardWidth / 2;
        const minLeft = half + safeMargin;
        const maxLeft = window.innerWidth - half - safeMargin;
        nextPosition.left = Math.min(Math.max(nextPosition.left, minLeft), Math.max(minLeft, maxLeft));
      }
    }

    return nextPosition;
  }, [isVisible, isPositionReady, shouldMoveToFinalPosition, allPositions, currentStep, currentStepData, getInitialCardPosition, cardSize.width, cardSize.height]);

  // Simple fade control - card fades in when position is ready
  useEffect(() => {
    if (!isVisible || !isPositionReady) return;

    // Position is ready — fade in the card
    const timer = setTimeout(() => {
      setCardOpacity(1);
      // Mark transition complete after opacity fade finishes (200ms matches CSS)
      setTimeout(() => {
        setIsTransitioning(false);
      }, 220);
    }, 20); // Micro-delay to let position apply before fading in
    return () => clearTimeout(timer);
  }, [isVisible, isPositionReady, currentStep, currentStepData.id]);

  const transitionStep = useCallback((direction: 1 | -1) => {
    if (isTransitioning) return;
    // if finishing the tour
    if (direction === 1 && isLastStep) {
      onComplete();
      onClose();
      return;
    }
    // guard lower bound
    if (direction === -1 && currentStep === 0) return;

    // Start transition and fade out current card
    setIsTransitioning(true);
    setCardOpacity(0);

    // After fade-out (200ms CSS duration), update step; fade-in handled by effects
    setTimeout(() => {
      setCurrentStep(prev => prev + direction);
    }, 200);
  }, [currentStep, isLastStep, isTransitioning, onClose, onComplete]);

  const handleNext = () => transitionStep(1);
  const handlePrev = () => transitionStep(-1);

  const handleSkip = () => {
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 bg-black/20"
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
        ref={cardRef}
        className="absolute w-[min(26rem,90vw)] max-h-[80vh] p-6 max-sm:p-4 max-sm:w-[min(22rem,88vw)] max-sm:max-h-[75vh] shadow-2xl border-2 border-primary/20 bg-card overflow-y-auto transition-opacity duration-200 ease-out"
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
              <h3 className="text-lg max-sm:text-base font-semibold text-card-foreground mb-3 max-sm:mb-2 leading-tight wrap-break-word">
                {currentStepData.title}
              </h3>
              <Badge variant="secondary" className="text-xs max-sm:text-[10px] bg-primary/10 text-primary border-primary/20 px-3 py-1">
                {t('stepCounter', { current: currentStep + 1, total: welcomeSteps.length })}
              </Badge>
            </div>
            <CloseButton
              className="ml-3"
              onClick={handleSkip}
              label={t('actions.skip')}
            />
          </div>

          {/* Description */}
          <p className="text-sm max-sm:text-xs text-muted-foreground mb-6 max-sm:mb-4 leading-relaxed max-sm:leading-snug wrap-break-word">
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
          <div
            className={cn(
              "grid gap-2 min-w-0 sm:items-center",
              isFirstStep || isLastStep ? "grid-cols-2" : "grid-cols-3"
            )}
          >
            {/* Previous button - flexible width for perfect alignment */}
            {!isFirstStep && (
              <div className="flex justify-start min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  disabled={isTransitioning}
                  className="w-full flex items-center justify-center gap-1.5 max-sm:gap-1 text-xs max-sm:text-[10px] h-9 max-sm:h-8 hover:bg-muted/50 font-medium px-3 max-sm:px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-3.5 h-3.5 max-sm:w-3 max-sm:h-3 shrink-0" />
                  <span className="wrap-anywhere">{t('actions.previous')}</span>
                </Button>
              </div>
            )}

            {/* Skip tour button - center section with equal spacing */}
            {!isLastStep && (
              <div className="flex-1 flex justify-center min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  disabled={isTransitioning}
                  className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 text-xs max-sm:text-[10px] h-9 max-sm:h-8 px-4 max-sm:px-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('actions.skipTour')}
                </Button>
              </div>
            )}

            {/* Next button - flexible width matching previous button */}
            <div className="flex justify-end min-w-0">
              <Button
                onClick={handleNext}
                size="sm"
                variant="default"
                disabled={isTransitioning}
                className="w-full flex items-center justify-center gap-1.5 max-sm:gap-1 text-xs max-sm:text-[10px] h-9 max-sm:h-8 fab font-medium px-3 max-sm:px-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === welcomeSteps.length - 1 ? (
                  <>
                    <Play className="w-3.5 h-3.5 max-sm:w-3 max-sm:h-3 shrink-0" />
                    <span className="max-sm:hidden wrap-anywhere">{t('actions.getStarted')}</span>
                    <span className="sm:hidden wrap-anywhere">{t('actions.start')}</span>
                  </>
                ) : (
                  <>
                    <span className="wrap-anywhere">{t('actions.next')}</span>
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
