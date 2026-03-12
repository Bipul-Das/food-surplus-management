// client/src/app/apply/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";
import { 
  Building2, HeartHandshake, Truck, 
  ShieldCheck, Globe, Leaf, ArrowRight, CheckCircle2 
} from "lucide-react";

// 1. Strict Zod Schema for Frontend Validation
const applicationSchema = z.object({
  role: z.enum(["DONOR", "RECEIVER", "DELIVERY_MAN"], {
    message: "Please select an operational role.",
  }),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid official email address."),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Please enter a valid phone number (10-15 digits)."),
  city: z.string().min(2, "Please enter a valid city."),
  location: z.string().min(5, "Please provide a complete operational address/location."),
  reason: z.string().min(20, "Please provide a detailed reason for joining (minimum 20 characters)."),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function ApplyPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
  
  // Form State (No default values, only empty strings for placeholders)
  const [formData, setFormData] = useState<ApplicationFormData>({
    role: "DONOR", // Defaulting the radio selection for UI UX, but can be empty if preferred
    name: "",
    email: "",
    phone: "",
    city: "",
    location: "",
    reason: "",
  });

  // 2. Frontend Sanitization: Auto-trim and Proper Capitalization
  const handleNameBlur = () => {
    if (!formData.name) return;
    const sanitized = formData.name
      .trim()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    
    setFormData(prev => ({ ...prev, name: sanitized }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate against strict Zod schema
    const validation = applicationSchema.safeParse(formData);
    
    if (!validation.success) {
      const fieldErrors: any = {};
      validation.error.issues.forEach(issue => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Simulate secure API transmission to Coordinators
    setTimeout(() => {
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-bg-page flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: Humanitarian Impact & B2B Copy */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
              <div>
                <h1 className="text-4xl font-extrabold text-brand-dark tracking-tight mb-4">
                  Join the Network of <span className="text-brand-blue">Impact.</span>
                </h1>
                <p className="text-lg text-text-secondary leading-relaxed">
                  FoodSurplus is an enterprise-grade ecosystem dedicated to eradicating food waste. By integrating with our platform, you become a critical node in a transparent, accountable supply chain that routes surplus resources directly to vulnerable communities.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                    <Leaf className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark text-lg">Systemic Waste Reduction</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">Transform localized food surplus from a logistical liability into a targeted, actionable community resource.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-100">
                    <Globe className="w-6 h-6 text-urgency-low" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark text-lg">Community Resilience</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">Empower NGOs and community kitchens with a reliable, mathematically quantifiable food supply infrastructure.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-yellow-100">
                    <ShieldCheck className="w-6 h-6 text-urgency-medium" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark text-lg">Auditable Integrity</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">Operate within a strictly governed, RBAC-protected environment. Every transaction is immutably logged for complete CSR accountability.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: The Application Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                
                {isSubmitted ? (
                  <div className="p-12 flex flex-col items-center text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-urgency-low" />
                    </div>
                    <h2 className="text-3xl font-bold text-brand-dark mb-4">Application Transmitted</h2>
                    <p className="text-text-secondary leading-relaxed max-w-md mx-auto mb-8">
                      Your operational data has been securely routed to our Coordination team. You will be contacted via your official email address following the compliance review.
                    </p>
                    <Link href="/" className="inline-flex justify-center items-center px-8 py-3 bg-gray-100 hover:bg-gray-200 text-brand-dark font-bold rounded-lg transition-colors">
                      Return to Homepage
                    </Link>
                  </div>
                ) : (
                  <div className="p-8 md:p-10">
                    <div className="mb-8 border-b border-gray-100 pb-6">
                      <h2 className="text-2xl font-bold text-brand-dark mb-2">Participant Application</h2>
                      <p className="text-sm text-text-secondary">Please provide accurate operational details. Placeholders indicate required formats.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Entity Type Selection */}
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-brand-dark uppercase tracking-wider">Requested Operational Role</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { id: "DONOR", icon: Building2, label: "Food Donor" },
                            { id: "RECEIVER", icon: HeartHandshake, label: "Receiver / NGO" },
                            { id: "DELIVERY_MAN", icon: Truck, label: "Delivery Logistics" }
                          ].map((role) => (
                            <label 
                              key={role.id} 
                              className={`relative flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.role === role.id ? 'border-brand-blue bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-brand-light hover:bg-gray-50'}`}
                            >
                              <input 
                                type="radio" 
                                name="role" 
                                value={role.id}
                                checked={formData.role === role.id}
                                onChange={(e) => setFormData({...formData, role: e.target.value as ApplicationFormData["role"]})}
                                className="sr-only" 
                              />
                              <role.icon className={`w-6 h-6 mb-2 ${formData.role === role.id ? 'text-brand-blue' : 'text-gray-400'}`} />
                              <span className={`text-sm font-bold ${formData.role === role.id ? 'text-brand-blue' : 'text-text-main'}`}>{role.label}</span>
                            </label>
                          ))}
                        </div>
                        {errors.role && <p className="text-xs text-urgency-high font-semibold">{errors.role}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Input with Auto-Capitalize */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-text-main">Entity / Individual Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Grand Hotel Dhaka"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            onBlur={handleNameBlur}
                            className={`w-full px-4 py-3 rounded-lg bg-bg-input border ${errors.name ? 'border-urgency-high' : 'border-transparent'} focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-light/20 transition-all outline-none`}
                          />
                          {errors.name && <p className="text-xs text-urgency-high font-semibold">{errors.name}</p>}
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-text-main">Official Phone Number</label>
                          <input 
                            type="tel" 
                            placeholder="e.g., +8801700000000"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className={`w-full px-4 py-3 rounded-lg bg-bg-input border ${errors.phone ? 'border-urgency-high' : 'border-transparent'} focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-light/20 transition-all outline-none`}
                          />
                          {errors.phone && <p className="text-xs text-urgency-high font-semibold">{errors.phone}</p>}
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-text-main">Official Email Address</label>
                        <input 
                          type="email" 
                          placeholder="e.g., contact@organization.org"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})}
                          className={`w-full px-4 py-3 rounded-lg bg-bg-input border ${errors.email ? 'border-urgency-high' : 'border-transparent'} focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-light/20 transition-all outline-none`}
                        />
                        {errors.email && <p className="text-xs text-urgency-high font-semibold">{errors.email}</p>}
                      </div>

                      {/* City Input */}
<div className="space-y-2">
  <label className="text-sm font-bold text-text-main">City</label>
  <input 
    type="text" 
    placeholder="e.g., Dhaka"
    value={formData.city}
    onChange={(e) => setFormData({...formData, city: e.target.value})}
    className={`w-full px-4 py-3 rounded-lg bg-bg-input border ${errors.city ? 'border-urgency-high' : 'border-transparent'} focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-light/20 transition-all outline-none`}
  />
  {errors.city && <p className="text-xs text-urgency-high font-semibold">{errors.city}</p>}
</div>

                      {/* Location Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-text-main">Operational Location / Address</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Block B, Mirpur 10, Dhaka"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className={`w-full px-4 py-3 rounded-lg bg-bg-input border ${errors.location ? 'border-urgency-high' : 'border-transparent'} focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-light/20 transition-all outline-none`}
                        />
                        {errors.location && <p className="text-xs text-urgency-high font-semibold">{errors.location}</p>}
                      </div>

                      {/* Reason Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-text-main">Operational Motivation</label>
                        <textarea 
                          rows={4}
                          placeholder="Please detail why you wish to join the network and how you intend to contribute..."
                          value={formData.reason}
                          onChange={(e) => setFormData({...formData, reason: e.target.value})}
                          className={`w-full px-4 py-3 rounded-lg bg-bg-input border ${errors.reason ? 'border-urgency-high' : 'border-transparent'} focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-light/20 transition-all outline-none resize-none`}
                        ></textarea>
                        {errors.reason && <p className="text-xs text-urgency-high font-semibold">{errors.reason}</p>}
                      </div>

                      {/* Submit Section & Strict Note */}
                      <div className="pt-6 border-t border-gray-100 flex flex-col items-center">
                        <button 
                          type="submit"
                          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-brand-dark hover:bg-brand-blue text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                          Submit Application <ArrowRight className="w-5 h-5" />
                        </button>
                        <p className="text-xs text-text-secondary mt-4 flex items-center gap-1.5 font-medium">
                          <ShieldCheck className="w-4 h-4 text-brand-light" />
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