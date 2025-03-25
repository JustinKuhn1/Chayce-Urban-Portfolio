"use client";

import Link from "next/link";
import { Github, Linkedin, Mail, Instagram, Twitter } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Instagram className="h-5 w-5" />, href: "https://www.instagram.com/cmurban_06?igsh=MWtocTN6dTJ5aGVscA==", label: "Instagram" },
    { icon: <Mail className="h-5 w-5" />, href: "mailto:cmurban@icloud.com", label: "Email" },
  ];

  return (
    <footer className="bg-muted/20 py-12">
      <div className="container">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold">Chayce Urban</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Living life one questionable decision at a time.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              &copy; {currentYear} | All rights reserved
            </p>
          </div>

          <div className="flex gap-6">
            {socialLinks.map((link, index) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Link
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  aria-label={link.label}
                >
                  {link.icon}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-10 text-center text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p>Developed by Justin Kuhn</p>
        </motion.div>
      </div>
    </footer>
  );
}
