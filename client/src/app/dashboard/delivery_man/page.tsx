// client/src/app/dashboard/delivery_man/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { MessagesWidget } from "@/components/dashboard/DashboardWidgets";
import { ShieldCheck, Truck, Clock, Loader2, Send, Navigation } from "lucide-react";
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
      <div className="min-h-screen bg-white flex flex-col font-sans">
        {/* <PrivateNavbar /> */}

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">

          {/* Header Block */}
          <div className="mb-10 pb-6 border-b-[2.5px] border-gray-900 flex justify-between items-end">
            <div>
              <h1 className="text-[32px] font-normal text-gray-900 tracking-tight uppercase">Logistics Operations</h1>
              <p className="text-[16px] text-gray-600 mt-1">Manage active transport routes and delivery history.</p>
            </div>
            <div className="bg-gray-900 text-white px-4 py-1.5 font-bold tracking-widest text-[14px] uppercase shadow-[2px_2px_0px_0px_rgba(107,114,128,1)]">
              Authorized
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COLUMN: Main Telemetry */}
            <div className="lg:col-span-8 space-y-8">

              {/* 1. Quick Navigation Hub */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/my-deliveries" className="flex items-center justify-between p-4 border-[1.5px] border-gray-900 bg-[#f3f4f6] hover:bg-gray-900 hover:text-white transition-colors group">
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-wide text-[14px]">My Deliveries</span>
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
                  <span className="font-bold text-[14px] uppercase tracking-widest text-gray-500">Agent Identity</span>
                  <ShieldCheck className="w-6 h-6 text-gray-900" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-[28px] font-normal text-gray-900 mb-1">{currentUser?.name || "Logistics Agent"}</h3>
                    <p className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">Delivery Division</p>
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

                  {currentUser?.phone && (
                    <div className="border-[1.5px] border-gray-200 p-4">
                      <span className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Contact</span>
                      <span className="text-[16px] font-medium text-gray-900">{currentUser.phone}</span>
                    </div>
                  )}

                  {(currentUser?.city || currentUser?.address) && (
                    <div className="border-[1.5px] border-gray-200 p-4 md:col-span-2">
                      <span className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Assigned Zone</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#f3f4f6] border-[1.5px] border-gray-900 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                    <Truck className="w-8 h-8 mb-3 text-gray-900" />
                    <span className="text-[32px] font-normal text-gray-900 leading-none">{deliveries.length}</span>
                    <span className="text-[12px] font-bold uppercase text-gray-500 mt-2 tracking-wider">Total Delivered</span>
                  </div>
                  <div className="bg-[#e6e6e6] border-[1.5px] border-gray-900 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                    <Clock className="w-8 h-8 mb-3 text-gray-900" />
                    <span className="text-[32px] font-normal text-gray-900 leading-none">0</span>
                    <span className="text-[12px] font-bold uppercase text-gray-500 mt-2 tracking-wider">This Week Delivered</span>
                  </div>
                </div>
              )}

              {/* 4. Active Logistics Roster */}
              <div className="border-[1.5px] border-gray-900 bg-white p-6 md:p-8 relative">
                <div className="absolute -top-3 left-6 bg-white px-3 font-bold text-[14px] uppercase tracking-widest text-gray-900">
                  Assigned Deliveries
                </div>

                {isLoading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-900" /></div>
                ) : deliveries.filter(d => d.status === 'LOCKED' || d.status === 'IN_TRANSIT').length === 0 ? (
                  <div className="bg-[#f3f4f6] border-[1.5px] border-gray-900 p-8 mt-4 text-center text-[15px] font-medium text-gray-600 uppercase tracking-wider">
                    No active logistics routed.
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    {deliveries
                      .filter(d => d.status === 'LOCKED' || d.status === 'IN_TRANSIT')
                      .slice(0, delCount)
                      .map(del => (
                        <div key={del.id} className="border-[1.5px] border-gray-900 p-5 text-[15px] font-medium text-gray-900 bg-gray-50 flex flex-col gap-2">
                          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="font-bold text-[#cc0000] uppercase tracking-wider text-[12px]">Status: {del.status}</span>
                            <span className="text-gray-500 text-[12px]">{new Date(del.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div>{del.details}</div>
                          <div className="text-[#4a86e8]">{del.payload}</div>
                        </div>
                      ))}
                  </div>
                )}

                {delCount < deliveries.filter(d => d.status === 'LOCKED' || d.status === 'IN_TRANSIT').length && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setDelCount(prev => prev + 2)}
                      className="px-10 py-2.5 bg-white border-[1.5px] border-gray-900 text-gray-900 font-normal text-[18px] hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </div>

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