// client/src/app/my-requests/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const getUrgencyStyles = (level: string) => {
  switch (level) {
    case "3": return "bg-[#e00000] text-white border-[#e00000]";
    case "2": return "bg-[#fbc02d] text-white border-[#fbc02d]";
    case "1": return "bg-[#388e3c] text-white border-[#388e3c]";
    default: return "bg-[#0a192f] text-white border-[#0a192f]";
  }
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState<any>(null);

  const [actionPledgeId, setActionPledgeId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);

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
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-[28px] font-normal text-gray-900 mb-8 tracking-tight">My requests</h1>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-900" /></div>
          ) : requests.length === 0 ? (
            <div className="border-[1.5px] border-gray-900 p-12 text-center text-gray-900 bg-gray-50">
              No requests found.
            </div>
          ) : (
            <div className="border-[1.5px] border-[#6aa84f] p-4 lg:p-8 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requests.slice(0, visibleCount).map((req) => {
                  const dateStr = new Date(req.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.');
                  const itemsStr = req.items.map((i: any) => `${i.initialQuantity || i.deficit}${i.unit} ${i.food || i.category?.name}`).join(' + ');
                  const completedPledges = req.pledges?.filter((p: any) => p.status === 'COMPLETED') || [];

                  return (
                    <div key={req.id} className={`relative bg-[#e6e6e6] border-[1.5px] border-gray-900 p-6 pt-12 flex flex-col justify-between min-h-[250px] transition-transform ${req.displayStatus === 'EXPIRED' || req.displayStatus === 'FULFILLED' ? 'opacity-70' : 'hover:-translate-y-1'}`}>

                      {/* BRUTALIST BADGE */}
                      <div className={`absolute top-0 right-0 border-b-[1.5px] border-l-[1.5px] border-gray-900 px-8 py-1.5 ${req.displayStatus === 'OPEN' ? 'bg-[#b4c7dc]' : req.displayStatus === 'PARTIAL' ? 'bg-[#f6b26b]' : 'bg-[#a5a5a5]'}`}>
                        <span className="text-[#cc0000] font-normal text-[17px] capitalize">
                          {req.displayStatus.toLowerCase()}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[17px] font-normal text-gray-900">On {dateStr}</p>
                        <p className="text-[17px] font-normal text-gray-900">Requested: {itemsStr}</p>

                        {completedPledges.length > 0 && (
                          <div className="space-y-3 mt-4">
                            {completedPledges.map((pledge: any, pIdx: number) => {
                              const pledgeItemsStr = pledge.items?.map((i: any) => `${i.quantity}${i.category?.unit || ''} ${i.category?.name || ''}`).join(' + ');
                              return (
                                <p key={pIdx} className="text-[16px] font-normal text-gray-800 leading-relaxed">
                                  Till now, received {pledgeItemsStr} from {pledge.donor?.organization || pledge.donor?.name || "unknown"} via Delivery-man {pledge.driver?.name || "unknown"}
                                </p>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* ACTION BUTTON (Visible for OPEN and PARTIAL) */}
                      {(req.displayStatus === 'OPEN' || req.displayStatus === 'PARTIAL') && (
                        <div className="mt-8 flex justify-center">
                          <button
                            onClick={() => setActiveRequest(req)}
                            className="px-8 py-2 bg-[#a5a5a5] border-[1.5px] border-gray-900 text-[#cc0000] font-normal text-[17px] hover:bg-[#8e8e8e] transition-colors shadow-sm"
                          >
                            Check status
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {visibleCount < requests.length && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setVisibleCount(p => p + 4)}
                    className="px-10 py-2 bg-[#b4c7dc] border-[1.5px] border-gray-900 text-[#cc0000] font-normal text-[18px] hover:bg-[#9eb4ca] transition-colors"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* MODAL POPUP */}
        {activeRequest && (
          <div className="fixed inset-0 bg-white/95 flex items-center justify-center z-50 p-8 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white border-[3px] border-[#0a192f] p-10 flex flex-col items-center relative shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] mt-auto mb-auto">
              <button onClick={() => { setActiveRequest(null); setActionPledgeId(null); }} className="absolute right-6 top-6 text-gray-900 font-bold text-lg hover:underline">
                Close (X)
              </button>

              <div className="w-full space-y-4 mb-10 px-8 mt-4">
                {activeRequest.items.map((item: any, idx: number) => {
                  const demanded = item.initialQuantity || item.deficit || 0;

                  // FIX: Calculate received STRICTLY from COMPLETED pledges
                  const completedPledges = activeRequest.pledges?.filter((p: any) => p.status === 'COMPLETED') || [];
                  const received = completedPledges.reduce((sum: number, p: any) => {
                    const pItem = p.items.find((pi: any) => pi.categoryId === item.categoryId);
                    return sum + (pItem ? pItem.quantity : 0);
                  }, 0);

                  let fillPercent = demanded > 0 ? Math.min(100, (received / demanded) * 100) : 0;

                  return (
                    <div key={idx} className="flex justify-between items-center w-full">
                      <span className="text-[20px] font-normal text-gray-900 capitalize w-1/3 text-right pr-6">{item.food || item.category?.name}</span>
                      <span className="text-[20px] font-normal text-gray-900 w-1/3 text-center">{received}/{demanded}{item.unit}</span>
                      <div className="w-1/3 flex justify-start pl-4">
                        <div className="w-[80px] h-[22px] border-[2px] border-gray-900 bg-white relative overflow-hidden flex items-center">
                          <div className="absolute left-0 top-0 h-full bg-[#f6b26b] transition-all duration-500 ease-out" style={{ width: `${fillPercent}%` }}></div>
                          <span className="absolute w-full text-center text-[10px] font-bold text-gray-900 z-10">{Math.round(fillPercent)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 mb-10">
                <span className="text-[24px] text-gray-900 font-normal">Urgency</span>
                <div className={`w-[70px] h-[70px] rounded-full border-[2.5px] flex items-center justify-center text-[36px] font-normal shadow-sm ${getUrgencyStyles(activeRequest.urgency)}`}>
                  {activeRequest.urgency}
                </div>
              </div>

              <div className="w-full border-[2.5px] border-gray-900 p-6 mb-10 min-h-[100px] flex items-center justify-center text-center">
                <p className="text-[20px] font-normal text-gray-900 leading-relaxed">
                  {activeRequest.description || "No specific details provided."}
                </p>
              </div>

              <div className="w-full flex items-center justify-center gap-4 mb-12">
                <span className="text-[22px] font-normal text-gray-900">Status</span>
                <div className="w-40 h-[30px] border-[2px] border-[#4a86e8] bg-white relative overflow-hidden flex items-center rounded-md">
                  <div className="absolute left-0 top-0 h-full bg-[#f6b26b] transition-all duration-500 ease-out"
                    style={{
                      width: `${(() => {
                        const totalDemanded = activeRequest.items.reduce((s: number, i: any) => s + (i.initialQuantity || i.deficit || 0), 0);
                        const completedPledges = activeRequest.pledges?.filter((p: any) => p.status === 'COMPLETED') || [];
                        const totalReceived = activeRequest.items.reduce((sum: number, item: any) => {
                          return sum + completedPledges.reduce((s: number, p: any) => {
                            const pItem = p.items.find((pi: any) => pi.categoryId === item.categoryId);
                            return s + (pItem ? pItem.quantity : 0);
                          }, 0);
                        }, 0);
                        return totalDemanded > 0 ? Math.min(100, Math.round((totalReceived / totalDemanded) * 100)) : 0;
                      })()}%`
                    }}>
                  </div>
                  <span className="absolute w-full text-center text-[14px] font-bold text-gray-900 z-10">
                    {(() => {
                      const totalDemanded = activeRequest.items.reduce((s: number, i: any) => s + (i.initialQuantity || i.deficit || 0), 0);
                      const completedPledges = activeRequest.pledges?.filter((p: any) => p.status === 'COMPLETED') || [];
                      const totalReceived = activeRequest.items.reduce((sum: number, item: any) => {
                        return sum + completedPledges.reduce((s: number, p: any) => {
                          const pItem = p.items.find((pi: any) => pi.categoryId === item.categoryId);
                          return s + (pItem ? pItem.quantity : 0);
                        }, 0);
                      }, 0);
                      return totalDemanded > 0 ? Math.min(100, Math.round((totalReceived / totalDemanded) * 100)) : 0;
                    })()}%
                  </span>
                </div>
              </div>

              <div className="w-full flex flex-col items-start px-8">
                <h3 className="text-[22px] font-normal text-gray-900 mb-4">Donations</h3>

                {activeRequest.pledges && activeRequest.pledges.length > 0 ? (
                  <div className="w-full space-y-4">
                    {activeRequest.pledges.map((pledge: any) => (
                      <div key={pledge.id} className="w-full">
                        {pledge.status === 'LOCKED' || pledge.status === 'IN_TRANSIT' ? (
                          actionPledgeId === pledge.id ? (
                            <div className="flex gap-4 animate-fade-in w-full">
                              <button
                                disabled={isUpdating}
                                onClick={() => handlePledgeStatus(pledge.id, 'COMPLETED')}
                                className="flex-1 py-3 bg-[#6aa84f] border-[2px] border-gray-900 text-white font-bold text-[18px] hover:bg-[#5b9044]"
                              >
                                Received
                              </button>
                              <button
                                disabled={isUpdating}
                                onClick={() => handlePledgeStatus(pledge.id, 'FAILED')}
                                className="flex-1 py-3 bg-[#cc0000] border-[2px] border-gray-900 text-white font-bold text-[18px] hover:bg-[#a60000]"
                              >
                                Failed
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActionPledgeId(pledge.id)}
                              className="w-fit px-6 py-2.5 bg-[#00FFFF] border-[2px] border-gray-900 text-gray-900 font-normal text-[20px] hover:bg-[#00e6e6] transition-colors"
                            >
                              Receive from {pledge.donor?.organization || pledge.donor?.name || "Unknown"}
                            </button>
                          )
                        ) : (
                          <div className={`px-6 py-2.5 border-[2px] border-gray-900 w-fit font-bold text-[18px] ${pledge.status === 'COMPLETED' ? 'bg-[#e6f4ea] text-[#388e3c]' : 'bg-[#fce8e6] text-[#cc0000]'}`}>
                            {pledge.donor?.organization || pledge.donor?.name || "Unknown"}: {pledge.status === 'COMPLETED' ? 'COMPLETED' : 'Failed'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 font-medium">No donations have been pledged to this request yet.</p>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}