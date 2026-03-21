// client/src/app/requests/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { X, Search, Loader2, Clock, MapPin, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

const getUrgencyBadge = (level: string) => {
  switch (level) {
    case "3": return <Badge variant="danger" size="md" className="ml-2">Urgency 3</Badge>;
    case "2": return <Badge variant="warning" size="md" className="ml-2">Urgency 2</Badge>;
    case "1": return <Badge variant="success" size="md" className="ml-2">Urgency 1</Badge>;
    default: return <Badge variant="neutral" size="md" className="ml-2">Standard</Badge>;
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
    } catch (error) { toast.error("Failed to fetch active requests."); }
    finally { setIsLoading(false); }
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
        setDeliveryAgents(usersData.data.filter((u: any) => u.role === "DELIVERY_MAN" && u.isActive !== false));
      }
    } catch (error) { toast.error("Failed to synchronize logistics data."); }
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
        batchAllocations.push({ inventoryId: batch.id, categoryId: batch.categoryId, food: food, quantity: deductQuantity, batchNumber: batch.batchNumber });
        remainingAmount -= deductQuantity;
      }
      if (remainingAmount > 0) return toast.error(`System Error: Insufficient continuous inventory to fulfill ${food}.`);
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${activeRequest.id}/pledge`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ pledgeAmounts, batchAllocations, driverId: selectedDriverId })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Transaction Locked. Inventory Deducted.");
        setActiveRequest(null);
        fetchRequests();
        fetchAllocationData();
      } else throw new Error(result.message);
    } catch (error: any) { toast.error(error.message || "Transaction failed."); }
    finally { setIsSubmitting(false); }
  };

  const visibleRequests = requests.slice(0, visibleCount);
  const filteredDrivers = deliveryAgents.filter(d =>
    d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
    (d.city && d.city.toLowerCase().includes(driverSearch.toLowerCase()))
  );

  return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "COORDINATOR", "LEAD_DEV", "DELIVERY_MAN"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">

          <div className="mb-8">
            <h1 className="text-3xl font-black text-brand-dark tracking-tight">Active Requests</h1>
            <p className="text-[15px] font-medium text-gray-500 mt-1">Live overview of network needs and ongoing operations.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-brand-blue" /></div>
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

                  let badgeVariant: "info" | "warning" | "danger" | "success" | "neutral" = "neutral";
                  if (displayStatus === 'OPEN') badgeVariant = "info";
                  else if (displayStatus === 'PARTIAL') badgeVariant = "warning";
                  else if (displayStatus === 'EXPIRED') badgeVariant = "danger";
                  else if (displayStatus === 'FULFILLED') badgeVariant = "success";

                  const displayName = req.orgName || req.organization || req.name || "Organization";
                  const initials = displayName.substring(0, 3).toUpperCase();

                  // LEAD DEV FIX: Now accurately targeting the receiverAvatar property matching your updated backend!
                  const avatarUrl = req.receiverAvatar;

                  return (
                    <Card key={req.id} className={`flex flex-col relative ${isLockedOut ? 'opacity-60 grayscale-[0.2]' : 'cinematic-hover'}`}>

                      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <Badge variant={badgeVariant}>
                          {displayStatus}
                        </Badge>
                        <div className="flex items-center text-sm font-bold text-gray-500">
                          <Clock className="w-4 h-4 mr-1.5" />
                          {isCompleted ? "Goal Met" : isExpired ? "Expired" : timeRemaining}
                        </div>
                      </div>

                      <CardContent className="p-6 flex-1 flex flex-col">

                        <div className="flex items-center gap-4 mb-6">

                          {/* Layered Avatar Component: Exact copy of inventory_all */}
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-blue/20 ring-4 ring-white shadow-md flex-shrink-0 relative bg-brand-blue/10 text-brand-blue text-xl font-black transition-colors duration-300">

                            <span className="absolute inset-0 flex items-center justify-center z-0">
                              {initials}
                            </span>

                            {avatarUrl && (
                              <img
                                src={avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:5000${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`}
                                alt={`${displayName} profile`}
                                className="absolute inset-0 w-full h-full object-cover z-10 bg-white"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                          </div>

                          <div className="flex-1">
                            <Link href={`/profile/${req.receiverId || ''}`} className="text-xl font-black text-brand-dark hover:text-brand-blue transition-colors tracking-tight line-clamp-1">
                              {displayName}
                            </Link>
                            <div className="flex items-center text-sm text-gray-500 mt-1 font-medium">
                              <MapPin className="w-4 h-4 mr-1 text-brand-blue" />
                              {req.location}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 mb-6 flex-1">
                          {req.items.map((item: any, idx: number) => {
                            const demanded = item.initialQuantity || item.deficit || 0;
                            const received = completedPledges.reduce((s: number, p: any) => {
                              const pItem = p.items?.find((pi: any) => pi.categoryId === item.categoryId);
                              return s + (pItem ? pItem.quantity : 0);
                            }, 0);
                            return (
                              <ProgressBar
                                key={idx}
                                current={received}
                                total={demanded}
                                label={item.food}
                                unit={item.unit}
                              />
                            );
                          })}
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl mb-6 flex items-center justify-between border border-gray-100">
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Priority</span>
                          {getUrgencyBadge(req.urgency)}
                        </div>

                        {(user?.role === "DONOR" || user?.role === "LEAD_DEV") && (
                          <div className="mt-auto pt-2">
                            <Button
                              variant={isCompleted ? "success" : isExpired ? "danger" : "primary"}
                              className="w-full"
                              disabled={isLockedOut}
                              onClick={() => !isLockedOut && openPledgeModal(req)}
                            >
                              {isCompleted ? "Fully Pledged" : isExpired ? "Request Expired" : "Pledge Donation"}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {visibleCount < requests.length && (
                <div className="mt-12 flex justify-center">
                  <Button variant="secondary" size="lg" onClick={() => setVisibleCount(prev => prev + 3)}>
                    Load More Requests
                  </Button>
                </div>
              )}
            </>
          )}
        </main>

        {activeRequest && (
          <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8 animate-in fade-in duration-300">
            <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col relative shadow-cinematic overflow-hidden">

              <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-xl font-black text-brand-dark">Pledge Allocation Console</h3>
                  <p className="text-sm font-medium text-gray-500">Routing surplus to {activeRequest.orgName || "Organization"}</p>
                </div>
                <button onClick={() => setActiveRequest(null)} className="p-2 bg-white rounded-full text-gray-400 hover:text-semantic-danger hover:bg-red-50 transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 flex flex-col lg:flex-row gap-12">

                <div className="flex-1 space-y-8">
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center"><Truck className="w-4 h-4 mr-2" /> Select Delivery Agent</h4>
                    <div className="bg-surface-background rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-3 border-b border-gray-200 bg-white">
                        <Input
                          placeholder="Search agents by name or city..."
                          value={driverSearch}
                          onChange={(e) => setDriverSearch(e.target.value)}
                          icon={<Search className="w-4 h-4" />}
                          className="bg-transparent border-none shadow-none focus:ring-0 px-0"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 bg-white">
                        {filteredDrivers.map(agent => (
                          <div key={agent.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div>
                              <p className="font-bold text-brand-dark text-sm">{agent.name}</p>
                              <p className="text-xs font-medium text-gray-500 capitalize">{agent.city || "Unassigned Zone"}</p>
                            </div>
                            <Button
                              variant={selectedDriverId === agent.id ? "primary" : "secondary"}
                              size="sm"
                              onClick={() => setSelectedDriverId(agent.id)}
                            >
                              {selectedDriverId === agent.id ? "Assigned" : "Assign"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[400px] flex flex-col bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Fulfillment Ledger</h4>
                  <div className="space-y-6 flex-1">
                    {activeRequest.items.map((item: any) => {
                      const avail = aggregatedInventory[item.food.toLowerCase()] || 0;
                      const maxAllowed = Math.min(item.deficit, avail);
                      const isZero = maxAllowed === 0;
                      return (
                        <div key={item.food} className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-brand-dark capitalize text-[15px]">{item.food}</p>
                            <p className="text-xs font-medium text-gray-500">Avail: {avail}{item.unit} | Need: {item.deficit}{item.unit}</p>
                          </div>
                          <div className="w-28">
                            <Input
                              type="number"
                              min="0"
                              max={maxAllowed}
                              disabled={isZero}
                              value={pledgeAmounts[item.food] || ""}
                              onChange={(e) => handleAmountChange(item.food, e.target.value, item.deficit)}
                              placeholder="0"
                              className="text-center font-black"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={handleConfirmPledge}
                      disabled={isSubmitting || !selectedDriverId}
                      isLoading={isSubmitting}
                    >
                      Authorize Transaction
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}