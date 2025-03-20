"use client";

import { Goal, Dumbbell, Car, ArrowDown, Brain, User, Calculator } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

type Skill = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const skills: Skill[] = [
  {
    title: "Golfing",
    description: "Passionate about golf and constantly working to improve my game on the course.",
    icon: <Goal className="h-12 w-12 text-primary" />,
  },
  {
    title: "Lifting",
    description: "Dedicated to fitness and strength training with a regular gym routine.",
    icon: <Dumbbell className="h-12 w-12 text-primary" />,
  },
  {
    title: "Driving like a moron",
    description: "Recognized for my unique approach to operating motor vehicles that defies conventional wisdom.",
    icon: <Car className="h-12 w-12 text-primary" />,
  },
  {
    title: "Being short",
    description: "Mastered the art of navigating life from a more compact perspective than average.",
    icon: <ArrowDown className="h-12 w-12 text-primary" />,
  },
  {
    title: "Low IQ",
    description: "Approaching problems with a refreshingly uncomplicated mindset that cuts through unnecessary complexity.",
    icon: <Brain className="h-12 w-12 text-primary" />,
  },
  {
    title: "Self righteous douchebag",
    description: "Confidently maintaining my positions regardless of contradictory evidence or social cues.",
    icon: <User className="h-12 w-12 text-primary" />,
  },
  {
    title: "Terrible at math",
    description: "Making calculators feel appreciated and necessary since day one.",
    icon: <Calculator className="h-12 w-12 text-primary" />,
  },
];

// Animation variants for staggered card animations
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Skills() {
  return (
    <section id="skills" className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <motion.div
          className="text-center space-y-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            My Unique Qualities
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A collection of distinct characteristics that make me who I am.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {skills.map((skill, index) => (
            <motion.div key={index} variants={item}>
              <Card className="transition-all hover:shadow-md hover:-translate-y-1 duration-300 h-full">
                <CardHeader className="pb-2">
                  <div className="mb-4">{skill.icon}</div>
                  <CardTitle>{skill.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {skill.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
