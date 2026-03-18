// client/src/app/applications-review/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// FIX: Interface updated to strictly match the real Prisma Schema
interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;       // Added to match DB
  address: string;    // Changed from 'location'
  role: "DONOR" | "RECEIVER" | "DELIVERY_MAN";
  motivation: string; // Changed from 'reason'
  status: "NEW" | "VIEWED" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function ApplicationsReviewPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"NEW" | "VIEWED">("NEW");
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/applications", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });

      if (response.ok) {
        const result = await response.json();
        setApplications(result.data || []);
      } else {
        toast.error("Failed to fetch applications from server.");
      }
    } catch (error) {
      toast.error("Network error while fetching application queue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setProcessingId(id);
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error("Update failed");

      // Instantly update the UI so it moves to the 'Viewed' tab without needing a refresh
      setApplications(prev => prev.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      ));

      if (newStatus === "APPROVED") {
        toast.success("Application Approved. Proceed to Staff Management to provision credentials.");
      } else {
        toast.error("Application Rejected.");
      }
    } catch (error) {
      toast.error("Failed to process application. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  // The Filter Engine
  const filteredApps = applications.filter(app => {
    if (activeTab === "NEW") return app.status === "NEW" || app.status === "VIEWED";
    return app.status === "APPROVED" || app.status === "REJECTED";
  });

  const visibleApps = filteredApps.slice(0, visibleCount);

  return (
    <ProtectedRoute allowedRoles={["COORDINATOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-[28px] font-normal text-gray-900 mb-8 tracking-tight">Application review</h1>

          <div className="border-[2px] border-[#6aa84f] p-4 md:p-8 bg-white min-h-[500px] flex flex-col">

            {/* Brutalist Tabs */}
            <div className="flex border-[2px] border-gray-900 w-fit mb-10 bg-white shadow-sm">
              <button
                onClick={() => { setActiveTab("NEW"); setVisibleCount(4); }}
                className={`px-8 py-2.5 font-normal text-[17px] transition-colors border-r-[2px] border-gray-900 ${activeTab === "NEW" ? "bg-[#4a86e8] text-white" : "bg-white text-gray-900 hover:bg-gray-50"
                  }`}
              >
                new
              </button>
              <button
                onClick={() => { setActiveTab("VIEWED"); setVisibleCount(4); }}
                className={`px-8 py-2.5 font-normal text-[17px] transition-colors ${activeTab === "VIEWED" ? "bg-[#4a86e8] text-white" : "bg-white text-gray-900 hover:bg-gray-50"
                  }`}
              >
                viewed
              </button>
            </div>

            {/* Grid & Cards */}
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-900" /></div>
            ) : filteredApps.length === 0 ? (
              <div className="flex justify-center items-center h-40 text-[17px] font-medium text-gray-500">
                No {activeTab.toLowerCase()} applications found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {visibleApps.map((app) => (
                  <div key={app.id} className="bg-white border-[1.5px] border-gray-900 p-6 flex flex-col relative min-h-[320px]">

                    {/* Top Right Status Box */}
                    <div className="absolute top-0 right-0 border-b-[1.5px] border-l-[1.5px] border-gray-900 px-6 py-2 bg-white">
                      <span className="text-[18px] font-normal text-gray-900 capitalize tracking-wide">
                        {app.status === 'NEW' ? 'New' : app.status.toLowerCase()}
                      </span>
                    </div>

                    {/* Card Body mapped to real DB data */}
                    <div className="space-y-1 mt-6">
                      <p className="text-[17px] font-normal text-gray-900">Name: {app.name}</p>
                      <p className="text-[17px] font-normal text-gray-900">Role: {app.role.replace('_', ' ')}</p>
                      {/* FIX: Now correctly outputs address and city */}
                      <p className="text-[17px] font-normal text-gray-900">Location: {app.address}{app.city ? `, ${app.city}` : ''}</p>
                      <p className="text-[17px] font-normal text-gray-900">Phone: {app.phone}</p>
                      <p className="text-[17px] font-normal text-gray-900">Email: {app.email}</p>
                    </div>

                    {/* Why Join Orange Box */}
                    <div className="mt-6 flex flex-col md:flex-row md:items-start gap-3">
                      <span className="text-[17px] font-normal text-gray-900 whitespace-nowrap mt-2">Why join:</span>
                      <div className="border-[2px] border-[#e69138] p-4 text-[16px] font-normal text-gray-900 w-full min-h-[80px] bg-white leading-relaxed">
                        {/* FIX: Now correctly outputs motivation */}
                        {app.motivation}
                      </div>
                    </div>

                    {/* Action Buttons (Only visible in 'NEW' tab) */}
                    {activeTab === "NEW" && (
                      <div className="mt-8 flex justify-end gap-4 mt-auto">
                        <button
                          onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                          disabled={processingId === app.id}
                          className="px-6 py-2 bg-white border-[1.5px] border-gray-900 text-[#cc0000] font-bold tracking-wide hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id, "APPROVED")}
                          disabled={processingId === app.id}
                          className="px-6 py-2 bg-[#6aa84f] border-[1.5px] border-gray-900 text-white font-bold tracking-wide hover:bg-[#5b9044] transition-colors disabled:opacity-50"
                        >
                          {processingId === app.id ? <Loader2 className="w-5 h-5 animate-spin" /> : "Approve"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {visibleCount < filteredApps.length && (
              <div className="mt-12 flex justify-center mt-auto pt-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + 4)}
                  className="px-10 py-2.5 bg-white border-[1.5px] border-gray-900 text-gray-900 font-normal text-[18px] hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Load more
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}