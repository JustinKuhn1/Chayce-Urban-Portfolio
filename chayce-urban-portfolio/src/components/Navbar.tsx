"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";

const navLinks = [
  { href: "#about", label: "About Me" },
  { href: "#skills", label: "My Qualities" },
  { href: "#projects", label: "Adventures" },
  { href: "#contact", label: "Hit Me Up" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const animateNavLinks = {
    hidden: { opacity: 0, y: -5 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.header
      className={`sticky top-0 z-40 w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${scrolled ? 'shadow-md py-2' : 'py-4'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="font-bold text-xl md:text-2xl tracking-tight hover:text-primary transition-colors duration-300"
          >
            Chayce Urban
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          className="hidden md:flex gap-8 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              variants={animateNavLinks}
              initial="hidden"
              animate="show"
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <Link
                href={link.href}
                className="text-muted-foreground hover:text-foreground font-medium relative group overflow-hidden inline-block"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
          ))}
          <motion.div
            variants={animateNavLinks}
            initial="hidden"
            animate="show"
            transition={{ delay: navLinks.length * 0.1 + 0.2 }}
          >
            <Button asChild variant="default" className="transition-transform hover:scale-105 duration-200">
              <Link href="#contact">Get in Touch</Link>
            </Button>
          </motion.div>
        </motion.nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="transition-transform active:scale-90 duration-200">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] max-w-sm">
            <div className="flex flex-col h-full">
              <nav className="flex flex-col gap-6">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                  className="mt-4"
                >
                  <Button asChild className="w-full transition-transform hover:scale-105 duration-200">
                    <Link
                      href="#contact"
                      onClick={() => setIsOpen(false)}
                    >
                      Get in Touch
                    </Link>
                  </Button>
                </motion.div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
