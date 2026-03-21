// client/src/app/contact/page.tsx
"use client";

import { useState } from "react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import {
  MapPin, Mail, Clock, ShieldCheck,
  Send, Building2, User, AtSign,
  MessageSquare, CheckCircle2, Globe,
  Facebook, Twitter, Instagram, Youtube // <-- Added these
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
        <section className="py-20 bg-surface-background relative">
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
                  <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm cinematic-hover">
                    <Mail className="w-6 h-6 text-brand-blue flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-brand-dark text-[13px] uppercase tracking-widest mb-1">Official Routing</h4>
                      <p className="text-brand-blue font-bold text-[15px]">admin@foodsurplus.network</p>
                      <p className="text-xs text-text-secondary mt-1 font-medium">General inquiries & partnerships.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm cinematic-hover">
                    <MapPin className="w-6 h-6 text-urgency-medium flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-brand-dark text-[13px] uppercase tracking-widest mb-1">Operational Region</h4>
                      <p className="text-brand-dark font-bold text-[15px]">Dhaka Division, Bangladesh</p>
                      <p className="text-xs text-text-secondary mt-1 font-medium">Primary deployment & logistics zone.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm cinematic-hover">
                    <Clock className="w-6 h-6 text-brand-light flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-brand-dark text-[13px] uppercase tracking-widest mb-1">Service Level Agreement</h4>
                      <p className="text-brand-dark font-bold text-[15px]">24 – 48 Hour Resolution</p>
                      <p className="text-xs text-text-secondary mt-1 font-medium">Standard response timeline for non-critical tickets.</p>
                    </div>
                  </div>
                </div>

                {/* Social/Network Links Placeholder */}
                <div className="pt-8 border-t border-gray-200/60">
                  <h4 className="font-bold text-brand-dark text-[13px] uppercase tracking-widest mb-4">Verified Network Channels</h4>
                  <div className="flex flex-wrap gap-4">

                    <a href="https://foodsurplus.network" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-500 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-colors">
                      <Globe className="w-5 h-5" />
                    </a>

                    <a href="https://facebook.com/foodsurplus" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>

                    <a href="https://x.com/foodsurplus" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-500 hover:bg-black hover:text-white hover:border-black transition-colors">
                      <Twitter className="w-5 h-5" /> {/* Using Twitter icon as the standard placeholder for X */}
                    </a>

                    <a href="https://instagram.com/foodsurplus" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-500 hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F] transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>

                    <a href="https://youtube.com/@foodsurplus" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-500 hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-colors">
                      <Youtube className="w-5 h-5" />
                    </a>

                    <a href="https://tiktok.com/@foodsurplus" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-500 hover:bg-black hover:text-white hover:border-black transition-colors">
                      {/* Custom TikTok SVG to match Lucide styling */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                      </svg>
                    </a>

                  </div>
                </div>
              </div>

              {/* Right Column: Secure Form */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-cinematic relative overflow-hidden">

                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-bl-[100px] pointer-events-none"></div>

                  {isSubmitted ? (
                    <div className="py-20 flex flex-col items-center text-center animate-fade-in">
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
                        <CheckCircle2 className="w-10 h-10 text-semantic-success" />
                      </div>
                      <h3 className="text-2xl font-black text-brand-dark mb-2 tracking-tight">Transmission Secured</h3>
                      <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">
                        Your message has been successfully logged and routed to the appropriate platform administrators. You will receive a response shortly.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-[14px] font-bold text-brand-blue hover:text-brand-dark transition-colors flex items-center gap-2"
                      >
                        Submit another inquiry &rarr;
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                        <div>
                          <h3 className="text-2xl font-black text-brand-dark tracking-tight">Intake Form</h3>
                          <p className="text-[14px] font-medium text-gray-500 mt-1">Please provide accurate details for prompt routing.</p>
                        </div>
                        <div className="p-3 bg-brand-blue/5 rounded-xl border border-brand-blue/10">
                          <ShieldCheck className="w-6 h-6 text-brand-blue" />
                        </div>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Name */}
                          <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                              <User className="w-4 h-4 text-brand-blue" /> Full Name
                            </label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. Jane Doe"
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark outline-none"
                            />
                          </div>

                          {/* Organization */}
                          <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                              <Building2 className="w-4 h-4 text-brand-blue" /> Organization <span className="text-[10px] text-gray-400">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Grand Hotel"
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark outline-none"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <AtSign className="w-4 h-4 text-brand-blue" /> Official Email Address
                          </label>
                          <input
                            required
                            type="email"
                            placeholder="contact@organization.com"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark outline-none"
                          />
                        </div>

                        {/* Subject Routing */}
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <MapPin className="w-4 h-4 text-brand-blue" /> Routing Subject
                          </label>
                          <select
                            required
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark outline-none appearance-none"
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
                          <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <MessageSquare className="w-4 h-4 text-brand-blue" /> Secure Message
                          </label>
                          <textarea
                            required
                            rows={5}
                            placeholder="Please detail your inquiry here..."
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark outline-none resize-none"
                          ></textarea>
                        </div>

                        {/* Disclaimer & Submit */}
                        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-100 mt-8">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest max-w-xs leading-relaxed">
                            By submitting, you acknowledge your data will be securely processed.
                          </p>
                          <button
                            type="submit"
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-3.5 bg-brand-dark hover:bg-brand-blue text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
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