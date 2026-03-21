// client/src/app/my-deliveries/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader2, Calendar, MapPin, Package, ArrowRight, Truck, CheckCircle2, XCircle, Clock, History } from "lucide-react";
import toast from "react-hot-toast";

export default function MyDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Requirement: Load 6 initially, append 4 on Load More
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    fetchDeliveryHistory();
  }, []);

  const fetchDeliveryHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/deliveries/history", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        setDeliveries(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch logistics history.");
    } finally {
      setIsLoading(false);
    }
  };

  // DESIGN REQUIREMENT: 3 distinct colors for 3 statuses
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
      case 'LOCKED':
        return {
          text: 'Processing',
          badge: 'info' as const,
          icon: <Clock className="w-3.5 h-3.5 mr-1" />,
          cardStyle: 'border-brand-blue/30 ring-1 ring-brand-blue/5 bg-blue-50/20'
        };
      case 'COMPLETED':
        return {
          text: 'Complete',
          badge: 'success' as const,
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
          cardStyle: 'border-semantic-success/30 ring-1 ring-semantic-success/5 bg-emerald-50/20'
        };
      case 'FAILED':
        return {
          text: 'Failed',
          badge: 'danger' as const,
          icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
          cardStyle: 'border-semantic-danger/20 ring-1 ring-semantic-danger/5 bg-red-50/20 opacity-80 grayscale-[0.2]'
        };
      default:
        return {
          text: status.toLowerCase(),
          badge: 'neutral' as const,
          icon: null,
          cardStyle: 'border-gray-200 bg-white'
        };
    }
  };

  const visibleDeliveries = deliveries.slice(0, visibleCount);

  return (
    <ProtectedRoute allowedRoles={["DELIVERY_MAN", "LEAD_DEV"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-black text-brand-dark tracking-tight">Logistics Ledger</h1>
              <p className="text-[15px] font-medium text-gray-500 mt-1">Audit your historical and active transport routes.</p>
            </div>
            <Badge variant="info" size="lg" className="shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
              Driver Active
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-brand-blue" />
              <p className="text-gray-500 font-medium animate-pulse">Syncing transport logs...</p>
            </div>
          ) : deliveries.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-20 border-dashed">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Truck className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-lg font-bold text-gray-400">No delivery history found.</p>
            </Card>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleDeliveries.map((delivery) => {
                  const dateStr = new Date(delivery.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.');
                  const itemsStr = delivery.items.map((i: any) => `${i.quantity}${i.unit} ${i.food}`).join(' + ');

                  const config = getStatusConfig(delivery.status);

                  return (
                    <Card
                      key={delivery.id}
                      className={`flex flex-col relative overflow-hidden transition-all duration-300 cinematic-hover ${config.cardStyle}`}
                    >
                      {/* Header */}
                      <div className="px-5 py-4 border-b border-gray-100/50 bg-white/60 backdrop-blur-sm flex justify-between items-center">
                        <div className="flex items-center text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {dateStr}
                        </div>
                        <Badge variant={config.badge} className="uppercase tracking-widest text-[10px]">
                          <div className="flex items-center">{config.icon} {config.text}</div>
                        </Badge>
                      </div>

                      {/* Body */}
                      <CardContent className="p-6 flex-1 flex flex-col bg-white/40">

                        {/* Payload Block */}
                        <div className="mb-6 p-4 bg-brand-blue/5 border border-brand-blue/10 rounded-xl flex items-start gap-3">
                          <Package className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Manifest Payload</span>
                            <span className="text-[14px] font-bold text-brand-dark capitalize leading-relaxed">{itemsStr}</span>
                          </div>
                        </div>

                        {/* Routing Details */}
                        <div className="space-y-4 flex-1 relative">
                          {/* Visual Connector Line */}
                          <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200" />

                          <div className="flex items-start gap-4 relative z-10">
                            <div className="p-1.5 bg-white rounded-full border-2 border-gray-200 z-10 mt-1">
                              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                            </div>
                            <div>
                              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Origin / Donor</span>
                              <span className="text-[15px] font-bold text-brand-dark capitalize">{delivery.donorOrg}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-4 relative z-10">
                            <div className="p-1.5 bg-white rounded-full border-2 border-gray-200 z-10 mt-1">
                              <MapPin className="w-3 h-3 text-brand-blue" />
                            </div>
                            <div>
                              <span className="block text-[11px] font-bold text-brand-blue uppercase tracking-widest mb-0.5">Destination / Receiver</span>
                              <span className="text-[15px] font-bold text-brand-dark capitalize">{delivery.receiverOrg}</span>
                            </div>
                          </div>
                        </div>

                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Load More Logic (+4 per click) */}
              {visibleCount < deliveries.length && (
                <div className="flex justify-center mt-12 border-t border-black pt-8">
                  <Button
                    variant="outline"
                    size="lg" 
                    onClick={() => setVisibleCount(prev => prev + 4)}
                    className="px-12"
                  >
                    Load More Records
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}