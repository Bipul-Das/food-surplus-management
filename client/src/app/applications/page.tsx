// client/src/app/applications-review/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { CheckCircle, XCircle, Search, Clock, FileText, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

// Interface mapping to the Prisma Schema
interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: "DONOR" | "RECEIVER" | "DELIVERY_MAN";
  reason: string;
  status: "NEW" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function ApplicationsReviewPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual API endpoint once wired
      const response = await fetch("http://localhost:5000/api/applications/pending", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.data.length > 0) {
          setApplications(result.data);
          return;
        }
      }
      
      // FALLBACK MOCK DATA FOR UI TESTING
      setApplications([
        {
          id: "app-001",
          name: "Grand Hotel Dhaka",
          email: "management@grandhotel.bd",
          phone: "+8801700000001",
          location: "Gulshan 2, Dhaka",
          role: "DONOR",
          reason: "We generate approx 30kg of high-quality buffet surplus daily. We wish to route this to verified shelters rather than discarding it.",
          status: "NEW",
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "app-002",
          name: "Al-Amanah Orphanage",
          email: "admin@alamanah.org",
          phone: "+8801800000002",
          location: "Mirpur 10, Dhaka",
          role: "RECEIVER",
          reason: "We provide meals for 150 children daily. Partnering with FoodSurplus will help us stabilize our dinner requirements and reduce operational deficits.",
          status: "NEW",
          createdAt: new Date(Date.now() - 43200000).toISOString()
        }
      ]);
    } catch (error) {
      toast.error("Failed to fetch application queue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "DECLINED") => {
    setProcessingId(id);
    try {
      // The API call to update the database
      /*
      const response = await fetch(`http://localhost:5000/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error("Update failed");
      */

      // Simulate network latency for UI feedback
      await new Promise(resolve => setTimeout(resolve, 600));

      setApplications(prev => prev.filter(app => app.id !== id));
      
      if (newStatus === "APPROVED") {
        toast.success("Application Approved. Proceed to Staff Management to provision credentials.", { duration: 4000 });
      } else {
        toast.success("Application permanently declined.");
      }
    } catch (error) {
      toast.error("Failed to process application.");
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "DONOR": return <span className="bg-blue-100 text-brand-blue px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Donor</span>;
      case "RECEIVER": return <span className="bg-green-100 text-urgency-low px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Receiver</span>;
      case "DELIVERY_MAN": return <span className="bg-yellow-100 text-urgency-medium px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Delivery</span>;
      default: return null;
    }
  };

  return (
    <ProtectedRoute allowedRoles={["COORDINATOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-bg-page flex flex-col">
        <PrivateNavbar />
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">Applications Review Matrix</h1>
              <p className="text-sm text-text-secondary">Evaluate incoming network requests. Approval requires subsequent manual credential provisioning.</p>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search entities..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-light/50"
              />
            </div>
          </div>

          <FloatingCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Entity Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Requested Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Operational Motivation</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-text-secondary">
                        <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-blue" />
                        Processing queue data...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-text-secondary">
                        <FileText className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                        <p className="text-base font-semibold text-brand-dark">The review queue is currently empty.</p>
                        <p className="text-sm mt-1">All pending applications have been processed.</p>
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="font-bold text-brand-dark text-sm">{app.name}</div>
                          <div className="text-xs text-text-secondary mt-1">{app.email}</div>
                          <div className="text-xs text-text-secondary mt-0.5">{app.phone}</div>
                          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 
                            Applied: {new Date(app.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {getRoleBadge(app.role)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-text-main leading-relaxed max-w-md bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                            "{app.reason}"
                          </div>
                          <div className="text-xs font-medium text-brand-blue mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Location: {app.location}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <div className="flex flex-col gap-2 items-end">
                            <button 
                              onClick={() => handleStatusUpdate(app.id, "APPROVED")}
                              disabled={processingId === app.id}
                              className="w-28 flex items-center justify-center gap-1.5 px-3 py-2 bg-urgency-low hover:bg-green-600 text-white text-xs font-bold rounded-md transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" /> Approve
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(app.id, "DECLINED")}
                              disabled={processingId === app.id}
                              className="w-28 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-red-200 hover:bg-red-50 text-urgency-high text-xs font-bold rounded-md transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" /> Decline
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </FloatingCard>
        </main>
      </div>
    </ProtectedRoute>
  );
}