// client/src/app/profile/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { 
  User, MapPin, Building2, Globe, MessageSquare, 
  Award, ArrowDownCircle, Clock, Package, ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";

// ==========================================
// GAMIFICATION ENGINE
// ==========================================

const getBadgeTier = (count: number) => {
  if (count >= 1000) return { name: "Titanium", style: "bg-slate-800 text-slate-100 border-slate-600" };
  if (count >= 500) return { name: "Diamond", style: "bg-cyan-50 text-cyan-700 border-cyan-200 shadow-cyan-100" };
  if (count >= 200) return { name: "Platinum", style: "bg-gray-100 text-gray-700 border-gray-300" };
  if (count >= 100) return { name: "Gold", style: "bg-yellow-50 text-yellow-700 border-yellow-300 shadow-yellow-100" };
  if (count >= 50) return { name: "Silver", style: "bg-gray-50 text-gray-600 border-gray-300" };
  if (count >= 20) return { name: "Bronze", style: "bg-amber-50 text-amber-800 border-amber-300" };
  return { name: "Verified", style: "bg-blue-50 text-brand-blue border-blue-200" };
};

// ==========================================
// REUSABLE UI WIDGETS
// ==========================================

const HistoryWidget = ({ title, data }: { title: string, data: any[] }) => {
  const [visibleCount, setVisibleCount] = useState(3);

  const handleLoadMore = () => {
    // In production, this fires a paginated API call: fetch(`/api/history?skip=${visibleCount}&take=3`)
    setVisibleCount(prev => prev + 3);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-bold text-brand-dark uppercase tracking-wide text-sm">{title}</h3>
      </div>
      <div className="p-4">
        <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
          {data.slice(0, visibleCount).map((item, idx) => (
            <div key={idx} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-brand-blue/30 transition-colors">
              <p className="text-sm font-medium text-text-main">{item.description}</p>
              {item.date && <p className="text-xs text-text-secondary mt-1">{item.date}</p>}
            </div>
          ))}
          {data.length === 0 && <p className="text-sm text-text-secondary text-center py-4">No history available.</p>}
        </div>
        {visibleCount < data.length && (
          <button 
            onClick={handleLoadMore}
            className="w-full mt-4 py-2.5 bg-brand-blue hover:bg-brand-dark text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            Load 3 More
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // MOCK DATA LAYER: Intercepts the ID to render the correct view for testing
    const roleMap: Record<string, string> = { "donor": "DONOR", "receiver": "RECEIVER", "delivery": "DELIVERY_MAN" };
    const simulatedRole = roleMap[unwrappedParams.id.toLowerCase()] || "DONOR";
    
    setTimeout(() => {
      setProfile({
        id: unwrappedParams.id,
        name: simulatedRole === "DONOR" ? "KFC Dhaka Branch" : simulatedRole === "RECEIVER" ? "Al-Amanah Shelter" : "FastLogistics Agent",
        organization: simulatedRole === "DELIVERY_MAN" ? null : "Global Foods Inc.",
        location: "Mirpur 10",
        city: "Dhaka",
        website: "https://example.com",
        role: simulatedRole,
        transaction_count: 145, // Triggers Gold Badge
        avatar: null,
        
        // Mock Relations
        history: Array.from({ length: 8 }).map((_, i) => ({ 
          description: simulatedRole === "DONOR" ? `5kg rice + 5kg chicken to Receiver ${i+1}` : simulatedRole === "RECEIVER" ? `Received 10kg from Donor ${i+1}` : `Delivered payload to Org ${i+1}`,
          date: new Date(Date.now() - i * 86400000).toLocaleDateString() 
        })),
        activeInventory: [
          { food: "Rice", qty: "15kg", exp: "12/12/26", batch: "B04" },
          { food: "Chicken", qty: "8kg", exp: "10/12/26", batch: "B05" }
        ],
        activeRequests: [
          { items: "Rice 10kg, Pork 7kg", urgency: 9 },
          { items: "Flour 5kg, Soup 10kg", urgency: 7 }
        ],
        logbooks: [
          { date: "01.03.26", served: 500, meal: "Rice & Chicken" },
          { date: "02.03.26", served: 480, meal: "Rice & Beef" }
        ],
        deliveryStatus: "Active",
      });
      setIsLoading(false);
    }, 600);
  }, [unwrappedParams.id]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-bg-page flex flex-col font-sans">
        <PrivateNavbar />
        <div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div></div>
      </div>
    );
  }

  const badge = getBadgeTier(profile.transaction_count);

  return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "DELIVERY_MAN", "COORDINATOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-bg-page flex flex-col font-sans">
        <PrivateNavbar />
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Fixed Profile Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              
              <div className="flex justify-end mb-[-40px] relative z-10 pr-6">
                <div className={`w-20 h-20 rounded-full border-4 border-white shadow-lg flex flex-col items-center justify-center ${badge.style}`}>
                  <Award className="w-6 h-6 mb-0.5" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">{badge.name}</span>
                </div>
              </div>

              <FloatingCard className="pt-12 px-8 pb-8 border-t-4 border-brand-blue shadow-lg">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-white">
                  {profile.avatar ? <img src={profile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" /> : <User className="w-10 h-10 text-gray-300" />}
                </div>
                
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-extrabold text-brand-dark mb-1">{profile.name}</h1>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-brand-dark text-xs font-bold uppercase tracking-wider rounded-md border border-gray-200">
                    {profile.role.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-4 text-sm text-text-secondary border-t border-gray-100 pt-6">
                  {profile.organization && (
                    <div className="flex items-center gap-3"><Building2 className="w-5 h-5 text-gray-400" /> <span className="font-medium">{profile.organization}</span></div>
                  )}
                  <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-gray-400" /> <span className="font-medium">{profile.location}, {profile.city}</span></div>
                  {profile.website && (
                    <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-brand-blue" /> <a href={profile.website} target="_blank" rel="noreferrer" className="font-medium text-brand-blue hover:underline">{new URL(profile.website).hostname}</a></div>
                  )}
                </div>

                <Link href={`/messages?user=${profile.id}`} className="w-full mt-8 py-3 bg-brand-dark hover:bg-brand-blue text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md">
                  <MessageSquare className="w-4 h-4" /> Secure Message
                </Link>
              </FloatingCard>
            </div>

            {/* RIGHT COLUMN: Dynamic Role Widgets */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* === DONOR WIDGETS === */}
              {profile.role === "DONOR" && (
                <>
                  <HistoryWidget title="Donation History" data={profile.history} />
                  
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                      <Package className="w-5 h-5 text-brand-blue" />
                      <h3 className="font-bold text-brand-dark uppercase tracking-wide text-sm">Current Surplus Inventory</h3>
                    </div>
                    <div className="p-4">
                      <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border border-gray-200 rounded-t-lg">
                              <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase">Food Category</th>
                              <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase">Quantity</th>
                              <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase">Exp Date</th>
                              <th className="px-4 py-3 text-xs font-bold text-text-secondary uppercase">Batch</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {profile.activeInventory.map((item: any, idx: number) => (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors border-x border-b border-gray-200">
                                <td className="px-4 py-4 text-sm font-bold text-brand-dark">{item.food}</td>
                                <td className="px-4 py-4 text-sm text-text-main">{item.qty}</td>
                                <td className="px-4 py-4 text-sm text-text-secondary">{item.exp}</td>
                                <td className="px-4 py-4 text-sm font-mono text-brand-light font-bold">{item.batch}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* === RECEIVER WIDGETS === */}
              {profile.role === "RECEIVER" && (
                <>
                  <HistoryWidget title="Receiving History" data={profile.history} />
                  
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-urgency-high" />
                      <h3 className="font-bold text-brand-dark uppercase tracking-wide text-sm">Active Requests</h3>
                    </div>
                    <div className="p-4">
                      <div className="max-h-72 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.activeRequests.map((req: any, idx: number) => (
                          <div key={idx} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <p className="text-sm font-bold text-brand-dark leading-relaxed mb-4">{req.items}</p>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-urgency-high border border-red-100">
                              Urgency Level: {req.urgency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-brand-light" />
                      <h3 className="font-bold text-brand-dark uppercase tracking-wide text-sm">Verified Logbooks</h3>
                    </div>
                    <div className="p-4">
                      <div className="max-h-72 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.logbooks.map((log: any, idx: number) => (
                          <div key={idx} className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                            <p className="text-xs text-text-secondary font-bold mb-2">{log.date}</p>
                            <p className="text-sm text-brand-dark font-medium mb-1">Total {log.served} people served</p>
                            <p className="text-sm text-text-secondary">Meal: <span className="font-bold text-brand-light">{log.meal}</span></p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* === DELIVERY WIDGETS === */}
              {profile.role === "DELIVERY_MAN" && (
                <>
                  <HistoryWidget title="Delivery History" data={profile.history} />
                  
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-bold text-brand-dark uppercase tracking-wide text-sm">Operational Status</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-3 h-3 bg-urgency-low rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-green-800">Current Status: ACTIVE</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <MapPin className="w-5 h-5 text-brand-blue" />
                        <span className="text-sm font-bold text-brand-dark">Zone: {profile.city}, Location: {profile.location}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <Link href={`/messages?user=${profile.id}`} className="inline-flex py-2.5 px-6 bg-gray-100 hover:bg-brand-blue hover:text-white text-text-secondary font-bold text-sm rounded-lg transition-colors items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4" /> Message Logistics Agent
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}