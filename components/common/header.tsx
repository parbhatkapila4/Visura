import Link from "next/link";
import { FileText } from "lucide-react";

export default function Header() {
  return (
    <nav className="container flex justify-between items-center py-4 lg:px-8 px-2 mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-1 lg:gap-2 shrink-0">
          <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900 hover:rotate-12 transform transition duration-200 ease-in-out" />
          Visura
        </Link>
      </div>
      <div className="flex items-center">
        <Link
          href="/#pricing"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Pricing
        </Link>
      </div>
      <div className="flex items-center">
        <Link
          href="/#sign-in"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}
