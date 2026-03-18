// client/src/app/edit-profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    phone: "",
    address: "",
    city: "",
    website: "",
    avatar: "",
  });

  // NEW: State to hold the physical file and its local preview
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // NEW: Track if the image is broken
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
        setFormData({
          name: data.data.name || "",
          organization: data.data.organization || "",
          phone: data.data.phone || "",
          address: data.data.address || "",
          city: data.data.city || "",
          website: data.data.website || "",
          avatar: data.data.avatar || "",
        });
      } else {
        toast.error(data.message || "Failed to load profile data.");
      }
    } catch (error) {
      toast.error("Network error while fetching profile.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the physical file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Generate temporary local preview
      setImageError(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // IMPORTANT: When sending files, we use FormData instead of JSON
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("organization", formData.organization);
      submitData.append("phone", formData.phone);
      submitData.append("address", formData.address);
      submitData.append("city", formData.city);
      submitData.append("website", formData.website);

      if (avatarFile) {
        submitData.append("avatarFile", avatarFile); // Send the physical file
      } else if (formData.avatar) {
        submitData.append("avatar", formData.avatar); // Keep the old string URL if unchanged
      }

      const res = await fetch("http://localhost:5000/api/edit-profile/info", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
          // CRITICAL: Do NOT set "Content-Type" here. 
          // The browser automatically sets it to multipart/form-data with the correct boundaries!
        },
        body: submitData
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Profile information updated.");
        // Sync the form with the newly saved URL from backend
        if (result.data.avatar) {
          setFormData(prev => ({ ...prev, avatar: result.data.avatar }));
          setAvatarFile(null);
          setPreviewUrl(null);
          setImageError(false); // <--- ADD THIS LINE!
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

  if (isLoading) return <div className="min-h-screen bg-white flex flex-col font-sans"><PrivateNavbar /><div className="flex-1 flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-gray-900" /></div></div>;

  // Determine which image to show in the circle
  const displayImage = previewUrl || formData.avatar;

  return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "COORDINATOR", "LEAD_DEV", "DELIVERY_MAN"]}>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 space-y-12">
          <h1 className="text-[24px] font-normal text-gray-900 tracking-tight">Edit Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Form 1: Basic Information */}
            <div className="border-[1.5px] border-gray-900 bg-[#f9f9f9] p-8 relative">
              <div className="absolute -top-4 left-6 bg-white px-2 border-[1.5px] border-gray-900 text-[16px] font-normal text-gray-900">
                Basic Info
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5 mt-4">

                {/* === NEW PHYSICAL DEVICE UPLOAD BLOCK === */}
                {/* === NEW PHYSICAL DEVICE UPLOAD BLOCK === */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b-[1.5px] border-dashed border-gray-300">
                  <div className="w-24 h-24 bg-[#4a86e8] border-[1.5px] border-gray-900 rounded-[50%] flex flex-shrink-0 items-center justify-center text-white text-[24px] font-normal shadow-sm overflow-hidden">

                    {/* FIX: Check if image exists AND hasn't errored out */}
                    {displayImage && !imageError ? (
                      <img
                        src={displayImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)} // Triggers fallback if image is broken
                      />
                    ) : (
                      formData.name ? formData.name.substring(0, 3).toLowerCase() : "pic"
                    )}

                  </div>
                  <div className="flex flex-col gap-2 w-full items-start">
                    <label className="text-[15px] font-normal text-gray-900">Profile Picture</label>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="px-6 py-2 bg-white border-[1.5px] border-gray-900 text-gray-900 font-normal text-[15px] hover:bg-gray-100 cursor-pointer flex items-center gap-2 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Image
                    </label>
                    <p className="text-[13px] text-gray-500">JPG, PNG, or WebP. Max size 2MB.</p>
                  </div>
                </div>
                {/* ======================================== */}
                {/* ======================================== */}

                <div className="flex flex-col gap-1">
                  <label className="text-[15px] font-normal text-gray-900">Name / Contact Person</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border-[1.5px] border-gray-900 font-normal outline-none focus:border-[#4a86e8]" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[15px] font-normal text-gray-900">Organization (Optional)</label>
                  <input type="text" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} className="w-full px-4 py-2.5 border-[1.5px] border-gray-900 font-normal outline-none focus:border-[#4a86e8]" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[15px] font-normal text-gray-900">Phone</label>
                  <input required type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border-[1.5px] border-gray-900 font-normal outline-none focus:border-[#4a86e8]" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[15px] font-normal text-gray-900">City</label>
                  <input required type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-2.5 border-[1.5px] border-gray-900 font-normal outline-none focus:border-[#4a86e8]" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[15px] font-normal text-gray-900">Address Details</label>
                  <textarea required rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 border-[1.5px] border-gray-900 font-normal outline-none focus:border-[#4a86e8] resize-none" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[15px] font-normal text-gray-900">Website URL (Optional)</label>
                  <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full px-4 py-2.5 border-[1.5px] border-gray-900 font-normal outline-none focus:border-[#4a86e8]" />
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={isSaving} className="w-full py-3 bg-[#6aa84f] text-white border-[1.5px] border-gray-900 font-bold text-[18px] hover:bg-[#5b9044] transition-colors flex items-center justify-center gap-2">
                    {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                    Save Info
                  </button>
                </div>
              </form>
            </div>

            {/* Form 2: Change Password */}
            <div className="border-[1.5px] border-gray-900 bg-white p-8 relative h-fit">
              <div className="absolute -top-4 left-6 bg-[#f9f9f9] px-2 border-[1.5px] border-gray-900 text-[16px] font-normal text-gray-900">
                Security
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-5 mt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[15px] font-normal text-gray-900">Current Password</label>
                  <input required type="password" value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} className="w-full px-4 py-2.5 border-[1.5px] border-gray-900 font-normal outline-none focus:border-[#4a86e8]" />
                </div>

                <div className="flex flex-col gap-1 pt-4 border-t-[1.5px] border-dashed border-gray-300">
                  <label className="text-[15px] font-normal text-gray-900">New Password</label>
                  <input required type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full px-4 py-2.5 border-[1.5px] border-gray-900 font-normal outline-none focus:border-[#4a86e8]" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[15px] font-normal text-gray-900">Confirm New Password</label>
                  <input required type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="w-full px-4 py-2.5 border-[1.5px] border-gray-900 font-normal outline-none focus:border-[#cc0000]" />
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={isChangingPassword} className="w-full py-3 bg-[#a5a5a5] border-[1.5px] border-gray-900 text-gray-900 font-normal text-[18px] hover:bg-[#8e8e8e] transition-colors flex items-center justify-center gap-2">
                    {isChangingPassword && <Loader2 className="w-5 h-5 animate-spin" />}
                    Change Password
                  </button>
                </div>
              </form>
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}