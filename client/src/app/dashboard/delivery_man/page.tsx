// client/src/app/dashboard/delivery_man/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { MessagesWidget } from "@/components/dashboard/DashboardWidgets";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Truck, Clock, Loader2, Send, Navigation, MapPin } from "lucide-react";
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

export default function DeliveryDashboard() {
  const { user } = useUserStore();
  const currentUser = user as ExtendedUser | null;

  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [delCount, setDelCount] = useState(2);
  const [isLoading, setIsLoading] = useState(true);

  // We leave this empty until the WebSocket architecture is deployed
  const REAL_MESSAGES: any[] = [];

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/deliveries/my-deliveries", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        if (data.success) {
          setDeliveries(data.data);
        }
      } catch (error) {
        toast.error("Failed to load logistics pipeline.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["DELIVERY_MAN", "LEAD_DEV"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        {/* LEAD DEV FIX: Injected Private Navbar */}
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">

          {/* Header Block: Upgraded to SaaS Standard */}
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-black text-brand-dark tracking-tight">Logistics Operations</h1>
              <p className="text-[15px] font-medium text-gray-500 mt-1">Manage active transport routes and delivery history.</p>
            </div>
            <Badge variant="success" size="lg" className="shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
              Clearance: Authorized
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COLUMN: Main Telemetry */}
            <div className="lg:col-span-8 space-y-8">

              {/* 1. Quick Navigation Hub: SaaS Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/my-deliveries" className="block group">
                  <Card className="cinematic-hover h-full bg-white border-transparent hover:border-brand-blue/30 group-hover:bg-brand-blue/5 transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                          <Navigation className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-brand-dark">My Deliveries</span>
                      </div>
                      <span className="text-gray-400 group-hover:text-brand-blue transition-colors group-hover:translate-x-1 duration-300">→</span>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/requests" className="block group">
                  <Card className="cinematic-hover h-full bg-white border-transparent hover:border-brand-blue/30 group-hover:bg-brand-blue/5 transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                          <Send className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-brand-dark">Current Requests</span>
                      </div>
                      <span className="text-gray-400 group-hover:text-brand-blue transition-colors group-hover:translate-x-1 duration-300">→</span>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* 2. Identity Block: Upgraded UI */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-bl-[100px] -z-10" />
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <span className="font-bold text-[13px] uppercase tracking-widest text-gray-400">Agent Identity</span>
                    <ShieldCheck className="w-5 h-5 text-brand-blue" />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">

                      {/* Integrated User Avatar */}
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-blue/20 ring-4 ring-white shadow-md flex-shrink-0 relative bg-brand-blue/10 text-brand-blue text-xl font-black flex items-center justify-center">
                        {currentUser?.avatar ? (
                          <img
                            src={currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:5000${currentUser.avatar.startsWith('/') ? '' : '/'}${currentUser.avatar}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                          />
                        ) : (
                          <span>{currentUser?.name?.substring(0, 3).toUpperCase() || "AGT"}</span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-2xl font-black text-brand-dark tracking-tight">{currentUser?.name || "Logistics Agent"}</h3>
                        <p className="text-[13px] font-bold text-brand-blue uppercase tracking-widest mt-1">Delivery Division</p>
                      </div>
                    </div>

                    <Link href={`/profile/${currentUser?.id}`}>
                      <Button variant="secondary" size="sm">
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
                        <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-brand-blue">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Assigned Zone</span>
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
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="cinematic-hover border-transparent hover:border-brand-blue/20">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="p-4 bg-brand-blue/10 rounded-2xl mb-4">
                        <Truck className="w-8 h-8 text-brand-blue" />
                      </div>
                      <span className="text-4xl font-black text-brand-dark tracking-tighter leading-none">{deliveries.length}</span>
                      <span className="text-[13px] font-bold uppercase text-gray-400 mt-3 tracking-widest">Total Delivered</span>
                    </CardContent>
                  </Card>
                  <Card className="cinematic-hover border-transparent hover:border-brand-green/20">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="p-4 bg-brand-green/10 rounded-2xl mb-4">
                        <Clock className="w-8 h-8 text-brand-green" />
                      </div>
                      <span className="text-4xl font-black text-brand-dark tracking-tighter leading-none">0</span>
                      <span className="text-[13px] font-bold uppercase text-gray-400 mt-3 tracking-widest">This Week Delivered</span>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 4. Active Logistics Roster */}
              <Card>
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h3 className="font-bold text-[14px] uppercase tracking-widest text-brand-dark">Assigned Deliveries</h3>
                </div>

                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>
                  ) : deliveries.filter(d => d.status === 'LOCKED' || d.status === 'IN_TRANSIT').length === 0 ? (
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center text-[15px] font-medium text-gray-500">
                      No active logistics routed.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {deliveries
                        .filter(d => d.status === 'LOCKED' || d.status === 'IN_TRANSIT')
                        .slice(0, delCount)
                        .map(del => (
                          <div key={del.id} className="border border-gray-200 rounded-xl p-5 bg-white cinematic-hover flex flex-col gap-3">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                              <Badge variant={del.status === 'LOCKED' ? 'warning' : 'info'} size="sm">
                                {del.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-gray-400 text-sm font-medium">{new Date(del.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="font-medium text-brand-dark text-[15px]">{del.details}</div>
                            <div className="p-3 bg-brand-blue/5 rounded-lg text-brand-blue font-bold text-sm border border-brand-blue/10">
                              Payload: {del.payload}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {delCount < deliveries.filter(d => d.status === 'LOCKED' || d.status === 'IN_TRANSIT').length && (
                    <div className="mt-8 flex justify-center">
                      <Button
                        variant="secondary"
                        onClick={() => setDelCount(prev => prev + 2)}
                      >
                        Load More Routes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* RIGHT COLUMN: COMMS Hub */}
            <div className="lg:col-span-4 h-[600px] lg:sticky lg:top-24">
              {/* Inherits Phase 4 styling if MessagesWidget was upgraded, otherwise acts as a standard block */}
              <MessagesWidget messages={REAL_MESSAGES} />
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}