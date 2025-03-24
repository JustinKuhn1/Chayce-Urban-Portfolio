"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';

// Sample image URLs removed from here

// Removing FloatingImages component

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800"></div>
      <motion.div
        className="absolute -inset-[100px] opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob top-0 -left-4"></div>
        <div className="absolute w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 top-0 -right-4"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 bottom-0 left-20"></div>
      </div>
    </div>
  );
};

const ScrollDownIndicator = () => {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1 }}
    >
      
    </motion.div>
  );
};

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [isLoaded, setIsLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Animate on load
  useEffect(() => {
    const sequence = async () => {
      await controls.start({
        y: 0,
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" }
      });
      setIsLoaded(true);
    };
    sequence();
  }, [controls]);

  return (
    <section
      ref={ref}
      id="home"
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
    >
      <AnimatedBackground />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ y: 50, opacity: 0 }}
          animate={controls}
        >
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-gray"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Hi, I'm Chayce Urban
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            A unique individual with distinct qualities you won't find anywhere else.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <motion.a
              href="#projects"
              className="px-8 py-3 bg-gradient-to-r from-[#7692ad] to-[#688eb3] text-white font-medium rounded-full transition-transform hover:scale-105 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Notable Moments
            </motion.a>

            <motion.a
              href="#contact"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-medium rounded-full border border-gray-300 dark:border-gray-700 transition-transform hover:scale-105 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Me
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      <ScrollDownIndicator />

      {/* Overlay at the bottom for smooth scrolling */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-10"></div>
    </section>
  );
};

export default Hero;
