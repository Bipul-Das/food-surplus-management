// client/src/app/edit-profile/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { Camera, Lock, Save, Globe, Phone, MapPin, User, Building2 } from "lucide-react";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  name: string;
  organization: string | null;
  phone: string;
  address: string;
  city: string;
  website: string | null;
  avatar: string | null;
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Replace with actual API call: GET /api/users/me
      // const res = await fetch("http://localhost:5000/api/users/me", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }});
      
      // MOCK DATA FOR UI VERIFICATION
      setTimeout(() => {
        setProfile({
          id: "u-123",
          email: "dev@project.com",
          role: "LEAD_DEV",
          name: "Bipul Das",
          organization: "FoodSurplus Network",
          phone: "+8801700000000",
          address: "Block B, Mirpur 10",
          city: "Dhaka",
          website: "https://github.com/Bipul-Das",
          avatar: null,
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast.error("Failed to synchronize profile data.");
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB.");
      return;
    }

    // Convert to Base64 for immediate preview and backend transmission
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => prev ? { ...prev, avatar: reader.result as string } : null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);

    try {
      // The API call to update the profile
      /*
      const response = await fetch("http://localhost:5000/api/users/me", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          website: profile.website,
          avatar: profile.avatar
        })
      });
      if (!response.ok) throw new Error("Update failed");
      */

      // Simulate network request
      await new Promise(res => setTimeout(res, 800));
      toast.success("Profile synchronized securely.");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-bg-page flex flex-col font-sans">
        <PrivateNavbar />
        <div className="flex-1 flex items-center justify-center text-text-secondary">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4"></div>
            Synchronizing profile data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "DELIVERY_MAN", "COORDINATOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-bg-page flex flex-col font-sans">
        <PrivateNavbar />
        
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">Profile Settings</h1>
            <p className="text-sm text-text-secondary mt-1">Manage your public directory presence and operational contact data.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* IMMUTABLE IDENTIFIERS */}
            <FloatingCard className="border-t-4 border-gray-300 bg-gray-50/50">
              <h2 className="text-sm font-bold text-brand-dark mb-4 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" /> Immutable Identifiers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Registered Email</label>
                  <input type="text" readOnly disabled value={profile.email} className="w-full px-4 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed outline-none font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Operational Role</label>
                  <input type="text" readOnly disabled value={profile.role} className="w-full px-4 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed outline-none font-mono text-sm" />
                </div>
                {profile.organization && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Parent Organization</label>
                    <div className="w-full px-4 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed flex items-center gap-2 font-mono text-sm">
                      <Building2 className="w-4 h-4" /> {profile.organization}
                    </div>
                  </div>
                )}
              </div>
            </FloatingCard>

            {/* PUBLIC DIRECTORY PROFILE */}
            <FloatingCard className="border-t-4 border-brand-blue">
              <h2 className="text-sm font-bold text-brand-dark mb-6 uppercase tracking-wider">Public Directory Profile</h2>
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Avatar Uploader */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center overflow-hidden group">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-300" />
                    )}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    >
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-xs text-white font-bold">Update</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <p className="text-xs text-text-secondary">JPG, PNG. Max 2MB.</p>
                </div>

                {/* Editable Fields */}
                <div className="flex-1 w-full space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-text-main uppercase mb-1.5">Display Name</label>
                    <input 
                      required 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})} 
                      className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-text-main uppercase mb-1.5 flex items-center gap-1.5"><Phone className="w-3 h-3"/> Contact Number</label>
                      <input 
                        required 
                        type="text" 
                        value={profile.phone} 
                        onChange={(e) => setProfile({...profile, phone: e.target.value})} 
                        className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-main uppercase mb-1.5 flex items-center gap-1.5"><Globe className="w-3 h-3"/> Website / Social Link</label>
                      <input 
                        type="url" 
                        placeholder="https://"
                        value={profile.website || ""} 
                        onChange={(e) => setProfile({...profile, website: e.target.value})} 
                        className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-text-main uppercase mb-1.5 flex items-center gap-1.5"><MapPin className="w-3 h-3"/> Street Address</label>
                      <input 
                        required 
                        type="text" 
                        value={profile.address} 
                        onChange={(e) => setProfile({...profile, address: e.target.value})} 
                        className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none" 
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-text-main uppercase mb-1.5">City</label>
                      <input 
                        required 
                        type="text" 
                        value={profile.city} 
                        onChange={(e) => setProfile({...profile, city: e.target.value})} 
                        className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none" 
                      />
                    </div>
                  </div>
                </div>

              </div>
            </FloatingCard>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-8 py-3 bg-brand-dark text-white text-sm font-bold rounded-lg hover:bg-brand-blue transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Synchronizing...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Configuration</>
                )}
              </button>
            </div>
          </form>

        </main>
      </div>
    </ProtectedRoute>
  );
}