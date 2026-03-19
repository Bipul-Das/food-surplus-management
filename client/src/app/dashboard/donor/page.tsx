// client/src/app/dashboard/donor/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { MessagesWidget } from "@/components/dashboard/DashboardWidgets";
import { Package, Clock, Loader2, ShieldCheck, Database, Send, Gift } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

// ----------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------
interface ExtendedUser {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  organization?: string;
  role?: string;
}

interface TopItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

export default function DonorDashboard() {
  const { user } = useUserStore();
  const currentUser = user as ExtendedUser | null;

  const [stats, setStats] = useState({
    totalDonations: 0,
    thisWeek: 0,
    topItems: [] as TopItem[]
  });
  const [isLoading, setIsLoading] = useState(true);

  // We leave this empty until the WebSocket architecture is deployed
  // const REAL_MESSAGES: any[] = [];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/donors/stats", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const result = await res.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        toast.error("Failed to fetch operational analytics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["DONOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        {/* <PrivateNavbar /> */}

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">

          {/* Header Block */}
          <div className="mb-10 pb-6 border-b-[2.5px] border-gray-900 flex justify-between items-end">
            <div>
              <h1 className="text-[32px] font-normal text-gray-900 tracking-tight uppercase">Donor Operations</h1>
              <p className="text-[16px] text-gray-600 mt-1">Manage surplus inventory and track network contributions.</p>
            </div>
            <div className="bg-[#4a86e8] text-white px-4 py-1.5 font-bold tracking-widest text-[14px] uppercase shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
              Authorized
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COLUMN: Main Telemetry */}
            <div className="lg:col-span-8 space-y-8">

              {/* 1. Quick Navigation Hub */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/inventory" className="flex items-center justify-between p-4 border-[1.5px] border-gray-900 bg-[#f3f4f6] hover:bg-[#6aa84f] hover:text-white transition-colors group">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-wide text-[14px]">My Inventory</span>
                  </div>
                  <span className="font-normal text-xl group-hover:translate-x-1 transition-transform">→</span>
                </Link>

                <Link href="/donations" className="flex items-center justify-between p-4 border-[1.5px] border-gray-900 bg-[#f3f4f6] hover:bg-[#f6b26b] hover:text-white transition-colors group">
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-wide text-[14px]">My Donations</span>
                  </div>
                  <span className="font-normal text-xl group-hover:translate-x-1 transition-transform">→</span>
                </Link>

                <Link href="/requests" className="flex items-center justify-between p-4 border-[1.5px] border-gray-900 bg-[#f3f4f6] hover:bg-[#4a86e8] hover:text-white transition-colors group">
                  <div className="flex items-center gap-3">
                    <Send className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-wide text-[14px]">Current Requests</span>
                  </div>
                  <span className="font-normal text-xl group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>

              {/* 2. Identity Block */}
              <div className="border-[1.5px] border-gray-900 bg-white p-6 md:p-8">
                <div className="flex items-center justify-between border-b-[1.5px] border-gray-900 pb-4 mb-6">
                  <span className="font-bold text-[14px] uppercase tracking-widest text-gray-500">Node Identity</span>
                  <ShieldCheck className="w-6 h-6 text-[#4a86e8]" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-[28px] font-normal text-gray-900 mb-1">{currentUser?.organization || currentUser?.name || "Corporate Partner"}</h3>
                    <p className="text-[14px] font-bold text-[#4a86e8] uppercase tracking-wider">Donor Node</p>
                  </div>

                  <Link
                    href={`/profile/${currentUser?.id}`}
                    className="px-6 py-2.5 bg-gray-900 text-white font-bold text-[14px] uppercase tracking-widest hover:bg-[#4a86e8] hover:text-white transition-colors text-center shadow-[2px_2px_0px_0px_rgba(17,24,39,0.3)]"
                  >
                    View Public Profile
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-[1.5px] border-gray-200 p-4">
                    <span className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Official Email</span>
                    <span className="text-[16px] font-medium text-gray-900">{currentUser?.email || "-"}</span>
                  </div>

                  {/* Conditionally render Phone if available */}
                  {currentUser?.phone && (
                    <div className="border-[1.5px] border-gray-200 p-4">
                      <span className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Contact</span>
                      <span className="text-[16px] font-medium text-gray-900">{currentUser.phone}</span>
                    </div>
                  )}

                  {/* Conditionally render Location if available */}
                  {(currentUser?.city || currentUser?.address) && (
                    <div className="border-[1.5px] border-gray-200 p-4 md:col-span-2">
                      <span className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Operating Location</span>
                      <span className="text-[16px] font-medium text-gray-900 capitalize">
                        {[currentUser?.address, currentUser?.city].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Real-Time Telemetry */}
              {isLoading ? (
                <div className="flex justify-center py-12 border-[1.5px] border-gray-900"><Loader2 className="w-8 h-8 animate-spin text-gray-900" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#f3f4f6] border-[1.5px] border-gray-900 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                      <Package className="w-8 h-8 mb-3 text-gray-900" />
                      <span className="text-[32px] font-normal text-gray-900 leading-none">{stats.totalDonations}</span>
                      <span className="text-[12px] font-bold uppercase text-gray-500 mt-2 tracking-wider">Total Donations</span>
                    </div>
                    <div className="bg-[#e6e6e6] border-[1.5px] border-gray-900 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                      <Clock className="w-8 h-8 mb-3 text-gray-900" />
                      <span className="text-[32px] font-normal text-gray-900 leading-none">{stats.thisWeek}</span>
                      <span className="text-[12px] font-bold uppercase text-gray-500 mt-2 tracking-wider">This Week</span>
                    </div>
                  </div>

                  {/* 4. Top Donated Items Matrix */}
                  <div className="border-[1.5px] border-gray-900 bg-white p-6 md:p-8">
                    <h2 className="text-[20px] font-normal text-gray-900 uppercase tracking-widest mb-6">Top Donated Commodities</h2>

                    {stats.topItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.topItems.map((item, index) => (
                          <div key={item.name} className="flex items-center justify-between border-[1.5px] border-gray-900 p-4 bg-gray-50">
                            <div className="flex items-center gap-4">
                              <span className="text-[20px] font-bold text-gray-400">0{index + 1}</span>
                              <span className="text-[16px] font-bold text-gray-900 uppercase tracking-wider">{item.name}</span>
                            </div>
                            <div className="text-[16px] font-normal text-gray-900">
                              {item.quantity} <span className="text-gray-500 text-[14px]">{item.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#f3f4f6] border-[1.5px] border-gray-900 p-8 text-center text-[15px] font-medium text-gray-600 uppercase tracking-wider">
                        Awaiting initial donation data to generate analytics.
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>

            {/* RIGHT COLUMN: COMMS Hub */}
            <div className="lg:col-span-4 h-[600px] lg:sticky lg:top-24">
              <MessagesWidget />
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}