"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface ParallaxImagesProps {
  images: string[];
  className?: string;
  speed?: number;
}

interface ParallaxImageItemProps {
  src: string;
  index: number;
  scrollYProgress: any; // MotionValue<number>
  speed: number;
  totalImages: number;
}

const ParallaxImageItem = ({
  src,
  index,
  scrollYProgress,
  speed,
  totalImages,
}: ParallaxImageItemProps) => {
  // Hooks called at the top level in this child component
  const yValue = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 100 * speed * (1 + index * 0.15)]
  );
  const scaleValue = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 1 + index * 0.02, 1 - index * 0.05]
  );
  const opacityValue = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    [1, 0.8 - index * 0.1, 0.6 + index * 0.1, 0]
  );

  // Calculate positions and dimensions
  const leftPosition = 20 + (index % 3) * 30;
  const topPosition = 10 + (index % 2) * 40;
  const width = 300 - index * 20;
  const height = 200 - index * 10;

  return (
    <motion.div
      className="absolute rounded-lg overflow-hidden shadow-2xl"
      style={{
        left: `${leftPosition}%`,
        top: `${topPosition}%`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: totalImages - index,
        y: yValue,
        scale: scaleValue,
        opacity: opacityValue,
        rotate: index % 2 === 0 ? -5 : 5,
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
    >
      <Image
        src={src}
        alt={`Parallax Image ${index}`}
        width={width}
        height={height}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
};

const ParallaxImages = ({ images, className = "", speed = 0.5 }: ParallaxImagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {images.map((src, index) => (
        <ParallaxImageItem
          key={index}
          src={src}
          index={index}
          scrollYProgress={scrollYProgress}
          speed={speed}
          totalImages={images.length}
        />
      ))}
    </div>
  );
};

export default ParallaxImages;
