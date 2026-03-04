// client/src/components/layout/PublicNavbar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contribute", href: "/contribute" },
    { name: "Login", href: "/login" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* 1. Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold">
                F
              </div>
              <span className="font-bold text-xl tracking-tight text-brand-dark">
                Food<span className="text-brand-blue">Surplus</span>
              </span>
            </Link>
          </div>

          {/* 2. Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-brand-blue font-semibold"
                      : "text-gray-600 hover:text-brand-blue"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* CTA Button */}
            <Link
              href="/apply"
              className="ml-4 px-5 py-2.5 rounded-full bg-brand-blue text-white text-sm font-medium shadow-md hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
            >
              Join Us
            </Link>
          </div>

          {/* 3. Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-brand-blue focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? "text-brand-blue bg-blue-50"
                    : "text-gray-600 hover:text-brand-blue hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/apply"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center mt-4 px-5 py-3 rounded-md bg-brand-blue text-white font-medium hover:bg-blue-700"
            >
              Join Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}