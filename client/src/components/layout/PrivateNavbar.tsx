// client/src/components/layout/PrivateNavbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useMessageStore } from "@/store/messageStore";
import { LogOut, User as UserIcon, Menu, X, ShieldAlert } from "lucide-react";
import { useState } from "react";

// Define the shape of a Navigation Link
interface NavLink {
  name: string;
  href: string;
}

export default function PrivateNavbar() {
  const { user, logout } = useUserStore();
  const { unreadCount } = useMessageStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Define Links for each Role
  const commonLinks: NavLink[] = [
    { name: "Home", href: "/" }, // Homepage is always included
  ];

  const donorLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard/donor" },
    { name: "My Inventory", href: "/inventory" },
    { name: "My Donations", href: "/donations" },
    { name: "Messages", href: "/messages" },
  ];

  const receiverLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard/receiver" },
    { name: "My Requests", href: "/requests" },
    { name: "Logbook", href: "/logbook" },
    { name: "Messages", href: "/messages" },
  ];

  const deliveryLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard/delivery" },
    { name: "My Deliveries", href: "/deliveries" },
    { name: "Messages", href: "/messages" },
  ];

  const coordinatorLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard/coordinator" },
    { name: "Applications", href: "/applications" },
    { name: "Community", href: "/community" },
    { name: "Messages", href: "/messages" },
  ];

  // 2. The Logic Engine: Determine which links to show based on Role
  const getLinks = (): NavLink[] => {
    if (!user) return [];

    // 👑 GOD MODE: Lead Dev sees a merged view of critical pages
    if (user.role === "LEAD_DEV") {
      return [
        ...commonLinks,
        { name: "Dev Dashboard", href: "/dashboard/admin" },
        { name: "Inventory (All)", href: "/inventory" },
        { name: "Requests (All)", href: "/requests" },
        { name: "Deliveries (All)", href: "/deliveries" },
        { name: "Applications", href: "/applications" },
      ];
    }

    // Standard Roles
    switch (user.role) {
      case "DONOR":
        return [...commonLinks, ...donorLinks];
      case "RECEIVER":
        return [...commonLinks, ...receiverLinks];
      case "DELIVERY_MAN":
        return [...commonLinks, ...deliveryLinks];
      case "COORDINATOR":
        return [...commonLinks, ...coordinatorLinks];
      default:
        return commonLinks;
    }
  };

  const currentLinks = getLinks();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null; // Safety check: Don't render if not logged in

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left Side: Brand & Desktop Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl text-brand-dark">
                Food<span className="text-brand-blue">Surplus</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {currentLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "border-b-2 border-brand-blue text-brand-blue" // Active State Protocol
                        : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {link.name}
                    {/* Message Badge Logic */}
                    {link.name === "Messages" && unreadCount > 0 && (
                      <span className="ml-2 bg-brand-error text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side: Profile Badge & Logout */}
          <div className="hidden md:flex md:items-center gap-4">
            
            {/* User Profile Pill */}
            <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-brand-dark leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">
                  {user.role === "LEAD_DEV" ? "DEV MODE" : user.role}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center">
                {user.role === "LEAD_DEV" ? <ShieldAlert size={16} /> : <UserIcon size={16} />}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-brand-error transition-colors p-2 rounded-full hover:bg-red-50"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-brand-blue p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4 shadow-xl">
          <div className="pt-2 pb-3 space-y-1">
            {currentLinks.map((link) => {
               const isActive = pathname === link.href;
               return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? "bg-blue-50 border-brand-blue text-brand-blue"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  }`}
                >
                  {link.name}
                </Link>
               )
            })}
            <button
              onClick={handleLogout}
              className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-brand-error hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}