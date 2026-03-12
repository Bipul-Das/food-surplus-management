// client/src/app/logbook/page.tsx
"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { GoogleStyleInput } from "@/components/ui/GoogleStyleInput";
import { CheckCircle, Lock } from "lucide-react";

export default function LogbookPage() {
  const [lunchDone, setLunchDone] = useState(false);

  // State for Lunch
  const [lunchEst, setLunchEst] = useState(1200);
  const [lunchArr, setLunchArr] = useState(1000);

  // State for Dinner
  const [dinnerEst, setDinnerEst] = useState(1400);
  const [dinnerArr, setDinnerArr] = useState(1200);

  return (
    <ProtectedRoute allowedRoles={["RECEIVER"]}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Daily Logbook</h1>
          <p className="text-sm text-text-secondary">Record estimated needs and arranged meals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LUNCH CARD (Active by default) */}
          <FloatingCard className={`border-t-4 ${lunchDone ? "border-t-urgency-low opacity-75" : "border-t-brand-blue"} transition-all duration-300`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-text-main">Today - Lunch</h2>
              {lunchDone ? (
                <span className="flex items-center gap-1 text-sm font-bold text-urgency-low"><CheckCircle size={16}/> Done</span>
              ) : (
                <span className="text-xs font-bold bg-blue-100 text-brand-blue px-2 py-1 rounded-full uppercase">Ongoing</span>
              )}
            </div>

            <div className="space-y-4">
              <GoogleStyleInput 
                label="Estimated people to feed" 
                type="number" 
                value={lunchEst} 
                onChange={(e) => setLunchEst(Number(e.target.value))}
                disabled={lunchDone}
              />
              <GoogleStyleInput 
                label="Arranged for" 
                type="number" 
                value={lunchArr} 
                onChange={(e) => setLunchArr(Number(e.target.value))}
                disabled={lunchDone}
              />
              <GoogleStyleInput 
                label="Meal Description" 
                defaultValue="Rice, Pork, Fish" 
                disabled={lunchDone}
              />
              
              {/* Auto-calculated Deficit */}
              <div className="flex justify-between items-center bg-red-50 p-4 rounded-lg border border-red-100 mt-2">
                <span className="font-semibold text-urgency-high">Deficit for:</span>
                <span className="text-xl font-bold text-urgency-high">{Math.max(0, lunchEst - lunchArr)}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button disabled={lunchDone} className="flex-1 bg-gray-200 text-text-main py-2.5 rounded-lg text-sm font-bold hover:bg-gray-300 disabled:opacity-50">
                Update
              </button>
              <button 
                onClick={() => setLunchDone(true)}
                disabled={lunchDone} 
                className="flex-1 bg-urgency-low text-white py-2.5 rounded-lg text-sm font-bold hover:bg-green-600 disabled:opacity-50 shadow-sm"
              >
                Mark as Done
              </button>
            </div>
          </FloatingCard>

          {/* DINNER CARD (Locked until Lunch is Done) */}
          <FloatingCard className={`border-t-4 border-t-brand-dark transition-all duration-500 relative ${!lunchDone ? "opacity-60 bg-gray-50" : ""}`}>
            
            {/* Lock Overlay */}
            {!lunchDone && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-lg">
                <div className="bg-white p-3 rounded-full shadow-md text-text-secondary mb-2">
                  <Lock size={24} />
                </div>
                <p className="text-sm font-bold text-text-main">Complete Lunch to Unlock</p>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-text-main">Today - Dinner</h2>
            </div>

            <div className="space-y-4">
              <GoogleStyleInput 
                label="Estimated people to feed" 
                type="number" 
                value={dinnerEst}
                onChange={(e) => setDinnerEst(Number(e.target.value))}
                disabled={!lunchDone}
              />
              <GoogleStyleInput 
                label="Arranged for" 
                type="number" 
                value={dinnerArr}
                onChange={(e) => setDinnerArr(Number(e.target.value))}
                disabled={!lunchDone}
              />
              <GoogleStyleInput 
                label="Meal Description" 
                placeholder="Enter food types" 
                disabled={!lunchDone}
              />
              
              {/* Auto-calculated Deficit */}
              <div className="flex justify-between items-center bg-red-50 p-4 rounded-lg border border-red-100 mt-2">
                <span className="font-semibold text-urgency-high">Deficit for:</span>
                <span className="text-xl font-bold text-urgency-high">{Math.max(0, dinnerEst - dinnerArr)}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button disabled={!lunchDone} className="flex-1 bg-gray-200 text-text-main py-2.5 rounded-lg text-sm font-bold hover:bg-gray-300 disabled:opacity-50">
                Update
              </button>
              <button disabled={!lunchDone} className="flex-1 bg-urgency-low text-white py-2.5 rounded-lg text-sm font-bold hover:bg-green-600 disabled:opacity-50 shadow-sm">
                Mark as Done
              </button>
            </div>
          </FloatingCard>

        </div>
      </div>
    </ProtectedRoute>
  );
}