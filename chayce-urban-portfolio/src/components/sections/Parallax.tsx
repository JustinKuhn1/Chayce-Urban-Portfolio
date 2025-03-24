"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image"; // Import Next.js Image component

interface ParallaxImagesProps {
  images: string[];
  className?: string;
  speed?: number;
}

const ParallaxImages = ({ images, className = "", speed = 0.5 }: ParallaxImagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use scrollYProgress at the top level
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Compute transforms at the top level
  const yTransforms = images.map((_, index) =>
    useTransform(scrollYProgress, [0, 1], [0, 100 * speed * (1 + index * 0.15)])
  );
  const scaleTransforms = images.map((_, index) =>
    useTransform(scrollYProgress, [0, 0.5, 1], [1, 1 + index * 0.02, 1 - index * 0.05])
  );
  const opacityTransforms = images.map((_, index) =>
    useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [1, 0.8 - index * 0.1, 0.6 + index * 0.1, 0])
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {images.map((src, index) => {
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
              y: yTransforms[index], // Use precomputed values
              scale: scaleTransforms[index],
              opacity: opacityTransforms[index],
              rotate: index % 2 === 0 ? -5 : 5,
            }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            <Image
              src={src}
              alt={`Parallax Image ${index}`}
              width={300 - index * 20}
              height={200 - index * 10}
              className="w-full h-full object-cover"
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default ParallaxImages;
