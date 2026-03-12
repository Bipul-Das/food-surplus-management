// client/src/app/page.tsx
import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, Utensils, Truck, HeartHandshake, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-page flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative bg-white pt-24 pb-32 overflow-hidden border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-brand-dark tracking-tight mb-6 animate-slide-up">
              Bridge the Gap Between <br className="hidden md:block" />
              <span className="text-brand-blue">Surplus and Scarcity.</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary leading-relaxed mb-10">
              A secure, role-based ecosystem empowering hotels, restaurants, and grocery stores to route excess inventory to verified NGOs and community kitchens.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/apply" className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-bold rounded-lg text-white bg-brand-blue hover:bg-brand-light transition-all shadow-md hover:shadow-lg">
                Submit Application <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
              </Link>
              <Link href="/services" className="inline-flex justify-center items-center px-8 py-4 border-2 border-gray-200 text-base font-bold rounded-lg text-brand-dark bg-white hover:bg-gray-50 hover:border-gray-300 transition-all">
                Learn How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* IMPACT METRICS SECTION */}
        <section className="bg-brand-dark py-16 -mt-10 relative z-10 max-w-6xl mx-auto rounded-2xl shadow-2xl">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-blue-800/50">
              <div>
                <p className="text-4xl font-extrabold text-white mb-2">120K+</p>
                <p className="text-sm font-semibold text-brand-light uppercase tracking-wider">People Served</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white mb-2">45,000</p>
                <p className="text-sm font-semibold text-brand-light uppercase tracking-wider">Kg Food Donated</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white mb-2">8,500</p>
                <p className="text-sm font-semibold text-brand-light uppercase tracking-wider">Safe Deliveries</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white mb-2">340</p>
                <p className="text-sm font-semibold text-brand-light uppercase tracking-wider">Active Partners</p>
              </div>
            </div>
          </div>
        </section>

        {/* THE ECOSYSTEM (ACTORS) SECTION */}
        <section className="py-24 bg-bg-page">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-brand-dark">The FoodSurplus Ecosystem</h2>
              <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
                Our strict Role-Based Access Control (RBAC) ensures seamless coordination between three core operational entities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Donor Card */}
              <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 hover:-translate-y-1 hover:shadow-hover transition-all duration-300">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 border border-blue-100">
                  <Utensils className="w-7 h-7 text-brand-blue" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-3">Food Donors</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  Hotels, restaurants, and superstores can effortlessly manage their canonical surplus inventory, set expiration batches, and pledge to active network deficits.
                </p>
              </div>

              {/* Receiver Card */}
              <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 hover:-translate-y-1 hover:shadow-hover transition-all duration-300">
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 border border-green-100">
                  <HeartHandshake className="w-7 h-7 text-urgency-low" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-3">Food Receivers</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  NGOs and community kitchens can broadcast structured food requests with calculated urgency levels and utilize strict daily logbooks to track meal deficits.
                </p>
              </div>

              {/* Delivery Card */}
              <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 hover:-translate-y-1 hover:shadow-hover transition-all duration-300">
                <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center mb-6 border border-yellow-100">
                  <Truck className="w-7 h-7 text-urgency-medium" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-3">Delivery Personnel</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
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
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-brand-blue" />
              </div>
              <h2 className="text-3xl font-extrabold text-brand-dark mb-4">Strict Verification Protocol</h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                To maintain the highest standards of food safety and operational integrity, there is no public "Sign Up". Every participant must submit a detailed application and undergo strict manual review by our Coordination team before being granted dashboard access.
              </p>
              <Link href="/apply" className="text-brand-blue font-bold flex items-center hover:text-brand-dark transition-colors">
                Read our onboarding policy <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            <div className="flex-1 bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-inner">
               <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                   <span className="font-semibold text-text-main">Application Approval Rate</span>
                   <span className="font-bold text-brand-blue">42%</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                   <span className="font-semibold text-text-main">Average Review Time</span>
                   <span className="font-bold text-brand-blue">&lt; 24 Hours</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="font-semibold text-text-main">Active Network Participants</span>
                   <span className="font-bold text-brand-blue">340 Entities</span>
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