"use client";

import Image from 'next/image';
import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="container">
        <motion.div
          className="text-center space-y-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-bold text-[#7692ad]">
            Contact
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Hit me up, I'm lonely.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <motion.div
            className="md:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" /> Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  <a href="mailto:cmurban@icloud.com" className="hover:text-foreground transition-colors">
                    cmurban@icloud.com
                  </a>
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" /> Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  <a href="tel:+14126998128" className="hover:text-foreground transition-colors">
                    (412) 699-8128
                  </a>
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  214 Victoria Dr<br />
                  Plum, PA 15239
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="md:col-span-2 relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="w-full h-full">
              <CardHeader>
                <CardTitle>Location View</CardTitle>
              </CardHeader>
              <CardContent className="relative w-full aspect-video">
                <Image 
                  src="/hcaycehouse.png" 
                  alt="214 Victoria Dr, Plum, PA" 
                  fill
                  className="object-cover"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}