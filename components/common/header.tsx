import { FileText } from "lucide-react";
import { Button } from "../ui/button";
import NavLink from "./nav-link";

export default function Header() {
  const isLoggedIn = false;
  return (
    <nav className="container flex items-center py-4 lg:px-8 px-2 mx-auto">
      <div className="flex items-center gap-2 flex-1">
        <NavLink
          href="/"
          className="flex items-center gap-1 lg:gap-2 shrink-0 "
        >
          <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900 hover:rotate-12 transform transition duration-200 ease-in-out" />
          <span className="font-extrabold lg:text-xl text-gray-900">
            Visura
          </span>
        </NavLink>
      </div>
      <div className="flex justify-center gap-4 lg:gap-12 items-center flex-1">
        <NavLink href="/#pricing">Pricing</NavLink>
        {isLoggedIn && <NavLink href="/dashboard">Your Summaries</NavLink>}
      </div>
      <div className="flex justify-end items-center flex-1">
        {isLoggedIn ? (
          <div className="flex gap-2 items-center">
            <NavLink href="/upload">Upload a PDF</NavLink>
            <div>Pro</div>
            <Button>User</Button>
          </div>
        ) : (
          <div>
            <NavLink href="/sign-in">Sign In</NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}
