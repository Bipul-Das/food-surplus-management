// client/src/app/profile/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Loader2, MapPin, Phone, Mail, Link as LinkIcon, MessageSquare, ShieldCheck, Star, Activity, Package, Clock, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

// ==========================================
// GAMIFICATION: BADGE ENGINE
// ==========================================
const getBadgeInfo = (points: number = 0) => {
  if (points >= 1000000) return { title: 'Diamond', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-500' };
  if (points >= 250000) return { title: 'Platinum', bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700', icon: 'text-slate-500' };
  if (points >= 100000) return { title: 'Gold', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500' };
  if (points >= 25000) return { title: 'Silver', bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', icon: 'text-gray-500' };
  if (points >= 5000) return { title: 'Bronze', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: 'text-orange-600' };
  return null; // Not enough points for a badge yet
};

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

  if (isLoading) return <div className="min-h-screen bg-surface-background flex flex-col font-sans"><PrivateNavbar /><div className="flex-1 flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-brand-blue" /></div></div>;

  if (isLockedOut) return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "COORDINATOR", "LEAD_DEV", "DELIVERY_MAN"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-6">
            <Shield className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-black text-brand-dark mb-2">Access Restricted</h2>
          <p className="text-gray-500 font-medium">Your current clearance level does not permit viewing this profile.</p>
        </main>
      </div>
    </ProtectedRoute>
  );

  if (!profile) return <div className="min-h-screen bg-surface-background flex flex-col font-sans"><PrivateNavbar /><div className="flex-1 flex justify-center items-center text-semantic-danger font-bold">Profile not found or removed from network.</div></div>;

  const { user, receivingHistory, activeRequests, logbooks, deliveryHistory, donationHistory, activeInventory } = profile;
  const initials = (user.organization || user.name).substring(0, 3).toUpperCase();
  const displayRole = user.role.replace('_', ' ').toLowerCase();

  // Calculate badge dynamically based on user points (default to 0 if undefined)
  const userPoints = user.points || 0;
  const earnedBadge = getBadgeInfo(userPoints);

  return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "COORDINATOR", "LEAD_DEV", "DELIVERY_MAN"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">

          {/* SAAS HEADER: Replaced the absolute-positioned brutalist circles */}
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-black text-brand-dark tracking-tight">Network Profile</h1>
              <p className="text-[15px] font-medium text-gray-500 mt-1 capitalize">Identity record for {user.organization || user.name}</p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="info" size="lg" className="capitalize shadow-sm">
                {displayRole === 'delivery man' ? 'Logistics Driver' : displayRole}
              </Badge>

              {earnedBadge && (
                <div className={`px-4 py-1.5 rounded-full border ${earnedBadge.border} ${earnedBadge.bg} flex items-center gap-2 shadow-sm`}>
                  <Star className={`w-4 h-4 ${earnedBadge.icon} fill-current`} />
                  <span className={`text-xs font-black uppercase tracking-widest ${earnedBadge.text}`}>{earnedBadge.title} Class</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">

            {/* LEFT COLUMN: Identity Card */}
            <div className="lg:col-span-4">
              <Card className="relative overflow-hidden shadow-cinematic lg:sticky lg:top-24">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-brand-blue/10 to-brand-green/10 -z-10" />
                <CardContent className="p-8 pt-12 flex flex-col items-center text-center">

                  {/* Layered Avatar Component */}
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white ring-4 ring-brand-blue/10 shadow-lg flex-shrink-0 relative bg-brand-blue/5 flex items-center justify-center text-brand-blue text-3xl font-black transition-transform hover:scale-105 duration-300 mb-6">
                    <span className="absolute inset-0 flex items-center justify-center z-0">
                      {initials}
                    </span>

                    {user.avatar && (
                      <img
                        src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`}
                        alt="Profile"
                        className="absolute inset-0 w-full h-full object-cover z-10 bg-white"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    )}
                  </div>

                  <h2 className="text-2xl font-black text-brand-dark tracking-tight mb-1 capitalize line-clamp-2">
                    {user.organization || user.name}
                  </h2>

                  <div className="flex items-center justify-center gap-1.5 text-semantic-success font-bold bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 mt-3 mb-8">
                    <Activity className="w-4 h-4" />
                    <span className="text-[13px] uppercase tracking-widest">{userPoints.toLocaleString()} Impact Points</span>
                  </div>

                  <div className="w-full space-y-4 text-left border-t border-gray-100 pt-6">
                    {(user.city || user.address) && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-brand-blue mt-0.5"><MapPin className="w-4 h-4" /></div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                          <p className="text-[15px] font-medium text-brand-dark capitalize leading-tight">{[user.address, user.city].filter(Boolean).join(', ')}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg text-brand-blue mt-0.5"><Phone className="w-4 h-4" /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Phone</p>
                        <p className="text-[15px] font-medium text-brand-dark leading-tight">{user.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg text-brand-blue mt-0.5"><Mail className="w-4 h-4" /></div>
                      <div className="overflow-hidden w-full">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
                        <p className="text-[15px] font-medium text-brand-dark truncate">{user.email}</p>
                      </div>
                    </div>
                    {user.website && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-brand-blue mt-0.5"><LinkIcon className="w-4 h-4" /></div>
                        <div className="overflow-hidden w-full">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Website</p>
                          <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" className="text-[15px] font-bold text-brand-blue hover:underline truncate block">
                            {user.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {currentUser?.id !== user.id && (
                    <div className="w-full mt-8 pt-6 border-t border-gray-100">
                      <Link href={`/messages?contactId=${user.id}&name=${encodeURIComponent(user.organization || user.name)}&role=${user.role}`} className="block w-full">
                        <Button variant="secondary" className="w-full border-brand-blue/20 hover:border-brand-blue hover:bg-brand-blue hover:text-white transition-all duration-300">
                          <MessageSquare className="w-4 h-4 mr-2" /> Open Secure Channel
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: Operational History */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {user.role === 'RECEIVER' && (
                <>
                  <Card>
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-[14px] uppercase tracking-widest text-brand-dark">Receiving History</h3>
                    </div>
                    <CardContent className="p-6">
                      {receivingHistory && receivingHistory.length > 0 ? (
                        <div className="space-y-4">
                          {receivingHistory.slice(0, visibleHistory).map((hist: any) => {
                            const itemsStr = hist.items.map((i: any) => `${i.quantity} ${i.unit} ${i.food}`).join(' + ');
                            return (
                              <div key={hist.id} className="border border-gray-100 rounded-xl p-5 bg-white cinematic-hover flex flex-col gap-2">
                                <div className="font-medium text-brand-dark text-[15px]">Received from <span className="font-bold capitalize">{hist.donorName}</span></div>
                                <div className="p-3 bg-brand-blue/5 rounded-lg text-brand-blue font-bold text-sm border border-brand-blue/10 capitalize">
                                  {itemsStr}
                                </div>
                              </div>
                            );
                          })}
                          {visibleHistory < receivingHistory.length && (
                            <div className="flex justify-center pt-4">
                              <Button variant="secondary" size="sm" onClick={() => setVisibleHistory(p => p + 3)}>Load More Records</Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center text-[15px] font-medium text-gray-500">No history available.</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-[14px] uppercase tracking-widest text-brand-dark">Active Requests</h3>
                    </div>
                    <CardContent className="p-6">
                      {activeRequests && activeRequests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeRequests.slice(0, visibleRequests).map((req: any) => (
                            <div key={req.id} className="border border-gray-100 rounded-xl p-5 bg-white cinematic-hover flex flex-col justify-between min-h-[160px]">
                              <div className="space-y-2 mb-4">
                                {req.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center text-[14px]">
                                    <span className="font-medium text-gray-600 capitalize">{item.food}</span>
                                    <span className="font-bold text-brand-dark">{item.deficit}{item.unit}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Urgency</span>
                                <Badge variant={req.urgency === "3" ? "danger" : req.urgency === "2" ? "warning" : "success"} size="sm">Level {req.urgency}</Badge>
                              </div>
                            </div>
                          ))}
                          {visibleRequests < activeRequests.length && (
                            <Button variant="secondary" className="min-h-[160px] flex flex-col items-center justify-center gap-2" onClick={() => setVisibleRequests(p => p + 2)}>
                              <span className="font-bold uppercase tracking-widest text-xs">Load More</span>
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center text-[15px] font-medium text-gray-500">No active requests.</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-[14px] uppercase tracking-widest text-brand-dark">Logbooks</h3>
                    </div>
                    <CardContent className="p-6">
                      {logbooks && logbooks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {logbooks.slice(0, visibleLogbooks).map((log: any) => {
                            const logDate = new Date(log.date).toLocaleDateString('en-GB').replace(/\//g, '.');
                            const totalServed = (log.lunchServed || 0) + (log.dinnerServed || 0);
                            const meals = [log.lunchMeal, log.dinnerMeal].filter(Boolean).join(', ');

                            return (
                              <div key={log.id} className="border border-gray-100 rounded-xl p-5 bg-white cinematic-hover min-h-[160px] flex flex-col">
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                                  <span className="font-bold text-[13px] uppercase tracking-widest text-gray-400">Date</span>
                                  <span className="font-bold text-brand-dark">{logDate}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[14px] font-medium text-gray-500">People Served</span>
                                  <span className="text-[15px] font-black text-brand-green">{totalServed}</span>
                                </div>
                                <div className="mt-auto">
                                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Meals Delivered</span>
                                  <span className="text-[14px] font-medium text-gray-800 line-clamp-2">{meals || 'Not specified'}</span>
                                </div>
                              </div>
                            );
                          })}
                          {visibleLogbooks < logbooks.length && (
                            <Button variant="secondary" className="min-h-[160px] flex flex-col items-center justify-center gap-2" onClick={() => setVisibleLogbooks(p => p + 2)}>
                              <span className="font-bold uppercase tracking-widest text-xs">Load More</span>
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center text-[15px] font-medium text-gray-500">No logbooks recorded.</div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {user.role === 'DELIVERY_MAN' && (
                <div className="flex flex-col gap-6 h-full">
                  <Card className="flex-1">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-[14px] uppercase tracking-widest text-brand-dark">Delivery History</h3>
                    </div>
                    <CardContent className="p-6">
                      {deliveryHistory && deliveryHistory.length > 0 ? (
                        <div className="space-y-4">
                          {deliveryHistory.slice(0, visibleDeliveries).map((hist: any) => {
                            const itemsStr = hist.items.map((i: any) => `${i.quantity} ${i.unit} ${i.food}`).join(' + ');
                            return (
                              <div key={hist.id} className="border border-gray-100 rounded-xl p-5 bg-white cinematic-hover flex flex-col gap-2">
                                <div className="font-medium text-brand-dark text-[15px]">Delivered to <span className="font-bold capitalize">{hist.receiverName}</span></div>
                                <div className="p-3 bg-brand-blue/5 rounded-lg text-brand-blue font-bold text-sm border border-brand-blue/10 capitalize">
                                  {itemsStr}
                                </div>
                              </div>
                            );
                          })}
                          {visibleDeliveries < deliveryHistory.length && (
                            <div className="flex justify-center pt-4">
                              <Button variant="secondary" size="sm" onClick={() => setVisibleDeliveries(p => p + 3)}>Load More Records</Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center text-[15px] font-medium text-gray-500">No delivery history available.</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-8 flex flex-col justify-center gap-6">
                      <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className="font-bold text-[14px] uppercase tracking-widest text-gray-500">Operational Status</span>
                        </div>
                        <Badge variant={user.isActive !== false ? "success" : "danger"} size="lg">
                          {user.isActive !== false ? 'Active Duty' : 'Off-Duty'}
                        </Badge>
                      </div>

                      <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white">
                        <MapPin className="w-6 h-6 text-brand-blue mt-0.5" />
                        <div>
                          <span className="block font-bold text-[14px] uppercase tracking-widest text-gray-400 mb-1">Dispatch Zone</span>
                          <span className="text-[16px] font-bold text-brand-dark capitalize">
                            {[user.address, user.city].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {user.role === 'DONOR' && (
                <>
                  <Card>
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-[14px] uppercase tracking-widest text-brand-dark">Donation History</h3>
                    </div>
                    <CardContent className="p-6">
                      {donationHistory && donationHistory.length > 0 ? (
                        <div className="space-y-4">
                          {donationHistory.slice(0, visibleDonations).map((hist: any) => {
                            const itemsStr = hist.items.map((i: any) => `${i.quantity} ${i.unit} ${i.food}`).join(' + ');
                            return (
                              <div key={hist.id} className="border border-gray-100 rounded-xl p-5 bg-white cinematic-hover flex flex-col gap-2">
                                <div className="font-medium text-brand-dark text-[15px]">Donated to <span className="font-bold capitalize">{hist.receiverName}</span></div>
                                <div className="p-3 bg-brand-green/5 rounded-lg text-brand-green font-bold text-sm border border-brand-green/10 capitalize">
                                  {itemsStr}
                                </div>
                              </div>
                            );
                          })}
                          {visibleDonations < donationHistory.length && (
                            <div className="flex justify-center pt-4">
                              <Button variant="secondary" size="sm" onClick={() => setVisibleDonations(p => p + 3)}>Load More Records</Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center text-[15px] font-medium text-gray-500">No donation history available.</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-[14px] uppercase tracking-widest text-brand-dark">Current Surplus Inventory</h3>
                    </div>
                    <CardContent className="p-6">
                      {activeInventory && activeInventory.length > 0 ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 rounded-lg text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4 border border-gray-200">
                            <div>Resource</div>
                            <div className="text-center">Quantity</div>
                            <div className="text-center">Exp Date</div>
                            <div className="text-center text-brand-blue">Batch ID</div>
                          </div>

                          {activeInventory.slice(0, visibleInventory).map((inv: any) => {
                            const expStr = new Date(inv.expDate).toLocaleDateString('en-GB').replace(/\//g, '.');
                            return (
                              <div key={inv.id} className="grid grid-cols-4 gap-4 px-4 py-4 border border-gray-100 rounded-xl bg-white cinematic-hover text-[15px] font-medium text-gray-800 items-center">
                                <div className="capitalize font-bold text-brand-dark">{inv.food}</div>
                                <div className="text-center text-brand-green font-black">{inv.quantity}<span className="text-xs text-gray-400 ml-1">{inv.unit}</span></div>
                                <div className="text-center text-[13px]">{expStr}</div>
                                <div className="text-center font-mono text-[13px] text-brand-blue bg-brand-blue/5 py-1 rounded">{inv.batch}</div>
                              </div>
                            );
                          })}

                          {visibleInventory < activeInventory.length && (
                            <div className="flex justify-center pt-4">
                              <Button variant="secondary" className="w-full" onClick={() => setVisibleInventory(p => p + 3)}>Load Complete Inventory</Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center text-[15px] font-medium text-gray-500">No current surplus inventory.</div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}