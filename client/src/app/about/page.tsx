// client/src/app/about/page.tsx
import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import { 
  Target, AlertTriangle, CheckCircle, Shield, 
  Users, Scale, Heart, ShieldCheck, ArrowRight, User
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-page flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1">
        {/* 1. HERO / INTRODUCTION & MISSION */}
        <section className="bg-brand-dark text-white py-20 border-b border-brand-blue/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              Our Mission
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed font-light">
              We are dedicated to reducing food waste by engineering a transparent, accountable distribution system that seamlessly connects surplus food sources with the communities that need them most.
            </p>
          </div>
        </section>

        {/* 2. THE PROBLEM & 3. OUR SOLUTION */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* The Problem */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-urgency-high w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold text-brand-dark">The Problem</h2>
                </div>
                <ul className="space-y-4 text-text-secondary leading-relaxed">
                  <li className="flex gap-3">
                    <span className="text-urgency-high font-bold">•</span>
                    Large quantities of perfectly edible food are discarded daily by restaurants, supermarkets, and hotels due to logistical friction.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-urgency-high font-bold">•</span>
                    Simultaneously, community kitchens and NGOs struggle constantly to secure a consistent, reliable food supply.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-urgency-high font-bold">•</span>
                    A fundamental lack of real-time coordination between surplus producers and verified receivers results in massive, preventable waste.
                  </li>
                </ul>
              </div>

              {/* Our Solution */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-brand-blue w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold text-brand-dark">Our Solution</h2>
                </div>
                <ul className="space-y-4 text-text-secondary leading-relaxed">
                  <li className="flex gap-3">
                    <span className="text-brand-light font-bold">✓</span>
                    A centralized surplus inventory system allowing donors to post canonical, batch-tracked food items.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-brand-light font-bold">✓</span>
                    Structured, urgency-rated food requests explicitly defined by community kitchens.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-brand-light font-bold">✓</span>
                    Verified delivery logistics connecting zones with real-time coordination and messaging.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-brand-light font-bold">✓</span>
                    Immutable, transparent tracking of every food allocation from the donor's dock to the receiver's table.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TRANSPARENCY & VERIFICATION + 6. FOOD SAFETY */}
        <section className="py-20 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-brand-dark">Uncompromising Standards</h2>
              <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
                Trust is the currency of our ecosystem. We enforce strict frameworks to ensure the safety of our users and the integrity of the food supply.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <Shield className="w-10 h-10 text-brand-blue mb-4" />
                <h3 className="text-xl font-bold text-brand-dark mb-4">Transparency & Verification</h3>
                <p className="text-sm text-text-secondary mb-4">Every participant operates with complete visibility to prevent misuse:</p>
                <ul className="space-y-2 text-sm text-text-main">
                  <li>• Public profiles displaying verified organizational status.</li>
                  <li>• Visible, immutable donation and delivery histories.</li>
                  <li>• A performance badge system reflecting active contribution levels.</li>
                  <li>• End-to-end traceability of every food allocation.</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <ShieldCheck className="w-10 h-10 text-urgency-low mb-4" />
                <h3 className="text-xl font-bold text-brand-dark mb-4">Food Safety Principles</h3>
                <p className="text-sm text-text-secondary mb-4">Responsible handling is a non-negotiable requirement for network access:</p>
                <ul className="space-y-2 text-sm text-text-main">
                  <li>• Only safe, non-expired, legally compliant food may be donated.</li>
                  <li>• Donors are strictly required to provide accurate expiry dates.</li>
                  <li>• Receivers must physically verify food condition upon delivery.</li>
                  <li>• System traceability ensures accountability for every transaction.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5. GOVERNANCE MODEL */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:text-center">
              <Scale className="w-12 h-12 text-brand-dark md:mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-brand-dark">Governance Model</h2>
              <p className="mt-4 text-text-secondary max-w-2xl md:mx-auto">
                The platform is administered through a strict Role-Based Access Control (RBAC) architecture to maintain boundaries and ensure operational efficiency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border-l-4 border-brand-dark bg-gray-50 rounded-r-lg">
                <h4 className="font-bold text-brand-dark mb-2">Lead Developer</h4>
                <p className="text-sm text-text-secondary">Maintains overall system integrity, data security, and the technical infrastructure. Operates with maximum administrative oversight.</p>
              </div>
              <div className="p-6 border-l-4 border-brand-light bg-blue-50 rounded-r-lg">
                <h4 className="font-bold text-brand-dark mb-2">Coordinators</h4>
                <p className="text-sm text-text-secondary">Monitor requests, review applications, and facilitate communication. <strong>Crucially:</strong> Coordinators do not control or modify donor inventories.</p>
              </div>
              <div className="p-6 border-l-4 border-urgency-low bg-green-50 rounded-r-lg">
                <h4 className="font-bold text-brand-dark mb-2">Operational Participants</h4>
                <p className="text-sm text-text-secondary">Donors retain full autonomy over their surplus inventory. Receivers maintain their daily logbooks. Delivery personnel manage transportation routes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. PLATFORM VALUES & 7. COMMUNITY IMPACT */}
        <section className="py-20 bg-brand-dark text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-8">Our Guiding Values</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-brand-light font-bold uppercase tracking-wider text-xs">01</span>
                  <span className="font-semibold text-lg">Transparency</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-brand-light font-bold uppercase tracking-wider text-xs">02</span>
                  <span className="font-semibold text-lg">Accountability</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-brand-light font-bold uppercase tracking-wider text-xs">03</span>
                  <span className="font-semibold text-lg">Collaboration</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-brand-light font-bold uppercase tracking-wider text-xs">04</span>
                  <span className="font-semibold text-lg">Efficiency</span>
                </div>
                <div className="flex flex-col gap-2 col-span-2 mt-2">
                  <span className="text-brand-light font-bold uppercase tracking-wider text-xs">05</span>
                  <span className="font-semibold text-lg">Community Welfare</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 p-8 rounded-2xl border border-white/20 backdrop-blur-sm">
              <Heart className="w-10 h-10 text-red-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Community Impact</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                By bridging the logistical gap, FoodSurplus actively reduces metropolitan food waste while providing critical support for community kitchens and shelters. 
                We are building a culture of responsible surplus management among local businesses.
              </p>
              <div className="pt-6 border-t border-white/20 flex justify-between items-center">
                <span className="text-sm font-medium text-blue-200">Current Goal</span>
                <span className="font-bold text-white text-xl">50,000kg Redistributed</span>
              </div>
            </div>
          </div>
        </section>

        {/* 9. FOUNDER / PROJECT TEAM */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-dark">Project Leadership</h2>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-brand-blue rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <User className="w-16 h-16 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-dark mb-1">Bipul Das</h3>
                <p className="text-brand-light font-semibold text-sm uppercase tracking-wide mb-4">Lead Developer & System Architect</p>
                <p className="text-text-secondary leading-relaxed mb-4">
                  Currently in the final semester of his B.Sc. in Computer Science and Engineering at Dhaka University, Bipul developed FoodSurplus to solve a critical logistical failure in modern food distribution.
                </p>
                <p className="text-text-secondary leading-relaxed italic border-l-4 border-brand-light pl-4">
                  "The motivation behind this platform was to engineer a highly accurate, industry-standard solution that replaces chaotic, uncoordinated food waste with a strict, accountable, and transparent digital ecosystem."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 10. JOIN THE PLATFORM (CTA) */}
        <section className="bg-blue-50 py-20 border-t border-blue-100 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Target className="w-12 h-12 text-brand-blue mx-auto mb-6" />
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">Join the Ecosystem</h2>
            <p className="text-lg text-text-secondary mb-8">
              We invite restaurants, supermarkets, and grocery stores to join as donors; NGOs and community kitchens as receivers; and dedicated volunteers as delivery personnel.
            </p>
            <Link href="/apply" className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-bold rounded-lg text-white bg-brand-blue hover:bg-brand-light transition-all shadow-md">
              Submit Your Application <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}