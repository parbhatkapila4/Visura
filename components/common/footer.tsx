"use client";

import Link from "next/link";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "/features" },
      { name: "Changelog", href: "/changelog" },
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "Support", href: "/support" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", href: "https://x.com/Parbhat03", icon: Twitter },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/parbhat-kapila/", icon: Linkedin },
    { name: "GitHub", href: "https://github.com/parbhatkapila4/Visura", icon: Github },
  ];

  return (
    <footer className="w-full px-0 py-8" ref={ref}>
      <div className="w-full px-6 lg:px-12 xl:px-20">
        <motion.div
          className="bg-black rounded-3xl px-6 py-8 relative overflow-hidden shadow-lg border border-gray-200"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-30"></div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Link href="/" className="flex items-center gap-3 mb-4 group">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  </div>
                  <span className="text-white font-bold text-lg">Visura</span>
                </Link>
              </motion.div>
              <p className="text-white mb-6 max-w-sm text-sm leading-relaxed">
                Visura empowers teams to transform complex documents into clear, actionable insights
                - making data easier to understand, analyze, and act on.
              </p>

              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.div
                      key={social.name}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.5 + index * 0.1,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      whileHover={{
                        scale: 1.2,
                        rotate: 5,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <Link
                        href={social.href}
                        className="w-8 h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon className="w-5 h-5" />
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

            {[
              { title: "Product", links: footerLinks.product },
              { title: "Resources", links: footerLinks.resources },
              { title: "Company", links: footerLinks.company },
            ].map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3 + sectionIndex * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <h3 className="text-white font-semibold text-base mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.4 + sectionIndex * 0.1 + linkIndex * 0.05,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      whileHover={{
                        x: 5,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <Link
                        href={link.href}
                        className="text-white hover:text-gray-300 transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-8 pt-4 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <motion.div
                className="text-center sm:text-left"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <p className="text-white text-sm">© {currentYear} Visura. All rights reserved.</p>
              </motion.div>
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {[
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms of Service", href: "/terms" },
                  { name: "Cookies Settings", href: "/cookies" },
                ].map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.9 + index * 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    whileHover={{
                      scale: 1.1,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <Link
                      href={link.href}
                      className="text-white hover:text-gray-300 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
