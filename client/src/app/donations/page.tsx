// client/src/app/donations/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader2, Calendar, MapPin, Truck, Package, XCircle, CheckCircle2, Clock, History } from "lucide-react";
import toast from "react-hot-toast";

export default function DonationHistoryPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Requirement: Load 6 initially, append 4 on Load More
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const fetchMyDonations = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/donors/my-donations", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        setDonations(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch donation history.");
    } finally {
      setIsLoading(false);
    }
  };

  // DESIGN REQUIREMENT: 3 distinct colors for 3 statuses
  const getStatusConfig = (status: string) => {
    if (status === 'IN_TRANSIT' || status === 'LOCKED') {
      return {
        text: 'Processing',
        badge: 'info' as const,
        icon: <Clock className="w-3.5 h-3.5 mr-1" />,
        cardStyle: 'border-brand-blue/30 ring-1 ring-brand-blue/5 bg-blue-50/20'
      };
    }
    if (status === 'COMPLETED') {
      return {
        text: 'Complete',
        badge: 'success' as const,
        icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
        cardStyle: 'border-semantic-success/30 ring-1 ring-semantic-success/5 bg-emerald-50/20'
      };
    }
    if (status === 'FAILED') {
      return {
        text: 'Failed',
        badge: 'danger' as const,
        icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
        cardStyle: 'border-semantic-danger/20 ring-1 ring-semantic-danger/5 bg-red-50/20 opacity-80 grayscale-[0.2]'
      };
    }
    return {
      text: status.toLowerCase(),
      badge: 'neutral' as const,
      icon: null,
      cardStyle: 'border-gray-200 bg-white'
    };
  };

  const visibleDonations = donations.slice(0, visibleCount);

  return (
    <ProtectedRoute allowedRoles={["DONOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">

          <div className="mb-10">
            <h1 className="text-3xl font-black text-brand-dark tracking-tight">Donation Ledger</h1>
            <p className="text-[15px] font-medium text-gray-500 mt-1">Audit your historical and active contributions to the network.</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-brand-blue" />
              <p className="text-gray-500 font-medium animate-pulse">Syncing transaction ledger...</p>
            </div>
          ) : donations.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-20 border-dashed">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <History className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-lg font-bold text-gray-400">No donation history found.</p>
            </Card>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleDonations.map((donation) => {
                  const dateStr = new Date(donation.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.');
                  const itemsStr = donation.items.map((i: any) => `${i.quantity}${i.unit} ${i.food}`).join(' + ');

                  const { text: statusText, badge, icon, cardStyle } = getStatusConfig(donation.status);

                  const actionWord =
                    donation.status === 'COMPLETED' ? 'Delivered to' :
                      donation.status === 'FAILED' ? 'Failed delivery to' :
                        'Routing to';

                  return (
                    <Card
                      key={donation.id}
                      className={`flex flex-col relative overflow-hidden transition-all duration-300 cinematic-hover ${cardStyle}`}
                    >
                      {/* Header */}
                      <div className="px-5 py-4 border-b border-gray-100/50 bg-white/60 backdrop-blur-sm flex justify-between items-center">
                        <div className="flex items-center text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {dateStr}
                        </div>
                        <Badge variant={badge} className="uppercase tracking-widest text-[10px]">
                          <div className="flex items-center">{icon} {statusText}</div>
                        </Badge>
                      </div>

                      {/* Body */}
                      <CardContent className="p-6 flex-1 flex flex-col bg-white/40">
                        <div className="space-y-4 flex-1">

                          {/* Destination */}
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm mt-0.5">
                              <MapPin className="w-4 h-4 text-brand-dark" />
                            </div>
                            <div>
                              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{actionWord}</span>
                              <span className="text-[15px] font-bold text-brand-dark capitalize leading-tight">{donation.receiverOrg}</span>
                            </div>
                          </div>

                          {/* Items Payload */}
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm mt-0.5">
                              <Package className="w-4 h-4 text-brand-blue" />
                            </div>
                            <div>
                              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Payload</span>
                              <span className="text-[14px] font-medium text-gray-700 capitalize leading-relaxed">{itemsStr}</span>
                            </div>
                          </div>
                        </div>

                        {/* Logistics Operator */}
                        <div className="mt-6 pt-4 border-t border-gray-100/50 flex items-center gap-3">
                          <div className="p-1.5 bg-gray-100 rounded-md text-gray-400">
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[13px] font-medium text-gray-500">
                            Handled by <span className="font-bold text-brand-dark capitalize">{donation.driverName}</span>
                          </span>
                        </div>

                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {visibleCount < donations.length && (
                <div className="flex justify-center mt-12 border-t border-gray-100 pt-8">
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