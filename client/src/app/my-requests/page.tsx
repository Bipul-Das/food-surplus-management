// client/src/app/my-requests/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { X, Loader2, Clock, Calendar, AlertTriangle, CheckCircle2, ChevronRight, Download, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import toast from "react-hot-toast";

const getUrgencyStyles = (level: string) => {
  switch (level) {
    case "3": return "bg-semantic-danger text-white border-semantic-danger";
    case "2": return "bg-semantic-warning text-white border-semantic-warning";
    case "1": return "bg-semantic-success text-white border-semantic-success";
    default: return "bg-brand-dark text-white border-brand-dark";
  }
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState<any>(null);

  const [actionPledgeId, setActionPledgeId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/receivers/my-requests", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();

      if (data.success) {
        const processedRequests = data.data.map((req: any) => {
          let displayStatus = req.status;

          const completedPledges = req.pledges?.filter((p: any) => p.status === 'COMPLETED') || [];
          const isFulfilled = req.items.length > 0 && req.items.every((item: any) => {
            const demanded = item.initialQuantity || item.deficit || 0;
            const received = completedPledges.reduce((sum: number, p: any) => {
              const pItem = p.items.find((pi: any) => pi.categoryId === item.categoryId);
              return sum + (pItem ? pItem.quantity : 0);
            }, 0);
            return received >= demanded;
          });

          let isExpired = false;
          if (req.requiredWithin && !isFulfilled) {
            const [hours, minutes] = req.requiredWithin.split(':').map(Number);
            const expiryTime = new Date(req.createdAt);
            expiryTime.setHours(expiryTime.getHours() + (hours || 0));
            expiryTime.setMinutes(expiryTime.getMinutes() + (minutes || 0));
            if (new Date() > expiryTime) isExpired = true;
          }

          if (isFulfilled) displayStatus = 'FULFILLED';
          else if (isExpired) displayStatus = 'EXPIRED';

          return { ...req, displayStatus };
        });

        processedRequests.sort((a: any, b: any) => {
          const aAct = a.displayStatus === 'OPEN' || a.displayStatus === 'PARTIAL';
          const bAct = b.displayStatus === 'OPEN' || b.displayStatus === 'PARTIAL';
          if (aAct && !bAct) return -1;
          if (!aAct && bAct) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setRequests(processedRequests);

        if (activeRequest) {
          const updatedReq = processedRequests.find((r: any) => r.id === activeRequest.id);
          if (updatedReq) setActiveRequest(updatedReq);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch logistics data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePledgeStatus = async (pledgeId: string, status: 'COMPLETED' | 'FAILED') => {
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/receivers/pledge/${pledgeId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status })
      });
      const result = await res.json();

      if (result.success) {
        toast.success(`Logistics marked as ${status}.`);
        setActionPledgeId(null);
        fetchMyRequests();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["RECEIVER", "LEAD_DEV"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">

          <div className="mb-10">
            <h1 className="text-3xl font-black text-brand-dark tracking-tight">My Active Requests</h1>
            <p className="text-[15px] font-medium text-gray-500 mt-1">Track and manage your broadcasted resource requirements.</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-brand-blue" />
              <p className="text-gray-500 font-medium animate-pulse">Syncing network data...</p>
            </div>
          ) : requests.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-20 border-dashed">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-lg font-bold text-gray-400">No broadcasted requests found.</p>
            </Card>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.slice(0, visibleCount).map((req) => {
                  const dateStr = new Date(req.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.');
                  const completedPledges = req.pledges?.filter((p: any) => p.status === 'COMPLETED') || [];

                  // DESIGN REQUIREMENT: 4 Distinct Colors for 4 Types of Requests
                  let cardStyle = "";
                  let badgeVariant: "info" | "warning" | "success" | "danger" | "neutral" = "neutral";

                  if (req.displayStatus === 'OPEN') {
                    cardStyle = "border-brand-blue/30 ring-1 ring-brand-blue/10 bg-blue-50/20";
                    badgeVariant = "info";
                  } else if (req.displayStatus === 'PARTIAL') {
                    cardStyle = "border-semantic-warning/40 ring-1 ring-semantic-warning/10 bg-amber-50/20";
                    badgeVariant = "warning";
                  } else if (req.displayStatus === 'FULFILLED') {
                    cardStyle = "border-semantic-success/30 ring-1 ring-semantic-success/10 bg-emerald-50/20 opacity-70 grayscale-[0.2]";
                    badgeVariant = "success";
                  } else if (req.displayStatus === 'EXPIRED') {
                    cardStyle = "border-semantic-danger/20 ring-1 ring-semantic-danger/5 bg-red-50/20 opacity-60 grayscale-[0.4]";
                    badgeVariant = "danger";
                  }

                  return (
                    <Card
                      key={req.id}
                      className={`flex flex-col relative overflow-hidden transition-all duration-300 ${cardStyle} ${req.displayStatus === 'OPEN' || req.displayStatus === 'PARTIAL' ? 'cinematic-hover' : ''}`}
                    >
                      <div className="px-5 py-4 border-b border-gray-100 bg-white/60 backdrop-blur-sm flex justify-between items-center">
                        <Badge variant={badgeVariant}>{req.displayStatus}</Badge>
                        <div className="flex items-center text-xs font-bold text-gray-500">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                          {dateStr}
                        </div>
                      </div>

                      <CardContent className="p-6 flex-1 flex flex-col bg-white/40">

                        <div className="space-y-4 mb-6 flex-1">
                          {req.items.map((item: any, idx: number) => {
                            const demanded = item.initialQuantity || item.deficit || 0;
                            const received = completedPledges.reduce((s: number, p: any) => {
                              const pItem = p.items?.find((pi: any) => pi.categoryId === item.categoryId);
                              return s + (pItem ? pItem.quantity : 0);
                            }, 0);
                            return (
                              <div key={idx} className="space-y-1.5">
                                <div className="flex justify-between items-end">
                                  <span className="text-[13px] font-bold text-brand-dark uppercase tracking-widest">{item.food || item.category?.name}</span>
                                  <span className="text-xs font-medium text-gray-500">{received} / {demanded} {item.unit}</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${req.displayStatus === 'FULFILLED' ? 'bg-semantic-success' : 'bg-brand-blue'}`}
                                    style={{ width: `${demanded > 0 ? Math.min(100, (received / demanded) * 100) : 0}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {(req.displayStatus === 'OPEN' || req.displayStatus === 'PARTIAL') && (
                          <div className="mt-auto pt-4 border-t border-gray-100">
                            <Button
                              variant="secondary"
                              className="w-full group"
                              onClick={() => setActiveRequest(req)}
                            >
                              Manage Operations
                              <ChevronRight className="w-4 h-4 ml-1 text-gray-400 group-hover:text-brand-blue transition-colors" />
                            </Button>
                          </div>
                        )}

                        {(req.displayStatus === 'FULFILLED' || req.displayStatus === 'EXPIRED') && (
                          <div className="mt-auto pt-4 border-t border-gray-100">
                            <Button
                              variant="secondary"
                              className="w-full opacity-50 cursor-not-allowed"
                              onClick={() => setActiveRequest(req)}
                            >
                              View Archive
                            </Button>
                          </div>
                        )}

                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {visibleCount < requests.length && (
                <div className="flex justify-center mt-12 border-t border-gray-100 pt-8">
                  <Button variant="outline" size="lg" onClick={() => setVisibleCount(p => p + 3)}>
                    Load More History
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* MODAL POPUP - Rebuilt for SaaS Standard */}
        {activeRequest && (
          <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8 animate-in fade-in duration-300 overflow-y-auto">
            <Card className="w-full max-w-3xl flex flex-col relative shadow-cinematic overflow-hidden my-auto">

              <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-xl font-black text-brand-dark">Fulfillment Operations Center</h3>
                  <p className="text-sm font-medium text-gray-500">Managing logistics for request {activeRequest.id.substring(0, 8)}...</p>
                </div>
                <button onClick={() => { setActiveRequest(null); setActionPledgeId(null); }} className="p-2 bg-white rounded-full text-gray-400 hover:text-semantic-danger hover:bg-red-50 transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8">

                {/* Visual Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="space-y-4">
                    <span className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Completion Status</span>
                    {activeRequest.items.map((item: any, idx: number) => {
                      const demanded = item.initialQuantity || item.deficit || 0;
                      const completedPledges = activeRequest.pledges?.filter((p: any) => p.status === 'COMPLETED') || [];
                      const received = completedPledges.reduce((sum: number, p: any) => {
                        const pItem = p.items.find((pi: any) => pi.categoryId === item.categoryId);
                        return sum + (pItem ? pItem.quantity : 0);
                      }, 0);

                      return (
                        <ProgressBar
                          key={idx}
                          current={received}
                          total={demanded}
                          label={item.food || item.category?.name}
                          unit={item.unit}
                        />
                      );
                    })}
                  </div>

                  <div className="flex flex-col justify-center items-center md:items-end md:pr-4 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0">
                    <span className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3">Priority Level</span>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black shadow-sm ${getUrgencyStyles(activeRequest.urgency)}`}>
                      {activeRequest.urgency}
                    </div>
                  </div>
                </div>

                {activeRequest.description && (
                  <div>
                    <span className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Operational Context</span>
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-[15px] text-gray-700 italic">
                      "{activeRequest.description}"
                    </div>
                  </div>
                )}

                {/* Logistics Ledger */}
                <div>
                  <h3 className="text-lg font-black text-brand-dark tracking-tight mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-brand-blue" /> Incoming Logistics
                  </h3>

                  {activeRequest.pledges && activeRequest.pledges.length > 0 ? (
                    <div className="space-y-4">
                      {activeRequest.pledges.map((pledge: any) => (
                        <div key={pledge.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                          <div className="px-5 py-3 bg-gray-50 flex justify-between items-center border-b border-gray-100">
                            <span className="text-[13px] font-bold text-brand-dark uppercase tracking-widest">
                              From {pledge.donor?.organization || pledge.donor?.name || "Unknown Entity"}
                            </span>
                            <Badge variant={pledge.status === 'COMPLETED' ? 'success' : pledge.status === 'FAILED' ? 'danger' : 'warning'} size="sm">
                              {pledge.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-[14px] font-medium text-gray-600">
                              {pledge.items?.map((i: any) => `${i.quantity}${i.category?.unit || ''} ${i.category?.name || ''}`).join(' + ')}
                            </div>

                            {/* Action Engine */}
                            {pledge.status === 'LOCKED' || pledge.status === 'IN_TRANSIT' ? (
                              actionPledgeId === pledge.id ? (
                                <div className="flex w-full md:w-auto gap-2 animate-in slide-in-from-right-4">
                                  <Button
                                    variant="success"
                                    size="sm"
                                    disabled={isUpdating}
                                    onClick={() => handlePledgeStatus(pledge.id, 'COMPLETED')}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Accept
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    disabled={isUpdating}
                                    onClick={() => handlePledgeStatus(pledge.id, 'FAILED')}
                                  >
                                    <XCircle className="w-4 h-4 mr-1.5" /> Fail
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="w-full md:w-auto border-brand-blue/30 text-brand-blue hover:bg-brand-blue hover:text-white"
                                  onClick={() => setActionPledgeId(pledge.id)}
                                >
                                  Process Delivery
                                </Button>
                              )
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-gray-200 text-center bg-gray-50/50">
                      <p className="text-[14px] font-bold text-gray-400">No external commitments pledged to this request yet.</p>
                    </div>
                  )}
                </div>

              </div>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}