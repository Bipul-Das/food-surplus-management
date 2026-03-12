// client/src/app/delivery-personnel/page.tsx
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
        // Filter strictly for active delivery personnel
        const agents = result.data.filter((u: any) => u.role === "DELIVERY_MAN");
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
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "COORDINATOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PrivateNavbar />
        
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
          
          {/* Main Typography Header */}
          <h1 className="text-3xl font-normal text-gray-900 mb-8 tracking-tight">
            Delivery personnel
          </h1>
          
          {/* Sub-label Box */}
          <div className="inline-block px-4 py-2 border border-gray-900 font-normal text-gray-900 mb-6 bg-white text-sm">
            Active delivery guys
          </div>

          {/* Search Bar matching the wireframe */}
          <div className="flex items-center px-4 py-3 border border-gray-900 bg-white mb-6">
            <div className="relative mr-4 flex items-center justify-center">
               <Search className="w-6 h-6 text-gray-900 fill-[#4a86e8] stroke-gray-900 stroke-2" />
            </div>
            <input 
              type="text" 
              placeholder="Search by location/name" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-base text-gray-900 placeholder-gray-800 font-normal"
            />
          </div>

          {/* Table Header Row */}
          <div className="grid grid-cols-4 px-4 py-3 border border-gray-900 bg-white text-gray-900 text-sm font-normal mb-3">
            <div>Name</div>
            <div>city</div>
            <div className="col-span-2">location</div>
          </div>

          {/* Table Body Rows */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-12 border border-gray-900 flex justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="py-12 border border-gray-900 text-center text-gray-600 bg-white font-medium">
                No active delivery personnel found.
              </div>
            ) : (
              filteredAgents.map((agent) => (
                <div 
                  key={agent.id} 
                  className="grid grid-cols-4 px-4 py-3 border border-gray-900 bg-white items-center text-gray-900 text-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="font-normal">{agent.name}</div>
                  <div className="font-normal capitalize">{agent.city || "-"}</div>
                  <div className="font-normal capitalize">{agent.address || "Unassigned Zone"}</div>
                  
                  {/* Action Button */}
                  <div className="flex justify-end">
                    <Link 
                      href={`/messages?user=${agent.id}`} 
                      className="px-5 py-1.5 bg-[#a5a5a5] border border-gray-900 text-gray-900 font-normal hover:bg-[#8e8e8e] transition-colors"
                    >
                      message
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}