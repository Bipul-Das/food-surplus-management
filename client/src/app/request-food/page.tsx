// client/src/app/request-food/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Plus, Minus, Loader2 } from "lucide-react";
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
  const [requiredWithin, setRequiredWithin] = useState("");
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
    if (!requiredWithin.match(/^\d{1,2}:\d{2}$/)) return toast.error("Please use the format hr:min (e.g., 02:30).");

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
          requiredWithin,
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
      <div className="min-h-screen bg-bg-page flex flex-col font-sans">
        <PrivateNavbar />
        
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold text-brand-dark mb-8 text-center">Create Food Request</h1>
            
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Dynamic Food Item Rows */}
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 border border-green-600 rounded-lg bg-green-50/10">
                      
                      <div className="flex-1 flex flex-col">
                        <label className="text-xs font-bold text-gray-500 mb-1">Food Category</label>
                        <select 
                          required
                          value={item.categoryId}
                          onChange={(e) => handleItemChange(idx, "categoryId", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:outline-none"
                        >
                          <option value="" disabled>Select food</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id} className="capitalize">{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24 flex flex-col">
                        <label className="text-xs font-bold text-gray-500 mb-1">Quantity</label>
                        <input 
                          type="number" 
                          required
                          min="0.1"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:outline-none"
                        />
                      </div>

                      <div className="w-16 flex flex-col">
                        <label className="text-xs font-bold text-gray-500 mb-1">Unit</label>
                        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-600 text-sm h-[38px] flex items-center">
                          {item.unit || "-"}
                        </div>
                      </div>

                      <div className="flex items-end gap-2 h-[38px] mt-auto">
                        <button type="button" onClick={addRow} className="p-2 bg-[#b6d7a8] rounded-full border border-gray-600 hover:bg-[#a5c697] transition-colors">
                          <Plus className="w-5 h-5 text-black" />
                        </button>
                        <button type="button" onClick={() => removeRow(idx)} disabled={items.length === 1} className="p-2 bg-[#b6d7a8] rounded-full border border-gray-600 hover:bg-[#a5c697] transition-colors disabled:opacity-50">
                          <Minus className="w-5 h-5 text-black" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Logistics Requirements */}
                <div className="space-y-6 max-w-md">
                  
                  <div className="flex items-center gap-4">
                    <label className="w-40 px-4 py-2 border border-[#e69138] text-[#cc0000] font-medium text-center">Required within</label>
                    <input 
                      type="text" 
                      placeholder="hr:min"
                      value={requiredWithin}
                      onChange={(e) => setRequiredWithin(e.target.value)}
                      className="flex-1 px-4 py-2 border border-black focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="w-40 px-4 py-2 border border-[#e69138] text-[#cc0000] font-medium text-center">Urgency level</label>
                    <select 
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="flex-1 px-4 py-2 border border-black focus:outline-none"
                    >
                      <option value="1">1 (Lowest)</option>
                      <option value="2">2 (Medium)</option>
                      <option value="3">3 (Highest)</option>
                    </select>
                  </div>

                  <div className="flex items-start gap-4">
                    <label className="w-40 px-4 py-2 border border-[#e69138] text-[#cc0000] font-medium text-center">Description</label>
                    <textarea 
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="flex-1 px-4 py-2 border border-black focus:outline-none resize-none"
                      placeholder="We need to arrange foods for..."
                    />
                  </div>

                </div>

                {/* Submit Action */}
                <div className="flex justify-center pt-8">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#8faadc] border-2 border-black text-[#cc0000] font-bold text-lg hover:bg-[#7e99cb] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : "Request food"}
                  </button>
                </div>

              </form>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}