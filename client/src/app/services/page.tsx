// client/src/app/services/page.tsx
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import { 
  PackageCheck, ClipboardList, PieChart, 
  Truck, MapPin, MessageSquare, 
  BookOpen, Award, ShieldCheck, 
  Eye, TrendingUp, ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-bg-page flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="bg-brand-dark text-white pt-24 pb-20 border-b border-brand-blue/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              Enterprise-Grade <span className="text-brand-light">Redistribution</span> Logistics
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed font-light max-w-3xl mx-auto">
              FoodSurplus provides a structured, high-availability infrastructure designed to coordinate complex food surplus ecosystems with absolute traceability and accountability.
            </p>
          </div>
        </section>

        {/* 2. INVENTORY & ALLOCATION ENGINE (Feature Highlight) */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-brand-dark uppercase tracking-tight">Core Infrastructure</h2>
              <div className="w-24 h-1 bg-brand-blue mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <PackageCheck className="text-brand-blue w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-dark">Food Surplus Redistribution</h3>
                </div>
                <p className="text-text-secondary leading-relaxed mb-6">
                  The platform provides a structured system enabling restaurants, hotels, supermarkets, and grocery stores to list surplus food and ingredients that would otherwise be wasted. These items are recorded in a strict surplus inventory where donors specify canonical food categories, descriptions, available quantities, and rigid expiry dates. Verified receivers can view these available resources and coordinate rapid distribution.
                </p>

                <div className="flex items-center gap-3 mb-4 mt-8">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <ClipboardList className="text-brand-blue w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-dark">Structured Request Management</h3>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  Receivers execute structured food requests based on documented daily needs. Each request specifies the type of food required, quantity, urgency level, and contextual notes. The system architecture allows requests to be fulfilled by multiple donors, ensuring that fragmented contributions intelligently aggregate to satisfy community deficits. Requests remain actively routed until the required quantity is fulfilled or the automated deadline expires.
                </p>
              </div>

              {/* Partial Allocation Callout Feature */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-bl-full -z-10"></div>
                <PieChart className="w-10 h-10 text-brand-blue mb-6" />
                <h3 className="text-xl font-bold text-brand-dark mb-4">Dynamic Partial Batch Allocation</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  The platform supports highly flexible distribution logic through partial allocation algorithms. A donor may have a larger batch of surplus food, and the system dynamically distributes that single batch across multiple receivers without losing inventory accuracy.
                </p>
                <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                  <span className="text-xs font-bold text-brand-light uppercase tracking-wider mb-2 block">System Execution Example</span>
                  <ul className="space-y-3 text-sm font-medium text-brand-dark">
                    <li className="flex justify-between items-center pb-2 border-b border-gray-50">
                      <span>1. Donor lists surplus inventory:</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">20 kg Rice</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-50">
                      <span>2. Receiver explicitly requests:</span>
                      <span className="bg-blue-50 text-brand-blue px-2 py-1 rounded">8 kg Rice</span>
                    </li>
                    <li className="flex justify-between items-center text-urgency-low pt-1">
                      <span>3. System automatically retains:</span>
                      <span className="bg-green-50 px-2 py-1 rounded">12 kg Active</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. LOGISTICS & COORDINATION GRID */}
        <section className="py-20 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-brand-dark uppercase tracking-tight">Logistics & Coordination</h2>
              <div className="w-24 h-1 bg-brand-blue mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Truck className="w-8 h-8 text-urgency-medium mb-4" />
                <h4 className="text-lg font-bold text-brand-dark mb-3">Delivery Coordination</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Organized transportation through registered delivery personnel. Donors assign deliveries to active agents. Operations include real-time status tracking (pending pickup, in transit, completed, failed) with precise timestamping and location logging for absolute traceability.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <MapPin className="w-8 h-8 text-urgency-medium mb-4" />
                <h4 className="text-lg font-bold text-brand-dark mb-3">Live Location Awareness</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Delivery personnel maintain structured operational zones. This geospatial awareness allows donors and receivers to coordinate exclusively with agents who are geographically capable of performing the transport efficiently, reducing delays and preserving food integrity.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <MessageSquare className="w-8 h-8 text-brand-light mb-4" />
                <h4 className="text-lg font-bold text-brand-dark mb-3">Secure Messaging</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  An integrated communication matrix allows donors, receivers, delivery personnel, and coordinators to interact directly within the platform. All logistical conversations remain isolated within the system architecture to maintain transparency and auditability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ACCOUNTABILITY & GOVERNANCE GRID */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-brand-dark uppercase tracking-tight">Governance & Accountability</h2>
              <div className="w-24 h-1 bg-brand-dark mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              <div className="p-6 border-l-4 border-brand-blue bg-gray-50 rounded-r-xl">
                <BookOpen className="w-6 h-6 text-brand-blue mb-4" />
                <h4 className="font-bold text-brand-dark mb-2">Operational Logbooks</h4>
                <p className="text-sm text-text-secondary">Community kitchens maintain strict daily logbooks recording estimated meal requirements versus actual served metrics. The system mathematically calculates shortages to ensure requests are driven by empirical demand, not estimation.</p>
              </div>

              <div className="p-6 border-l-4 border-brand-light bg-blue-50 rounded-r-xl">
                <Award className="w-6 h-6 text-brand-light mb-4" />
                <h4 className="font-bold text-brand-dark mb-2">Contribution Tracking</h4>
                <p className="text-sm text-text-secondary">Every successful operation is immutably recorded. Organizations and delivery personnel earn system badges as they complete successful operations, generating a highly visible, automated record of reliability.</p>
              </div>

              <div className="p-6 border-l-4 border-urgency-low bg-green-50 rounded-r-xl">
                <ShieldCheck className="w-6 h-6 text-urgency-low mb-4" />
                <h4 className="font-bold text-brand-dark mb-2">Public Verification Profiles</h4>
                <p className="text-sm text-text-secondary">All entities maintain public profiles detailing their operational history, badges, and verified organizational status. This transparency system enforces responsible participation and structurally discourages platform misuse.</p>
              </div>

              <div className="p-6 border-l-4 border-brand-dark bg-gray-50 rounded-r-xl lg:col-span-1 md:col-span-2">
                <Eye className="w-6 h-6 text-brand-dark mb-4" />
                <h4 className="font-bold text-brand-dark mb-2">Coordinator Oversight</h4>
                <p className="text-sm text-text-secondary">System Coordinators monitor the global state of surplus inventories and active deficits. They actively route resources and resolve logistical friction without ever directly mutating participant data or overriding donor autonomy.</p>
              </div>

              <div className="p-6 border-l-4 border-brand-blue bg-gray-50 rounded-r-xl lg:col-span-2 md:col-span-2 flex flex-col justify-center">
                <TrendingUp className="w-6 h-6 text-brand-blue mb-4" />
                <h4 className="font-bold text-brand-dark mb-2">Impact Measurement & Reporting</h4>
                <p className="text-sm text-text-secondary mb-3">
                  The platform telemetry tracks aggregate quantities of food redistributed across the network (categorized by weight, volume, and unit). 
                </p>
                <p className="text-sm text-text-secondary">
                  These robust statistics allow organizations to evaluate network efficacy, while providing enterprise partners with verifiable impact metrics to satisfy Corporate Social Responsibility (CSR) reporting requirements.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* 5. CTA */}
        <section className="bg-brand-dark py-16 border-t border-brand-blue/30 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white mb-6">Ready to Integrate?</h2>
            <p className="text-lg text-blue-100 mb-8">
              Partner with our infrastructure to optimize your surplus management or secure reliable resources for your community kitchen.
            </p>
            <Link href="/apply" className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-bold rounded-lg text-brand-dark bg-white hover:bg-gray-100 transition-all shadow-md">
              Apply for Network Access <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}