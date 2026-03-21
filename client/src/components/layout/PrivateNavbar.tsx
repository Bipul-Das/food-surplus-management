// client/src/components/layout/PrivateNavbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useMessageStore } from "@/store/messageStore";
import { LogOut, User as UserIcon, Menu, X, ShieldAlert, ChevronDown, ChevronRight, Home } from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "@/components/common/Logo"; // NEW: Import centralized Logo

// ----------------------------------------------------------------------
// TYPES & DATA DICTIONARIES
// ----------------------------------------------------------------------
interface NavLink {
  name: string;
  href: string;
}

interface SidebarSection {
  title: string;
  links: NavLink[];
}

export default function PrivateNavbar() {
  const { user, logout } = useUserStore();
  const { unreadCount } = useMessageStore();
  const pathname = usePathname();
  const router = useRouter();

  // State for Mobile Top Menu and Desktop Sidebar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("Only Me");

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; }
  }, [isSidebarOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!user) return null;

  // Generate fallback initials if no avatar exists
  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "US";

  // ----------------------------------------------------------------------
  // TOP NAVBAR LOGIC (Original Horizontal Tabs)
  // ----------------------------------------------------------------------
  const commonLinks: NavLink[] = [{ name: "Home", href: "/" }];

  const donorLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard/donor" },
    { name: "My Inventory", href: "/inventory" },
    { name: "My Donations", href: "/donations" },
    { name: "Messages", href: "/messages" },
  ];

  const receiverLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard/receiver" },
    { name: "My Requests", href: "/my-requests" },
    { name: "Logbook", href: "/logbook" },
    { name: "Messages", href: "/messages" },
  ];

  const deliveryLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard/delivery_man" },
    { name: "My Deliveries", href: "/my-deliveries" },
    { name: "Messages", href: "/messages" },
  ];

  const coordinatorLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard/coordinator" },
    { name: "Applications", href: "/applications" },
    { name: "All Inventories", href: "/inventory_all" }, { name: "Active Requests", href: "/requests" }, 
    { name: "Messages", href: "/messages" },
  ];

  const getTopLinks = (): NavLink[] => {
    if (user.role === "LEAD_DEV") return [...commonLinks, { name: "Dev Dashboard", href: "/dashboard/admin" }, { name: "All Inventories", href: "/inventory_all" }, { name: "All Requests", href: "/requests" }, { name: "Find Delivery Men", href: "/deliveries" }, { name: "Applications", href: "/applications" }];
    if (user.role === "DONOR") return [...commonLinks, ...donorLinks];
    if (user.role === "RECEIVER") return [...commonLinks, ...receiverLinks];
    if (user.role === "DELIVERY_MAN") return [...commonLinks, ...deliveryLinks];
    if (user.role === "COORDINATOR") return [...commonLinks, ...coordinatorLinks];
    return commonLinks;
  };

  const topLinks = getTopLinks();

  // ----------------------------------------------------------------------
  // SIDEBAR LOGIC ENGINE (Categorized Dropdowns)
  // ----------------------------------------------------------------------
  const getSidebarConfig = (): SidebarSection[] => {
    const role = user.role;
    let config: SidebarSection[] = [];

    if (role === "DONOR") {
      config = [
        { title: "Only Me", links: [{ name: "Public Profile", href: `/profile/${user.id}` }, { name: "Dashboard", href: "/dashboard/donor" }, { name: "Edit Profile", href: "/edit-profile" }, { name: "My Inventory", href: "/inventory" }, { name: "My Donations", href: "/donations" }, { name: "Messages", href: "/messages" }] },
        { title: "Global", links: [{ name: "All Inventories", href: "/inventory_all" }, { name: "Active Requests", href: "/requests" }, { name: "Active Deliveries", href: "/deliveries" }, { name: "Apply", href: "/apply" }] }
      ];
    } else if (role === "RECEIVER") {
      config = [
        { title: "Only Me", links: [{ name: "Public Profile", href: `/profile/${user.id}` }, { name: "Dashboard", href: "/dashboard/receiver" }, { name: "Edit Profile", href: "/edit-profile" }, { name: "Request Food", href: "/request-food" }, { name: "My Requests", href: "/my-requests" }, { name: "My Logbook", href: "/logbook" }, { name: "Messages", href: "/messages" }] },
        { title: "Global", links: [{ name: "All Inventories", href: "/inventory_all" }, { name: "Active Requests", href: "/requests" }, { name: "Active Deliveries", href: "/deliveries" }, { name: "Apply", href: "/apply" }] }
      ];
    } else if (role === "DELIVERY_MAN") {
      config = [
        { title: "Only Me", links: [{ name: "Public Profile", href: `/profile/${user.id}` }, { name: "Dashboard", href: "/dashboard/delivery_man" }, { name: "Edit Profile", href: "/edit-profile" }, { name: "My Deliveries", href: "/my-deliveries" }, { name: "Messages", href: "/messages" }] },
        { title: "Global", links: [{ name: "All Inventories", href: "/inventory_all" }, { name: "Active Requests", href: "/requests" }, { name: "Active Deliveries", href: "/deliveries" }, { name: "Apply", href: "/apply" }] }
      ];
    } else if (role === "COORDINATOR") {
      config = [
        { title: "Only Me", links: [{ name: "Public Profile", href: `/profile/${user.id}` }, { name: "Dashboard", href: "/dashboard/coordinator" }, { name: "Edit Profile", href: "/edit-profile" }, { name: "Messages", href: "/messages" }] },
        { title: "Global", links: [{ name: "All Inventories", href: "/inventory_all" }, { name: "All Requests", href: "/requests" }, { name: "Active Deliveries", href: "/deliveries" }, { name: "Applications", href: "/applications" }, { name: "Staff Management", href: "/staff-management" }, { name: "Apply", href: "/apply" }] }
      ];
    } else if (role === "LEAD_DEV") {
      config = [
        { title: "Only Me", links: [{ name: "Public Profile", href: `/profile/${user.id}` }, { name: "Dev Dashboard", href: "/dashboard/admin" }, { name: "Edit Profile", href: "/edit-profile" }, { name: "Messages", href: "/messages" }, { name: "My Requests", href: "/my-requests" }, { name: "My Donations", href: "/donations" }, { name: "My Deliveries", href: "/my-deliveries" }, { name: "My Inventory", href: "/inventory" }] },
        { title: "Global", links: [{ name: "All Inventories", href: "/inventory_all" }, { name: "All Requests", href: "/requests" }, { name: "Active Deliveries", href: "/deliveries" }, { name: "Applications", href: "/applications" }, { name: "Staff Management", href: "/staff-management" }, { name: "Request Food", href: "/request-food" }, { name: "Apply", href: "/apply" }, { name: "Logbook", href: "/logbook" }] }
      ];
    }
    return config;
  };

  const sidebarConfig = getSidebarConfig();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleSection = (title: string) => {
    if (expandedSection === title) setExpandedSection(null);
    else setExpandedSection(title);
  };

  return (
    <>
      {/* ---------------------------------------------------------------------- */}
      {/* TOP NAVBAR (Always Visible) */}
      {/* ---------------------------------------------------------------------- */}
      <nav className="bg-white border-b-[1.5px] border-gray-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Left Side: Hamburger, Brand & Desktop Links */}
            <div className="flex items-center gap-6">

              {/* SIDEBAR HAMBURGER */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-900 hover:text-[#4a86e8] p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Open Sidebar Menu"
              >
                <Menu size={28} />
              </button>

              {/* UPGRADED: Centralized Logo Component */}
              <Logo iconSize="md" />

              {/* ORIGINAL DESKTOP NAVIGATION TABS */}
              <div className="hidden lg:flex md:space-x-6 ml-4">
                {topLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${isActive
                        ? "border-b-2 border-[#4a86e8] text-[#4a86e8]"
                        : "border-b-2 border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                        }`}
                    >
                      {link.name}
                      {link.name === "Messages" && unreadCount > 0 && (
                        <span className="ml-2 bg-[#cc0000] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Profile Badge & Logout (Desktop Only) */}
            <div className="hidden lg:flex md:items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-1.5 rounded-full border-[1.5px] border-gray-900 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-gray-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#4a86e8] uppercase tracking-wider">
                    {user.role === "LEAD_DEV" ? "DEV MODE" : user.role.replace('_', ' ')}
                  </span>
                </div>

                {/* UPGRADED AVATAR DISPLAY */}
                <div className="h-8 w-8 rounded-[50%] bg-[#4a86e8] border-[1.5px] border-gray-900 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : user.role === "LEAD_DEV" ? (
                    <ShieldAlert size={16} className="text-white" />
                  ) : (
                    <span className="text-[12px] font-bold text-white">{initials}</span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-gray-900 hover:text-[#cc0000] transition-colors p-2 hover:bg-red-50 rounded-full"
                title="Logout"
              >
                <LogOut size={22} />
              </button>
            </div>

            {/* Mobile Top Menu Button (Original) */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-[#4a86e8] p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Original Mobile Menu Dropdown (For Top Links) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 pb-4 shadow-xl">
            <div className="pt-2 pb-3 space-y-1">
              {topLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive
                      ? "bg-blue-50 border-[#4a86e8] text-[#4a86e8]"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900"
                      }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-[#cc0000] hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ---------------------------------------------------------------------- */}
      {/* OFF-CANVAS SIDEBAR SYSTEM */}
      {/* ---------------------------------------------------------------------- */}

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[300px] bg-[#f9f9f9] border-r-[2px] border-gray-900 shadow-[8px_0px_0px_0px_rgba(17,24,39,0.1)] z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b-[1.5px] border-gray-900 bg-white">
          <span className="font-bold text-[18px] text-gray-900 uppercase tracking-widest">Menu</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-900 hover:text-[#cc0000] p-1 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-4">

          {/* Always show Home at the top */}
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-[17px] font-bold text-gray-900 hover:bg-[#4a86e8] hover:text-white border-[1.5px] border-transparent hover:border-gray-900 transition-all rounded-md"
          >
            <Home size={20} /> Home
          </Link>

          {/* Render Dynamic Sections (Only Me / Global) */}
          {sidebarConfig.map((section, idx) => (
            <div key={idx} className="border-[1.5px] border-gray-900 bg-white rounded-md overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#e6e6e6] hover:bg-[#d9d9d9] transition-colors"
              >
                <span className="font-bold text-[16px] text-gray-900 uppercase tracking-wide">{section.title}</span>
                {expandedSection === section.title ? <ChevronDown size={20} className="text-gray-900" /> : <ChevronRight size={20} className="text-gray-900" />}
              </button>

              {/* Dropdown Links */}
              {expandedSection === section.title && (
                <div className="flex flex-col py-2 px-2 gap-1 bg-white">
                  {section.links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center justify-between px-4 py-2.5 text-[15px] font-medium rounded-md transition-colors ${isActive
                          ? "bg-[#4a86e8]/10 text-[#4a86e8] border-[1.5px] border-[#4a86e8]"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-[1.5px] border-transparent"
                          }`}
                      >
                        {link.name}
                        {link.name === "Messages" && unreadCount > 0 && (
                          <span className="bg-[#cc0000] text-white text-[11px] font-bold px-2 py-0.5 rounded-full border border-gray-900">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

        </div>

        {/* Sidebar-Only Logout */}
        <div className="p-4 border-t-[1.5px] border-gray-900 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#cc0000] text-white font-bold border-[1.5px] border-gray-900 hover:bg-[#a60000] transition-colors rounded-md"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>

      </div>
    </>
  );
}