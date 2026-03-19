// client/src/app/profile/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const profileId = unwrappedParams.id;
  const { user: currentUser } = useUserStore();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLockedOut, setIsLockedOut] = useState(false);

  const [visibleHistory, setVisibleHistory] = useState(3);
  const [visibleRequests, setVisibleRequests] = useState(3);
  const [visibleLogbooks, setVisibleLogbooks] = useState(2);
  const [visibleDeliveries, setVisibleDeliveries] = useState(3);
  const [visibleDonations, setVisibleDonations] = useState(3);
  const [visibleInventory, setVisibleInventory] = useState(3);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${profileId}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();

        if (data.isLockedOut) {
          setIsLockedOut(true);
          setIsLoading(false);
          return;
        }

        if (data.success) {
          setProfile(data.data);
        } else {
          toast.error(data.message || "Failed to load profile.");
        }
      } catch (error) {
        toast.error("Network error while fetching profile.");
      } finally {
        setIsLoading(false);
      }
    };
    if (profileId) fetchProfile();
  }, [profileId]);

  if (isLoading) return <div className="min-h-screen bg-white flex flex-col font-sans"><PrivateNavbar /><div className="flex-1 flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-gray-900" /></div></div>;

  if (isLockedOut) return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "COORDINATOR", "LEAD_DEV", "DELIVERY_MAN"]}>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PrivateNavbar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12">
          <div className="border-[2px] border-[#6aa84f] p-16 text-[24px] font-normal text-gray-900 bg-white">
            you don’t have access to this page
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );

  if (!profile) return <div className="min-h-screen bg-white flex flex-col font-sans"><PrivateNavbar /><div className="flex-1 flex justify-center items-center text-[#cc0000] font-bold">Profile not found.</div></div>;

  const { user, receivingHistory, activeRequests, logbooks, deliveryHistory, donationHistory, activeInventory } = profile;
  const initials = (user.organization || user.name).substring(0, 3).toLowerCase();
  const displayRole = user.role.replace('_', ' ').toLowerCase();

  return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "COORDINATOR", "LEAD_DEV", "DELIVERY_MAN"]}>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">

          <div className="flex items-center gap-4 mb-6 relative">
            <span className="text-[20px] font-normal text-gray-900">Public profile</span>
            <div className="absolute -top-4 left-32 bg-[#4a86e8] border-[1.5px] border-gray-900 rounded-[50%] w-[60px] h-[60px] flex flex-col items-center justify-center text-white text-[12px] font-medium leading-tight shadow-sm">
              <span>Badge</span>
              <span>{displayRole === 'delivery man' ? 'driver' : displayRole}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <div className="lg:col-span-4 border-[1.5px] border-gray-900 p-6 flex flex-col min-h-[600px] relative bg-white">
              <h2 className="text-[32px] font-normal text-gray-900 mb-6 tracking-tight">Basic info</h2>

              {user.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                  alt={`${user.organization || user.name} profile picture`}
                  className="w-16 h-16 border-[1.5px] border-gray-900 rounded-[50%] mb-8 shadow-sm object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-[#4a86e8] border-[1.5px] border-gray-900 rounded-[50%] flex items-center justify-center text-white text-[20px] font-normal mb-8 shadow-sm">
                  {initials}
                </div>
              )}

              <ul className="space-y-4 mb-12 flex-1">
                <li className="flex items-start gap-2"><span className="text-xl leading-none">&bull;</span> <span className="text-[17px] capitalize">{user.organization || user.name}</span></li>
                <li className="flex items-start gap-2"><span className="text-xl leading-none">&bull;</span> <span className="text-[17px] capitalize">{user.address || 'Location unknown'}</span></li>
                <li className="flex items-start gap-2"><span className="text-xl leading-none">&bull;</span> <span className="text-[17px] capitalize">{user.city || 'City unknown'}</span></li>
                <li className="flex items-start gap-2"><span className="text-xl leading-none">&bull;</span> <span className="text-[17px]">{user.phone}</span></li>
                <li className="flex items-start gap-2"><span className="text-xl leading-none">&bull;</span> <span className="text-[17px]">{user.email}</span></li>
              </ul>

              <div className="mt-auto">
                <h3 className="text-[28px] font-normal text-gray-900 mb-4 tracking-tight">Website</h3>

                {user.website ? (
                  <a
                    href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4a86e8] hover:underline mb-6 block text-[17px]"
                  >
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                ) : (
                  <p className="text-gray-500 mb-6 text-[17px]">No website provided</p>
                )}

                {currentUser?.id !== user.id && (
                  <Link
                    href={`/messages?contactId=${user.id}&name=${encodeURIComponent(user.organization || user.name)}&role=${user.role}`}
                    className="px-6 py-2.5 bg-[#a5a5a5] border-[1.5px] border-gray-900 text-gray-900 font-bold uppercase tracking-widest text-[14px] hover:bg-[#8e8e8e] transition-colors inline-block text-center"
                  >
                    message
                  </Link>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">

              {user.role === 'RECEIVER' && (
                <>
                  <div className="border-[1.5px] border-gray-900 bg-white flex flex-col">
                    <div className="px-4 py-2 border-b-[1.5px] border-gray-900">
                      <h3 className="text-[18px] font-normal text-gray-900">Receiving history</h3>
                    </div>
                    <div className="p-4 h-[240px] overflow-y-auto bg-white custom-scrollbar">
                      {receivingHistory && receivingHistory.length > 0 ? (
                        <div className="space-y-3">
                          {receivingHistory.slice(0, visibleHistory).map((hist: any) => {
                            const itemsStr = hist.items.map((i: any) => `${i.quantity} ${i.unit} ${i.food}`).join(' + ');
                            return (
                              <div key={hist.id} className="border-[1.5px] border-gray-900 p-4 bg-white text-[17px]">
                                {itemsStr} from {hist.donorName}
                              </div>
                            );
                          })}
                          {visibleHistory < receivingHistory.length && (
                            <div className="flex justify-center pt-2 pb-4">
                              <button onClick={() => setVisibleHistory(p => p + 3)} className="px-8 py-2 bg-[#4a86e8] border-[1.5px] border-gray-900 text-white font-normal text-[17px] hover:bg-[#3c6ec2]">
                                Load 3 more
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 p-4">No history available.</p>
                      )}
                    </div>
                  </div>

                  <div className="border-[1.5px] border-gray-900 bg-white flex flex-col">
                    <div className="px-4 py-2 border-b-[1.5px] border-gray-900">
                      <h3 className="text-[18px] font-normal text-gray-900">active requests</h3>
                    </div>
                    <div className="p-4 h-[240px] overflow-y-auto bg-white custom-scrollbar">
                      {activeRequests && activeRequests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {activeRequests.slice(0, visibleRequests).map((req: any) => (
                            <div key={req.id} className="border-[1.5px] border-gray-900 p-4 bg-white flex flex-col justify-between min-h-[180px]">
                              <div className="space-y-1 mb-4">
                                {req.items.map((item: any, idx: number) => (
                                  <p key={idx} className="text-[17px] font-normal text-gray-900 capitalize">
                                    {item.food} {item.deficit}{item.unit}
                                  </p>
                                ))}
                              </div>
                              <p className="text-[18px] font-normal text-gray-900 mt-auto">
                                Urgency {req.urgency}
                              </p>
                            </div>
                          ))}
                          {visibleRequests < activeRequests.length && (
                            <button onClick={() => setVisibleRequests(p => p + 3)} className="border-[1.5px] border-gray-900 bg-[#e6e6e6] hover:bg-[#cccccc] flex items-center justify-center text-[18px] min-h-[180px] transition-colors">
                              Load more
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 p-4">No active requests.</p>
                      )}
                    </div>
                  </div>

                  <div className="border-[1.5px] border-gray-900 bg-white flex flex-col">
                    <div className="px-4 py-2 border-b-[1.5px] border-gray-900">
                      <h3 className="text-[18px] font-normal text-gray-900">Logbooks</h3>
                    </div>
                    <div className="p-4 h-[240px] overflow-y-auto bg-white custom-scrollbar">
                      {logbooks && logbooks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {logbooks.slice(0, visibleLogbooks).map((log: any) => {
                            const logDate = new Date(log.date).toLocaleDateString('en-GB').replace(/\//g, '.');
                            const totalServed = (log.lunchServed || 0) + (log.dinnerServed || 0);
                            const meals = [log.lunchMeal, log.dinnerMeal].filter(Boolean).join(', ');

                            return (
                              <div key={log.id} className="border-[1.5px] border-gray-900 p-4 bg-white min-h-[180px]">
                                <p className="text-[17px] font-normal text-gray-900 mb-2">{logDate}</p>
                                <p className="text-[17px] font-normal text-gray-900 mb-1">Total {totalServed} people served</p>
                                <p className="text-[17px] font-normal text-gray-900">Meal: {meals || 'Not specified'}</p>
                              </div>
                            );
                          })}
                          {visibleLogbooks < logbooks.length && (
                            <button onClick={() => setVisibleLogbooks(p => p + 2)} className="border-[1.5px] border-gray-900 bg-[#e6e6e6] hover:bg-[#cccccc] flex items-center justify-center text-[18px] min-h-[180px] transition-colors">
                              Load more
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 p-4">No logbooks recorded.</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {user.role === 'DELIVERY_MAN' && (
                <div className="flex flex-col gap-6 h-full">
                  <div className="border-[1.5px] border-gray-900 bg-white flex flex-col flex-1 min-h-[350px]">
                    <div className="px-4 py-2 border-b-[1.5px] border-gray-900">
                      <h3 className="text-[18px] font-normal text-gray-900">delivery history</h3>
                    </div>
                    <div className="p-4 overflow-y-auto bg-white custom-scrollbar h-[300px]">
                      {deliveryHistory && deliveryHistory.length > 0 ? (
                        <div className="space-y-3">
                          {deliveryHistory.slice(0, visibleDeliveries).map((hist: any) => {
                            const itemsStr = hist.items.map((i: any) => `${i.quantity} ${i.unit} ${i.food}`).join(' + ');
                            return (
                              <div key={hist.id} className="border-[1.5px] border-gray-900 p-4 bg-white text-[17px]">
                                delivered to {hist.receiverName}<br />
                                {itemsStr}
                              </div>
                            );
                          })}
                          {visibleDeliveries < deliveryHistory.length && (
                            <div className="flex justify-center pt-2 pb-4">
                              <button onClick={() => setVisibleDeliveries(p => p + 3)} className="px-8 py-2 bg-[#4a86e8] border-[1.5px] border-gray-900 text-white font-normal text-[17px] hover:bg-[#3c6ec2]">
                                Load 3 more
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 p-4">No delivery history available.</p>
                      )}
                    </div>
                  </div>
                  <div className="border-[1.5px] border-gray-900 bg-white p-8 flex flex-col justify-center gap-6 min-h-[250px]">
                    {/* NEW: Dynamic Operational Status Block */}
                    <div className={`border-[1.5px] px-6 py-4 text-[18px] font-bold uppercase tracking-widest w-full max-w-md ${user.isActive !== false ? 'border-[#6aa84f] text-[#6aa84f]' : 'border-[#cc0000] text-[#cc0000] bg-gray-50'}`}>
                      Current status: {user.isActive !== false ? 'Active' : 'Off-Duty'}
                    </div>
                    <div className="border-[1.5px] border-[#6aa84f] px-6 py-4 text-[18px] font-normal text-gray-900 bg-white w-full max-w-md capitalize">
                      City: {user.city}, location: {user.address}
                    </div>
                  </div>
                </div>
              )}

              {user.role === 'DONOR' && (
                <>
                  <div className="border-[1.5px] border-gray-900 bg-white flex flex-col">
                    <div className="px-4 py-2 border-b-[1.5px] border-gray-900">
                      <h3 className="text-[18px] font-normal text-gray-900">Donation history</h3>
                    </div>
                    <div className="p-4 h-[240px] overflow-y-auto bg-white custom-scrollbar">
                      {donationHistory && donationHistory.length > 0 ? (
                        <div className="space-y-3">
                          {donationHistory.slice(0, visibleDonations).map((hist: any) => {
                            const itemsStr = hist.items.map((i: any) => `${i.quantity} ${i.unit} ${i.food}`).join(' + ');
                            return (
                              <div key={hist.id} className="border-[1.5px] border-gray-900 p-4 bg-white text-[17px]">
                                {itemsStr} to {hist.receiverName}
                              </div>
                            );
                          })}
                          {visibleDonations < donationHistory.length && (
                            <div className="flex justify-center pt-2 pb-4">
                              <button onClick={() => setVisibleDonations(p => p + 3)} className="px-8 py-2 bg-[#4a86e8] border-[1.5px] border-gray-900 text-white font-normal text-[17px] hover:bg-[#3c6ec2]">
                                Load 3 more
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 p-4">No donation history available.</p>
                      )}
                    </div>
                  </div>
                  <div className="border-[1.5px] border-gray-900 bg-white flex flex-col">
                    <div className="px-4 py-2 border-b-[1.5px] border-gray-900">
                      <h3 className="text-[18px] font-normal text-gray-900">Current surplus inventory</h3>
                    </div>
                    <div className="p-4 h-[350px] overflow-y-auto bg-white custom-scrollbar">
                      {activeInventory && activeInventory.length > 0 ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-4 gap-4 px-4 py-3 border-[1.5px] border-[#6aa84f] text-[17px] font-normal text-gray-900 mb-4">
                            <div>food</div>
                            <div className="text-center">quantity</div>
                            <div className="text-center">exp date</div>
                            <div className="text-center">batch</div>
                          </div>

                          {activeInventory.slice(0, visibleInventory).map((inv: any) => {
                            const expStr = new Date(inv.expDate).toLocaleDateString('en-GB').replace(/\//g, '.');
                            return (
                              <div key={inv.id} className="grid grid-cols-4 gap-4 px-4 py-4 border-[1.5px] border-gray-900 text-[17px] font-normal text-gray-900">
                                <div className="capitalize">{inv.food}</div>
                                <div className="text-center">{inv.quantity}{inv.unit}</div>
                                <div className="text-center">{expStr}</div>
                                <div className="text-center">{inv.batch}</div>
                              </div>
                            );
                          })}
                          {visibleInventory < activeInventory.length && (
                            <div className="flex justify-center pt-2">
                              <button onClick={() => setVisibleInventory(p => p + 3)} className="w-full py-4 border-[1.5px] border-gray-900 bg-[#e6e6e6] hover:bg-[#cccccc] flex items-center justify-center text-[18px] transition-colors">
                                Load more
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 p-4">No current surplus inventory.</p>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </main>

        <style dangerouslySetInnerHTML={{
          __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 16px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #ffffff;
            border-left: 1.5px solid #111827;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #4a86e8;
            border: 1.5px solid #111827;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #3c6ec2;
          }
        `}} />
      </div>
    </ProtectedRoute>
  );
}