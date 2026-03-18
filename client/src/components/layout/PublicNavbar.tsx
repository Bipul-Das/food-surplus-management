// client/src/components/layout/PublicNavbar.tsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User as UserIcon, ShieldAlert, LogOut } from "lucide-react";
import { useState } from "react";
import { useUserStore } from "@/store/userStore";

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // 1. Hook into the Global State
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Determine the correct dashboard route based on role
  const getDashboardRoute = () => {
    if (!user) return "/";
    switch (user.role) {
      case "LEAD_DEV": return "/dashboard/admin";
      case "DONOR": return "/dashboard/donor";
      case "RECEIVER": return "/dashboard/receiver";
      case "DELIVERY_MAN": return "/dashboard/delivery_man";
      case "COORDINATOR": return "/dashboard/coordinator";
      default: return "/";
    }
  };

  // Standard public links
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contribute", href: "/contribute" },
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
                  className={`text-sm font-medium transition-colors duration-200 ${isActive
                      ? "text-brand-blue font-semibold"
                      : "text-gray-600 hover:text-brand-blue"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* 3. Conditional Rendering: Auth vs Guest */}
            {user ? (
              // AUTHENTICATED STATE: Show the Brutalist Profile Pill and Logout
              <div className="flex items-center gap-4 ml-4">
                <Link href={getDashboardRoute()} className="flex items-center gap-3 bg-gray-50 px-4 py-1.5 rounded-full border-[1.5px] border-gray-900 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-bold text-gray-900 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-bold text-[#4a86e8] uppercase tracking-wider">
                      {user.role === "LEAD_DEV" ? "DEV MODE" : user.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-[50%] bg-[#4a86e8] border-[1.5px] border-gray-900 text-white flex items-center justify-center">
                    {user.role === "LEAD_DEV" ? <ShieldAlert size={16} /> : <UserIcon size={16} />}
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-900 hover:text-[#cc0000] transition-colors p-2 hover:bg-red-50 rounded-full"
                  title="Logout"
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              // GUEST STATE: Show Login and Join Us buttons
              <div className="flex items-center gap-4 ml-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/apply"
                  className="px-5 py-2.5 rounded-full bg-brand-blue text-white text-sm font-medium shadow-md hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
                >
                  Join Us
                </Link>
              </div>
            )}

          </div>

          {/* 4. Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-brand-blue focus:outline-none p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === link.href
                    ? "text-brand-blue bg-blue-50"
                    : "text-gray-600 hover:text-brand-blue hover:bg-gray-50"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Conditional Mobile Auth Buttons */}
            {user ? (
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  href={getDashboardRoute()}
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-5 py-3 rounded-md bg-gray-50 border border-gray-200 text-brand-dark font-medium hover:bg-gray-100"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full text-center px-5 py-3 rounded-md bg-red-50 text-[#cc0000] font-medium hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-5 py-3 rounded-md bg-gray-50 text-gray-700 font-medium hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  href="/apply"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-5 py-3 rounded-md bg-brand-blue text-white font-medium hover:bg-blue-700"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}