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
    description: "Passionate about golf and consistently hitting 70 on the front nine.",
    icon: <Goal className="h-12 w-12 text-primary" />,
  },
  {
    title: "Lifting",
    description: "2 years in- benching 134lbs and squatting 95lbs.",
    icon: <Dumbbell className="h-12 w-12 text-primary" />,
  },
  {
    title: "Driving like an moron",
    description: "I drive a BMW so it's fine.",
    icon: <Car className="h-12 w-12 text-primary" />,
  },
  {
    title: "Being short",
    description: "Mastered the art of navigating life from a more compact perspective than average.",
    icon: <ArrowDown className="h-12 w-12 text-primary" />,
  },
  {
    title: "Borderline Retarded",
    description: "I will be attending CalU to drink on the daily.",
    icon: <Brain className="h-12 w-12 text-primary" />,
  },
  {
    title: "Self Righteous Douchebag",
    description: "'What color is your BMW?'",
    icon: <User className="h-12 w-12 text-primary" />,
  },
  {
    title: "Natural talent at math",
    description: "6+2×3 = 24",
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-bold text-[#7692ad]">
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
