import { FileText, Github, Twitter, Mail, Shield, Zap, Users, Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">Visura</span>
            </div>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              AI-powered PDF insight engine that transforms complex documents into clear, 
              actionable insights in seconds.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://github.com" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="mailto:hello@visura.com" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Upload PDF
                </Link>
              </li>
              <li>
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#help" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#docs" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#status" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Status
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#privacy" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#security" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Lightning Fast</h4>
                <p className="text-gray-600 text-xs">Get insights in seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Secure & Private</h4>
                <p className="text-gray-600 text-xs">Your documents are protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Trusted by Thousands</h4>
                <p className="text-gray-600 text-xs">Join our growing community</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <span>© {currentYear} Visura. Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for document lovers.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>Powered by AI</span>
              <span>•</span>
              <span>Built with Next.js</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
