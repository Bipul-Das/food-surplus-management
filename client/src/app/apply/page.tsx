// client/src/app/apply/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import {
  Building2, HeartHandshake, Truck,
  ShieldCheck, Globe, Leaf, ArrowRight, CheckCircle2, Loader2, Phone
} from "lucide-react";
import toast from "react-hot-toast";

// 1. Strict Zod Schema for Frontend Validation
const applicationSchema = z.object({
  role: z.enum(["DONOR", "RECEIVER", "DELIVERY_MAN"], {
    message: "Please select an operational role.",
  }),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid official email address."),
  phone: z.string().regex(/^10\d{5}$/, "Phone number must be exactly 7 digits starting with 10."),
  city: z.string().min(2, "Please enter a valid city."),
  location: z.string().min(5, "Please provide a complete operational address/location."),
  reason: z.string().min(20, "Please provide a detailed reason for joining (minimum 20 characters)."),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function ApplyPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});

  const [phoneSuffix, setPhoneSuffix] = useState("");

  const [formData, setFormData] = useState<ApplicationFormData>({
    role: "DONOR",
    name: "",
    email: "",
    phone: "10",
    city: "",
    location: "",
    reason: "",
  });

  const handleNameBlur = () => {
    if (!formData.name) return;
    const sanitized = formData.name
      .trim()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setFormData(prev => ({ ...prev, name: sanitized }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const truncated = rawValue.slice(0, 5);

    setPhoneSuffix(truncated);
    setFormData(prev => ({ ...prev, phone: `10${truncated}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = applicationSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: any = {};
      validation.error.issues.forEach(issue => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: formData.role,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          address: formData.location,
          motivation: formData.reason
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubmitted(true);
      } else {
        toast.error(result.message || "Failed to submit application.");
      }
    } catch (error) {
      toast.error("Network error. Please ensure the server is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-background flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">

            {/* LEFT COLUMN: Humanitarian Impact & B2B Copy */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
              <div>
                <h1 className="text-4xl font-black text-brand-dark tracking-tight mb-4">
                  Join the Network of <span className="text-brand-blue">Impact.</span>
                </h1>
                <p className="text-lg text-gray-500 font-medium leading-relaxed">
                  FoodSurplus is an enterprise-grade ecosystem dedicated to eradicating food waste. By integrating with our platform, you become a critical node in a transparent, accountable supply chain that routes surplus resources directly to vulnerable communities.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                    <Leaf className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div>
                    <h3 className="font-black text-brand-dark text-[15px] uppercase tracking-widest mb-1 mt-0.5">Systemic Waste Reduction</h3>
                    <p className="text-[14px] font-medium text-gray-500 leading-relaxed">Transform localized food surplus from a logistical liability into a targeted, actionable community resource.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-100">
                    <Globe className="w-6 h-6 text-semantic-success" />
                  </div>
                  <div>
                    <h3 className="font-black text-brand-dark text-[15px] uppercase tracking-widest mb-1 mt-0.5">Community Resilience</h3>
                    <p className="text-[14px] font-medium text-gray-500 leading-relaxed">Empower NGOs and community kitchens with a reliable, mathematically quantifiable food supply infrastructure.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-100">
                    <ShieldCheck className="w-6 h-6 text-semantic-warning" />
                  </div>
                  <div>
                    <h3 className="font-black text-brand-dark text-[15px] uppercase tracking-widest mb-1 mt-0.5">Auditable Integrity</h3>
                    <p className="text-[14px] font-medium text-gray-500 leading-relaxed">Operate within a strictly governed, RBAC-protected environment. Every transaction is immutably logged for complete CSR accountability.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: The Application Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl shadow-cinematic border border-gray-200 overflow-hidden">

                {isSubmitted ? (
                  <div className="p-12 flex flex-col items-center text-center animate-fade-in">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
                      <CheckCircle2 className="w-10 h-10 text-semantic-success" />
                    </div>
                    <h2 className="text-3xl font-black text-brand-dark mb-4 tracking-tight">Application Transmitted</h2>
                    <p className="text-gray-500 font-medium leading-relaxed max-w-md mx-auto mb-8">
                      Your operational data has been securely routed to our Coordination team. You will be contacted via your official email address following the compliance review.
                    </p>
                    <Link href="/" className="inline-flex justify-center items-center px-8 py-3.5 bg-brand-dark hover:bg-brand-blue text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
                      Return to Homepage
                    </Link>
                  </div>
                ) : (
                  <div className="p-8 md:p-10">
                    <div className="mb-8 border-b border-gray-100 pb-6">
                      <h2 className="text-2xl font-black text-brand-dark mb-2 tracking-tight">Participant Application</h2>
                      <p className="text-[14px] font-medium text-gray-500">Please provide accurate operational details. Placeholders indicate required formats.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                      {/* Entity Type Selection */}
                      <div className="space-y-3">
                        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-1">Requested Operational Role</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { id: "DONOR", icon: Building2, label: "Food Donor" },
                            { id: "RECEIVER", icon: HeartHandshake, label: "Receiver / NGO" },
                            { id: "DELIVERY_MAN", icon: Truck, label: "Delivery Logistics" }
                          ].map((role) => (
                            <label
                              key={role.id}
                              className={`relative flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all cinematic-hover ${formData.role === role.id ? 'border-brand-blue bg-brand-blue/5 shadow-sm ring-1 ring-brand-blue/10' : 'border-gray-200 hover:border-brand-blue/50 hover:bg-gray-50/50'}`}
                            >
                              <input
                                type="radio"
                                name="role"
                                value={role.id}
                                checked={formData.role === role.id}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as ApplicationFormData["role"] })}
                                className="sr-only"
                              />
                              <role.icon className={`w-6 h-6 mb-2 ${formData.role === role.id ? 'text-brand-blue' : 'text-gray-400'}`} />
                              <span className={`text-[13px] font-black uppercase tracking-widest ${formData.role === role.id ? 'text-brand-blue' : 'text-gray-500'}`}>{role.label}</span>
                            </label>
                          ))}
                        </div>
                        {errors.role && <p className="text-[12px] font-bold text-semantic-danger ml-1 mt-1">{errors.role}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest ml-1">Entity / Individual Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Grand Hotel Dhaka"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            onBlur={handleNameBlur}
                            className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.name ? 'border-semantic-danger' : 'border-gray-200'} focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark outline-none`}
                          />
                          {errors.name && <p className="text-[12px] font-bold text-semantic-danger ml-1 mt-1">{errors.name}</p>}
                        </div>

                        {/* LEAD DEV FIX: Custom Standardized Phone Input with visible border */}
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest ml-1">Official Phone Number</label>
                          <div className={`flex items-center w-full rounded-xl bg-gray-50 border overflow-hidden transition-all focus-within:bg-white focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 ${errors.phone ? 'border-semantic-danger' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-center pl-4 pr-3 py-3 bg-gray-100/80 border-r border-gray-200">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="font-bold text-brand-dark">10</span>
                              <span className="text-gray-300 mx-1">-</span>
                            </div>
                            <input
                              type="tel"
                              placeholder="XXXXX"
                              value={phoneSuffix}
                              onChange={handlePhoneChange}
                              className="flex-1 px-3 py-3 bg-transparent outline-none font-medium text-brand-dark tracking-wide"
                            />
                          </div>
                          {errors.phone && <p className="text-[12px] font-bold text-semantic-danger ml-1 mt-1">{errors.phone}</p>}
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest ml-1">Official Email Address</label>
                        <input
                          type="email"
                          placeholder="e.g. contact@organization.org"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                          className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.email ? 'border-semantic-danger' : 'border-gray-200'} focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark outline-none`}
                        />
                        {errors.email && <p className="text-[12px] font-bold text-semantic-danger ml-1 mt-1">{errors.email}</p>}
                      </div>

                      {/* City Input */}
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest ml-1">City</label>
                        <input
                          type="text"
                          placeholder="e.g. Dhaka"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.city ? 'border-semantic-danger' : 'border-gray-200'} focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark outline-none`}
                        />
                        {errors.city && <p className="text-[12px] font-bold text-semantic-danger ml-1 mt-1">{errors.city}</p>}
                      </div>

                      {/* Location Input */}
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest ml-1">Operational Location / Address</label>
                        <input
                          type="text"
                          placeholder="e.g. Block B, Mirpur 10, Dhaka"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.location ? 'border-semantic-danger' : 'border-gray-200'} focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark outline-none`}
                        />
                        {errors.location && <p className="text-[12px] font-bold text-semantic-danger ml-1 mt-1">{errors.location}</p>}
                      </div>

                      {/* Reason Input */}
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest ml-1">Operational Motivation</label>
                        <textarea
                          rows={4}
                          placeholder="Please detail why you wish to join the network and how you intend to contribute..."
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.reason ? 'border-semantic-danger' : 'border-gray-200'} focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark outline-none resize-none`}
                        ></textarea>
                        {errors.reason && <p className="text-[12px] font-bold text-semantic-danger ml-1 mt-1">{errors.reason}</p>}
                      </div>

                      {/* Submit Section */}
                      <div className="pt-6 border-t border-gray-100 flex flex-col items-center">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center gap-2 px-10 py-4 bg-brand-dark hover:bg-brand-blue text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                        >
                          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Application <ArrowRight className="w-5 h-5" /></>}
                        </button>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-6 flex items-center justify-center gap-1.5 text-center max-w-sm leading-relaxed">
                          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                          Note: No operational account is generated upon submission. All applications undergo strict manual compliance review.
                        </p>
                      </div>

                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}