"use client";
import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { ProfileWidget, StatCard, MessagesWidget } from "@/components/dashboard/DashboardWidgets";
import { ShieldCheck, Clock, ArrowDownCircle } from "lucide-react";

export default function CoordinatorDashboard() {
  const [appCount, setAppCount] = useState(2);
  const APPS = [
    { id: 1, name: "City Center Hotel", role: "Donor", date: "4 March" },
    { id: 2, name: "Downtown Shelter", role: "Receiver", date: "4 March" },
    { id: 3, name: "FastLogistics", role: "Delivery", date: "3 March" }
  ];

  return (
    <ProtectedRoute allowedRoles={["COORDINATOR"]}>
      <div className="min-h-screen bg-bg-page flex flex-col font-sans">
        {/* <PrivateNavbar /> */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-1 mb-8 border-b border-gray-200 overflow-x-auto">
            <Link href="/applications-review" className="px-6 py-3 text-sm font-bold text-text-secondary hover:text-brand-blue border-b-2 border-transparent hover:border-brand-blue whitespace-nowrap">Applications</Link>
            <Link href="/inventory" className="px-6 py-3 text-sm font-bold text-text-secondary hover:text-brand-blue border-b-2 border-transparent hover:border-brand-blue whitespace-nowrap">All Inventories</Link>
            <Link href="/requests" className="px-6 py-3 text-sm font-bold text-text-secondary hover:text-brand-blue border-b-2 border-transparent hover:border-brand-blue whitespace-nowrap">All Requests</Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <ProfileWidget role="Network Coordinator" name="Coordination Team Alpha" email="admin@foodsurplus.network" phone="+880150000000" location="HQ, Dhaka" />
              <div className="grid grid-cols-2 gap-6">
                <StatCard title="Total Applications" value="342" icon={ShieldCheck} />
                <StatCard title="This Week" value="14" icon={Clock} />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">New Applications</h3>
                <div className="space-y-3">
                  {APPS.slice(0, appCount).map(app => (
                    <div key={app.id} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl border-l-4 border-l-brand-dark">
                      <div><p className="font-bold text-brand-dark text-sm">{app.name}</p><p className="text-xs text-text-secondary font-medium">{app.role}</p></div>
                      <span className="text-xs text-gray-400 font-medium">{app.date}</span>
                    </div>
                  ))}
                </div>
                {appCount < APPS.length && (
                  <button onClick={() => setAppCount(prev => prev + 2)} className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 text-text-secondary font-bold text-sm rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2"><ArrowDownCircle className="w-4 h-4"/> Load More</button>
                )}
              </div>
            </div>
            <div className="lg:col-span-1 lg:sticky lg:top-24 h-[600px]"><MessagesWidget messages={[]} /></div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}