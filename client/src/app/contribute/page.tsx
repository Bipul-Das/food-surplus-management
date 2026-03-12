// client/src/app/contribute/page.tsx
import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import { 
  Building2, HeartHandshake, Truck, 
  FileText, ShieldAlert, Key, Activity, 
  Leaf, Award, ShieldCheck, HelpCircle, 
  ArrowRight, CheckCircle2
} from "lucide-react";

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-bg-page flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="bg-brand-dark text-white pt-24 pb-20 border-b border-brand-blue/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              Join the Distribution <span className="text-brand-light">Network</span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed font-light max-w-3xl mx-auto">
              FoodSurplus operates a controlled, high-trust ecosystem. We invite verified organizations and dedicated logistics partners to integrate with our platform to eliminate food waste and support communities.
            </p>
          </div>
        </section>

        {/* 2. THE 4-STEP ONBOARDING PROTOCOL */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-brand-dark uppercase tracking-tight">Onboarding Protocol</h2>
              <div className="w-24 h-1 bg-brand-blue mx-auto mt-4 rounded-full"></div>
              <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
                There is no instant public registration. To maintain operational integrity, all participants must clear our strict, four-stage verification pipeline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connector Line (Desktop only) */}
              <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gray-100 z-0"></div>

              {[
                { icon: FileText, title: "1. Submit Application", desc: "Provide comprehensive organizational details, operational zones, and intended participation capacity via our secure portal." },
                { icon: ShieldAlert, title: "2. Compliance Review", desc: "Our Coordination team manually verifies identity, operational legitimacy, and reviews public organizational footprints." },
                { icon: Key, title: "3. Provisioning", desc: "Upon approval, secure accounts are generated with strict, role-based access control (RBAC) permissions applied." },
                { icon: Activity, title: "4. Active Operations", desc: "Access the live dashboard to instantly list surplus inventory, request resources, or execute delivery logistics." }
              ].map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-white rounded-full border-4 border-gray-50 shadow-sm flex items-center justify-center mb-6 relative">
                    <step.icon className="w-10 h-10 text-brand-blue" />
                    {idx < 3 && <div className="absolute -right-4 top-1/2 -translate-y-1/2 md:hidden"><ArrowRight className="text-gray-300 w-6 h-6" /></div>}
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-3">{step.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed px-2">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. OPERATIONAL ROLES (Cards) */}
        <section className="py-20 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-brand-dark uppercase tracking-tight">Operational Roles</h2>
              <div className="w-24 h-1 bg-brand-dark mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Donor Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <Building2 className="w-7 h-7 text-brand-blue" />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-2">Become a Donor</h3>
                <p className="text-sm font-semibold text-brand-light mb-4">Restaurants, Supermarkets, Producers</p>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  List available surplus food and ingredients. You are expected to maintain highly accurate inventory quantities and strictly adhere to documented expiry timelines.
                </p>
                <ul className="space-y-2 text-sm text-text-main font-medium mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-light" /> Partial batch fulfillment support</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-light" /> Automated CSR impact tracking</li>
                </ul>
                <Link href="/apply" className="block w-full text-center py-3 bg-gray-50 hover:bg-brand-blue hover:text-white text-brand-dark font-bold rounded-lg transition-colors border border-gray-200 hover:border-brand-blue">
                  Apply as Donor
                </Link>
              </div>

              {/* Receiver Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-urgency-low"></div>
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                  <HeartHandshake className="w-7 h-7 text-urgency-low" />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-2">Become a Receiver</h3>
                <p className="text-sm font-semibold text-urgency-low mb-4">NGOs, Shelters, Community Kitchens</p>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  Request resources based strictly on empirical needs. You must maintain daily operational logbooks to quantify demand and confirm receipt of all deliveries for network accountability.
                </p>
                <ul className="space-y-2 text-sm text-text-main font-medium mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-urgency-low" /> Automated deficit calculation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-urgency-low" /> Prioritized urgency routing</li>
                </ul>
                <Link href="/apply" className="block w-full text-center py-3 bg-gray-50 hover:bg-urgency-low hover:text-white text-brand-dark font-bold rounded-lg transition-colors border border-gray-200 hover:border-urgency-low">
                  Apply as Receiver
                </Link>
              </div>

              {/* Logistics Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center mb-6">
                  <Truck className="w-7 h-7 text-urgency-medium" />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-2">Delivery Partner</h3>
                <p className="text-sm font-semibold text-urgency-medium mb-4">Verified Volunteers & Fleets</p>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  Coordinate pickups and drop-offs to ensure timely redistribution. You operate within declared availability zones and maintain strict adherence to transport timelines.
                </p>
                <ul className="space-y-2 text-sm text-text-main font-medium mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-urgency-medium" /> Zone-based assignment</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-urgency-medium" /> Live status telemetry</li>
                </ul>
                <Link href="/apply" className="block w-full text-center py-3 bg-gray-50 hover:bg-yellow-500 hover:text-white text-brand-dark font-bold rounded-lg transition-colors border border-gray-200 hover:border-yellow-500">
                  Apply for Logistics
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SAFETY & RESPONSIBILITY MANDATE */}
        <section className="py-16 bg-brand-dark text-white border-y border-brand-blue/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-shrink-0">
              <ShieldCheck className="w-32 h-32 text-brand-blue opacity-80" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Safety & Responsibility Mandate</h2>
              <p className="text-blue-100 leading-relaxed mb-4">
                Participation in the FoodSurplus network is a privilege that requires absolute adherence to ethical distribution standards. 
                All contributors must guarantee strict food hygiene compliance, provide hyper-accurate listing data, and commit to transparent operations.
              </p>
              <p className="text-sm font-semibold text-brand-light uppercase tracking-wider">
                Non-compliance results in immediate operational suspension.
              </p>
            </div>
          </div>
        </section>

        {/* 5. CONTRIBUTOR BENEFITS */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-brand-dark uppercase tracking-tight">Systemic Benefits</h2>
              <div className="w-24 h-1 bg-brand-blue mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <Leaf className="w-8 h-8 text-urgency-low flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-brand-dark mb-1">Waste Eradication</h4>
                  <p className="text-sm text-text-secondary">Transform localized surplus into targeted, actionable resources rather than environmentally damaging waste.</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <HeartHandshake className="w-8 h-8 text-brand-blue flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-brand-dark mb-1">Community Welfare</h4>
                  <p className="text-sm text-text-secondary">Provide immediate, measurable nutritional support to vulnerable populations within your operational sector.</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <Activity className="w-8 h-8 text-brand-light flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-brand-dark mb-1">Transparent Impact Tracking</h4>
                  <p className="text-sm text-text-secondary">Generate verifiable, data-driven reports on your redistribution metrics for Corporate Social Responsibility (CSR) compliance.</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <Award className="w-8 h-8 text-urgency-medium flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-brand-dark mb-1">Public Recognition</h4>
                  <p className="text-sm text-text-secondary">Earn verifiable digital badges and public profile accolades representing your operational reliability and volume.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ SECTION */}
        <section className="py-20 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-brand-dark" />
              <h2 className="text-3xl font-bold text-brand-dark uppercase tracking-tight">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              {[
                { q: "Who can apply to the network?", a: "Registered restaurants, grocery chains, verified NGOs, community shelters, and individually vetted volunteer logistics personnel are eligible to apply." },
                { q: "How long does the approval protocol take?", a: "Our Coordination team processes standard applications within 24 to 48 hours, pending documentation verification." },
                { q: "Is there any fee to participate?", a: "No. The FoodSurplus core infrastructure is entirely free for Donors, Receivers, and Delivery personnel." },
                { q: "Can an organization have multiple dashboard users?", a: "Currently, access is granted at the organizational entity level. Multi-user RBAC for singular organizations is scheduled for a future architectural update." }
              ].map((faq, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-brand-dark mb-2 text-lg">{faq.q}</h4>
                  <p className="text-text-secondary">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. CTA */}
        <section className="bg-white py-20 text-center border-t border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-6">Initialize Your Application</h2>
            <p className="text-lg text-text-secondary mb-8">
              Join the coordinated effort to fundamentally upgrade community food access and operationalize your surplus management.
            </p>
            <Link href="/apply" className="inline-flex justify-center items-center px-10 py-4 border border-transparent text-lg font-bold rounded-lg text-white bg-brand-blue hover:bg-brand-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Begin Onboarding <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}