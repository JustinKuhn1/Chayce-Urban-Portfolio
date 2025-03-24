"use client";
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const MouseTrailEffect = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const effectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      // Set active on mouse movement
      if (!isActive) {
        setIsActive(true);
      }
    };

    // Only start tracking after a slight delay for better UX
    const timeout = setTimeout(() => {
      window.addEventListener('mousemove', handleMouseMove);
    }, 1000);

    // Reset active state when mouse stops
    let inactivityTimer: NodeJS.Timeout;
    const handleMouseStop = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        setIsActive(false);
      }, 500);
    };

    window.addEventListener('mousemove', handleMouseStop);

    return () => {
      clearTimeout(timeout);
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleMouseStop);
    };
  }, [isActive]);

  // Generate multiple trail dots
  const trailDots = Array.from({ length: 8 }).map((_, i) => {
    const delay = i * 0.05; // Staggered delay
    const scale = 1 - i * 0.1; // Gradually smaller
    const opacity = 1 - i * 0.1; // Gradually more transparent

    return (
      <motion.div
        key={i}
        className="absolute rounded-full bg-gradient-to-r from-purple-500 via-blue-400 to-indigo-600"
        style={{
          width: 20 - i * 2,
          height: 20 - i * 2,
          x: mousePosition.x - (10 - i),
          y: mousePosition.y - (10 - i),
          opacity: isActive ? opacity : 0,
          scale: isActive ? scale : 0,
          zIndex: 9999 - i,
        }}
        animate={{
          x: mousePosition.x - (10 - i),
          y: mousePosition.y - (10 - i),
          opacity: isActive ? opacity : 0,
          scale: isActive ? scale : 0,
        }}
        transition={{
          duration: 0.15,
          ease: "linear",
          delay,
        }}
      />
    );
  });

  return <div ref={effectRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-50">{trailDots}</div>;
};

export default MouseTrailEffect;