// client/src/app/inventory/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar"; // NEW: Imported the Navbar
import { FloatingCard } from "@/components/ui/FloatingCard";
import { GoogleStyleInput } from "@/components/ui/GoogleStyleInput";
import { Plus, Image as ImageIcon, Edit2, Trash2, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// 1. Strict Canonical Food Dictionary
const CANONICAL_CATEGORIES: Record<string, string> = {
  "Rice": "kg",
  "Chicken": "kg",
  "Mutton": "kg",
  "Beef": "kg",
  "Fish": "kg",
  "Milk": "Liters",
  "Cooking Oil": "Liters",
  "Bread": "Loaves",
  "Canned Beans": "Cans",
  "Vegetables": "kg",
  "Fruits": "kg",
};

interface InventoryItem {
  id: string;
  food: string;
  quantity: number | "";
  unit: string;
  expDate: string;
  batch: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // Restored!
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    food: string;
    quantity: number | "";
    expDate: string;
  }>({
    food: "",
    quantity: "",
    expDate: "",
  });

  const derivedUnit = formData.food ? CANONICAL_CATEGORIES[formData.food] : "";

  useEffect(() => {
    fetchLiveInventory();
  }, []);

  const fetchLiveInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/inventory", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const result = await res.json();

      if (result.success) {
        const formattedData: InventoryItem[] = result.data.map((item: any) => ({
          id: item.id,
          food: item.category?.name
            ? item.category.name.charAt(0).toUpperCase() + item.category.name.slice(1)
            : item.description,
          quantity: item.currentQuantity,
          unit: item.category?.unit || "kg",
          expDate: new Date(item.expiryDate).toISOString().split('T')[0],
          batch: item.batchNumber
        }));
        setInventory(formattedData);
      }
    } catch (error) {
      toast.error("Failed to synchronize with database.");
    } finally {
      setIsLoading(false);
    }
  };

  const getNextBatchNumber = () => {
    if (inventory.length === 0) return "B1";
    const batchNumbers = inventory.map((item) => {
      const num = parseInt(item.batch.replace("B", ""), 10);
      return isNaN(num) ? 0 : num;
    });
    const highestBatch = Math.max(...batchNumbers);
    return `B${highestBatch + 1}`;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ food: "", quantity: "", expDate: "" });
    setShowAddForm(true);
  };

  // Restored handleEdit to populate the form
  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData({
      food: item.food,
      quantity: item.quantity,
      expDate: item.expDate,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/inventory/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });

      if (res.ok) {
        toast.success("Item removed from inventory.");
        setInventory((prev) => prev.filter((item) => item.id !== id));
        if (editingId === id) {
          setShowAddForm(false);
          setEditingId(null);
        }
      } else {
        throw new Error("Deletion rejected by server.");
      }
    } catch (error) {
      toast.error("Failed to delete item.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.food || !formData.quantity || !formData.expDate) return;
    setIsSaving(true);

    const url = editingId
      ? `http://localhost:5000/api/inventory/${editingId}`
      : "http://localhost:5000/api/inventory";

    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          categoryName: formData.food,
          unit: derivedUnit,
          description: formData.food,
          currentQuantity: Number(formData.quantity),
          batchNumber: editingId ? undefined : getNextBatchNumber(), // Don't update batch if editing
          expiryDate: formData.expDate
        })
      });

      const result = await res.json();

      if (result.success) {
        toast.success(editingId ? "Item updated successfully." : "Item securely logged to database.");
        fetchLiveInventory();
        setShowAddForm(false);
        setFormData({ food: "", quantity: "", expDate: "" });
        setEditingId(null);
      } else {
        toast.error(result.message || "Failed to save item.");
      }
    } catch (error) {
      toast.error("Network error. Could not save item.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["DONOR", "LEAD_DEV", "COORDINATOR"]}>
      {/* LEAD DEV FIX: Added master layout wrappers to replace the deleted layout.tsx */}
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-brand-dark">Surplus Inventory</h1>
                <p className="text-sm text-text-secondary">Manage your available food donations securely.</p>
              </div>
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-light transition-colors shadow-sm"
              >
                <Plus size={16} /> Log New Batch
              </button>
            </div>

            {showAddForm && (
              <FloatingCard className="border-l-4 border-l-brand-blue animate-fade-in relative shadow-lg">
                <button
                  onClick={() => { setShowAddForm(false); setEditingId(null); }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-urgency-high transition-colors"
                >
                  <X size={20} />
                </button>

                <h3 className="font-bold text-text-main mb-4 uppercase tracking-wider text-sm">
                  {editingId
                    ? `Update Inventory Item`
                    : `Log New Item (Auto-Assigned Batch: ${getNextBatchNumber()})`}
                </h3>

                <form onSubmit={handleSave}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="flex flex-col w-full gap-1.5">
                      <label className="text-sm font-semibold text-text-main">Food Category</label>
                      <select
                        required
                        value={formData.food}
                        onChange={(e) => setFormData({ ...formData, food: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-bg-input border border-transparent transition-all duration-200 text-text-main focus:outline-none focus:ring-2 focus:ring-brand-light focus:bg-white"
                      >
                        <option value="" disabled>Select category...</option>
                        {Object.keys(CANONICAL_CATEGORIES).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <GoogleStyleInput
                        label="Current Quantity"
                        type="number"
                        min="0.1"
                        step="0.1"
                        required
                        placeholder="0"
                        className="w-2/3"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      />
                      <GoogleStyleInput
                        label="Unit"
                        value={derivedUnit}
                        readOnly
                        disabled
                        className="w-1/3 bg-gray-200 cursor-not-allowed opacity-70 font-bold"
                      />
                    </div>

                    <GoogleStyleInput
                      label="Strict Expiration Date"
                      type="date"
                      required
                      value={formData.expDate}
                      onChange={(e) => setFormData({ ...formData, expDate: e.target.value })}
                    />
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-brand-dark text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-blue transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md"
                    >
                      {isSaving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        editingId ? "Save Changes" : "Commit to Database"
                      )}
                    </button>
                  </div>
                </form>
              </FloatingCard>
            )}

            <FloatingCard className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Food Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Available Quantity</th>
                      <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Expiration Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">System Batch</th>
                      <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-brand-blue">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                          <p className="text-sm font-medium">Synchronizing with Postgres database...</p>
                        </td>
                      </tr>
                    ) : inventory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-text-secondary font-medium">
                          Your inventory is currently empty.
                        </td>
                      </tr>
                    ) : (
                      inventory.map((item) => (
                        <tr key={item.id} className="even:bg-gray-50 hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 bg-green-50 border border-green-200 rounded-md flex items-center justify-center text-urgency-low shadow-sm">
                              <ImageIcon size={18} />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-brand-dark">{item.food}</td>
                          <td className="px-6 py-4 font-semibold text-text-main">
                            {item.quantity} <span className="text-text-secondary text-xs">{item.unit}</span>
                          </td>
                          <td className="px-6 py-4 text-text-secondary text-sm font-medium">
                            {/* Beautiful Date Formatting Restored! */}
                            {new Date(item.expDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-brand-light font-bold bg-gray-50 rounded-lg text-center mx-2 my-2 border border-gray-100">
                            {item.batch}
                          </td>
                          <td className="px-6 py-4 text-right space-x-4">
                            {/* UPDATE BUTTON RESTORED! */}
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-sm font-bold text-brand-blue hover:text-brand-dark transition-colors inline-flex items-center gap-1"
                            >
                              <Edit2 size={14} /> Update
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-sm font-bold px-3 py-1.5 bg-white border border-red-200 text-urgency-high rounded-md hover:bg-red-50 transition-colors inline-flex items-center gap-1 shadow-sm"
                            >
                              <Trash2 size={14} /> Purge
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </FloatingCard>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}