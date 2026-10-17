import React, { useEffect, useState, useRef } from 'react';

/**
 * Custom Cosmic Cursor Component
 * - Fixed: decoupled positioning transform from React state re-renders to prevent top-left snapping
 * - Fixed: zero CSS transition on positioning transforms to ensure 1:1 fluid tracking
 * - Smooth lerped trailing cosmic aura ring
 * - Dynamic scaling and glow on interactive elements
 * - Click snap effect
 * - Mobile / touch device safe (automatically disabled via `pointer: fine`)
 */
export default function CustomCursor() {
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInput, setIsInput] = useState(false);

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const posRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });
  const hasMovedRef = useRef(false);
  const rafIdRef = useRef(null);

  useEffect(() => {
    // Only activate on devices with a mouse / fine pointer
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mediaQuery.matches);

    const handleMediaChange = (e) => setIsFinePointer(e.matches);
    mediaQuery.addEventListener('change', handleMediaChange);

    if (!mediaQuery.matches) {
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }

    const onMouseMove = (e) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      posRef.current = { x: clientX, y: clientY };

      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        ringPosRef.current = { x: clientX, y: clientY };
        setIsVisible(true);
      }

      // Directly update dot wrapper position without triggering React re-renders
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }

      // Detect hover target without causing redundant re-renders
      const target = e.target;
      if (target) {
        const interactive = Boolean(
          target.closest('button, a, input, select, textarea, label, [role="button"], .cursor-pointer')
        );
        const inputElem = Boolean(target.closest('input, textarea, select'));

        setIsHovered(prev => (prev !== interactive ? interactive : prev));
        setIsInput(prev => (prev !== inputElem ? inputElem : prev));
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth lerp loop for the outer cosmic ring (independent of React state)
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animateRing = () => {
      if (hasMovedRef.current) {
        ringPosRef.current.x = lerp(ringPosRef.current.x, posRef.current.x, 0.22);
        ringPosRef.current.y = lerp(ringPosRef.current.y, posRef.current.y, 0.22);

        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0)`;
        }
      }

      rafIdRef.current = requestAnimationFrame(animateRing);
    };

    rafIdRef.current = requestAnimationFrame(animateRing);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  if (!isFinePointer) return null;

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-[999999] transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden="true"
    >
      {/* Outer Cosmic Trailing Ring Wrapper (strictly positioned via translate3d, no inline style overrides on re-render) */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform -translate-x-1/2 -translate-y-1/2"
      >
        {/* Inner animated ring: handles scale, glow, border, and transitions smoothly without interfering with x/y coordinates */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-out ${
            isClicked 
              ? 'scale-75 bg-blue-600/30 border border-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.7)]'
              : isHovered 
              ? isInput 
                ? 'scale-110 bg-[#38BDF8]/10 border border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                : 'scale-150 bg-[#38BDF8]/15 border-1.5 border-[#38BDF8] shadow-[0_0_25px_rgba(56,189,248,0.65),inset_0_0_12px_rgba(56,189,248,0.3)]'
              : 'scale-100 bg-blue-950/20 border border-[#38BDF8]/40 shadow-[0_0_12px_rgba(29,78,216,0.35)]'
          }`}
        >
          {isHovered && !isInput && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping opacity-75" />
          )}
        </div>
      </div>

      {/* Central Sharp Cyan Flare Dot Wrapper */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform -translate-x-1/2 -translate-y-1/2"
      >
        <div 
          className={`w-2 h-2 rounded-full transition-all duration-150 ${
            isHovered 
              ? 'bg-white shadow-[0_0_10px_#FFFFFF,0_0_18px_#38BDF8] scale-125' 
              : 'bg-[#38BDF8] shadow-[0_0_8px_#38BDF8,0_0_15px_rgba(29,78,216,0.8)] scale-100'
          }`} 
        />
      </div>
    </div>
  );
}
