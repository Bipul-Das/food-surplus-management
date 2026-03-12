"use client";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { ProfileWidget, StatCard, MessagesWidget } from "@/components/dashboard/DashboardWidgets";
import { ShieldCheck, Server } from "lucide-react";

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["LEAD_DEV"]}>
      <div className="min-h-screen bg-bg-page flex flex-col font-sans">
        <PrivateNavbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-1 mb-8 border-b border-gray-200 overflow-x-auto">
            <Link href="/staff-management" className="px-6 py-3 text-sm font-bold text-text-secondary hover:text-brand-blue border-b-2 border-transparent hover:border-brand-blue whitespace-nowrap">Staff Management</Link>
            <Link href="/applications-review" className="px-6 py-3 text-sm font-bold text-text-secondary hover:text-brand-blue border-b-2 border-transparent hover:border-brand-blue whitespace-nowrap">Applications</Link>
            <Link href="/inventory" className="px-6 py-3 text-sm font-bold text-text-secondary hover:text-brand-blue border-b-2 border-transparent hover:border-brand-blue whitespace-nowrap">Global Inventory</Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <ProfileWidget role="Lead Developer" name="Bipul Das" email="dev@project.com" phone="System Admin" location="God Mode Active" />
              <div className="grid grid-cols-2 gap-6">
                <StatCard title="System Uptime" value="99.9%" icon={Server} />
                <StatCard title="Active Users" value="1,402" icon={ShieldCheck} />
              </div>
              <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
                <h3 className="text-red-800 font-bold mb-2">Administrative Access Active</h3>
                <p className="text-sm text-red-700">You have full global override permissions. Use caution when modifying active entities.</p>
              </div>
            </div>
            <div className="lg:col-span-1 lg:sticky lg:top-24 h-[600px]"><MessagesWidget messages={[]} /></div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}