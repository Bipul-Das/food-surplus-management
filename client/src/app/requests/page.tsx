// client/src/app/requests/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { X, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

const getUrgencyStyles = (level: string) => {
  switch (level) {
    case "3": return "bg-[#e00000] text-white border-[#e00000]";
    case "2": return "bg-[#fbc02d] text-white border-[#fbc02d]";
    case "1": return "bg-[#388e3c] text-white border-[#388e3c]";
    default: return "bg-gray-200 text-gray-900 border-gray-400";
  }
};

const calculateTimeRemaining = (createdAt: string, requiredWithin: string | null) => {
  if (!requiredWithin || !createdAt) return null;
  try {
    const [hours, minutes] = requiredWithin.split(':').map(Number);
    const createdDate = new Date(createdAt);
    const targetDate = new Date(createdDate.getTime() + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000));
    const now = new Date();

    const diffMs = targetDate.getTime() - now.getTime();
    if (diffMs <= 0) return "Expired";

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}:${diffMins.toString().padStart(2, '0')}`;
  } catch (e) {
    return "N/A";
  }
};

export default function RequestsPage() {
  const { user } = useUserStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [aggregatedInventory, setAggregatedInventory] = useState<Record<string, number>>({});
  const [deliveryAgents, setDeliveryAgents] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [pledgeAmounts, setPledgeAmounts] = useState<Record<string, number>>({});
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [driverSearch, setDriverSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    fetchRequests();
    if (user?.role === "DONOR" || user?.role === "LEAD_DEV") {
      fetchAllocationData();
    }
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/requests", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) setRequests(data.data);
    } catch (error) {
      toast.error("Failed to fetch active requests.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllocationData = async () => {
    try {
      const headers = { "Authorization": `Bearer ${localStorage.getItem("token")}` };
      const invRes = await fetch("http://localhost:5000/api/inventory", { headers });
      const invData = await invRes.json();
      if (invData.success) {
        setInventory(invData.data);
        const aggregated = invData.data.reduce((acc: Record<string, number>, item: any) => {
          const foodName = item.category?.name.toLowerCase();
          if (foodName) acc[foodName] = (acc[foodName] || 0) + item.currentQuantity;
          return acc;
        }, {} as Record<string, number>);
        setAggregatedInventory(aggregated);
      }

      const usersRes = await fetch("http://localhost:5000/api/users", { headers });
      const usersData = await usersRes.json();
      if (usersData.success) {
        // FIX: Strictly filter out Delivery Men who have toggled isActive to false
        setDeliveryAgents(usersData.data.filter((u: any) => u.role === "DELIVERY_MAN" && u.isActive !== false));
      }
    } catch (error) {
      toast.error("Failed to synchronize logistics data.");
    }
  };

  const openPledgeModal = (req: any) => {
    setActiveRequest(req);
    setPledgeAmounts({});
    setSelectedDriverId("");
    setDriverSearch("");
  };

  const handleAmountChange = (food: string, value: string, maxDeficit: number) => {
    const numValue = parseFloat(value) || 0;
    const availableInventory = aggregatedInventory[food.toLowerCase()] || 0;
    const maxAllowed = Math.min(maxDeficit, availableInventory);

    if (numValue > maxAllowed) {
      toast.error(`Constraint Error: Max allowable pledge is ${maxAllowed}.`);
      setPledgeAmounts(prev => ({ ...prev, [food]: maxAllowed }));
    } else {
      setPledgeAmounts(prev => ({ ...prev, [food]: numValue }));
    }
  };

  const handleConfirmPledge = async () => {
    if (!selectedDriverId) return toast.error("System Requirement: Assign Delivery Personnel.");
    const totalPledged = Object.values(pledgeAmounts).reduce((a, b) => a + b, 0);
    if (totalPledged <= 0) return toast.error("Invalid quantity.");

    const batchAllocations: any[] = [];

    for (const [food, amount] of Object.entries(pledgeAmounts)) {
      let remainingAmount = amount;
      if (remainingAmount <= 0) continue;

      const availableBatches = inventory.filter((item: any) =>
        item.category?.name.toLowerCase() === food.toLowerCase() && item.currentQuantity > 0
      );

      availableBatches.sort((a: any, b: any) => {
        const dateA = new Date(a.expiryDate).getTime();
        const dateB = new Date(b.expiryDate).getTime();
        if (dateA !== dateB) return dateA - dateB;

        const createA = new Date(a.createdAt || 0).getTime();
        const createB = new Date(b.createdAt || 0).getTime();
        if (createA !== createB) return createA - createB;

        return (a.batchNumber || "").localeCompare(b.batchNumber || "", undefined, { numeric: true });
      });

      for (const batch of availableBatches) {
        if (remainingAmount <= 0) break;

        const deductQuantity = Math.min(batch.currentQuantity, remainingAmount);

        batchAllocations.push({
          inventoryId: batch.id,
          categoryId: batch.categoryId,
          food: food,
          quantity: deductQuantity,
          batchNumber: batch.batchNumber
        });

        remainingAmount -= deductQuantity;
      }

      if (remainingAmount > 0) {
        return toast.error(`System Error: Insufficient continuous inventory to fulfill ${food}.`);
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${activeRequest.id}/pledge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          pledgeAmounts,
          batchAllocations,
          driverId: selectedDriverId
        })
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Transaction Locked. Inventory Deducted.");
        setActiveRequest(null);
        fetchRequests();
        fetchAllocationData();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleRequests = requests.slice(0, visibleCount);
  const filteredDrivers = deliveryAgents.filter(d =>
    d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
    (d.city && d.city.toLowerCase().includes(driverSearch.toLowerCase()))
  );

  return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "COORDINATOR", "LEAD_DEV", "DELIVERY_MAN"]}>
      {/* LEAD DEV FIX: Restored the layout wrappers and PrivateNavbar since layout.tsx was deleted */}
      <div className="min-h-screen bg-white flex flex-col font-sans">

        <PrivateNavbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12">

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-900" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleRequests.map((req) => {

                  const completedPledges = req.pledges?.filter((p: any) => p.status === 'COMPLETED') || [];
                  const totalDemanded = req.items.reduce((sum: number, item: any) => sum + (item.initialQuantity || item.deficit || 0), 0);

                  const totalReceived = req.items.reduce((sum: number, item: any) => {
                    return sum + completedPledges.reduce((s: number, p: any) => {
                      const pItem = p.items?.find((pi: any) => pi.categoryId === item.categoryId);
                      return s + (pItem ? pItem.quantity : 0);
                    }, 0);
                  }, 0);

                  let overallPercent = 0;
                  if (totalDemanded > 0) overallPercent = Math.round((totalReceived / totalDemanded) * 100);

                  const displayStatus = req.status;
                  const isCompleted = displayStatus === 'FULFILLED' || overallPercent >= 100;
                  const timeRemaining = displayStatus === 'EXPIRED' ? "Expired" : calculateTimeRemaining(req.createdAt, req.requiredWithin);
                  const isExpired = displayStatus === 'EXPIRED' || timeRemaining === "Expired";
                  const isLockedOut = isCompleted || isExpired;

                  let badgeBg = 'bg-[#a5a5a5]';
                  if (displayStatus === 'OPEN') badgeBg = 'bg-[#b4c7dc]';
                  else if (displayStatus === 'PARTIAL') badgeBg = 'bg-[#f6b26b]';

                  return (
                    <div key={req.id} className={`bg-white border-[3px] border-[#0a192f] p-8 flex flex-col items-center relative ${isLockedOut ? 'opacity-60 bg-gray-50' : 'hover:-translate-y-1 transition-transform'}`}>

                      <div className={`absolute top-0 right-0 border-b-[2px] border-l-[2px] border-gray-900 px-6 py-1 ${badgeBg}`}>
                        <span className="text-[#cc0000] font-bold tracking-wider text-[14px] uppercase">
                          {displayStatus}
                        </span>
                      </div>

                      <div className="w-full text-center mt-2 mb-8 border-b-2 border-transparent">
                        <h2 className="text-[22px] font-normal text-gray-900 tracking-tight mb-1">
                          <Link
                            href={`/profile/${req.userId || req.receiverId || ''}`}
                            className="hover:text-[#4a86e8] hover:underline transition-colors block w-fit mx-auto"
                          >
                            {req.orgName}
                          </Link>
                        </h2>
                        <p className="text-[16px] font-normal text-gray-800">{req.location}</p>
                      </div>

                      <div className="w-full space-y-4 mb-10 px-2">
                        {req.items.map((item: any, idx: number) => {
                          const demanded = item.initialQuantity || item.deficit || 0;

                          const received = completedPledges.reduce((s: number, p: any) => {
                            const pItem = p.items?.find((pi: any) => pi.categoryId === item.categoryId);
                            return s + (pItem ? pItem.quantity : 0);
                          }, 0);

                          let fillPercent = 0;
                          if (demanded > 0) fillPercent = Math.min(100, (received / demanded) * 100);

                          return (
                            <div key={idx} className="flex justify-between items-center w-full">
                              <span className="text-[17px] font-normal text-gray-900 capitalize w-1/3 text-left">{item.food}</span>
                              <span className="text-[17px] font-normal text-gray-900 w-1/3 text-center tracking-wide">
                                {received}/{demanded}{item.unit}
                              </span>
                              <div className="w-1/3 flex justify-end">
                                <div className="w-[70px] h-[16px] border-[2px] border-gray-900 bg-white relative overflow-hidden">
                                  <div
                                    className="absolute left-0 top-0 h-full bg-gray-900 transition-all duration-500 ease-out"
                                    style={{ width: `${fillPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="w-full text-center mb-6">
                        {isCompleted ? (
                          <span className="text-[22px] font-black text-[#388e3c] uppercase tracking-widest">Goal Met</span>
                        ) : isExpired ? (
                          <span className="text-[22px] font-black text-[#e00000] uppercase tracking-widest">Time Expired</span>
                        ) : (
                          <span className="text-[24px] font-light text-[#00bfff] tracking-tight">time remaining: {timeRemaining}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-6 mb-8">
                        <span className="text-[22px] text-gray-900 font-normal">Urgency</span>
                        <div className={`w-[85px] h-[85px] rounded-full border-[2.5px] flex items-center justify-center text-[44px] font-normal shadow-sm ${getUrgencyStyles(req.urgency)}`}>
                          {req.urgency}
                        </div>
                      </div>

                      <div className="w-full border-[2.5px] border-[#0a192f] p-6 mb-10 min-h-[100px] flex items-center justify-center text-center bg-white">
                        <p className="text-[16px] font-medium text-gray-900 leading-relaxed">
                          {req.description || "No specific details provided."}
                        </p>
                      </div>

                      <div className="w-full flex items-center justify-center gap-5 mb-10">
                        <span className="text-[17px] font-normal text-gray-900">Status {overallPercent}%</span>
                        <div className="w-32 h-[16px] border-[2.5px] border-[#0a192f] bg-white relative overflow-hidden">
                          <div
                            className={`absolute left-0 top-0 h-full transition-all duration-500 ease-out ${isCompleted ? 'bg-[#388e3c]' : 'bg-[#0a192f]'}`}
                            style={{ width: `${overallPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="w-full flex justify-center mt-auto">
                        {(user?.role === "DONOR" || user?.role === "LEAD_DEV") && (
                          <button
                            onClick={() => !isLockedOut && openPledgeModal(req)}
                            disabled={isLockedOut}
                            className={`px-10 py-3 border-[2.5px] font-bold text-[15px] transition-colors w-full ${isCompleted
                              ? "bg-[#388e3c] border-[#388e3c] text-white cursor-not-allowed"
                              : isExpired
                                ? "bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed"
                                : "bg-white border-gray-900 text-gray-900 hover:bg-gray-100 shadow-sm"
                              }`}
                          >
                            {isCompleted ? "FULLY PLEDGED" : isExpired ? "EXPIRED" : "Pledge donation"}
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {visibleCount < requests.length && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 3)}
                    className="px-12 py-3 bg-white border-2 border-gray-900 text-gray-900 font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors"
                  >
                    LOAD MORE
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Modal Logic */}
        {activeRequest && (
          <div className="fixed inset-0 bg-white/95 flex items-start justify-center z-50 p-8 pt-16 overflow-y-auto">
            <div className="w-full max-w-6xl flex flex-col relative">
              <button onClick={() => setActiveRequest(null)} className="absolute right-0 -top-8 text-gray-900 font-bold text-lg hover:underline">
                Close (X)
              </button>
              <div className="flex flex-col lg:flex-row gap-16 mt-8">
                <div className="flex-1 space-y-12">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">My Inventory</h3>
                    <div className="border-[2px] border-gray-900">
                      <table className="w-full text-left text-[15px]">
                        <thead className="border-b-[2px] border-gray-900 bg-white">
                          <tr>
                            <th className="px-5 py-4 font-bold text-gray-900">item</th>
                            <th className="px-5 py-4 font-bold text-gray-900">qt</th>
                            <th className="px-5 py-4 font-bold text-gray-900">batch</th>
                            <th className="px-5 py-4 font-bold text-gray-900">expires in</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-[1px] divide-gray-300">
                          {inventory.length === 0 ? (
                            <tr><td colSpan={4} className="p-6 text-center font-medium">No active inventory found.</td></tr>
                          ) : (
                            inventory.map((item) => (
                              <tr key={item.id}>
                                <td className="px-5 py-4 font-medium capitalize">{item.category?.name}</td>
                                <td className="px-5 py-4 font-bold">{item.currentQuantity}{item.category?.unit}</td>
                                <td className="px-5 py-4 font-medium">{item.batchNumber}</td>
                                <td className="px-5 py-4 font-medium">{new Date(item.expiryDate).toLocaleDateString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <div className="inline-block px-4 py-2 border-[1.5px] border-gray-900 font-medium text-sm mb-4">
                      Active delivery guys
                    </div>
                    <div className="border-[2px] border-gray-900 bg-white">
                      <div className="flex items-center px-4 py-3 border-b-[2px] border-gray-900">
                        <Search className="w-5 h-5 text-[#4a86e8] stroke-2 mr-3" />
                        <input
                          type="text"
                          placeholder="Search by location/name"
                          value={driverSearch}
                          onChange={(e) => setDriverSearch(e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-[15px]"
                        />
                      </div>
                      <div className="grid grid-cols-4 px-5 py-3 border-b-[2px] border-gray-900 text-sm font-medium">
                        <div>Name</div>
                        <div>city</div>
                        <div className="col-span-2">location</div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <div className="divide-y-[1px] divide-gray-300">
                          {filteredDrivers.map(agent => (
                            <div key={agent.id} className="grid grid-cols-4 px-5 py-4 items-center text-[15px]">
                              <div className="font-medium">{agent.name}</div>
                              <div className="font-medium capitalize">{agent.city || "-"}</div>
                              <div className="font-medium capitalize">{agent.address || "-"}</div>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => setSelectedDriverId(agent.id)}
                                  className={`px-6 py-1.5 border-[1.5px] font-medium transition-colors ${selectedDriverId === agent.id
                                    ? "bg-gray-900 border-gray-900 text-white"
                                    : "bg-gray-200 border-gray-400 text-[#cc0000] hover:bg-gray-300"
                                    }`}
                                >
                                  {selectedDriverId === agent.id ? "assigned" : "assign"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-[400px] flex flex-col pt-12 space-y-8">
                  <div className="text-right border-b-2 border-gray-900 pb-6 mb-8">
                    <h2 className="text-2xl font-normal text-gray-900">
                      <Link
                        href={`/profile/${activeRequest.userId || activeRequest.receiverId || ''}`}
                        className="hover:text-[#4a86e8] hover:underline transition-colors"
                      >
                        {activeRequest.orgName}
                      </Link>
                    </h2>
                    <p className="text-[17px] font-normal text-gray-800">{activeRequest.location}</p>
                  </div>
                  <div className="space-y-6">
                    {activeRequest.items.map((item: any) => {
                      const avail = aggregatedInventory[item.food.toLowerCase()] || 0;
                      const maxAllowed = Math.min(item.deficit, avail);
                      const isZero = maxAllowed === 0;
                      return (
                        <div key={item.food} className="flex items-center justify-end gap-6">
                          <span className="font-normal text-gray-900 text-xl capitalize">{item.food}</span>
                          <div className="w-32">
                            <input
                              type="number"
                              min="0"
                              max={maxAllowed}
                              disabled={isZero}
                              value={pledgeAmounts[item.food] || ""}
                              onChange={(e) => handleAmountChange(item.food, e.target.value, item.deficit)}
                              className="w-full px-4 py-2 border-[2px] border-gray-900 font-bold text-center text-lg focus:outline-none disabled:bg-gray-100 disabled:border-gray-300"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-12 flex justify-end">
                    <button
                      onClick={handleConfirmPledge}
                      disabled={isSubmitting || !selectedDriverId}
                      className="px-12 py-4 bg-white border-[2px] border-gray-900 text-gray-900 font-normal text-xl hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-3"
                    >
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Provide"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}