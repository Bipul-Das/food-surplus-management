// client/src/app/request-food/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
// LEAD DEV FIX: Removed CardDescription from the import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Minus, Loader2, Send, Clock, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  unit: string;
}

interface RequestItem {
  categoryId: number | "";
  quantity: number | "";
  unit: string;
}

export default function RequestFoodPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<RequestItem[]>([{ categoryId: "", quantity: "", unit: "" }]);

  // NEW: Modern state for time input instead of raw string parsing
  const [hours, setHours] = useState("02");
  const [minutes, setMinutes] = useState("30");

  const [urgency, setUrgency] = useState("1"); // Default to lowest
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/requests/categories", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      toast.error("Failed to load canonical food categories.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemChange = (index: number, field: keyof RequestItem, value: any) => {
    const newItems = [...items];

    if (field === "categoryId") {
      const selectedCat = categories.find(c => c.id === Number(value));
      newItems[index].categoryId = Number(value);
      newItems[index].unit = selectedCat ? selectedCat.unit : "";
    } else if (field === "quantity") {
      newItems[index].quantity = Number(value);
    }

    setItems(newItems);
  };

  const addRow = () => setItems([...items, { categoryId: "", quantity: "", unit: "" }]);

  const removeRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict Validation Check
    const validItems = items.filter(item => item.categoryId !== "" && item.quantity !== "" && item.quantity > 0);
    if (validItems.length === 0) return toast.error("Please add at least one valid food item with a quantity.");

    // Reconstruct the string for the backend API
    const constructedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/requests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          items: validItems,
          requiredWithin: constructedTime,
          urgency,
          description
        })
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Food request broadcasted successfully!");
        router.push("/requests"); // Redirect back to active requests board
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["RECEIVER", "LEAD_DEV"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-12">

          <div className="mb-8">
            <h1 className="text-3xl font-black text-brand-dark tracking-tight">Initiate Dispatch Request</h1>
            <p className="text-[15px] font-medium text-gray-500 mt-1">Broadcast an urgent resource requirement to the supply network.</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-brand-blue" />
              <p className="text-gray-500 font-medium animate-pulse">Syncing catalog data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* SECTION 1: RESOURCE ALLOCATION */}
              <Card className="overflow-visible">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-xs">1</span>
                    Resource Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row items-start md:items-end gap-4 p-5 rounded-2xl border border-gray-200 bg-white cinematic-hover">

                      <div className="flex-1 w-full">
                        <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                        <div className="relative">
                          <select
                            required
                            value={item.categoryId}
                            onChange={(e) => handleItemChange(idx, "categoryId", e.target.value)}
                            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all appearance-none font-medium text-brand-dark capitalize"
                          >
                            <option value="" disabled>Select food category...</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-32">
                        <Input
                          label="Quantity"
                          type="number"
                          required
                          min="0.1"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          placeholder="0.0"
                        />
                      </div>

                      <div className="w-full md:w-24">
                        <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-2">Unit</label>
                        <div className="w-full h-11 px-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 text-sm flex items-center font-bold">
                          {item.unit || "-"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          onClick={addRow}
                          className="h-11 w-11 flex items-center justify-center bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-xl transition-colors"
                          title="Add Item"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          disabled={items.length === 1}
                          className="h-11 w-11 flex items-center justify-center bg-semantic-danger/10 text-semantic-danger hover:bg-semantic-danger hover:text-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Remove Item"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* SECTION 2: LOGISTICS PARAMETERS */}
              <Card>
                <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-xs">2</span>
                    Logistics Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* MODERNIZED "REQUIRED WITHIN" FIELD */}
                    <div>
                      <label className="flex items-center gap-2 text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                        <Clock className="w-4 h-4 text-brand-blue" /> Target Fulfillment Window
                      </label>
                      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-gray-400 mb-1 block">Hours</label>
                          <select
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full h-11 px-3 bg-white border border-gray-200 rounded-lg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none font-medium"
                          >
                            {Array.from({ length: 48 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
                              <option key={h} value={h}>{h} hr</option>
                            ))}
                          </select>
                        </div>
                        <div className="text-xl font-black text-gray-300 mt-5">:</div>
                        <div className="flex-1">
                          <label className="text-xs font-bold text-gray-400 mb-1 block">Minutes</label>
                          <select
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            className="w-full h-11 px-3 bg-white border border-gray-200 rounded-lg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none font-medium"
                          >
                            {['00', '01', '15', '30', '45'].map(m => (
                              <option key={m} value={m}>{m} min</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                        <AlertTriangle className="w-4 h-4 text-semantic-warning" /> Priority Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: "1", label: "Standard", color: "border-brand-green text-brand-green bg-brand-green/5" },
                          { val: "2", label: "Elevated", color: "border-semantic-warning text-semantic-warning bg-semantic-warning/5" },
                          { val: "3", label: "Critical", color: "border-semantic-danger text-semantic-danger bg-semantic-danger/5" }
                        ].map(level => (
                          <button
                            key={level.val}
                            type="button"
                            onClick={() => setUrgency(level.val)}
                            className={`h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${urgency === level.val
                              ? `${level.color} ring-4 ring-gray-100 shadow-sm`
                              : 'border-gray-200 text-gray-400 hover:border-gray-300 bg-white'
                              }`}
                          >
                            <span className="text-lg font-black">Lvl {level.val}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{level.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-2">Operational Context</label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-brand-dark resize-none placeholder-gray-400"
                      placeholder="Detail the specific use-case or destination for these resources..."
                    />
                  </div>

                </CardContent>
              </Card>

              {/* Submit Action */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  size="lg"
                  className="w-full md:w-auto px-12 py-6 text-lg tracking-wide shadow-cinematic"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Broadcast Request
                </Button>
              </div>

            </form>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}