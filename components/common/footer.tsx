import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="container mx-auto px-4 py-8 flex justify-between items-center">
        <div className="">
          <p className="text-white/80 text-sm">
            © {currentYear} Visura. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <Link href="mailto:helpvisura@gmail.com" className="flex items-center gap-2"> <Mail/>For any information, contact us</Link>
          </div>        
      </div>
    </footer>
  );
}
