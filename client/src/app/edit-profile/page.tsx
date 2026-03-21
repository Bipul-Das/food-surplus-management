// client/src/app/edit-profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Upload, UserCog, ShieldCheck, Camera, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

export default function EditProfilePage() {
  const { user: currentUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    phone: "10", // Ensure standard prefix is always present in payload
    address: "",
    city: "",
    website: "",
    avatar: "",
    isActive: true,
  });

  // LEAD DEV FIX: Isolated state for the 5-digit user input
  const [phoneSuffix, setPhoneSuffix] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/edit-profile", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {

        // Handle incoming phone data: strip "10" if it exists to populate the suffix field
        const incomingPhone = data.data.phone || "";
        const extractedSuffix = incomingPhone.startsWith("10") ? incomingPhone.slice(2) : incomingPhone;

        setFormData({
          name: data.data.name || "",
          organization: data.data.organization || "",
          phone: incomingPhone || "10",
          address: data.data.address || "",
          city: data.data.city || "",
          website: data.data.website || "",
          avatar: data.data.avatar || "",
          isActive: data.data.isActive ?? true,
        });

        setPhoneSuffix(extractedSuffix);

      } else {
        toast.error(data.message || "Failed to load profile data.");
      }
    } catch (error) {
      toast.error("Network error while fetching profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageError(false);
    }
  };

  // LEAD DEV FIX: Strict Masking for Phone Updates
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Digits only
    const truncated = rawValue.slice(0, 5); // Max 5 digits

    setPhoneSuffix(truncated);
    setFormData(prev => ({ ...prev, phone: `10${truncated}` })); // Reconstruct payload
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phoneSuffix.length !== 5) {
      return toast.error("Phone number must be exactly 7 digits (10 + 5 digits).");
    }

    setIsSaving(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("organization", formData.organization);
      submitData.append("phone", formData.phone); // Payload is guaranteed to be 10XXXXX
      submitData.append("address", formData.address);
      submitData.append("city", formData.city);
      submitData.append("website", formData.website);
      submitData.append("isActive", String(formData.isActive));

      if (avatarFile) {
        submitData.append("avatarFile", avatarFile);
      } else if (formData.avatar) {
        submitData.append("avatar", formData.avatar);
      }

      const res = await fetch("http://localhost:5000/api/edit-profile/info", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: submitData
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Profile information updated.");
        if (result.data.avatar) {
          setFormData(prev => ({ ...prev, avatar: result.data.avatar }));
          setAvatarFile(null);
          setPreviewUrl(null);
          setImageError(false);
        }
      } else {
        toast.error(result.message || "Failed to update profile.");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    if (passwords.newPassword.length < 1) {
      return toast.error("Password must be at least 1 characters.");
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("http://localhost:5000/api/edit-profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword
        })
      });
      const result = await res.json();

      if (result.success) {
        toast.success("Password changed successfully.");
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(result.message || "Failed to change password.");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-surface-background flex flex-col font-sans"><PrivateNavbar /><div className="flex-1 flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-brand-blue" /></div></div>;

  const displayImage = previewUrl || formData.avatar;
  const initials = formData.name ? formData.name.substring(0, 3).toUpperCase() : "PIC";

  return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "COORDINATOR", "LEAD_DEV", "DELIVERY_MAN"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-brand-dark tracking-tight">Settings & Preferences</h1>
            <p className="text-[15px] font-medium text-gray-500 mt-1">Manage your identity and security protocols within the network.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COLUMN: Basic Information */}
            <div className="lg:col-span-8">
              <Card>
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                  <UserCog className="w-5 h-5 text-brand-blue" />
                  <h3 className="font-bold text-[14px] uppercase tracking-widest text-brand-dark">Identity Configuration</h3>
                </div>
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">

                    {/* Avatar Upload Section - Layered SaaS Style */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 mb-8 border-b border-gray-100">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white ring-4 ring-gray-50 shadow-sm flex-shrink-0 relative bg-brand-blue/5 text-brand-blue text-3xl font-black flex items-center justify-center group">
                        <span className="absolute inset-0 flex items-center justify-center z-0 tracking-widest">
                          {initials}
                        </span>
                        {displayImage && !imageError && (
                          <img
                            src={displayImage.startsWith('http') || displayImage.startsWith('blob:') ? displayImage : `http://localhost:5000${displayImage}`}
                            alt="Profile"
                            className="absolute inset-0 w-full h-full object-cover z-10 bg-white"
                            onError={() => setImageError(true)}
                          />
                        )}
                        {/* Hover Overlay for Upload */}
                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-brand-dark/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 cursor-pointer backdrop-blur-[2px]">
                          <Camera className="w-8 h-8" />
                        </label>
                      </div>

                      <div className="flex flex-col items-center sm:items-start gap-3 w-full">
                        <div>
                          <h4 className="text-[15px] font-bold text-brand-dark mb-1">Profile Photo</h4>
                          <p className="text-[13px] text-gray-500 text-center sm:text-left leading-relaxed">This image will be visible to other nodes in the network. We recommend a clear, high-contrast image. (JPG, PNG, WebP. Max 2MB).</p>
                        </div>
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <label htmlFor="avatar-upload">
                          <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                            <Upload className="w-4 h-4 mr-2" /> Upload New Image
                          </Button>
                        </label>
                      </div>
                    </div>

                    {/* Input Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Name / Contact Person"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <Input
                        label="Organization (Optional)"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      />

                      {/* LEAD DEV FIX: Custom Standardized Phone Input */}
                      <div className="space-y-1.5 mt-1">
                        <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest ml-1">Official Phone</label>
                        <div className="flex items-center w-full rounded-xl bg-gray-50 border border-gray-200 overflow-hidden transition-all focus-within:bg-white focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20">
                          <div className="flex items-center justify-center pl-4 pr-3 py-2.5 bg-gray-100/80 border-r border-gray-200">
                            <Phone className="w-3.5 h-3.5 text-gray-400 mr-2" />
                            <span className="font-bold text-brand-dark">10</span>
                            <span className="text-gray-300 mx-1">-</span>
                          </div>
                          <input
                            type="tel"
                            required
                            placeholder="XXXXX"
                            value={phoneSuffix}
                            onChange={handlePhoneChange}
                            className="flex-1 px-3 py-2.5 bg-transparent outline-none font-medium text-brand-dark tracking-wide"
                          />
                        </div>
                      </div>

                      <Input
                        label="Website URL (Optional)"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>

                    <div className="space-y-6 pt-2">
                      <Input
                        label="City"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                      <div>
                        <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-2">Address Details</label>
                        <textarea
                          required
                          rows={3}
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark resize-none"
                        />
                      </div>
                    </div>

                    {/* Operational Status Toggle for Delivery Men */}
                    {currentUser?.role === 'DELIVERY_MAN' && (
                      <div className="mt-8 p-6 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <label className="text-[14px] font-bold text-brand-dark uppercase tracking-widest mb-1 block">Duty Status</label>
                          <p className="text-[13px] font-medium text-gray-500">Toggle off to hide your profile from new assignments.</p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-semantic-success shadow-inner"></div>
                          <span className="ml-3 text-[14px] font-bold text-brand-dark hidden sm:block w-24">
                            {formData.isActive ? "Active" : "Off-Duty"}
                          </span>
                        </label>
                      </div>
                    )}

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isSaving}
                        isLoading={isSaving}
                        className="w-full md:w-auto px-10 shadow-cinematic"
                      >
                        Synchronize Profile
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: Security */}
            <div className="lg:col-span-4 h-full">
              <Card className="h-full sticky top-24">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-red-50/30">
                  <ShieldCheck className="w-5 h-5 text-semantic-danger" />
                  <h3 className="font-bold text-[14px] uppercase tracking-widest text-brand-dark">Security Protocol</h3>
                </div>
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">

                    <div className="space-y-6">
                      <Input
                        label="Current Password"
                        type="password"
                        required
                        value={passwords.oldPassword}
                        onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                      />
                    </div>

                    <div className="pt-6 border-t border-gray-100 space-y-6">
                      <Input
                        label="New Password"
                        type="password"
                        required
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        required
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      />
                    </div>

                    <div className="pt-6">
                      <Button
                        type="submit"
                        variant="danger"
                        className="w-full"
                        disabled={isChangingPassword}
                        isLoading={isChangingPassword}
                      >
                        Update Security Key
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}