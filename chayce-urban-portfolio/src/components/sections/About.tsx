"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-16 md:py-24 bg-muted/50">
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
              <AvatarImage src="/images/profile.jpg" alt="Chayce Urban" />
              <AvatarFallback className="text-4xl">CU</AvatarFallback>
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
              Hello! I'm Chayce Urban, just your average guy with some not-so-average qualities. Life's too short to take everything seriously, so I don't.
            </p>

            <p className="text-lg text-muted-foreground">
              When I'm not on the golf course perfecting my swing (or trying to), you might find me at the gym lifting weights or behind the wheel demonstrating my unique approach to driving that keeps everyone on their toes.
            </p>

            <p className="text-lg text-muted-foreground">
              I'm not ashamed to embrace all aspects of who I am - from my compact stature to my refreshingly uncomplicated approach to problem-solving. Some might call it low IQ; I call it cutting through the noise.
            </p>

            <div className="pt-4">
              <Button asChild variant="outline" className="transition-transform hover:scale-105 duration-300">
                <Link href="#skills">Check Out My Qualities</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
