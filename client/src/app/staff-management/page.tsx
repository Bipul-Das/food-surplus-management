// client/src/app/staff-management/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UserPlus, Edit2, Trash2, Copy, CheckCircle2, ShieldCheck, Loader2, X, Search, Shield, Key, Phone } from "lucide-react";
import toast from "react-hot-toast";

export default function StaffManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Provisioning & Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string, password: string } | null>(null);

  // LEAD DEV FIX: Isolated state for the 5-digit user input
  const [phoneSuffix, setPhoneSuffix] = useState("");

  const initialFormState = {
    name: "", email: "", phone: "10", role: "DONOR",
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

  const handleEdit = (user: any) => {
    setEditingId(user.id);

    // Handle incoming phone data: strip "10" if it exists to populate the suffix field
    const incomingPhone = user.phone || "";
    const extractedSuffix = incomingPhone.startsWith("10") ? incomingPhone.slice(2) : incomingPhone;

    setPhoneSuffix(extractedSuffix);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: incomingPhone || "10",
      role: user.role || "DONOR",
      organization: user.organization || "",
      address: user.address || "",
      city: user.city || "",
      password: "" // Intentionally blank so we don't overwrite it accidentally
    });
    setGeneratedCredentials(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // LEAD DEV FIX: Strict Masking for Phone Updates
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Digits only
    const truncated = rawValue.slice(0, 5); // Max 5 digits

    setPhoneSuffix(truncated);
    setFormData(prev => ({ ...prev, phone: `10${truncated}` })); // Reconstruct payload
  };

  const cancelEdit = () => {
    setEditingId(null);
    setGeneratedCredentials(null);
    setPhoneSuffix("");
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

    // Strict Client-Side Validation
    if (phoneSuffix.length !== 5) {
      return toast.error("Phone number must be exactly 7 digits (10 + 5 digits).");
    }

    setIsLoading(true);

    try {
      const url = editingId
        ? `http://localhost:5000/api/users/${editingId}`
        : "http://localhost:5000/api/users/create";

      const method = editingId ? "PATCH" : "POST";

      if (!editingId && !formData.password) {
        throw new Error("A temporary password must be provided for new accounts.");
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData) // payload.phone is strictly "10XXXXX"
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
        cancelEdit();
      }

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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={["COORDINATOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black text-brand-dark tracking-tight flex items-center gap-3">
                <ShieldCheck className="text-brand-blue w-8 h-8" />
                Identity & Access Management
              </h1>
              <p className="text-[15px] font-medium text-gray-500 mt-1">Convert approved applications into active operational accounts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COLUMN: Form Area */}
            <div className="lg:col-span-4 sticky top-24">
              <Card className={`overflow-hidden transition-all duration-500 ${editingId ? 'border-t-4 border-t-amber-500 shadow-cinematic' : 'border-t-4 border-t-brand-blue'}`}>
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h2 className="text-[15px] font-black text-brand-dark flex items-center gap-2 uppercase tracking-widest">
                    {editingId ? <Edit2 className="w-4 h-4 text-amber-500" /> : <UserPlus className="w-4 h-4 text-brand-blue" />}
                    {editingId ? "Update Entity" : "Provision Entity"}
                  </h2>
                  {editingId && !generatedCredentials && (
                    <button onClick={cancelEdit} className="p-1 text-gray-400 hover:text-semantic-danger bg-white rounded-full transition-colors shadow-sm">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <CardContent className="p-6">
                  {generatedCredentials ? (
                    <div className="text-center animate-in fade-in zoom-in duration-300 py-4">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                        <CheckCircle2 className="w-8 h-8 text-semantic-success" />
                      </div>
                      <h3 className="text-xl font-black text-brand-dark mb-2">Credentials Generated</h3>
                      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        Copy the secure credentials below and transmit them to the organization via secure channels.
                      </p>

                      <div className="space-y-3 mb-8 text-left">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                            <p className="font-mono text-sm text-brand-dark mt-0.5 font-bold">{generatedCredentials.email}</p>
                          </div>
                          <button type="button" onClick={() => copyToClipboard(generatedCredentials.email)} className="p-2 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"><Copy className="w-4 h-4" /></button>
                        </div>
                        <div className="bg-blue-50/50 border border-brand-blue/20 rounded-xl p-4 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temporary Password</p>
                            <p className="font-mono text-sm text-brand-blue mt-0.5 font-bold">{generatedCredentials.password}</p>
                          </div>
                          <button type="button" onClick={() => copyToClipboard(generatedCredentials.password)} className="p-2 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"><Copy className="w-4 h-4" /></button>
                        </div>
                      </div>

                      <Button type="button" onClick={cancelEdit} variant="primary" className="w-full">
                        Acknowledge & Close
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveUser} className="space-y-4 animate-in fade-in duration-300">

                      <Input
                        label="Entity / Full Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Grand Hotel"
                      />

                      <Input
                        label="Official Email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@domain.com"
                      />

                      {/* LEAD DEV FIX: Custom Standardized Phone Input */}
                      <div className="space-y-1.5 mt-1">
                        <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest ml-1">Official Phone</label>
                        <div className="flex items-center w-full rounded-xl bg-white border border-gray-200 overflow-hidden transition-all focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20">
                          <div className="flex items-center justify-center pl-4 pr-3 py-2.5 bg-gray-50 border-r border-gray-200">
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

                      <div>
                        <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Role Assignment</label>
                        <select
                          required
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark"
                        >
                          <option value="DONOR">Food Donor</option>
                          <option value="RECEIVER">Receiver / NGO</option>
                          <option value="DELIVERY_MAN">Delivery Personnel</option>
                          <option value="COORDINATOR">Network Coordinator</option>
                        </select>
                      </div>

                      <Input
                        label="Organization (Optional)"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Parent org if applicable"
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Street Address"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="House 1, Road 2"
                        />
                        <Input
                          label="City"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Dhaka"
                        />
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <Input
                          label={editingId ? "Update Password (Optional)" : "Temporary Password"}
                          required={!editingId}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter initial key (e.g. 'a')"
                          icon={<Key className="w-4 h-4 text-gray-400" />}
                        />
                        <p className="text-[11px] font-medium text-gray-400 mt-2 ml-1">
                          {editingId ? "Leave blank to maintain current credentials." : "Manually set a temporary key for testing."}
                        </p>
                      </div>

                      <div className="pt-6">
                        <Button
                          type="submit"
                          variant={editingId ? "warning" : "primary"}
                          className="w-full shadow-md"
                          disabled={isLoading || (!editingId && !formData.password)}
                          isLoading={isLoading}
                        >
                          {editingId ? "Update Account Configuration" : "Provision New Account"}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: Data Table */}
            <div className="lg:col-span-8">
              <Card className="overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-[14px] font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    Registered Network Participants
                  </h2>
                  <div className="w-full sm:w-64 relative">
                    <Input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={<Search className="w-4 h-4" />}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto min-h-[500px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-gray-100">
                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest sticky top-0 bg-white">Entity Details</th>
                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest sticky top-0 bg-white">Role</th>
                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest sticky top-0 bg-white">Location</th>
                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right sticky top-0 bg-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {isFetching ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-20 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-blue mx-auto mb-4" />
                            <p className="text-sm font-medium text-gray-500">Synchronizing with registry...</p>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-20 text-center">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Search className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-[15px] font-bold text-gray-500">No participants match your query.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className={`transition-all duration-300 cinematic-hover ${editingId === user.id ? 'bg-amber-50/20 shadow-inner' : 'hover:bg-gray-50/50'}`}>
                            <td className="px-6 py-4">
                              <div className="font-black text-brand-dark text-[14px] capitalize">{user.name}</div>
                              <div className="text-xs font-medium text-gray-500 mt-1">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant={
                                  user.role === 'LEAD_DEV' ? 'danger' :
                                    user.role === 'COORDINATOR' ? 'info' :
                                      user.role === 'RECEIVER' ? 'warning' :
                                        user.role === 'DELIVERY_MAN' ? 'neutral' : 'success'
                                }
                                size="sm"
                                className="capitalize"
                              >
                                {user.role.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-[13px] font-medium text-brand-dark capitalize leading-tight">
                                {[user.address, user.city].filter(Boolean).join(', ') || '-'}
                              </div>
                              <div className="text-xs font-medium text-gray-400 mt-1">{user.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleEdit(user)}
                                  className="px-3"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(user.id)}
                                  className="px-3"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}