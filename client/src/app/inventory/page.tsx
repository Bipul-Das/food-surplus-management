// client/src/app/inventory/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Plus, Image as ImageIcon, Edit2, Trash2, X, AlertTriangle, AlertOctagon, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const CANONICAL_CATEGORIES: Record<string, string> = {
  "Rice": "kg", "Chicken": "kg", "Mutton": "kg", "Beef": "kg",
  "Fish": "kg", "Milk": "Liters", "Cooking Oil": "Liters",
  "Bread": "Loaves", "Canned Beans": "Cans", "Vegetables": "kg", "Fruits": "kg",
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({ food: "", quantity: "" as number | "", expDate: "" });
  const derivedUnit = formData.food ? CANONICAL_CATEGORIES[formData.food] : "";

  // LEAD DEV FIX: Core logic to calculate days remaining
  const calculateStatus = (expDateString: string) => {
    const expDate = new Date(expDateString);
    const today = new Date();

    // Reset time portions for accurate day calculations
    expDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { type: 'PURGED', days: diffDays };
    if (diffDays <= 7) return { type: 'CRITICAL', days: diffDays };
    if (diffDays <= 14) return { type: 'WARNING', days: diffDays };
    return { type: 'ACTIVE', days: diffDays };
  };

  useEffect(() => { fetchLiveInventory(); }, []);

  const fetchLiveInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/inventory", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const result = await res.json();
      if (result.success) {

        const validData: InventoryItem[] = [];

        result.data.forEach((item: any) => {
          const status = calculateStatus(item.expiryDate);

          // LEAD DEV FIX: Silently filter out purged items so the Donor never sees them
          if (status.type !== 'PURGED') {
            validData.push({
              id: item.id,
              food: item.category?.name ? item.category.name.charAt(0).toUpperCase() + item.category.name.slice(1) : item.description,
              quantity: item.currentQuantity,
              unit: item.category?.unit || "kg",
              expDate: new Date(item.expiryDate).toISOString().split('T')[0],
              batch: item.batchNumber
            });
          }
        });

        setInventory(validData);
      }
    } catch (error) { toast.error("Failed to synchronize with database."); }
    finally { setIsLoading(false); }
  };

  const getNextBatchNumber = () => {
    if (inventory.length === 0) return "B1";
    const batchNumbers = inventory.map(item => parseInt(item.batch.replace("B", ""), 10) || 0);
    return `B${Math.max(...batchNumbers) + 1}`;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ food: "", quantity: "", expDate: "" });
    setShowAddForm(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData({ food: item.food, quantity: item.quantity, expDate: item.expDate });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/inventory/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast.success("Item removed from inventory.");
        setInventory(prev => prev.filter(item => item.id !== id));
        if (editingId === id) { setShowAddForm(false); setEditingId(null); }
      } else throw new Error();
    } catch (error) { toast.error("Failed to delete item."); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.food || !formData.quantity || !formData.expDate) return;
    setIsSaving(true);
    const url = editingId ? `http://localhost:5000/api/inventory/${editingId}` : "http://localhost:5000/api/inventory";

    try {
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          categoryName: formData.food, unit: derivedUnit, description: formData.food,
          currentQuantity: Number(formData.quantity), batchNumber: editingId ? undefined : getNextBatchNumber(),
          expiryDate: formData.expDate
        })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(editingId ? "Item updated." : "Item logged.");
        fetchLiveInventory();
        setShowAddForm(false);
      } else throw new Error(result.message);
    } catch (error) { toast.error("Network error."); }
    finally { setIsSaving(false); }
  };

  // --- DATATABLE CONFIGURATION ---
  const columns = [
    {
      header: "Status",
      accessor: (row: InventoryItem) => {
        const status = calculateStatus(row.expDate);

        if (status.type === 'CRITICAL') {
          return (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-semantic-danger/10 border border-semantic-danger/20 rounded-xl flex items-center justify-center text-semantic-danger shadow-sm">
                <AlertOctagon size={18} />
              </div>
            </div>
          );
        }
        if (status.type === 'WARNING') {
          return (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-semantic-warning/10 border border-semantic-warning/20 rounded-xl flex items-center justify-center text-semantic-warning shadow-sm">
                <AlertTriangle size={18} />
              </div>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-green/10 border border-brand-green/20 rounded-xl flex items-center justify-center text-brand-green shadow-sm">
              <CheckCircle2 size={18} />
            </div>
          </div>
        );
      }
    },
    { header: "Food Category", accessor: (row: InventoryItem) => <span className="font-bold text-brand-dark">{row.food}</span> },
    { header: "Available", accessor: (row: InventoryItem) => <span className="font-semibold text-brand-dark">{row.quantity} <span className="text-gray-500 text-xs">{row.unit}</span></span> },
    {
      header: "Expiration Date",
      accessor: (row: InventoryItem) => {
        const status = calculateStatus(row.expDate);
        const formattedDate = new Date(row.expDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        if (status.type === 'CRITICAL') {
          return <span className="text-semantic-danger font-bold">{formattedDate} <span className="text-[10px] uppercase ml-1 block">({status.days} Days Left)</span></span>;
        }
        if (status.type === 'WARNING') {
          return <span className="text-semantic-warning font-bold">{formattedDate} <span className="text-[10px] uppercase ml-1 block">({status.days} Days Left)</span></span>;
        }
        return <span className="text-gray-500 font-medium">{formattedDate}</span>;
      }
    },
    { header: "System Batch", accessor: (row: InventoryItem) => <Badge variant="neutral">{row.batch}</Badge> },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row: InventoryItem) => (
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)} icon={<Edit2 size={14} />}>Update</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)} icon={<Trash2 size={14} />}>Purge</Button>
        </div>
      )
    }
  ];

  return (
    <ProtectedRoute allowedRoles={["DONOR", "LEAD_DEV", "COORDINATOR"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="space-y-8">

            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-brand-dark tracking-tight">Surplus Inventory</h1>
                <p className="text-[15px] font-medium text-gray-500 mt-1">Manage your available food donations securely.</p>
              </div>
              <Button variant="primary" onClick={handleOpenAdd} icon={<Plus size={16} />}>
                Log New Batch
              </Button>
            </div>

            {/* Form Section */}
            {showAddForm && (
              <Card className="border-l-4 border-l-brand-blue animate-in fade-in slide-in-from-top-4 relative">
                <button onClick={() => setShowAddForm(false)} className="absolute top-6 right-6 text-gray-400 hover:text-semantic-danger transition-colors">
                  <X size={20} />
                </button>
                <CardHeader>
                  <CardTitle>{editingId ? "Update Inventory Item" : `Log New Item (Auto-Assigned Batch: ${getNextBatchNumber()})`}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Select
                        label="Food Category"
                        value={formData.food}
                        onChange={(e) => setFormData({ ...formData, food: e.target.value })}
                        options={Object.keys(CANONICAL_CATEGORIES).map(cat => ({ value: cat, label: cat }))}
                        required
                      />
                      <div className="flex gap-3">
                        <Input
                          label="Current Quantity"
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="0"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                          required
                        />
                        <div className="w-24 mt-7">
                          <Badge variant="neutral" className="w-full h-[50px] flex items-center justify-center text-sm font-black text-gray-400">
                            {derivedUnit || "UNIT"}
                          </Badge>
                        </div>
                      </div>
                      <Input
                        label="Strict Expiration Date"
                        type="date"
                        value={formData.expDate}
                        onChange={(e) => setFormData({ ...formData, expDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mt-8 flex justify-end">
                      <Button type="submit" variant="primary" isLoading={isSaving}>
                        {editingId ? "Save Changes" : "Commit to Database"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Data Table Section */}
            <Card>
              <DataTable
                columns={columns}
                data={inventory}
                isLoading={isLoading}
                emptyMessage="Your inventory is currently empty or all items have expired."
              />
            </Card>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}