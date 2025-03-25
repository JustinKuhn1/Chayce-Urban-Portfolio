import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import ScrollAnimatedProjects from "@/components/sections/ScrollAnimatedProjects";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <About />
        <ScrollAnimatedProjects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}