// client/src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, Utensils, Truck, HeartHandshake, ShieldCheck } from "lucide-react";
import CountUp from "react-countup";

// Define the interface matching our backend response
interface SystemStats {
  peopleServed: number;
  foodDonatedKg: number;
  safeDeliveries: number;
  activePartners: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/public/stats");
        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Telemetry Sync Failed:", error);
        // Graceful degradation: Fallback to base numbers if API fails
        setStats({
          peopleServed: 120000,
          foodDonatedKg: 45000,
          safeDeliveries: 8500,
          activePartners: 340
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveStats();
  }, []);

  return (
    <div className="min-h-screen bg-surface-background flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative bg-white pt-24 pb-32 overflow-hidden border-b border-gray-100">
          {/* Subtle Ambient Background */}
          <div className="absolute top-0 left-0 w-full h-96 bg-brand-blue/5 -z-10 [clip-path:polygon(0_0,100%_0,100%_100%,0_80%)]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-black text-brand-dark tracking-tight mb-6 animate-in slide-in-from-bottom-4 duration-700 fade-in">
              Bridge the Gap Between <br className="hidden md:block" />
              <span className="text-brand-blue">Surplus and Scarcity.</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 font-medium leading-relaxed mb-10 animate-in slide-in-from-bottom-6 duration-1000 fade-in">
              A secure, role-based ecosystem empowering hotels, restaurants, and grocery stores to route excess inventory to verified NGOs and community kitchens.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in zoom-in-95 duration-700 fade-in">
              <Link href="/apply" className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-[15px] font-bold rounded-xl text-white bg-brand-dark hover:bg-brand-blue transition-colors shadow-cinematic">
                Submit Application <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
              </Link>
              <Link href="/services" className="inline-flex justify-center items-center px-8 py-4 border-2 border-gray-200 text-[15px] font-bold rounded-xl text-brand-dark bg-white hover:bg-gray-50 hover:border-gray-300 transition-all">
                Learn How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* IMPACT METRICS SECTION */}
        <section className="bg-brand-dark py-16 -mt-10 relative z-20 max-w-6xl mx-auto rounded-2xl shadow-2xl border border-white/10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">

              <div>
                <p className="text-4xl font-black text-white mb-2 tracking-tight">
                  {isLoading ? (
                    <span className="inline-block w-24 h-10 bg-white/10 rounded animate-pulse"></span>
                  ) : (
                    <CountUp end={stats?.peopleServed || 0} separator="," suffix="+" duration={2.5} />
                  )}
                </p>
                <p className="text-[11px] font-bold text-brand-blue uppercase tracking-widest">People Served</p>
              </div>

              <div>
                <p className="text-4xl font-black text-white mb-2 tracking-tight">
                  {isLoading ? (
                    <span className="inline-block w-24 h-10 bg-white/10 rounded animate-pulse"></span>
                  ) : (
                      <CountUp
                        end={Math.floor(stats?.foodDonatedKg || 0)}
                        separator=","
                        duration={2.5}
                      />
                  )}
                </p>
                <p className="text-[11px] font-bold text-brand-blue uppercase tracking-widest">Kg Food Donated</p>
              </div>

              <div>
                <p className="text-4xl font-black text-white mb-2 tracking-tight">
                  {isLoading ? (
                    <span className="inline-block w-24 h-10 bg-white/10 rounded animate-pulse"></span>
                  ) : (
                    <CountUp end={stats?.safeDeliveries || 0} separator="," duration={2.5} />
                  )}
                </p>
                <p className="text-[11px] font-bold text-brand-blue uppercase tracking-widest">Safe Deliveries</p>
              </div>

              <div>
                <p className="text-4xl font-black text-white mb-2 tracking-tight">
                  {isLoading ? (
                    <span className="inline-block w-16 h-10 bg-white/10 rounded animate-pulse"></span>
                  ) : (
                    <CountUp end={stats?.activePartners || 0} separator="," duration={2.5} />
                  )}
                </p>
                <p className="text-[11px] font-bold text-brand-blue uppercase tracking-widest">Active Partners</p>
              </div>

            </div>
          </div>
        </section>

        {/* THE ECOSYSTEM (ACTORS) SECTION */}
        <section className="py-24 bg-surface-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-brand-dark tracking-tight">The FoodSurplus Ecosystem</h2>
              <p className="mt-4 text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                Our strict Role-Based Access Control (RBAC) ensures seamless coordination between three core operational entities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Donor Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 cinematic-hover transition-all duration-300 group">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 border border-blue-100 group-hover:bg-brand-blue group-hover:border-brand-blue transition-colors duration-300">
                  <Utensils className="w-7 h-7 text-brand-blue group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[18px] font-black text-brand-dark mb-3 tracking-tight">Food Donors</h3>
                <p className="text-[14px] text-gray-500 font-medium leading-relaxed">
                  Hotels, restaurants, and superstores can effortlessly manage their canonical surplus inventory, set expiration batches, and pledge to active network deficits.
                </p>
              </div>

              {/* Receiver Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 cinematic-hover transition-all duration-300 group">
                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 border border-emerald-100 group-hover:bg-semantic-success group-hover:border-semantic-success transition-colors duration-300">
                  <HeartHandshake className="w-7 h-7 text-semantic-success group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[18px] font-black text-brand-dark mb-3 tracking-tight">Food Receivers</h3>
                <p className="text-[14px] text-gray-500 font-medium leading-relaxed">
                  NGOs and community kitchens can broadcast structured food requests with calculated urgency levels and utilize strict daily logbooks to track meal deficits.
                </p>
              </div>

              {/* Delivery Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 cinematic-hover transition-all duration-300 group">
                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mb-6 border border-amber-100 group-hover:bg-semantic-warning group-hover:border-semantic-warning transition-colors duration-300">
                  <Truck className="w-7 h-7 text-semantic-warning group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[18px] font-black text-brand-dark mb-3 tracking-tight">Delivery Personnel</h3>
                <p className="text-[14px] text-gray-500 font-medium leading-relaxed">
                  Verified logistics partners are assigned to specific availability zones to safely transport pledges from Donors directly to Receiver locations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100">
                <ShieldCheck className="w-8 h-8 text-brand-blue" />
              </div>
              <h2 className="text-3xl font-black text-brand-dark mb-4 tracking-tight">Strict Verification Protocol</h2>
              <p className="text-gray-500 font-medium leading-relaxed mb-6">
                To maintain the highest standards of food safety and operational integrity, there is no public "Sign Up". Every participant must submit a detailed application and undergo strict manual review by our Coordination team before being granted dashboard access.
              </p>
              <Link href="/apply" className="text-[14px] text-brand-blue font-bold flex items-center hover:text-brand-dark transition-colors uppercase tracking-widest">
                Read our onboarding policy <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            <div className="flex-1 w-full bg-gray-50 rounded-2xl p-8 md:p-10 border border-gray-200 shadow-inner">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-200/60 pb-4">
                  <span className="text-[14px] font-bold text-gray-500">Application Approval Rate</span>
                  <span className="text-[16px] font-black text-brand-blue">42%</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200/60 pb-4">
                  <span className="text-[14px] font-bold text-gray-500">Average Review Time</span>
                  <span className="text-[16px] font-black text-brand-blue">&lt; 24 Hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-bold text-gray-500">Active Network Participants</span>
                  <span className="text-[16px] font-black text-brand-blue">
                    {isLoading ? "..." : (stats?.activePartners || 340)} Entities
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}