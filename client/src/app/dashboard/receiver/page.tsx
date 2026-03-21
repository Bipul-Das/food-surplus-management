// client/src/app/dashboard/receiver/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { MessagesWidget } from "@/components/dashboard/DashboardWidgets";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Package,
  Clock,
  HeartHandshake,
  Loader2,
  ShieldCheck,
  ClipboardList,
  Database,
  Send,
  MapPin
} from "lucide-react";
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
  avatar?: string;
}

interface TopItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

export default function ReceiverDashboard() {
  const { user } = useUserStore();
  const currentUser = user as ExtendedUser | null;

  const [stats, setStats] = useState({
    totalReceived: 0,
    thisWeek: 0,
    peopleFed: 0,
    topItems: [] as TopItem[]
  });
  const [isLoading, setIsLoading] = useState(true);

  const REAL_MESSAGES: any[] = [];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/receivers/stats", {
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

  // Helper for Avatar Fallback & Name Parsing
  const displayName = currentUser?.organization || currentUser?.name || "Partner Organization";
  const initials = displayName.substring(0, 3).toUpperCase();

  return (
    <ProtectedRoute allowedRoles={["RECEIVER", "LEAD_DEV"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">

          {/* SaaS Header Block */}
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-black text-brand-dark tracking-tight">Receiver Operations</h1>
              <p className="text-[15px] font-medium text-gray-500 mt-1">Manage incoming donations and logbook entries.</p>
            </div>
            <Badge variant="warning" size="lg" className="shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
              Clearance: Authorized
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COLUMN: Main Telemetry */}
            <div className="lg:col-span-8 space-y-8">

              {/* 1. Quick Navigation Hub: SaaS Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/my-requests" className="block group">
                  <Card className="cinematic-hover h-full bg-white border-transparent hover:border-brand-blue/30 group-hover:bg-brand-blue/5 transition-all">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-blue/10 rounded-xl text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                          <Send className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[13px] text-brand-dark uppercase tracking-widest">My Requests</span>
                      </div>
                      <span className="text-gray-400 group-hover:text-brand-blue transition-colors group-hover:translate-x-1 duration-300">→</span>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/logbook" className="block group">
                  <Card className="cinematic-hover h-full bg-white border-transparent hover:border-amber-500/30 group-hover:bg-amber-50 transition-all">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[13px] text-brand-dark uppercase tracking-widest">My Logbooks</span>
                      </div>
                      <span className="text-gray-400 group-hover:text-amber-600 transition-colors group-hover:translate-x-1 duration-300">→</span>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/inventory_all" className="block group">
                  <Card className="cinematic-hover h-full bg-white border-transparent hover:border-brand-green/30 group-hover:bg-brand-green/5 transition-all">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-green/10 rounded-xl text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors">
                          <Database className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[13px] text-brand-dark uppercase tracking-widest">Global Inventory</span>
                      </div>
                      <span className="text-gray-400 group-hover:text-brand-green transition-colors group-hover:translate-x-1 duration-300">→</span>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* 2. Identity Block */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] -z-10" />
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <span className="font-bold text-[13px] uppercase tracking-widest text-gray-400">Node Identity</span>
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">

                      {/* Integrated Layered Avatar Component */}
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/20 ring-4 ring-white shadow-md flex-shrink-0 relative bg-amber-50 text-amber-600 text-xl font-black flex items-center justify-center">
                        <span className="absolute inset-0 flex items-center justify-center z-0">
                          {initials}
                        </span>

                        {currentUser?.avatar && (
                          <img
                            src={currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:5000${currentUser.avatar.startsWith('/') ? '' : '/'}${currentUser.avatar}`}
                            alt="Profile"
                            className="absolute inset-0 w-full h-full object-cover z-10 bg-white"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                          />
                        )}
                      </div>

                      <div>
                        <h3 className="text-2xl font-black text-brand-dark tracking-tight line-clamp-1">{displayName}</h3>
                        <p className="text-[13px] font-bold text-amber-600 uppercase tracking-widest mt-1">Receiver Node</p>
                      </div>
                    </div>

                    <Link href={`/profile/${currentUser?.id}`}>
                      <Button variant="outline" size="sm" className="border-gray-900 text-gray-900 hover:bg-amber-500 hover:border-amber-500 hover:text-white">
                        View Public Profile
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                      <span className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">Official Email</span>
                      <span className="text-[15px] font-medium text-brand-dark">{currentUser?.email || "-"}</span>
                    </div>

                    {currentUser?.phone && (
                      <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                        <span className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact</span>
                        <span className="text-[15px] font-medium text-brand-dark">{currentUser.phone}</span>
                      </div>
                    )}

                    {(currentUser?.city || currentUser?.address) && (
                      <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 md:col-span-2 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-amber-600">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Operating Location</span>
                          <span className="text-[15px] font-medium text-brand-dark capitalize">
                            {[currentUser?.address, currentUser?.city].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 3. Real-Time Telemetry */}
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="cinematic-hover border-transparent hover:border-brand-blue/20">
                      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                        <div className="p-4 bg-brand-blue/10 rounded-2xl mb-4">
                          <Package className="w-8 h-8 text-brand-blue" />
                        </div>
                        <span className="text-4xl font-black text-brand-dark tracking-tighter leading-none">{stats.totalReceived}</span>
                        <span className="text-[13px] font-bold uppercase text-gray-400 mt-3 tracking-widest">Total Received</span>
                      </CardContent>
                    </Card>

                    <Card className="cinematic-hover border-transparent hover:border-gray-200">
                      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                        <div className="p-4 bg-gray-100 rounded-2xl mb-4">
                          <Clock className="w-8 h-8 text-gray-600" />
                        </div>
                        <span className="text-4xl font-black text-brand-dark tracking-tighter leading-none">{stats.thisWeek}</span>
                        <span className="text-[13px] font-bold uppercase text-gray-400 mt-3 tracking-widest">This Week</span>
                      </CardContent>
                    </Card>

                    <Card className="cinematic-hover border-transparent hover:border-red-100 group">
                      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                        <div className="p-4 bg-red-50 rounded-2xl mb-4 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                          <HeartHandshake className="w-8 h-8 text-red-500 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-4xl font-black text-brand-dark tracking-tighter leading-none">{stats.peopleFed.toLocaleString()}</span>
                        <span className="text-[13px] font-bold uppercase text-red-500 mt-3 tracking-widest">Impact: People Fed</span>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 4. Top Received Items Matrix */}
                  <Card>
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-[14px] uppercase tracking-widest text-brand-dark">Top Received Commodities</h3>
                    </div>

                    <CardContent className="p-6 md:p-8">
                      {stats.topItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {stats.topItems.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between rounded-xl border border-gray-200 p-4 bg-white cinematic-hover">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 font-bold flex items-center justify-center text-sm">
                                  0{index + 1}
                                </div>
                                <span className="text-[15px] font-bold text-brand-dark uppercase tracking-wider">{item.name}</span>
                              </div>
                              <div className="text-[15px] font-black text-amber-600">
                                {item.quantity} <span className="text-gray-400 text-[13px] font-medium">{item.unit}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center text-[15px] font-medium text-gray-500">
                          Awaiting initial delivery data to generate analytics.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

            </div>

            {/* RIGHT COLUMN: COMMS Hub */}
            <div className="lg:col-span-4 h-[600px] lg:sticky lg:top-24">
              <MessagesWidget messages={REAL_MESSAGES} />
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}