"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { ProfileWidget, StatCard, TopItemsWidget, MessagesWidget } from "@/components/dashboard/DashboardWidgets";
import { Package, Clock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

// ----------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------
interface ExtendedUser {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  organization?: string;
  role?: string;
}

export default function DonorDashboard() {
  const { user } = useUserStore();
  const currentUser = user as ExtendedUser | null;

  const [stats, setStats] = useState({
    totalDonations: 0,
    thisWeek: 0,
    topItems: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // We leave this empty until the WebSocket architecture is deployed
  const REAL_MESSAGES: any[] = []; 

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
      <div className="min-h-screen bg-bg-page flex flex-col font-sans">
        <PrivateNavbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-1 mb-8 border-b border-gray-200 overflow-x-auto">
            <Link href="/inventory" className="px-6 py-3 text-sm font-bold text-text-secondary hover:text-brand-blue border-b-2 border-transparent hover:border-brand-blue whitespace-nowrap">My Inventory</Link>
            <Link href="/donation-history" className="px-6 py-3 text-sm font-bold text-text-secondary hover:text-brand-blue border-b-2 border-transparent hover:border-brand-blue whitespace-nowrap">My Donations</Link>
            <Link href="/requests" className="px-6 py-3 text-sm font-bold text-text-secondary hover:text-brand-blue border-b-2 border-transparent hover:border-brand-blue whitespace-nowrap">Current Requests</Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Dynamic Profile Injector */}
              <ProfileWidget 
                role={currentUser?.role?.replace('_', ' ') || "Food Donor"} 
                name={currentUser?.organization || currentUser?.name || "Corporate Partner"} 
                email={currentUser?.email || "Unknown"} 
                phone={currentUser?.phone || "-"} 
                location={`${currentUser?.address || ""}, ${currentUser?.city || "Unassigned"}`.replace(/^, /, '')} 
              />
              
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <StatCard title="Total Donations" value={`${stats.totalDonations} Times`} icon={Package} />
                    <StatCard title="This Week" value={`${stats.thisWeek} Times`} icon={Clock} />
                  </div>
                  
                  {stats.topItems.length > 0 ? (
                    <TopItemsWidget items={stats.topItems} type="Donated" />
                  ) : (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center text-sm font-medium text-text-secondary">
                      Awaiting first donation to calculate top items.
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="lg:col-span-1 lg:sticky lg:top-24 h-[600px]">
              <MessagesWidget messages={REAL_MESSAGES} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}