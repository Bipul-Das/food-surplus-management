// client/src/app/deliveries/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Search, Loader2 } from "lucide-react";
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
        // FIX: Strictly filter out Delivery Men who have toggled isActive to false
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
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">

          <h1 className="text-[32px] font-normal text-gray-900 mb-8 tracking-tight uppercase">
            Delivery personnel
          </h1>

          <div className="flex border-[2px] border-gray-900 w-fit mb-10 bg-white shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
            <div className="px-8 py-2.5 font-bold text-white bg-[#4a86e8] border-r-[2px] border-gray-900 uppercase tracking-widest text-[14px]">
              Delivery Directory
            </div>
            <Link href="/requests" className="px-8 py-2.5 font-normal text-gray-900 hover:bg-gray-50 transition-colors uppercase tracking-widest text-[14px]">
              Current requests
            </Link>
          </div>

          <div className="flex items-center px-4 py-3 border-[2px] border-gray-900 bg-white mb-6 shadow-sm">
            <div className="relative mr-4 flex items-center justify-center">
              <Search className="w-6 h-6 text-[#4a86e8] stroke-2" />
            </div>
            <input
              type="text"
              placeholder="Search by location/name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-[16px] text-gray-900 placeholder-gray-500 font-normal"
            />
          </div>

          <div className="grid grid-cols-4 px-5 py-3 border-[2px] border-gray-900 bg-white text-gray-900 text-[15px] font-bold uppercase tracking-widest mb-3">
            <div>Name</div>
            <div>City</div>
            <div className="col-span-2">Location</div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-12 border-[2px] border-gray-900 flex justify-center bg-white shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="py-12 border-[2px] border-gray-900 text-center text-gray-600 bg-gray-50 font-medium shadow-sm">
                No active delivery personnel found.
              </div>
            ) : (
              filteredAgents.map((agent) => {
                const targetId = agent.userId || agent.user?.id || agent.id;

                return (
                  <div
                    key={agent.id || targetId}
                    className="grid grid-cols-4 px-5 py-4 border-[2px] border-gray-900 bg-white items-center text-gray-900 text-[16px] hover:-translate-y-0.5 transition-transform shadow-sm"
                  >
                    <div>
                      <Link
                        href={`/profile/${targetId}`}
                        className="font-bold text-gray-900 hover:text-[#4a86e8] hover:underline transition-colors w-fit block"
                      >
                        {agent.name}
                      </Link>
                    </div>

                    <div className="font-normal capitalize text-gray-700">{agent.city || "-"}</div>
                    <div className="font-normal capitalize text-gray-700">{agent.address || "Unassigned Zone"}</div>

                    <div className="flex justify-end">
                      <Link
                        href={`/messages?contactId=${targetId}&name=${encodeURIComponent(agent.name)}&role=${agent.role}`}
                        className="px-6 py-2 bg-[#a5a5a5] border-[1.5px] border-gray-900 text-gray-900 font-bold uppercase tracking-widest text-[13px] hover:bg-[#8e8e8e] transition-colors"
                      >
                        Message
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}