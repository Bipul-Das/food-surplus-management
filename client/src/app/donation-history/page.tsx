// client/src/app/donation-history/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Loader2 } from "lucide-react";
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

  const getStatusDisplay = (status: string) => {
    if (status === 'IN_TRANSIT') return { text: 'processing', style: 'bg-[#b4a7d6] text-[#cc0000]' };
    if (status === 'COMPLETED') return { text: 'complete', style: 'bg-[#a5a5a5] text-[#cc0000]' };
    if (status === 'FAILED') return { text: 'failed', style: 'bg-[#a5a5a5] text-[#cc0000]' };
    return { text: status.toLowerCase(), style: 'bg-gray-300 text-gray-900' };
  };

  const visibleDonations = donations.slice(0, visibleCount);

  return (
    <ProtectedRoute allowedRoles={["DONOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PrivateNavbar />
        
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-[22px] font-normal text-gray-900 mb-8 tracking-tight">My donations</h1>
          
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-900" /></div>
          ) : donations.length === 0 ? (
            <div className="border-[2px] border-[#6aa84f] p-12 text-center font-medium text-gray-900 bg-white">
              No donation history found.
            </div>
          ) : (
            <div className="border-[2px] border-[#6aa84f] p-8 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:pr-12">
                {visibleDonations.map((donation) => {
                  // Format Date to DD.MM.YYYY
                  const dateStr = new Date(donation.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.'); 
                  
                  // Format Items Array: "5 kg rice + 5 kg chicken..."
                  const itemsStr = donation.items.map((i: any) => `${i.quantity} ${i.unit} ${i.food}`).join(' + ');
                  
                  const { text: statusText, style: statusStyle } = getStatusDisplay(donation.status);
                  const actionWord = donation.status === 'COMPLETED' ? 'delivered to' : 'delivering to';

                  return (
                    <div key={donation.id} className="border-[1.5px] border-gray-900 p-6 flex flex-col relative bg-white min-h-[160px]">
                      
                      {/* Status Badge */}
                      <div className={`absolute top-0 right-0 px-4 py-1.5 border-b-[1.5px] border-l-[1.5px] border-gray-900 text-[18px] font-normal tracking-wide ${statusStyle}`}>
                        {statusText}
                      </div>
                      
                      <p className="text-[19px] font-normal text-gray-900 mb-1 mt-1">On {dateStr}</p>
                      <p className="text-[19px] font-normal text-gray-900 mb-1">{actionWord} {donation.receiverOrg}</p>
                      <p className="text-[19px] font-normal text-gray-900 mb-1">
                        {itemsStr} via
                      </p>
                      <p className="text-[19px] font-normal text-gray-900">
                        Delivery-man {donation.driverName}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              {/* Load More Logic (+4 per click) */}
              {visibleCount < donations.length && (
                <div className="mt-14 flex justify-center">
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