// client/src/app/dashboard/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { MessagesWidget } from "@/components/dashboard/DashboardWidgets";
import { ShieldCheck, Activity, Users, CheckCircle, AlertTriangle, LayoutDashboard, Loader2, UserCog } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import toast from "react-hot-toast";

interface SystemStats {
  totalUsers: number;
  roles: { role: string; _count: { role: number } }[];
  activeRequests: number;
  fulfilledRequests: number;
}

export default function AdminDashboard() {
  const { user } = useUserStore();
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/stats", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        } else {
          toast.error("Failed to load telemetry.");
        }
      } catch (error) {
        toast.error("Network error while connecting to system core.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getRoleCount = (roleName: string) => {
    if (!stats) return 0;
    const roleObj = stats.roles.find(r => r.role === roleName);
    return roleObj ? roleObj._count.role : 0;
  };

  return (
    <ProtectedRoute allowedRoles={["LEAD_DEV"]}>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        {/* <PrivateNavbar /> */}

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">

          {/* Header Block */}
          <div className="mb-10 pb-6 border-b-[2.5px] border-gray-900 flex justify-between items-end">
            <div>
              <h1 className="text-[32px] font-normal text-gray-900 tracking-tight uppercase">System Operations Core</h1>
              <p className="text-[16px] text-gray-600 mt-1">Global oversight and architecture management.</p>
            </div>
            <div className="bg-[#cc0000] text-white px-4 py-1.5 font-bold tracking-widest text-[14px] uppercase shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
              God Mode Active
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <div className="lg:col-span-8 space-y-8">

              {/* 1. REAL-TIME TELEMETRY */}
              <div className="border-[1.5px] border-gray-900 bg-white p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-6 h-6 text-[#4a86e8]" />
                  <h2 className="text-[20px] font-normal text-gray-900 uppercase tracking-widest">Network Telemetry</h2>
                </div>

                {isLoading ? (
                  <div className="h-[120px] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-900" /></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#f3f4f6] border-[1.5px] border-gray-900 p-4 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                      <Users className="w-6 h-6 mb-2 text-gray-900" />
                      <span className="text-[32px] font-normal text-gray-900 leading-none">{stats?.totalUsers || 0}</span>
                      <span className="text-[12px] font-bold uppercase text-gray-500 mt-2 tracking-wider">Total Users</span>
                    </div>
                    <div className="bg-[#e6f4ea] border-[1.5px] border-[#6aa84f] p-4 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                      <AlertTriangle className="w-6 h-6 mb-2 text-[#cc0000]" />
                      <span className="text-[32px] font-normal text-gray-900 leading-none">{stats?.activeRequests || 0}</span>
                      <span className="text-[12px] font-bold uppercase text-[#cc0000] mt-2 tracking-wider">Active Requests</span>
                    </div>
                    <div className="bg-[#fce8e6] border-[1.5px] border-[#cc0000] p-4 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                      <CheckCircle className="w-6 h-6 mb-2 text-[#388e3c]" />
                      <span className="text-[32px] font-normal text-gray-900 leading-none">{stats?.fulfilledRequests || 0}</span>
                      <span className="text-[12px] font-bold uppercase text-[#388e3c] mt-2 tracking-wider">Fulfilled Requests</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. ROLE DISTRIBUTION */}
              <div className="border-[1.5px] border-gray-900 bg-white p-6 md:p-8">
                <h2 className="text-[20px] font-normal text-gray-900 uppercase tracking-widest mb-6">User Distribution Matrix</h2>
                {isLoading ? (
                  <div className="h-[80px] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-900" /></div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { role: 'DONOR', label: 'Donors', color: 'border-[#4a86e8]' },
                      { role: 'RECEIVER', label: 'Receivers', color: 'border-[#f6b26b]' },
                      { role: 'DELIVERY_MAN', label: 'Drivers', color: 'border-gray-900' },
                      { role: 'COORDINATOR', label: 'Coordinators', color: 'border-[#6aa84f]' }
                    ].map((r) => (
                      <div key={r.role} className={`border-l-[4px] bg-gray-50 border-y-[1.5px] border-r-[1.5px] ${r.color} p-4`}>
                        <div className="text-[24px] font-normal text-gray-900">{getRoleCount(r.role)}</div>
                        <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">{r.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. CROSS-ROLE SIMULATION HUB */}
              <div className="border-[1.5px] border-gray-900 bg-white p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 border-b-[1.5px] border-l-[1.5px] border-gray-900 bg-[#e6e6e6] px-4 py-1">
                  <span className="text-gray-900 font-bold text-[12px] uppercase tracking-widest">Environment Sandbox</span>
                </div>

                <div className="flex items-center gap-3 mb-6 mt-2">
                  <LayoutDashboard className="w-6 h-6 text-gray-900" />
                  <h2 className="text-[20px] font-normal text-gray-900 uppercase tracking-widest">Interface Testing Hub</h2>
                </div>
                <p className="text-[15px] text-gray-600 mb-6">
                  As the Lead Developer, you have bypass authority to view and interact with all role-specific environments.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => router.push('/dashboard/coordinator')} className="flex items-center justify-between p-4 border-[1.5px] border-gray-900 bg-white hover:bg-[#6aa84f] hover:text-white transition-colors group">
                    <span className="font-bold uppercase tracking-wide">Coordinator View</span>
                    <span className="font-normal text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <button onClick={() => router.push('/dashboard/donor')} className="flex items-center justify-between p-4 border-[1.5px] border-gray-900 bg-white hover:bg-[#4a86e8] hover:text-white transition-colors group">
                    <span className="font-bold uppercase tracking-wide">Donor View</span>
                    <span className="font-normal text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <button onClick={() => router.push('/dashboard/receiver')} className="flex items-center justify-between p-4 border-[1.5px] border-gray-900 bg-white hover:bg-[#f6b26b] hover:text-white transition-colors group">
                    <span className="font-bold uppercase tracking-wide">Receiver View</span>
                    <span className="font-normal text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <button onClick={() => router.push('/dashboard/delivery_man')} className="flex items-center justify-between p-4 border-[1.5px] border-gray-900 bg-white hover:bg-gray-900 hover:text-white transition-colors group">
                    <span className="font-bold uppercase tracking-wide">Driver View</span>
                    <span className="font-normal text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </button>

                  {/* STAFF MANAGEMENT LINK ADDED HERE */}
                  <div className="md:col-span-2 mt-4 border-t-[1.5px] border-gray-900 pt-6">
                    <button onClick={() => router.push('/staff-management')} className="w-full flex items-center justify-center gap-3 p-4 border-[1.5px] border-[#cc0000] bg-[#fff0f0] text-[#cc0000] hover:bg-[#cc0000] hover:text-white transition-colors group">
                      <UserCog className="w-5 h-5" />
                      <span className="font-bold uppercase tracking-widest text-[15px]">Access Staff Management Panel</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-4 space-y-8">

              {/* Admin Identity Identity Block */}
              <div className="border-[1.5px] border-gray-900 bg-white p-6">
                <div className="flex items-center justify-between border-b-[1.5px] border-gray-900 pb-4 mb-4">
                  <span className="font-bold text-[14px] uppercase tracking-widest text-gray-500">System Identity</span>
                  <ShieldCheck className="w-5 h-5 text-[#cc0000]" />
                </div>
                <h3 className="text-[24px] font-normal text-gray-900 mb-1">{user?.name || "System Admin"}</h3>
                <p className="text-[14px] font-bold text-[#4a86e8] uppercase tracking-wider mb-6">Lead Developer</p>

                <div className="space-y-3 text-[15px] text-gray-800">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold">Email</span>
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold">Terminal ID</span>
                    <span className="font-mono text-xs">{user?.id?.substring(0, 8)}...</span>
                  </div>
                  
                </div>
              </div>

              {/* Secure COMMS Hub */}
              <div className="h-[500px]">
                <MessagesWidget messages={[]} />
              </div>

            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}