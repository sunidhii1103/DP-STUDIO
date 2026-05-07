import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import './tutorial.css';

export interface TutorialStep {
  targetId: string;
  title: string;
  description: string;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onClose: () => void;
  isOpen: boolean;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps, onClose, isOpen }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const currentStep = steps[currentStepIndex];
  const overlayRef = useRef<HTMLDivElement>(null);

  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !currentStep) return;
    const elements = document.querySelectorAll(`[data-tour="${currentStep.targetId}"]`);
    let el: Element | null = null;
    for (const element of Array.from(elements)) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        el = element;
        break;
      }
    }
    
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      
      const isFullyVisible = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
      
      if (!isFullyVisible) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    updateTargetPosition();
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      updateTargetPosition();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateTargetPosition]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateTargetPosition();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentStepIndex, updateTargetPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  let tooltipTop = 0;
  let tooltipLeft = 0;
  let tooltipPlacement = 'bottom';

  const isMobile = windowSize.width <= 768;
  const TOOLTIP_MAX_HEIGHT = 280;

  if (targetRect) {
    const spaceBelow = windowSize.height - targetRect.bottom;
    const spaceAbove = targetRect.top;
    
    // Always fallback to center if there is not enough vertical space (both desktop & mobile)
    if (spaceBelow < TOOLTIP_MAX_HEIGHT && spaceAbove < TOOLTIP_MAX_HEIGHT) {
      tooltipPlacement = 'center';
      tooltipTop = windowSize.height / 2;
      tooltipLeft = windowSize.width / 2;
    } else if (spaceBelow < TOOLTIP_MAX_HEIGHT && spaceAbove > TOOLTIP_MAX_HEIGHT) {
      tooltipPlacement = 'top';
      tooltipTop = targetRect.top - 24; 
    } else {
      tooltipPlacement = 'bottom';
      tooltipTop = targetRect.bottom + 24;
    }

    if (tooltipPlacement !== 'center') {
      tooltipLeft = targetRect.left + (targetRect.width / 2);
      const tooltipHalfWidth = isMobile ? (windowSize.width - 32) / 2 : 170;
      
      // Horizontal Clamp
      const maxLeft = windowSize.width - tooltipHalfWidth - 16;
      const minLeft = tooltipHalfWidth + 16;
      tooltipLeft = Math.max(minLeft, Math.min(maxLeft, tooltipLeft));

      // Vertical Clamp safety
      if (tooltipPlacement === 'bottom') {
        const maxTop = windowSize.height - TOOLTIP_MAX_HEIGHT - 16;
        tooltipTop = Math.min(tooltipTop, maxTop);
      } else if (tooltipPlacement === 'top') {
        const minTop = TOOLTIP_MAX_HEIGHT + 16; 
        tooltipTop = Math.max(tooltipTop, minTop);
      }
    }
  } else {
    tooltipTop = windowSize.height / 2;
    tooltipLeft = windowSize.width / 2;
    tooltipPlacement = 'center';
  }

  return createPortal(
    <div className="tutorial-overlay-container" ref={overlayRef}>
      <div className="tutorial-dimmer"></div>
      
      {targetRect && (
        <>
          <div 
            className="tutorial-spotlight-hole"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
          <div 
            className="tutorial-spotlight-ring"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        </>
      )}
      
      <div 
        className={`tutorial-tooltip tutorial-tooltip-${tooltipPlacement}`}
        style={{
          top: tooltipTop,
          left: tooltipLeft,
          transform: tooltipPlacement === 'center' ? 'translate(-50%, -50%) scale(1)' : tooltipPlacement === 'top' ? 'translate(-50%, -100%) scale(1)' : 'translate(-50%, 0) scale(1)',
        }}
      >
        <div className="tutorial-tooltip-header">
          <span className="tutorial-step-counter">
            <span className="step-accent">Step {currentStepIndex + 1}</span> of {steps.length}
          </span>
          <button className="tutorial-close-btn" onClick={onClose} aria-label="Close tutorial">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <h3 className="tutorial-title">{currentStep.title}</h3>
        <p className="tutorial-desc">{currentStep.description}</p>
        
        <div className="tutorial-actions">
          <div className="tutorial-progress-pills">
            {steps.map((_, idx) => (
              <span 
                key={idx} 
                className={`tutorial-pill ${idx === currentStepIndex ? 'active' : idx < currentStepIndex ? 'completed' : ''}`} 
              />
            ))}
          </div>
          <div className="tutorial-buttons">
            <button 
              className="tutorial-btn-secondary" 
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
            >
              Back
            </button>
            <button 
              className="tutorial-btn-primary" 
              onClick={handleNext}
            >
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
