// client/src/app/my-deliveries/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Loader2 } from "lucide-react";
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

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'IN_TRANSIT': 
        return { text: 'processing', style: 'bg-[#b4a7d6] text-[#cc0000]', action: 'delivering to' };
      case 'COMPLETED': 
        return { text: 'complete', style: 'bg-[#a5a5a5] text-[#cc0000]', action: 'delivered to' };
      case 'FAILED': 
        return { text: 'failed', style: 'bg-[#a5a5a5] text-[#cc0000]', action: 'Failed to deliver to' };
      default: 
        return { text: status.toLowerCase(), style: 'bg-gray-300 text-gray-900', action: 'assigned to' };
    }
  };

  const visibleDeliveries = deliveries.slice(0, visibleCount);

  return (
    <ProtectedRoute allowedRoles={["DELIVERY_MAN", "LEAD_DEV"]}>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PrivateNavbar />
        
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-[22px] font-normal text-gray-900 mb-2 tracking-tight pl-2">my deliveries</h1>
          
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-900" /></div>
          ) : deliveries.length === 0 ? (
            <div className="border-[2px] border-[#1c2e4a] bg-[#f3f4f6] p-12 text-center font-medium text-gray-900">
              No delivery history found.
            </div>
          ) : (
            // Outer container replicating the wireframe's dark border and off-white background
            <div className="border-[2px] border-[#1c2e4a] bg-[#f3f4f6] p-8 pb-12 relative">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:pr-16">
                {visibleDeliveries.map((delivery) => {
                  // Format Date to DD.MM.YYYY
                  const dateStr = new Date(delivery.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.'); 
                  
                  // Format Items Array: "5 kg rice + 5 kg chicken..."
                  const itemsStr = delivery.items.map((i: any) => `${i.quantity} ${i.unit} ${i.food}`).join(' + ');
                  
                  const config = getStatusConfig(delivery.status);

                  return (
                    <div key={delivery.id} className="border-[1.5px] border-gray-900 p-6 flex flex-col relative bg-white min-h-[160px]">
                      
                      {/* Status Badge */}
                      <div className={`absolute top-0 right-0 px-4 py-1 border-b-[1.5px] border-l-[1.5px] border-gray-900 text-[18px] font-normal tracking-wide ${config.style}`}>
                        {config.text}
                      </div>
                      
                      <p className="text-[19px] font-normal text-gray-900 mb-4 mt-1">On {dateStr}</p>
                      
                      <p className="text-[19px] font-normal text-gray-900 leading-snug">
                        {config.action} {delivery.receiverOrg} from {delivery.donorOrg} <br/>
                        {itemsStr}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              {/* Load More Logic (+4 per click) */}
              {visibleCount < deliveries.length && (
                <div className="mt-12 flex justify-center">
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 4)}
                    className="px-6 py-2 bg-[#b4a7d6] border-[1.5px] border-gray-900 text-[#cc0000] font-normal text-[20px] hover:bg-[#9d8cc2] transition-colors"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}