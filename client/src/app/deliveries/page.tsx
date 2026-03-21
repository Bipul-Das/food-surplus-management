// client/src/app/deliveries/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Loader2, MapPin, Navigation } from "lucide-react";
import toast from "react-hot-toast";

export default function DeliveryDirectoryPage() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryAgents();
  }, []);

  const fetchDeliveryAgents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const result = await res.json();

      if (result.success) {
        const agents = result.data.filter((u: any) => u.role === "DELIVERY_MAN" && u.isActive !== false);
        setPersonnel(agents);
      }
    } catch (error) {
      toast.error("Failed to fetch delivery roster.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAgents = personnel.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.city && agent.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (agent.address && agent.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "COORDINATOR", "LEAD_DEV", "DELIVERY_MAN"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">

          {/* DESIGN UPGRADE: SaaS Header Structure */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-brand-dark tracking-tight">Logistics Network</h1>
            <p className="text-[15px] font-medium text-gray-500 mt-1">Live directory of active delivery personnel.</p>
          </div>

          {/* DESIGN UPGRADE: Cinematic Search Bar matching Requests page layout */}
          <div className="mb-8 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center">
            <Input
              type="text"
              placeholder="Search personnel by name, city, or operational zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5 text-brand-blue" />}
              className="bg-transparent border-none shadow-none focus:ring-0 w-full text-[15px]"
            />
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-brand-blue" />
                <p className="text-gray-500 font-medium animate-pulse">Syncing logistics roster...</p>
              </div>
            ) : filteredAgents.length === 0 ? (
              <Card className="p-16 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Navigation className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">No Personnel Found</h3>
                <p className="text-gray-500 font-medium">There are no active delivery personnel matching your search criteria.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => {
                  const targetId = agent.userId || agent.user?.id || agent.id;

                  // Helper for Avatar Fallback & Name Parsing
                  const displayName = agent.name || "Delivery Agent";
                  const initials = displayName.substring(0, 3).toUpperCase();
                  const avatarUrl = agent.avatar; // Relies strictly on backend response

                  return (
                    <Card key={agent.id || targetId} className="cinematic-hover flex flex-col group overflow-hidden">
                      <CardContent className="p-6 flex-1 flex flex-col relative">

                        {/* Decorative Background Accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110 duration-500" />

                        {/* Top Section: Avatar and Identity */}
                        <div className="flex items-center gap-4 mb-6 relative z-10">

                          {/* DESIGN UPGRADE: Integrated Layered Avatar Component */}
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-blue/20 ring-4 ring-white shadow-md flex-shrink-0 relative bg-brand-blue/10 text-brand-blue text-xl font-black transition-colors duration-300">
                            {/* LAYER 1: Fallback Initials */}
                            <span className="absolute inset-0 flex items-center justify-center z-0">
                              {initials}
                            </span>

                            {/* LAYER 2: Profile Picture */}
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
                            <Link
                              href={`/profile/${targetId}`}
                              className="text-[18px] font-black text-brand-dark hover:text-brand-blue transition-colors tracking-tight line-clamp-1 block"
                            >
                              {displayName}
                            </Link>

                            {/* Operational Status Tag */}
                            <div className="flex items-center mt-1">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-semantic-success text-xs font-bold border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-semantic-success animate-pulse" />
                                Active Duty
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Middle Section: Location Data */}
                        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 mb-6 flex-1 relative z-10">
                          <div className="flex items-start text-sm text-gray-600 font-medium">
                            <MapPin className="w-4 h-4 mr-2 text-brand-blue mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="capitalize font-bold text-gray-800">{agent.city || "Unassigned City"}</p>
                              <p className="text-gray-500 capitalize">{agent.address || "Pending Zone Assignment"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Area */}
                        <div className="mt-auto relative z-10">
                          <Link href={`/messages?contactId=${targetId}&name=${encodeURIComponent(agent.name)}&role=${agent.role}`} className="block w-full">
                            <Button variant="secondary" className="w-full justify-center bg-white hover:bg-brand-blue hover:text-white border-gray-200 hover:border-brand-blue transition-all duration-300">
                              Dispatch Message
                            </Button>
                          </Link>
                        </div>

                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}