"use client";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";
import MouseTrailEffect from '@/components/sections/MouseTrailEffects';
import ParallaxSection from "@/components/sections/ParallaxSection";

import { useState, useEffect } from 'react';

export default function Home() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <About />
      <ParallaxSection
        title="Golfing"
        subtitle="Hooked the ball into someone's car."
        imageSrc="/297E3CF7-53D0-4B43-918E-DCEF876AFF7C.jpeg"
        direction="right"
        scrollPosition={scrollPosition}
        sectionIndex={0}
      />

      <ParallaxSection
        title="Gym PR Day"
        subtitle="Succesfully hit 134lbs on the bench with the assistance of King Kuhn by my side. All hail King Kuhn"
        imageSrc="/maxresdefault.jpg"
        direction="left"
        scrollPosition={scrollPosition}
        sectionIndex={1}
      />

      <ParallaxSection
        title="Driving"
        subtitle="Suicide passed an innocent family at 90mph on a backroad."
        imageSrc="/download.jpg"
        direction="right"
        scrollPosition={scrollPosition}
        sectionIndex={2}
      />

        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}