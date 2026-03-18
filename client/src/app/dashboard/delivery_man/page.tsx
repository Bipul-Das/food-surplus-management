// client/src/app/dashboard/delivery_man/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

// ----------------------------------------------------------------------
// TYPE DEFINITIONS: Bridging the frontend store with backend schema
// ----------------------------------------------------------------------
interface ExtendedUser {
  id?: string; // Add this
  name?: string;
  organization?: string;
  role?: string;
  city?: string;
  phone?: string;
}

// Mock data for messages until we build the real-time chat
const MOCK_MESSAGES = [
  { id: 1, sender: "jack", text: "Hi man whats up", date: "3 March" },
  { id: 2, sender: "jimmy", text: "Hi man whats up", date: "3 March" }
];

export default function DeliveryDashboard() {
  const { user } = useUserStore();
  
  // Cast the global user to our extended local interface to satisfy strict TS
  const currentUser = user as ExtendedUser | null;

  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [delCount, setDelCount] = useState(2);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/deliveries/my-deliveries", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        if (data.success) {
          setDeliveries(data.data);
        }
      } catch (error) {
        toast.error("Failed to load logistics pipeline.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["DELIVERY_MAN", "LEAD_DEV"]}>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        {/* <PrivateNavbar /> */}
        
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
          
          <h1 className="text-2xl font-normal text-gray-900 mb-8 tracking-tight">Dashboard for delivery man</h1>
          
          {/* Navigation Tabs */}
          <div className="flex border-[2px] border-gray-900 w-fit mb-10 bg-white">
            <div className="px-8 py-3 border-r-[2px] border-gray-900 font-bold text-gray-900 bg-gray-100">
              My deliveries
            </div>
            <Link href="/requests" className="px-8 py-3 font-normal text-gray-900 hover:bg-gray-50 transition-colors">
              Current requests
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* LEFT COLUMN: Logistics Pipeline (Span 3) */}
            <div className="lg:col-span-3 space-y-8">
              
              {/* Profile Section */}
              <div className="flex justify-center mb-4">
                {/* CHANGED: Wrapped in Link and added hover styles */}
                {currentUser?.id ? (
                  <Link
                    href={`/profile/${currentUser.id}`}
                    className="px-8 py-2 bg-[#4a86e8] border-[2px] border-gray-900 rounded-full text-white font-medium text-lg tracking-wide shadow-sm hover:bg-[#3c6ec2] hover:-translate-y-0.5 transition-all block"
                  >
                    {currentUser?.name || "agent"}
                  </Link>
                ) : (
                  <div className="px-8 py-2 bg-[#4a86e8] border-[2px] border-gray-900 rounded-full text-white font-medium text-lg tracking-wide shadow-sm">
                    {currentUser?.name || "agent"}
                  </div>
                )}
              </div>

              <div className="border-[2px] border-gray-900 p-6 text-[15px] font-medium text-gray-900 bg-white shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
                <p>{currentUser?.organization || "Logistics Division"}</p>
                <p className="mt-2">Role : {currentUser?.role?.replace('_', ' ').toLowerCase() || "delivery man"}</p>
                <p className="mt-2">Zone : {currentUser?.city || "Unassigned"}</p>
                <p className="mt-2">Contact : {currentUser?.phone || "-"}</p>
              </div>

              {/* Stats Matrix */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#4a86e8] border-[2px] border-gray-900 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
                  <span className="text-white font-bold text-lg">Total delivered</span>
                  <span className="text-white font-normal mt-1">{deliveries.length} times</span>
                </div>
                <div className="bg-[#4a86e8] border-[2px] border-gray-900 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
                  <span className="text-white font-bold text-lg">This week delivered</span>
                  <span className="text-white font-normal mt-1">0 times</span> {/* Logic for this week can be added later */}
                </div>
              </div>

              {/* Assigned Deliveries Roster */}
              <div className="border-[2px] border-[#6aa84f] rounded-[32px] p-8 bg-white relative">
                <div className="absolute -top-3 left-8 bg-white px-2 font-normal text-gray-900">Assigned deliveries</div>
                
                {/* IN client/src/app/dashboard/delivery_man/page.tsx */}
                
                {isLoading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-900" /></div>
                ) : deliveries.filter(d => d.status === 'LOCKED' || d.status === 'IN_TRANSIT').length === 0 ? (
                  <div className="py-12 text-center text-gray-500 font-medium">No active logistics routed.</div>
                ) : (
                  <div className="space-y-4">
                    {/* ADDED FILTER LOGIC HERE */}
                    {deliveries
                      .filter(d => d.status === 'LOCKED' || d.status === 'IN_TRANSIT')
                      .slice(0, delCount)
                      .map(del => (
                      <div key={del.id} className="border-[1.5px] border-gray-900 p-4 text-[15px] font-medium text-gray-900 bg-white">
                        {del.details}<br/>
                        {del.payload}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Update Load More visibility logic to check filtered length */}
                {delCount < deliveries.filter(d => d.status === 'LOCKED' || d.status === 'IN_TRANSIT').length && (
                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={() => setDelCount(prev => prev + 2)} 
                      className="px-8 py-2 border-[1.5px] border-gray-900 font-normal text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Comms (Span 2) */}
            <div className="lg:col-span-2">
              <div className="border-[2px] border-gray-900 bg-white h-full min-h-[600px] flex flex-col">
                <div className="px-6 py-4 border-b-[2px] border-gray-900 font-normal text-gray-900">
                  Unread messages
                </div>
                <div className="p-4 flex-1 space-y-4">
                  {MOCK_MESSAGES.map(msg => (
                    <div key={msg.id} className="border-[2px] border-[#6aa84f] p-4 bg-white relative">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="px-4 py-2 bg-[#4a86e8] border-[1.5px] border-gray-900 rounded-full text-white text-sm font-medium">
                          {msg.sender}
                        </div>
                        <p className="text-[15px] text-gray-900 font-medium mt-2">{msg.text}</p>
                      </div>
                      <div className="text-right text-[14px] text-gray-800 font-normal mt-4">
                        {msg.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
