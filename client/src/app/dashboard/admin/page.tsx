// client/src/app/dashboard/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { MessagesWidget } from "@/components/dashboard/DashboardWidgets";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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

  // Helper for Avatar Fallback & Name Parsing
  const displayName = user?.name || user?.organization || "System Admin";
  const initials = displayName.substring(0, 3).toUpperCase();

  return (
    <ProtectedRoute allowedRoles={["LEAD_DEV"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">

          {/* SaaS Header Block */}
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-black text-brand-dark tracking-tight">System Operations Core</h1>
              <p className="text-[15px] font-medium text-gray-500 mt-1">Global oversight and architecture management.</p>
            </div>
            {/* LEAD DEV FIX: Changed size from "lg" to "md" to comply with Badge interface */}
            <Badge variant="danger" size="md" className="shadow-sm px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
              God Mode Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <div className="lg:col-span-8 space-y-8">

              {/* 1. REAL-TIME TELEMETRY */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-bl-[100px] -z-10" />
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-6 h-6 text-brand-blue" />
                    <h2 className="text-[16px] font-bold text-gray-400 uppercase tracking-widest">Network Telemetry</h2>
                  </div>

                  {isLoading ? (
                    <div className="h-[120px] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300">
                        <div className="p-3 bg-brand-dark/5 rounded-xl mb-4">
                          <Users className="w-6 h-6 text-brand-dark" />
                        </div>
                        <span className="text-4xl font-black text-brand-dark leading-none tracking-tight">{stats?.totalUsers || 0}</span>
                        <span className="text-[12px] font-bold uppercase text-gray-400 mt-3 tracking-widest">Total Users</span>
                      </div>

                      <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300">
                        <div className="p-3 bg-amber-100 rounded-xl mb-4">
                          <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="text-4xl font-black text-amber-600 leading-none tracking-tight">{stats?.activeRequests || 0}</span>
                        <span className="text-[12px] font-bold uppercase text-amber-600/70 mt-3 tracking-widest">Active Requests</span>
                      </div>

                      <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300">
                        <div className="p-3 bg-emerald-100 rounded-xl mb-4">
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="text-4xl font-black text-emerald-600 leading-none tracking-tight">{stats?.fulfilledRequests || 0}</span>
                        <span className="text-[12px] font-bold uppercase text-emerald-600/70 mt-3 tracking-widest">Fulfilled Requests</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 2. ROLE DISTRIBUTION */}
              <Card>
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h3 className="font-bold text-[14px] uppercase tracking-widest text-brand-dark">User Distribution Matrix</h3>
                </div>
                <CardContent className="p-6 md:p-8">
                  {isLoading ? (
                    <div className="h-[80px] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-blue" /></div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { role: 'DONOR', label: 'Donors', bg: 'bg-brand-blue/5', border: 'border-brand-blue/20', text: 'text-brand-blue' },
                        { role: 'RECEIVER', label: 'Receivers', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
                        { role: 'DELIVERY_MAN', label: 'Drivers', bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-600' },
                        { role: 'COORDINATOR', label: 'Coordinators', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' }
                      ].map((r) => (
                        <div key={r.role} className={`rounded-xl border ${r.border} ${r.bg} p-5 flex flex-col items-center justify-center cinematic-hover`}>
                          <div className={`text-3xl font-black ${r.text}`}>{getRoleCount(r.role)}</div>
                          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-2">{r.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 3. CROSS-ROLE SIMULATION HUB */}
              <Card className="relative overflow-hidden border-brand-blue/20 ring-1 ring-brand-blue/5">
                <div className="absolute top-0 right-0 border-b border-l border-brand-blue/20 bg-brand-blue/5 px-4 py-1.5 rounded-bl-2xl">
                  <span className="text-brand-blue font-bold text-[11px] uppercase tracking-widest">Environment Sandbox</span>
                </div>

                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className="p-2 bg-brand-blue/10 rounded-lg">
                      <LayoutDashboard className="w-5 h-5 text-brand-blue" />
                    </div>
                    <h2 className="text-[18px] font-black text-brand-dark tracking-tight">Interface Testing Hub</h2>
                  </div>

                  <p className="text-[15px] font-medium text-gray-500 mb-8">
                    As the Lead Developer, you have bypass authority to view and interact with all role-specific environments.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => router.push('/dashboard/coordinator')} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all group">
                      <span className="font-bold uppercase tracking-wide text-[13px] text-gray-600 group-hover:text-emerald-700">Coordinator View</span>
                      <span className="font-normal text-xl text-gray-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <button onClick={() => router.push('/dashboard/donor')} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-blue hover:bg-blue-50 hover:text-brand-blue transition-all group">
                      <span className="font-bold uppercase tracking-wide text-[13px] text-gray-600 group-hover:text-brand-blue">Donor View</span>
                      <span className="font-normal text-xl text-gray-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <button onClick={() => router.push('/dashboard/receiver')} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 transition-all group">
                      <span className="font-bold uppercase tracking-wide text-[13px] text-gray-600 group-hover:text-amber-700">Receiver View</span>
                      <span className="font-normal text-xl text-gray-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <button onClick={() => router.push('/dashboard/delivery_man')} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-900 hover:bg-gray-50 hover:text-gray-900 transition-all group">
                      <span className="font-bold uppercase tracking-wide text-[13px] text-gray-600 group-hover:text-gray-900">Driver View</span>
                      <span className="font-normal text-xl text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    {/* STAFF MANAGEMENT LINK ADDED HERE */}
                    <div className="md:col-span-2 mt-4 pt-4">
                      <Button
                        variant="danger"
                        size="lg"
                        className="w-full text-[14px] uppercase tracking-widest shadow-md"
                        onClick={() => router.push('/staff-management')}
                      >
                        <UserCog className="w-5 h-5" />
                        Access Staff Management Panel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-4 space-y-8">

              {/* Admin Identity Identity Block */}
              <Card className="relative overflow-hidden border-semantic-danger/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-semantic-danger/5 rounded-bl-full -z-10" />
                <CardContent className="p-6 md:p-8">

                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <span className="font-bold text-[12px] uppercase tracking-widest text-gray-400">System Identity</span>
                    <ShieldCheck className="w-5 h-5 text-semantic-danger" />
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    {/* Layered Avatar Component */}
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-blue/20 ring-4 ring-white shadow-md flex-shrink-0 relative bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xl font-black transition-colors duration-300">
                      {/* LAYER 1: Fallback Initials */}
                      <span className="absolute inset-0 flex items-center justify-center z-0">
                        {initials}
                      </span>
                      {/* LAYER 2: Profile Picture */}
                      {user?.avatar && (
                        <img
                          src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`}
                          alt={`${displayName} profile`}
                          className="absolute inset-0 w-full h-full object-cover z-10 bg-white"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-brand-dark tracking-tight line-clamp-1">{displayName}</h3>
                      <p className="text-[12px] font-bold text-brand-blue uppercase tracking-widest mt-1">Lead Developer</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                      <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Email</span>
                      <span className="text-sm font-medium text-brand-dark truncate ml-4">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Terminal ID</span>
                      <span className="font-mono text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{user?.id?.substring(0, 8)}...</span>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Secure COMMS Hub */}
              <div className="h-[500px] lg:sticky lg:top-24">
                {/* LEAD DEV FIX: Removed invalid 'messages' prop. The widget handles its own data fetching. */}
                <MessagesWidget />
              </div>

            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}