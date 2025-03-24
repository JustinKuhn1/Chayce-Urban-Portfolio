"use client";

import { useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useInView as useIntersectionObserverInView } from 'react-intersection-observer';

// Sample image URLs - replace with your own
const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=600&auto=format&fit=crop",
    alt: "Creative Work",
    width: "full",
  },
  {
    src: "https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?q=80&w=600&auto=format&fit=crop",
    alt: "Website Design",
    width: "half",
  },
  {
    src: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=600&auto=format&fit=crop",
    alt: "Code Editor",
    width: "half",
  },
  {
    src: "https://images.unsplash.com/photo-1607799930031-71dee5b75f3d?q=80&w=600&auto=format&fit=crop",
    alt: "UI Design",
    width: "half",
  },
  {
    src: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=600&auto=format&fit=crop",
    alt: "Mobile App",
    width: "half",
  },
  {
    src: "https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=600&auto=format&fit=crop",
    alt: "Web Development",
    width: "full",
  },
];

const ImageItem = ({ image, index }: { image: typeof IMAGES[0], index: number }) => {
  const { ref, inView } = useIntersectionObserverInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  // Different animations for different positions
  const isEven = index % 2 === 0;

  const variants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
      rotate: isEven ? -2 : 2
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.1,
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${
        image.width === 'full' ? 'col-span-2' : 'col-span-1'
      } overflow-hidden rounded-xl shadow-lg`}
      variants={variants}
      initial="hidden"
      animate={controls}
    >
      <motion.div
        className="relative overflow-hidden group cursor-pointer"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={image.src}
          alt={image.alt}
          className="w-full h-full object-cover transition-transform aspect-[4/3]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <motion.div
          className="absolute bottom-0 left-0 w-full p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          initial={{ y: 20 }}
          whileHover={{ y: 0 }}
        >
          <h3 className="text-lg font-bold">{image.alt}</h3>
          <p className="text-sm opacity-90">View Project</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const ImageGallery = () => {
  const { ref, inView } = useIntersectionObserverInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return (
    <section id="gallery" className="py-24 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5 }
            }
          }}
          initial="hidden"
          animate={controls}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-600">
            My Work Gallery
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A collection of my recent work. Hover over each image to see more details.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {IMAGES.map((image, index) => (
            <ImageItem key={index} image={image} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageGallery;
