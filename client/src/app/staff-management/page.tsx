// client/src/app/staff-management/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { UserPlus, Edit2, Trash2, Copy, CheckCircle2, ShieldCheck, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

export default function StaffManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // Provisioning & Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{email: string, password: string} | null>(null);
  
  const initialFormState = {
    name: "", email: "", phone: "", role: "DONOR",
    organization: "", address: "", city: "", password: ""
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const result = await response.json();
      if (result.success) setUsers(result.data);
    } catch (error) {
      toast.error("Network error. Could not connect to database.");
    } finally {
      setIsFetching(false);
    }
  };

  /* // COMMENTED OUT FOR TESTING PURPOSES
  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pwd }));
  };
  */

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      organization: user.organization || "",
      address: user.address || "",
      city: user.city || "",
      password: "" // Intentionally blank so we don't overwrite it accidentally
    });
    setGeneratedCredentials(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently purge this entity from the network?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Entity purged successfully.");
        setUsers(prev => prev.filter(u => u.id !== id));
        if (editingId === id) cancelEdit();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete entity.");
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingId 
        ? `http://localhost:5000/api/users/${editingId}` 
        : "http://localhost:5000/api/users/create";
      
      const method = editingId ? "PATCH" : "POST";

      // If creating new user, password is required. If updating, it's optional.
      if (!editingId && !formData.password) {
        throw new Error("A temporary password must be provided for new accounts.");
      }

      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to provision account");
      }

      if (formData.password) {
        setGeneratedCredentials({ email: formData.email, password: formData.password });
        toast.success(editingId ? "Account updated and new password secured." : "Account provisioned successfully.");
      } else {
        toast.success("Account configuration updated securely.");
      }

      if (!formData.password) cancelEdit(); // Reset UI if we didn't generate credentials
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "An error occurred during transaction.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "LEAD_DEV": return <span className="bg-brand-dark text-white px-2.5 py-1 rounded-full text-xs font-bold uppercase">Lead Dev</span>;
      case "COORDINATOR": return <span className="bg-brand-blue text-white px-2.5 py-1 rounded-full text-xs font-bold uppercase">Coordinator</span>;
      case "DONOR": return <span className="bg-blue-100 text-brand-blue px-2.5 py-1 rounded-full text-xs font-bold uppercase">Donor</span>;
      case "RECEIVER": return <span className="bg-green-100 text-urgency-low px-2.5 py-1 rounded-full text-xs font-bold uppercase">Receiver</span>;
      case "DELIVERY_MAN": return <span className="bg-yellow-100 text-urgency-medium px-2.5 py-1 rounded-full text-xs font-bold uppercase">Delivery</span>;
      default: return null;
    }
  };

  return (
    <ProtectedRoute allowedRoles={["COORDINATOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-bg-page flex flex-col">
        <PrivateNavbar />
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <div>
            <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
              <ShieldCheck className="text-brand-blue w-6 h-6" />
              Identity & Access Management
            </h1>
            <p className="text-sm text-text-secondary mt-1">Convert approved applications into active operational accounts.</p>
          </div>

          <FloatingCard className={`border-t-4 ${editingId ? 'border-amber-400 shadow-lg' : 'border-brand-blue'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2 uppercase tracking-wide">
                {editingId ? <Edit2 className="w-5 h-5 text-amber-500" /> : <UserPlus className="w-5 h-5 text-text-secondary" />}
                {editingId ? "Update Entity Configuration" : "Provision New Entity"}
              </h2>
              {editingId && (
                <button onClick={cancelEdit} className="text-sm font-bold text-gray-400 hover:text-urgency-high flex items-center gap-1 transition-colors">
                  <X className="w-4 h-4" /> Cancel Edit
                </button>
              )}
            </div>

            {generatedCredentials ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <CheckCircle2 className="w-8 h-8 text-urgency-low" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">Credentials Generated</h3>
                <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
                  Please copy the secure credentials below and transmit them to the organization.
                </p>
                
                <div className="flex flex-col md:flex-row justify-center gap-4 max-w-2xl mx-auto">
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                      <p className="font-mono text-brand-dark">{generatedCredentials.email}</p>
                    </div>
                    <button onClick={() => copyToClipboard(generatedCredentials.email)} className="text-brand-blue hover:text-brand-dark transition-colors"><Copy className="w-5 h-5" /></button>
                  </div>
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-400 uppercase">Temporary Password</p>
                      <p className="font-mono text-brand-dark">{generatedCredentials.password}</p>
                    </div>
                    <button onClick={() => copyToClipboard(generatedCredentials.password)} className="text-brand-blue hover:text-brand-dark transition-colors"><Copy className="w-5 h-5" /></button>
                  </div>
                </div>

                <button onClick={cancelEdit} className="mt-8 px-6 py-2 bg-brand-dark text-white text-sm font-bold rounded-lg hover:bg-brand-blue transition-colors">
                  Acknowledge & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveUser} className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-text-main uppercase mb-1.5">Entity / Full Name</label>
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none" placeholder="e.g. Grand Hotel" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-main uppercase mb-1.5">Official Email</label>
                      <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none" placeholder="contact@domain.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-main uppercase mb-1.5">Phone Number</label>
                      <input required type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none" placeholder="+880..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-main uppercase mb-1.5">Role Assignment</label>
                      <select required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none">
                        <option value="DONOR">Food Donor</option>
                        <option value="RECEIVER">Receiver / NGO</option>
                        <option value="DELIVERY_MAN">Delivery Personnel</option>
                        <option value="COORDINATOR">Network Coordinator</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-text-main uppercase mb-1.5">Organization (Optional)</label>
                      <input type="text" value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none" placeholder="Parent org if applicable" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-main uppercase mb-1.5">Street Address</label>
                        <input required type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none" placeholder="House 1, Road 2" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-main uppercase mb-1.5">City</label>
                        <input required type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-bg-input border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all outline-none" placeholder="Dhaka" />
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-text-main uppercase mb-1.5">
                        {editingId ? "Update Password (Optional)" : "Temporary Password"}
                      </label>
                      <div className="flex gap-2">
                        {/* CHANGED TO EDITABLE INPUT FOR TESTING */}
                        <input 
                          type="text" 
                          value={formData.password} 
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-brand-blue focus:outline-none" 
                          placeholder="Enter password manually (e.g. 'a')" 
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {editingId ? "Leave blank to keep existing password." : "Manually set a temporary password for testing."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isLoading || (!editingId && !formData.password)} 
                    className={`px-8 py-3 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-dark hover:bg-brand-blue'}`}
                  >
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing...</> : (editingId ? "Save Changes" : "Create Account")}
                  </button>
                </div>
              </form>
            )}
          </FloatingCard>

          <FloatingCard className="p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-brand-dark uppercase tracking-wide">Registered Network Participants</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Entity Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Assigned Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Contact Logic</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isFetching ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-brand-blue">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm font-medium">Synchronizing with registry...</p>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-text-secondary font-medium">
                        No registered users found in the system.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className={`transition-colors ${editingId === user.id ? 'bg-amber-50/30' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-brand-dark text-sm">{user.name}</div>
                          <div className="text-xs text-text-secondary mt-0.5">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-main">
                          {user.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => handleEdit(user)}
                              className="flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-amber-500 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-urgency-high transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </FloatingCard>

        </main>
      </div>
    </ProtectedRoute>
  );
}