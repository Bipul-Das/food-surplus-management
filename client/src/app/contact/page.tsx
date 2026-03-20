// client/src/app/contact/page.tsx
"use client";

import { useState } from "react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import {
  MapPin, Mail, Clock, ShieldCheck,
  Send, Building2, User, AtSign,
  MessageSquare, CheckCircle2, Globe
} from "lucide-react";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate secure API transmission
    setTimeout(() => setIsSubmitted(true), 600);
  };

  return (
    <div className="min-h-screen bg-bg-page flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="bg-brand-dark text-white pt-24 pb-20 border-b border-brand-blue/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              Secure Communications <span className="text-brand-light">& Support</span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed font-light max-w-3xl mx-auto">
              Direct channels for partnership inquiries, operational coordination, technical support, and platform feedback. All submissions are securely routed to the appropriate network Coordinators.
            </p>
          </div>
        </section>

        {/* 2. MAIN CONTENT GRID */}
        <section className="py-20 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

              {/* Left Column: Official Info & Trust Signals */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-brand-dark mb-6">Platform Administration</h2>
                  <p className="text-text-secondary leading-relaxed mb-8">
                    This channel is strictly maintained for legitimate operational communication. Sensitive operational matters or participant-specific logistical issues are securely redirected to internal Coordinators for rapid resolution.
                  </p>
                </div>

                {/* Info Cards */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <Mail className="w-6 h-6 text-brand-blue flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-brand-dark text-sm uppercase tracking-wider mb-1">Official Routing</h4>
                      <p className="text-brand-blue font-semibold">admin@foodsurplus.network</p>
                      <p className="text-xs text-text-secondary mt-1">General inquiries & partnerships.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <MapPin className="w-6 h-6 text-urgency-medium flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-brand-dark text-sm uppercase tracking-wider mb-1">Operational Region</h4>
                      <p className="text-text-main font-semibold">Dhaka Division, Bangladesh</p>
                      <p className="text-xs text-text-secondary mt-1">Primary deployment & logistics zone.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <Clock className="w-6 h-6 text-urgency-low flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-brand-dark text-sm uppercase tracking-wider mb-1">Service Level Agreement</h4>
                      <p className="text-text-main font-semibold">24 – 48 Hour Resolution</p>
                      <p className="text-xs text-text-secondary mt-1">Standard response timeline for non-critical tickets.</p>
                    </div>
                  </div>
                </div>

                {/* Social/Network Links Placeholder */}
                <div className="pt-8 border-t border-gray-100">
                  <h4 className="font-bold text-brand-dark text-sm uppercase tracking-wider mb-4">Verified Network Channels</h4>
                  <div className="flex gap-4">
                    <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-text-secondary hover:bg-brand-blue hover:text-white transition-colors">
                      <Globe className="w-5 h-5" />
                    </button>
                    {/* Add standard social icons here if requested later */}
                  </div>
                </div>
              </div>

              {/* Right Column: Secure Form */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl relative overflow-hidden">

                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-bl-[100px] pointer-events-none"></div>

                  {isSubmitted ? (
                    <div className="py-20 flex flex-col items-center text-center animate-fade-in">
                      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-urgency-low" />
                      </div>
                      <h3 className="text-2xl font-bold text-brand-dark mb-2">Transmission Secured</h3>
                      <p className="text-text-secondary max-w-md mx-auto mb-8">
                        Your message has been successfully logged and routed to the appropriate platform administrators. You will receive a response shortly.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-brand-blue font-bold hover:text-brand-dark transition-colors"
                      >
                        Submit another inquiry &rarr;
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-brand-dark">Intake Form</h3>
                        <ShieldCheck className="w-6 h-6 text-brand-light" />
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Name */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                              <User className="w-4 h-4 text-text-secondary" /> Full Name
                            </label>
                            <input
                              required
                              type="text"
                              placeholder="Jane Doe"
                              className="w-full px-4 py-3 rounded-lg bg-bg-input border border-transparent focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-light/20 transition-all outline-none"
                            />
                          </div>

                          {/* Organization */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-text-secondary" /> Organization <span className="text-xs font-normal text-gray-400">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Entity Name"
                              className="w-full px-4 py-3 rounded-lg bg-bg-input border border-transparent focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-light/20 transition-all outline-none"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                            <AtSign className="w-4 h-4 text-text-secondary" /> Official Email Address
                          </label>
                          <input
                            required
                            type="email"
                            placeholder="contact@organization.com"
                            className="w-full px-4 py-3 rounded-lg bg-bg-input border border-transparent focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-light/20 transition-all outline-none"
                          />
                        </div>

                        {/* Subject Routing */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-text-secondary" /> Routing Subject
                          </label>
                          <select
                            required
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-bg-input border border-transparent focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-light/20 transition-all outline-none text-brand-dark"
                          >
                            <option value="" disabled>Select communication category...</option>
                            <option value="partnership">Partnership & Integration Inquiry</option>
                            <option value="onboarding">Contributor Onboarding Support</option>
                            <option value="technical">Technical Issue / Bug Report</option>
                            <option value="feedback">Operational Feedback</option>
                            <option value="media">Media & Press</option>
                          </select>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-text-secondary" /> Secure Message
                          </label>
                          <textarea
                            required
                            rows={5}
                            placeholder="Please detail your inquiry here..."
                            className="w-full px-4 py-3 rounded-lg bg-bg-input border border-transparent focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-light/20 transition-all outline-none resize-none"
                          ></textarea>
                        </div>

                        {/* Disclaimer & Submit */}
                        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-100">
                          <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
                            By submitting this form, you acknowledge that your data will be securely processed and reviewed strictly for platform coordination purposes.
                          </p>
                          <button
                            type="submit"
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-dark hover:bg-brand-blue text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
                          >
                            <Send className="w-4 h-4" /> Transmit Data
                          </button>
                        </div>
                      </form>
                    </>
                  )}
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