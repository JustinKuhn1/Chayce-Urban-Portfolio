"use client";
import { useRef, useEffect, useState } from 'react';

interface ParallaxSectionProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  direction: 'left' | 'right';
  scrollPosition: number;
  sectionIndex: number;
}

const ParallaxSection = ({
  title,
  subtitle,
  imageSrc,
  direction,
  scrollPosition,
  sectionIndex
}: ParallaxSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [sectionTop, setSectionTop] = useState(0);
  const [sectionHeight, setSectionHeight] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setSectionTop(rect.top + window.scrollY);
        setSectionHeight(rect.height);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  useEffect(() => {
    if (sectionTop && sectionHeight) {
      const sectionScrollStart = sectionTop - window.innerHeight;
      const sectionScrollEnd = sectionTop + sectionHeight;
      const scrollRange = sectionScrollEnd - sectionScrollStart;

      const currentProgress = (scrollPosition - sectionScrollStart) / scrollRange;
      setProgress(Math.min(Math.max(currentProgress, 0), 1));

      const isStickyNow =
        scrollPosition >= sectionTop - window.innerHeight / 2 &&
        scrollPosition <= sectionTop + sectionHeight - window.innerHeight / 2;

      setIsSticky(isStickyNow);
    }
  }, [scrollPosition, sectionTop, sectionHeight]);

  const scale = 0.7 + progress * 0.3;
  const opacity = progress < 0.1 ? progress * 10 : 1;

  const translateX = direction === 'left'
    ? (0.5 - progress) * 100
    : (progress - 0.5) * -100;

  const translateXAdjusted = Math.min(Math.max(translateX, -50), 50);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[130vh] overflow-hidden bg-black" // Restored black background
    >
      <div className={`sticky top-1/2 transform -translate-y-1/2 duration-300 w-full h-screen flex items-end justify-center ${isSticky ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-black/30"> {/* Kept slight overlay */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt={title}
            className="object-contain max-h-[80vh] w-auto max-w-none transform transition-all duration-500 rounded-lg shadow-xl"
            style={{
              transform: `scale(${scale}) translateY(${(1 - progress) * -20}px)`,
              opacity,
              zIndex: 10
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className={`max-w-md ${direction === 'right' ? 'ml-auto mr-8' : 'mr-auto ml-8'} bg-black/60 backdrop-blur-md p-8 rounded-lg transform transition-all duration-300`}
            style={{
              opacity,
              transform: `translateX(${direction === 'right' ? -translateXAdjusted : translateXAdjusted}px)`
            }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">{title}</h2>
            <p className="text-xl text-gray-300 mb-6">{subtitle}</p>
            <button className="px-6 py-2 border border-white/30 rounded-full hover:bg-white/10 transition-colors text-white">
              Learn more
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParallaxSection;