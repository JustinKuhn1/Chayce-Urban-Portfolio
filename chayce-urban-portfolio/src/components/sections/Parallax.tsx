"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxImagesProps {
  images: string[];
  className?: string;
  speed?: number;
}

const ParallaxImages = ({ images, className = '', speed = 0.5 }: ParallaxImagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {images.map((src, index) => {
        // Static transform values based on index
        const yTransform = [0, 100 * speed * (1 + index * 0.15)];
        const scaleTransform = [1, 1 + index * 0.02, 1 - index * 0.05];
        const opacityTransform = [1, 0.8 - index * 0.1, 0.6 + index * 0.1, 0];

        const yValue = useTransform(scrollYProgress, [0, 1], yTransform);
        const scaleValue = useTransform(scrollYProgress, [0, 0.5, 1], scaleTransform);
        const opacityValue = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], opacityTransform);

        // Position each image at a different place
        const leftPosition = 20 + (index % 3) * 30;
        const topPosition = 10 + (index % 2) * 40;

        return (
          <motion.div
            key={index}
            className="absolute rounded-lg overflow-hidden shadow-2xl"
            style={{
              left: `${leftPosition}%`,
              top: `${topPosition}%`,
              width: `${300 - index * 20}px`,
              height: `${200 - index * 10}px`,
              zIndex: images.length - index,
              y: yValue,
              scale: scaleValue,
              opacity: opacityValue,
              rotate: index % 2 === 0 ? -5 : 5,
            }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            <img
              src={src}
              alt={`Parallax Image ${index}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default ParallaxImages;