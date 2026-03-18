// client/src/app/inventory_all/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Loader2 } from "lucide-react";
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
        <ProtectedRoute allowedRoles={["RECEIVER", "LEAD_DEV", "DONOR"]}>
            <div className="min-h-screen bg-white flex flex-col font-sans">
                <PrivateNavbar />

                <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12">
                    <h1 className="text-[22px] font-normal text-gray-900 mb-2 tracking-tight pl-1">Current inventories</h1>

                    {isLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-900" /></div>
                    ) : inventories.length === 0 ? (
                        <div className="border-[1.5px] border-gray-900 p-12 text-center font-medium text-gray-900">
                            No surplus inventory available at the moment.
                        </div>
                    ) : (
                        // Outer container replicating the wireframe's border
                        <div className="border-[1.5px] border-gray-900 p-8 pb-12 relative">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {visibleInventories.map((donor) => {

                                    // Helper to generate a short 3-letter abbreviation for the avatar
                                    const initials = donor.name.substring(0, 3).toLowerCase();

                                    return (
                                        <div key={donor.donorId} className="border-[1.5px] border-gray-900 p-6 flex flex-col relative bg-white min-h-[220px]">

                                            {/* Avatar Circle */}
                                            <div className="flex justify-center mb-6">
                                                <div className="w-16 h-16 bg-[#4a86e8] border-[1.5px] border-gray-900 rounded-[50%] flex items-center justify-center text-white text-[20px] font-normal shadow-sm">
                                                    {initials}
                                                </div>
                                            </div>

                                            {/* Donor Info */}
                                            <Link
                                                href={`/profile/${donor.donorId}`}
                                                className="text-[20px] font-normal text-gray-900 hover:underline hover:text-[#4a86e8] transition-colors w-fit capitalize"
                                            >
                                                {donor.name}
                                            </Link>
                                            <p className="text-[18px] font-normal text-gray-900 mb-6 capitalize">
                                                {donor.address}, {donor.city}
                                            </p>

                                            {/* Available Categories Tags */}
                                            <div className="flex flex-wrap gap-3">
                                                {donor.categories.map((category: string, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="border-[1.5px] border-gray-900 px-4 py-2 text-[17px] font-normal text-gray-900 capitalize"
                                                    >
                                                        {category}
                                                    </div>
                                                ))}
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>

                            {/* Load More Logic (+4 per click) */}
                            {visibleCount < inventories.length && (
                                <div className="mt-12 flex justify-center">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 4)}
                                        className="px-10 py-3 bg-[#e6e6e6] border-[1.5px] border-gray-900 text-gray-900 font-normal text-[20px] hover:bg-[#cccccc] transition-colors"
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