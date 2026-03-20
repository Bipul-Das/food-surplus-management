// client/src/app/logbook/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Loader2, Unlock, Clock } from "lucide-react";
import toast from "react-hot-toast";

// NEW: Helper to accurately display the "Logical Shift" date
const formatShiftDate = (dateString: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  // If the log was created between Midnight and 2:00 AM, it technically belongs to yesterday's shift
  if (d.getHours() < 2) {
    d.setDate(d.getDate() - 1);
  }
  return d.toLocaleDateString('en-GB').replace(/\//g, '.');
};

export default function LogbookPage() {
  const [todayLog, setTodayLog] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [visibleHistory, setVisibleHistory] = useState(3);

  // Real-time clock to enforce the 4PM and 1AM time gates
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchLogbooks();
    // Tick the clock every 60 seconds to re-evaluate time gates
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchLogbooks = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/logbooks", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        setTodayLog(data.data.today);
        setHistory(data.data.history);
      }
    } catch (error) {
      toast.error("Failed to synchronize logbooks.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/logbooks/today/${todayLog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(todayLog)
      });
      const result = await res.json();
      if (result.success) {
        setTodayLog(result.data);
        if (e) toast.success("Logbook synchronized with supply chain.");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update logbook.");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const triggerAction = async (action: 'mark_lunch_done' | 'mark_dinner_done' | 'unlock_dinner') => {
    setIsUpdating(true);
    try {
      // 1. Force the auto-save to complete successfully before locking the shift
      if (action !== 'unlock_dinner') {
        await handleUpdate();
      }

      // 2. Execute the Lock/Unlock Action
      const res = await fetch(`http://localhost:5000/api/logbooks/today/${todayLog.id}/action`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ action })
      });
      const result = await res.json();

      // 3. Handle the response directly (Constraint modal removed)
      if (result.success) {
        setTodayLog(result.data);
        if (action === 'unlock_dinner') toast.success("Dinner shift unlocked.");
        else toast.success("Shift permanently locked and finalized.");
      } else {
        toast.error(result.message || "Failed to execute action.");
      }
    } catch (error) {
      toast.error("Action execution halted due to sync error.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ==========================================
  // TIME GATE MATHEMATICS
  // ==========================================
  let canMarkLunchDone = false;
  let canMarkDinnerDone = false;

  if (todayLog) {
    // 1. Establish the "Logical Shift" base date
    const shiftBaseDate = new Date(currentTime);
    if (shiftBaseDate.getHours() < 2) {
      shiftBaseDate.setDate(shiftBaseDate.getDate() - 1);
    }
    shiftBaseDate.setHours(0, 0, 0, 0);

    // 2. Lunch Window: 2:00 PM to 2:00 AM next day (14:00 to 02:00)
    const lunchStart = new Date(shiftBaseDate);
    lunchStart.setHours(14, 0, 0, 0);
    const lunchEnd = new Date(shiftBaseDate);
    lunchEnd.setDate(lunchEnd.getDate() + 1);
    lunchEnd.setHours(2, 0, 0, 0);

    // 3. Dinner Window: 11:30 PM to 2:00 AM next day (23:30 to 02:00)
    const dinnerStart = new Date(shiftBaseDate);
    dinnerStart.setHours(23, 30, 0, 0);
    const dinnerEnd = new Date(shiftBaseDate);
    dinnerEnd.setDate(dinnerEnd.getDate() + 1);
    dinnerEnd.setHours(2, 0, 0, 0);

    canMarkLunchDone = currentTime >= lunchStart && currentTime < lunchEnd;
    canMarkDinnerDone = currentTime >= dinnerStart && currentTime < dinnerEnd;
  }

  if (isLoading) return <div className="min-h-screen bg-white flex flex-col font-sans"><PrivateNavbar /><div className="flex-1 flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-gray-900" /></div></div>;
  if (!todayLog) return <div className="min-h-screen bg-white flex flex-col font-sans"><PrivateNavbar /><div className="flex-1 flex justify-center items-center text-[#cc0000] font-bold">System integrity fault. Refresh required.</div></div>;

  return (
    <ProtectedRoute allowedRoles={["RECEIVER", "LEAD_DEV"]}>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 space-y-12">

          <h1 className="text-[22px] font-normal text-gray-900 tracking-tight">Logbooks</h1>

          <div className="border-[1.5px] border-[#6aa84f] p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 relative bg-[#f9f9f9]">

            {/* LUNCH COLUMN */}
            <div className="border-r-0 lg:border-r-[1.5px] border-[#4a86e8] pr-0 lg:pr-8">
              <div className="border-[1.5px] border-gray-900 bg-white p-3 mb-6">
                <p className="text-[16px] font-normal text-gray-900">Today {formatShiftDate(todayLog.date)}</p>
                <p className="text-[16px] font-normal text-gray-900">lunch</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-[15px] text-gray-900">Estimated num of people to feed</span>
                  <input type="number" disabled={todayLog.isLunchComplete} value={todayLog.lunchEstimated === null ? '' : todayLog.lunchEstimated} onChange={(e) => setTodayLog({ ...todayLog, lunchEstimated: e.target.value === '' ? null : Number(e.target.value) })} className="w-32 px-3 py-2 border-[1.5px] border-[#6aa84f] font-normal outline-none disabled:bg-gray-100" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[15px] text-gray-900">Arranged for</span>
                  <input type="number" disabled={todayLog.isLunchComplete} value={todayLog.lunchServed === null ? '' : todayLog.lunchServed} onChange={(e) => setTodayLog({ ...todayLog, lunchServed: e.target.value === '' ? null : Number(e.target.value) })} className="w-32 px-3 py-2 border-[1.5px] border-[#6aa84f] font-normal outline-none disabled:bg-gray-100" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[15px] text-gray-900">Meal</span>
                  <input type="text" disabled={todayLog.isLunchComplete} value={todayLog.lunchMeal || ''} onChange={(e) => setTodayLog({ ...todayLog, lunchMeal: e.target.value })} className="w-48 px-3 py-2 border-[1.5px] border-[#6aa84f] font-normal outline-none disabled:bg-gray-100" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[15px] text-gray-900">Deficit for</span>
                  <div className="w-32 px-3 py-2 border-[1.5px] border-[#6aa84f] bg-white font-bold text-center">
                    {Math.max(0, (todayLog.lunchEstimated || 0) - (todayLog.lunchServed || 0))}
                  </div>
                </div>
              </div>

              {!todayLog.isLunchComplete && (
                <div className="flex gap-4 mt-12">
                  <button
                    onClick={() => triggerAction('mark_lunch_done')}
                    disabled={isUpdating || !canMarkLunchDone}
                    className={`px-4 py-2.5 border-[1.5px] border-gray-900 font-normal flex items-center justify-center gap-2 transition-colors ${canMarkLunchDone
                      ? 'bg-[#a5a5a5] text-gray-900 hover:bg-[#8e8e8e]'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {!canMarkLunchDone && <Clock className="w-4 h-4" />}
                    {canMarkLunchDone ? "Done" : "Window: 2:00 PM - 02:00 AM"}
                  </button>

                  <button onClick={(e) => handleUpdate(e)} disabled={isUpdating} className="px-8 py-2.5 bg-[#a5a5a5] border-[1.5px] border-gray-900 text-gray-900 font-normal hover:bg-[#8e8e8e]">
                    update
                  </button>
                </div>
              )}
            </div>

            {/* DINNER COLUMN */}
            <div className="pl-0 lg:pl-8 relative">

              {!todayLog.isDinnerUnlocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#f9f9f9]/80 backdrop-blur-[2px]">
                  {todayLog.isLunchComplete ? (
                    <button
                      onClick={() => triggerAction('unlock_dinner')}
                      className="px-10 py-4 bg-white border-[2.5px] border-gray-900 text-gray-900 font-bold text-[20px] flex items-center gap-3 hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-transform hover:-translate-y-1"
                    >
                      Unlock <Unlock className="w-6 h-6" />
                    </button>
                  ) : (
                    <p className="text-[17px] font-bold text-gray-500 border-[1.5px] border-gray-400 px-6 py-2 bg-gray-100 text-center">
                      Lunch shift must be completed first.
                    </p>
                  )}
                </div>
              )}

              <div className={`transition-opacity duration-300 ${!todayLog.isDinnerUnlocked ? 'opacity-30' : 'opacity-100'}`}>
                <div className="border-[1.5px] border-gray-900 bg-white p-3 mb-6">
                  <p className="text-[16px] font-normal text-gray-900">Today {formatShiftDate(todayLog.date)}</p>
                  <p className="text-[16px] font-normal text-gray-900">dinner</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-[15px] text-gray-900">Estimated num of people to feed</span>
                    <input type="number" disabled={!todayLog.isDinnerUnlocked || todayLog.isDinnerComplete} value={todayLog.dinnerEstimated === null ? '' : todayLog.dinnerEstimated} onChange={(e) => setTodayLog({ ...todayLog, dinnerEstimated: e.target.value === '' ? null : Number(e.target.value) })} className="w-32 px-3 py-2 border-[1.5px] border-[#6aa84f] font-normal outline-none disabled:bg-gray-100" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[15px] text-gray-900">Arranged for</span>
                    <input type="number" disabled={!todayLog.isDinnerUnlocked || todayLog.isDinnerComplete} value={todayLog.dinnerServed === null ? '' : todayLog.dinnerServed} onChange={(e) => setTodayLog({ ...todayLog, dinnerServed: e.target.value === '' ? null : Number(e.target.value) })} className="w-32 px-3 py-2 border-[1.5px] border-[#6aa84f] font-normal outline-none disabled:bg-gray-100" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[15px] text-gray-900">Meal</span>
                    <input type="text" disabled={!todayLog.isDinnerUnlocked || todayLog.isDinnerComplete} value={todayLog.dinnerMeal || ''} onChange={(e) => setTodayLog({ ...todayLog, dinnerMeal: e.target.value })} className="w-48 px-3 py-2 border-[1.5px] border-[#6aa84f] font-normal outline-none disabled:bg-gray-100" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[15px] text-gray-900">Deficit for</span>
                    <div className="w-32 px-3 py-2 border-[1.5px] border-[#6aa84f] bg-white font-bold text-center">
                      {Math.max(0, (todayLog.dinnerEstimated || 0) - (todayLog.dinnerServed || 0))}
                    </div>
                  </div>
                </div>

                {todayLog.isDinnerUnlocked && !todayLog.isDinnerComplete && (
                  <div className="flex gap-4 mt-12">
                    <button
                      onClick={() => triggerAction('mark_dinner_done')}
                      disabled={isUpdating || !canMarkDinnerDone}
                      className={`px-4 py-2.5 border-[1.5px] border-gray-900 font-normal flex items-center justify-center gap-2 transition-colors ${canMarkDinnerDone
                        ? 'bg-[#a5a5a5] text-gray-900 hover:bg-[#8e8e8e]'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      {!canMarkDinnerDone && <Clock className="w-4 h-4" />}
                      {canMarkDinnerDone ? "Done" : "Window: 11:30 PM - 2:00 AM"}
                    </button>

                    <button onClick={(e) => handleUpdate(e)} disabled={isUpdating} className="px-8 py-2.5 bg-[#a5a5a5] border-[1.5px] border-gray-900 text-gray-900 font-normal hover:bg-[#8e8e8e]">
                      update
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* HISTORY SECTION */}
          <h2 className="text-[22px] font-normal text-gray-900 tracking-tight pt-8">history</h2>

          <div className="border-[1.5px] border-[#6aa84f] p-8 bg-[#f9f9f9] relative min-h-[200px]">
            {history.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No past logbooks found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pr-8">
                {history.slice(0, visibleHistory).map((log) => (
                  <div key={log.id} className="border-[1.5px] border-gray-900 bg-[#e6e6e6] p-4 flex flex-col space-y-4">
                    <div className="border-[1.5px] border-gray-900 bg-white p-2">
                      Date {formatShiftDate(log.date)}
                    </div>

                    <div className="border-[1.5px] border-gray-900 bg-white p-3 space-y-1 min-h-[100px]">
                      <p className="font-normal text-[15px]">Lunch</p>
                      {log.isLunchComplete ? (
                        <>
                          <p className="font-normal text-[15px]">Total {log.lunchServed || 0} people served</p>
                          <p className="font-normal text-[15px]">Meal: {log.lunchMeal || '-'}</p>
                        </>
                      ) : (
                        <p className="font-normal text-[15px] text-gray-500 mt-2">Not logged</p>
                      )}
                    </div>

                    <div className="border-[1.5px] border-gray-900 bg-white p-3 space-y-1 min-h-[100px]">
                      <p className="font-normal text-[15px]">dinner</p>
                      {log.isDinnerUnlocked && log.isDinnerComplete ? (
                        <>
                          <p className="font-normal text-[15px]">Total {log.dinnerServed || 0} people served</p>
                          <p className="font-normal text-[15px]">Meal: {log.dinnerMeal || '-'}</p>
                        </>
                      ) : (
                        <p className="font-normal text-[15px] text-gray-500 mt-2">Not logged</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {visibleHistory < history.length && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setVisibleHistory(prev => prev + 3)}
                  className="px-8 py-2.5 bg-[#a5a5a5] border-[1.5px] border-gray-900 text-gray-900 font-normal text-[17px] hover:bg-[#8e8e8e]"
                >
                  Load more
                </button>
              </div>
            )}

            <div className="absolute right-3 top-8 bottom-8 w-4 bg-[#4a86e8] border-[1.5px] border-gray-900 flex justify-center">
              <div className="w-full h-16 bg-[#a5a5a5] border-y-[1.5px] border-gray-900 mt-8 cursor-pointer hover:bg-gray-400"></div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}