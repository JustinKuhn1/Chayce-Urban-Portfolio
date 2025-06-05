"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { motion } from "framer-motion";
import Collage from "@/components/sections/Collage";
import RedBullCan from "./RedBullCan";
import ChayceFight from "./ChayceFight";

export default function About() {
  return (
    <motion.section
      id="about"
      className="py-16 md:py-24 bg-muted/50"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <motion.div
            className="md:w-1/3 flex justify-center"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Avatar className="h-64 w-64 border-4 border-background shadow-xl transition-all duration-500 hover:scale-105">
              <AvatarImage src="/Screenshot 2025-03-19 213509.png" alt="Chayce Urban" />
              <AvatarFallback className="text-4xl"></AvatarFallback>
            </Avatar>
          </motion.div>

          <motion.div
            className="md:w-2/3 space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              About Me
            </h2>
            
            <p className="text-lg text-muted-foreground">
              I'm a passionate learner with a love for technology and sports.
            </p>

            <p className="text-lg text-muted-foreground">
              When I'm not coding, you'll find me on the golf course or hitting the gym.
            </p>

            <div className="pt-4">
              <Button asChild variant="outline" className="transition-transform hover:scale-105 duration-300">
                <Link href="#skills">Explore My Skills</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Horizontal layout for RedBullCan and ChayceFight */}
        <motion.div
          className="flex justify-center items-center space-x-4 mt-8"
          whileHover={{ scale: 1.05 }}
        >
          <RedBullCan />
          <ChayceFight />
        </motion.div>
        
        <div className="mt-12">
          <Collage />
        </div>
      </div>
    </motion.section>
  );
}