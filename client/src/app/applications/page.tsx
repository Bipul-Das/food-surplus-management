// client/src/app/applications-review/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Loader2, UserCheck, MapPin, Mail, Phone, Info, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

// ----------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------
interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  role: "DONOR" | "RECEIVER" | "DELIVERY_MAN";
  motivation: string;
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

      setApplications(prev => prev.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      ));

      if (newStatus === "APPROVED") {
        toast.success("Application Approved. Proceed to Staff Management.");
      } else {
        toast.error("Application Rejected.");
      }
    } catch (error) {
      toast.error("Failed to process application.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApps = applications.filter(app => {
    if (activeTab === "NEW") return app.status === "NEW" || app.status === "VIEWED";
    return app.status === "APPROVED" || app.status === "REJECTED";
  });

  const visibleApps = filteredApps.slice(0, visibleCount);

  return (
    <ProtectedRoute allowedRoles={["COORDINATOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black text-brand-dark tracking-tight">Application Review</h1>
              <p className="text-[15px] font-medium text-gray-500 mt-1">Audit and process new network onboarding requests.</p>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              <button
                onClick={() => { setActiveTab("NEW"); setVisibleCount(4); }}
                className={`px-6 py-2 rounded-lg font-bold text-[14px] uppercase tracking-wider transition-all duration-300 ${activeTab === "NEW" ? "bg-brand-blue text-white shadow-md" : "text-gray-400 hover:text-brand-dark"
                  }`}
              >
                Pending Queue
              </button>
              <button
                onClick={() => { setActiveTab("VIEWED"); setVisibleCount(4); }}
                className={`px-6 py-2 rounded-lg font-bold text-[14px] uppercase tracking-wider transition-all duration-300 ${activeTab === "VIEWED" ? "bg-brand-blue text-white shadow-md" : "text-gray-400 hover:text-brand-dark"
                  }`}
              >
                Processed
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="min-h-[600px] flex flex-col">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-brand-blue" />
                <p className="text-gray-400 font-medium animate-pulse">Syncing application data...</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-20 border-dashed">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <Info className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-lg font-bold text-gray-400">No {activeTab.toLowerCase()} applications in history.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {visibleApps.map((app) => (
                  <Card key={app.id} className="cinematic-hover overflow-hidden flex flex-col">
                    {/* Header: Role & Status */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-brand-blue" />
                        <span className="text-[13px] font-black text-brand-dark uppercase tracking-widest">
                          {app.role.replace('_', ' ')} Request
                        </span>
                      </div>
                      <Badge
                        variant={app.status === "NEW" ? "info" : app.status === "APPROVED" ? "success" : "danger"}
                        className="capitalize"
                      >
                        {app.status.toLowerCase()}
                      </Badge>
                    </div>

                    <CardContent className="p-6 flex flex-col flex-1">
                      {/* Personal Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="text-gray-400"><span className="font-bold text-[12px] uppercase">Name</span></div>
                            <div className="text-brand-dark font-bold">{app.name}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">{app.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">{app.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <MapPin className="w-4 h-4 text-brand-blue mt-0.5" />
                          <div className="text-sm font-medium text-brand-dark leading-tight">
                            {app.address}
                            <div className="text-gray-400 text-xs uppercase mt-1 tracking-tighter">{app.city}</div>
                          </div>
                        </div>
                      </div>

                      {/* Motivation Block */}
                      <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl mb-6 flex-1">
                        <span className="block text-[11px] font-black text-amber-600 uppercase tracking-widest mb-2">Statement of Motivation</span>
                        <p className="text-[15px] text-gray-700 italic leading-relaxed">
                          "{app.motivation}"
                        </p>
                      </div>

                      {/* Action Row */}
                      {activeTab === "NEW" && (
                        <div className="mt-auto pt-4 flex gap-3">
                          <Button
                            variant="danger"
                            className="flex-1 font-bold text-[12px] uppercase tracking-wider"
                            onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                            disabled={processingId === app.id}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            variant="success"
                            className="flex-2 font-bold text-[12px] uppercase tracking-wider"
                            onClick={() => handleStatusUpdate(app.id, "APPROVED")}
                            disabled={processingId === app.id}
                          >
                            {processingId === app.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve & Provision
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {visibleCount < filteredApps.length && (
              <div className="mt-12 flex justify-center border-t border-gray-100 pt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-12 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-all font-bold uppercase tracking-widest text-[13px]"
                  onClick={() => setVisibleCount(prev => prev + 4)}
                >
                  Load More Applications
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}