import Link from "next/link";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "/#features" },
      { name: "Pricing", href: "/#pricing" },
      { name: "API Docs", href: "/docs" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/visura", icon: Twitter },
    { name: "LinkedIn", href: "https://linkedin.com/company/visura", icon: Linkedin },
    { name: "GitHub", href: "https://github.com/visura", icon: Github },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-3 group">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-xs">V</span>
                </div>
                <span className="text-gray-900 font-bold text-lg">Visura</span>
              </Link>
              <p className="text-gray-600 mb-4 max-w-md text-sm leading-relaxed">
                AI-powered document analysis platform that transforms complex documents into actionable insights.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Links Sections */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-3 text-sm">Product</h3>
              <ul className="space-y-1.5">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-gray-900 font-semibold mb-3 text-sm">Company</h3>
              <ul className="space-y-1.5">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-500 text-sm">
                © {currentYear} Visura. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="mailto:help@visura.ai"
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                <Mail size={16} />
                <span>help@visura.ai</span>
              </Link>
              <div className="flex items-center gap-2 text-sm">
                {footerLinks.legal.map((link, index) => (
                  <span key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {link.name}
                    </Link>
                    {index < footerLinks.legal.length - 1 && <span className="mx-2">•</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
