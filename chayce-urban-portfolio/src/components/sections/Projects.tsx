"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Camera } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type Project = {
  title: string;
  description: string;
  imageSrc: string;
  tags: string[];
  link?: string;
};

const projects: Project[] = [
  {
    title: "Golf Range",
    description: "Hooked the ball into someone's car.",
    imageSrc: "/297E3CF7-53D0-4B43-918E-DCEF876AFF7C.jpeg",
    tags: ["Golf", "Sports"],
    link: "#",
  },
  {
    title: "Gym PR Day",
    description: "Succesfully hit 134lbs on the bench with the assistance of King Kuhn by my side. All hail King Kuhn",
    imageSrc: "/maxresdefault.jpg",
    tags: ["Fitness", "Lifting", "Challenge"],
    link: "#",
  },
  {
    title: "Driving",
    description: "Suicide passed an innocent family at 90mph on a backroad.",
    imageSrc: "/download.jpg",
    tags: ["Travel", "Driving", "Adventure"],
    link: "#",
  },
];

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Projects() {
  return (
    <section id="projects" className="py-16 md:py-24">
      <div className="container">
        <motion.div
          className="text-center space-y-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Notable Moments
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A glimpse into some of my memorable experiences.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {projects.map((project, index) => (
            <motion.div key={index} variants={item}>
              <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-lg hover:-translate-y-2 duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={project.imageSrc}
                    alt={project.title}
                    layout="fill"
                    objectFit="cover"
                  />
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center group">
                    
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200 hover:bg-primary/10">
                        {tag}
                      </span>
                    ))}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{project.description}</p>
                </CardContent>
                {project.link && (
                  <CardFooter>
                    <Button size="sm" variant="outline" asChild className="transition-transform hover:scale-105 duration-200">
                      <Link href={project.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        See More
                      </Link>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}