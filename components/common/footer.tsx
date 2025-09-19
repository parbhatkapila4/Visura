import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="text-center sm:text-left">
            <p className="text-white/80 text-sm">
              © {currentYear} Visura. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Link
              href="mailto:helpvisura@gmail.com"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail size={16} />
              <span className="hidden sm:inline">
                For any information, contact us
              </span>
              <span className="sm:hidden">Contact us</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
