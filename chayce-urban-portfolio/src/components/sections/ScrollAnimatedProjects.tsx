"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

// Sample project data - replace with your own
const projects = [
  {
    id: 1,
    title: "Golf Range",
    description: "Hooked the ball into someone's car.",
    image: "/297E3CF7-53D0-4B43-918E-DCEF876AFF7C.jpeg",
  },
  {
    id: 2,
    title: "Gym PR Day",
    description: "Succesfully hit 134lbs on the bench with the assistance of King Kuhn by my side. All hail King Kuhn",
    image: "/maxresdefault.jpg",
  },
  {
    id: 3,
    title: "Driving",
    description: "Suicide passed an innocent family at 90mph on a backroad.",
    image: "/download.jpg",
  }
];

const ProjectCard = ({ project, index }: { project: typeof projects[0], index: number }) => {
  const cardRef = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(cardRef, { amount: 0.2, once: false });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, isInView]);

  // Alternate the animation direction based on index
  const isEven = index % 2 === 0;
  const xInitial = isEven ? -100 : 100;

  const cardVariants = {
    hidden: {
      opacity: 0,
      x: xInitial,
      scale: 0.8,
      rotateY: isEven ? -10 : 10
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        duration: 0.8,
        bounce: 0.3,
        delay: index * 0.1,
      },
    },
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={controls}
      className={`relative flex flex-col md:flex-row items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl mb-16 overflow-hidden ${
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      <motion.div
        className="relative w-full md:w-2/5 aspect-video mb-6 md:mb-0"
        whileHover={{ scale: 1.05, rotate: isEven ? 2 : -2 }}
        transition={{ duration: 0.2 }}
      >
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover rounded-lg shadow-lg"
        />
      </motion.div>

      <div className="w-full md:w-3/5 md:px-8">
        <motion.h3
          className="text-2xl font-bold text-gray-800 dark:text-white mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
        >
          {project.title}
        </motion.h3>

        <motion.p
          className="text-gray-600 dark:text-gray-300 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
        >
          {project.description}
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.1 }}
        >
          
        </motion.div>

      </div>
    </motion.div>
  );
};

const ScrollAnimatedProjects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.2, once: false });
  const titleControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      titleControls.start("visible");
    } else {
      titleControls.start("hidden");
    }
  }, [titleControls, isInView]);

  return (
    <section id="projects" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: "easeOut"
              }
            }
          }}
          initial="hidden"
          animate={titleControls}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-bold text-[#7692ad]">
            Notable Moments
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          A glimpse into some of my memorable experiences.
          </p>
        </motion.div>

        <div className="space-y-16">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollAnimatedProjects;