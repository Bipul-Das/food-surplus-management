// client/src/app/inventory_all/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader2, PackageOpen } from "lucide-react";
import toast from "react-hot-toast";

export default function CurrentInventoriesPage() {
    const [inventories, setInventories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Requirement: Load 6 initially, append 4 on Load More
    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        const fetchInventories = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/inventory/public", {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                const data = await res.json();
                if (data.success) {
                    setInventories(data.data);
                }
            } catch (error) {
                toast.error("Failed to load current inventories.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInventories();
    }, []);

    const visibleInventories = inventories.slice(0, visibleCount);

    return (
        <ProtectedRoute allowedRoles={["RECEIVER", "LEAD_DEV", "DONOR", "DELIVERY_MAN"]}>
            <div className="min-h-screen bg-surface-background flex flex-col font-sans">
                <PrivateNavbar />

                <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-brand-dark tracking-tight">Active Donor Hubs</h1>
                        <p className="text-[15px] font-medium text-gray-500 mt-1">Live overview of network partners currently holding surplus resources.</p>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-12 h-12 animate-spin text-brand-blue" />
                            <p className="text-gray-500 font-medium animate-pulse">Syncing logistics network...</p>
                        </div>
                    ) : inventories.length === 0 ? (
                        <Card className="p-16 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <PackageOpen className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-dark mb-2">No Surplus Available</h3>
                            <p className="text-gray-500 font-medium">The network is currently cleared of all active inventory batches.</p>
                        </Card>
                    ) : (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                {visibleInventories.map((donor) => {
                                    // Helper to generate a short 3-letter abbreviation for the avatar fallback
                                    const initials = donor.name.substring(0, 3).toUpperCase();

                                    return (
                                        <Card key={donor.donorId} className="cinematic-hover flex flex-col group">
                                            <CardContent className="p-8 flex-1 flex flex-col">

                                                <div className="flex items-start gap-5 mb-8">

                                                    {/* LEAD DEV FIX: Integrated your robust avatar URL logic with our SaaS frame */}
                                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-blue/20 ring-4 ring-white shadow-md flex-shrink-0 relative bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xl font-black group-hover:border-brand-blue transition-colors duration-300">
                                                        {donor.avatar ? (
                                                            <img
                                                                src={donor.avatar.startsWith('http') ? donor.avatar : `http://localhost:5000${donor.avatar}`}
                                                                alt={`${donor.name} profile`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    // Fallback if image fails to load
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <span>{initials}</span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 pt-1">
                                                        <Link
                                                            href={`/profile/${donor.donorId}`}
                                                            className="text-2xl font-black text-brand-dark hover:text-brand-blue transition-colors capitalize tracking-tight line-clamp-1"
                                                        >
                                                            {donor.name}
                                                        </Link>
                                                        <p className="text-[15px] font-medium text-gray-500 mt-1 capitalize">
                                                            {donor.city} &bull; {donor.address}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-auto">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Available Resources</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {donor.categories.map((category: string, idx: number) => (
                                                            <Badge key={idx} variant="info" size="md" className="capitalize px-4">
                                                                {category}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {visibleCount < inventories.length && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        onClick={() => setVisibleCount(prev => prev + 4)}
                                    >
                                        Load More Hubs
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