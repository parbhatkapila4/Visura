import Link from "next/link";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "/#features" },
      { name: "Pricing", href: "/#pricing" },
      { name: "Changelog", href: "/changelog" },
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "Support", href: "/support" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Partners", href: "/partners" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/visura", icon: Twitter },
    { name: "Instagram", href: "https://instagram.com/visura", icon: Linkedin },
    { name: "GitHub", href: "https://github.com/visura", icon: Github },
  ];

  return (
    <footer className="w-full px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-black rounded-3xl px-8 py-12 relative overflow-hidden">
          {/* Gradient overlay at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-30"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4 group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                </div>
                <span className="text-white font-bold text-lg">Visura</span>
              </Link>
              <p className="text-gray-300 mb-6 max-w-sm text-sm leading-relaxed">
                Visura empowers teams to transform complex documents into clear, actionable insights — making data easier to understand, analyze, and act on.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="w-8 h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="text-center">
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-6 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-gray-400 text-sm">
                  © {currentYear} Visura. All rights reserved.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Cookies Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
