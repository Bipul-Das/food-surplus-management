// client/src/app/logbook/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Unlock, Clock, Calendar, CheckCircle2, History } from "lucide-react";
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

      // 3. Handle the response directly
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
    const shiftBaseDate = new Date(currentTime);
    if (shiftBaseDate.getHours() < 2) {
      shiftBaseDate.setDate(shiftBaseDate.getDate() - 1);
    }
    shiftBaseDate.setHours(0, 0, 0, 0);

    const lunchStart = new Date(shiftBaseDate);
    lunchStart.setHours(14, 0, 0, 0);
    const lunchEnd = new Date(shiftBaseDate);
    lunchEnd.setDate(lunchEnd.getDate() + 1);
    lunchEnd.setHours(2, 0, 0, 0);

    const dinnerStart = new Date(shiftBaseDate);
    dinnerStart.setHours(23, 0, 0, 0);
    const dinnerEnd = new Date(shiftBaseDate);
    dinnerEnd.setDate(dinnerEnd.getDate() + 1);
    dinnerEnd.setHours(2, 0, 0, 0);

    canMarkLunchDone = currentTime >= lunchStart && currentTime < lunchEnd;
    canMarkDinnerDone = currentTime >= dinnerStart && currentTime < dinnerEnd;
  }

  if (isLoading) return <div className="min-h-screen bg-surface-background flex flex-col font-sans"><PrivateNavbar /><div className="flex-1 flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-brand-blue" /></div></div>;
  if (!todayLog) return <div className="min-h-screen bg-surface-background flex flex-col font-sans"><PrivateNavbar /><div className="flex-1 flex justify-center items-center text-semantic-danger font-bold">System integrity fault. Refresh required.</div></div>;

  return (
    <ProtectedRoute allowedRoles={["RECEIVER", "LEAD_DEV"]}>
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">

          <div className="mb-8">
            <h1 className="text-3xl font-black text-brand-dark tracking-tight">Active Logbook</h1>
            <p className="text-[15px] font-medium text-gray-500 mt-1">Record daily meal distributions and synchronize with the core network.</p>
          </div>

          <Card className="overflow-hidden border-t-4 border-t-brand-blue">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">

                {/* LUNCH COLUMN */}
                <div className="p-8 md:p-10 relative">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-brand-dark tracking-tight">Lunch Shift</h2>
                      <div className="flex items-center text-gray-500 font-medium text-sm mt-1">
                        <Calendar className="w-4 h-4 mr-1.5 text-brand-blue" />
                        {formatShiftDate(todayLog.date)}
                      </div>
                    </div>
                    {/* LEAD DEV FIX: Changed Badge size from "lg" to "md" */}
                    {todayLog.isLunchComplete ? (
                      <Badge variant="success" size="md"><CheckCircle2 className="w-4 h-4 mr-1" /> Finalized</Badge>
                    ) : (
                      <Badge variant="info" size="md"><Clock className="w-4 h-4 mr-1" /> In Progress</Badge>
                    )}
                  </div>

                  <div className="space-y-6">
                    <Input
                      label="Estimated num of people to feed"
                      type="number"
                      disabled={todayLog.isLunchComplete}
                      value={todayLog.lunchEstimated === null ? '' : todayLog.lunchEstimated}
                      onChange={(e) => setTodayLog({ ...todayLog, lunchEstimated: e.target.value === '' ? null : Number(e.target.value) })}
                      placeholder="0"
                    />

                    <Input
                      label="Arranged for"
                      type="number"
                      disabled={todayLog.isLunchComplete}
                      value={todayLog.lunchServed === null ? '' : todayLog.lunchServed}
                      onChange={(e) => setTodayLog({ ...todayLog, lunchServed: e.target.value === '' ? null : Number(e.target.value) })}
                      placeholder="0"
                    />

                    <Input
                      label="Meal Details"
                      type="text"
                      disabled={todayLog.isLunchComplete}
                      value={todayLog.lunchMeal || ''}
                      onChange={(e) => setTodayLog({ ...todayLog, lunchMeal: e.target.value })}
                      placeholder="e.g., Rice, Lentils, Chicken"
                    />

                    <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center border border-gray-200">
                      <span className="text-[13px] font-bold text-gray-500 uppercase tracking-widest">Deficit</span>
                      <span className={`text-xl font-black ${Math.max(0, (todayLog.lunchEstimated || 0) - (todayLog.lunchServed || 0)) > 0 ? 'text-semantic-danger' : 'text-brand-dark'}`}>
                        {Math.max(0, (todayLog.lunchEstimated || 0) - (todayLog.lunchServed || 0))}
                      </span>
                    </div>
                  </div>

                  {!todayLog.isLunchComplete && (
                    <div className="flex flex-col sm:flex-row gap-4 mt-10">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={(e) => handleUpdate(e)}
                        disabled={isUpdating}
                        isLoading={isUpdating}
                      >
                        Save Draft
                      </Button>
                      {/* LEAD DEV FIX: Changed Button variant to comply with interface */}
                      <Button
                        variant={canMarkLunchDone ? "primary" : "secondary"}
                        className="flex-1"
                        onClick={() => triggerAction('mark_lunch_done')}
                        disabled={isUpdating || !canMarkLunchDone}
                      >
                        {!canMarkLunchDone && <Clock className="w-4 h-4 mr-2" />}
                        {canMarkLunchDone ? "Lock Shift" : "Opens at 2:00 PM"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* DINNER COLUMN */}
                <div className="p-8 md:p-10 relative bg-gray-50/50">
                  {!todayLog.isDinnerUnlocked && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm rounded-r-xl">
                      {todayLog.isLunchComplete ? (
                        <Button
                          variant="primary"
                          size="lg"
                          className="shadow-cinematic"
                          onClick={() => triggerAction('unlock_dinner')}
                        >
                          Unlock Dinner Shift <Unlock className="w-5 h-5 ml-2" />
                        </Button>
                      ) : (
                        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
                          <Clock className="w-8 h-8 text-gray-400 mb-3" />
                          <p className="text-[15px] font-bold text-gray-500">Lunch shift must be finalized first.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`transition-opacity duration-500 ${!todayLog.isDinnerUnlocked ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-2xl font-black text-brand-dark tracking-tight">Dinner Shift</h2>
                        <div className="flex items-center text-gray-500 font-medium text-sm mt-1">
                          <Calendar className="w-4 h-4 mr-1.5 text-brand-blue" />
                          {formatShiftDate(todayLog.date)}
                        </div>
                      </div>
                      {/* LEAD DEV FIX: Changed Badge size from "lg" to "md" */}
                      {todayLog.isDinnerComplete ? (
                        <Badge variant="success" size="md"><CheckCircle2 className="w-4 h-4 mr-1" /> Finalized</Badge>
                      ) : (
                        <Badge variant="info" size="md"><Clock className="w-4 h-4 mr-1" /> In Progress</Badge>
                      )}
                    </div>

                    <div className="space-y-6">
                      <Input
                        label="Estimated num of people to feed"
                        type="number"
                        disabled={!todayLog.isDinnerUnlocked || todayLog.isDinnerComplete}
                        value={todayLog.dinnerEstimated === null ? '' : todayLog.dinnerEstimated}
                        onChange={(e) => setTodayLog({ ...todayLog, dinnerEstimated: e.target.value === '' ? null : Number(e.target.value) })}
                        placeholder="0"
                      />

                      <Input
                        label="Arranged for"
                        type="number"
                        disabled={!todayLog.isDinnerUnlocked || todayLog.isDinnerComplete}
                        value={todayLog.dinnerServed === null ? '' : todayLog.dinnerServed}
                        onChange={(e) => setTodayLog({ ...todayLog, dinnerServed: e.target.value === '' ? null : Number(e.target.value) })}
                        placeholder="0"
                      />

                      <Input
                        label="Meal Details"
                        type="text"
                        disabled={!todayLog.isDinnerUnlocked || todayLog.isDinnerComplete}
                        value={todayLog.dinnerMeal || ''}
                        onChange={(e) => setTodayLog({ ...todayLog, dinnerMeal: e.target.value })}
                        placeholder="e.g., Bread, Vegetables, Beef"
                      />

                      <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center border border-gray-200">
                        <span className="text-[13px] font-bold text-gray-500 uppercase tracking-widest">Deficit</span>
                        <span className={`text-xl font-black ${Math.max(0, (todayLog.dinnerEstimated || 0) - (todayLog.dinnerServed || 0)) > 0 ? 'text-semantic-danger' : 'text-brand-dark'}`}>
                          {Math.max(0, (todayLog.dinnerEstimated || 0) - (todayLog.dinnerServed || 0))}
                        </span>
                      </div>
                    </div>

                    {todayLog.isDinnerUnlocked && !todayLog.isDinnerComplete && (
                      <div className="flex flex-col sm:flex-row gap-4 mt-10">
                        <Button
                          variant="primary"
                          className="flex-1"
                          onClick={(e) => handleUpdate(e)}
                          disabled={isUpdating}
                          isLoading={isUpdating}
                        >
                          Save Draft
                        </Button>
                        {/* LEAD DEV FIX: Changed Button variant to comply with interface */}
                        <Button
                          variant={canMarkDinnerDone ? "primary" : "secondary"}
                          className="flex-1"
                          onClick={() => triggerAction('mark_dinner_done')}
                          disabled={isUpdating || !canMarkDinnerDone}
                        >
                          {!canMarkDinnerDone && <Clock className="w-4 h-4 mr-2" />}
                          {canMarkDinnerDone ? "Lock Shift" : "Opens at 11:00 PM"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HISTORY SECTION */}
          <div className="pt-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gray-100 rounded-xl text-gray-500">
                <History className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-brand-dark tracking-tight">Logbook History</h2>
            </div>

            {history.length === 0 ? (
              <Card className="border-dashed py-20 flex flex-col items-center justify-center">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <History className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-lg font-bold text-gray-400">No historical records found.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.slice(0, visibleHistory).map((log) => (
                  <Card key={log.id} className="cinematic-hover flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                      <span className="font-bold text-[13px] uppercase tracking-widest text-gray-500">Date</span>
                      <span className="font-bold text-brand-dark">{formatShiftDate(log.date)}</span>
                    </div>

                    <CardContent className="p-0 flex-1 flex flex-col divide-y divide-gray-100">
                      {/* Historical Lunch */}
                      <div className="p-5 space-y-2">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-[13px] uppercase tracking-widest text-brand-blue">Lunch</span>
                          {log.isLunchComplete ? <CheckCircle2 className="w-4 h-4 text-semantic-success" /> : <div className="w-2 h-2 rounded-full bg-semantic-danger" />}
                        </div>

                        {log.isLunchComplete ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-500">Served</span>
                              <span className="font-bold text-brand-dark">{log.lunchServed || 0}</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-500 mr-4">Meal</span>
                              <span className="text-sm font-bold text-brand-dark text-right line-clamp-2">{log.lunchMeal || '-'}</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-[13px] font-bold text-semantic-danger bg-red-50 p-2 rounded-lg text-center">Missed Log</p>
                        )}
                      </div>

                      {/* Historical Dinner */}
                      <div className="p-5 space-y-2 flex-1 bg-gray-50/30">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-[13px] uppercase tracking-widest text-brand-dark">Dinner</span>
                          {log.isDinnerUnlocked && log.isDinnerComplete ? <CheckCircle2 className="w-4 h-4 text-semantic-success" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                        </div>

                        {log.isDinnerUnlocked && log.isDinnerComplete ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-500">Served</span>
                              <span className="font-bold text-brand-dark">{log.dinnerServed || 0}</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-500 mr-4">Meal</span>
                              <span className="text-sm font-bold text-brand-dark text-right line-clamp-2">{log.dinnerMeal || '-'}</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-[13px] font-bold text-gray-400 bg-gray-100 p-2 rounded-lg text-center">Not Logged</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {visibleHistory < history.length && (
              <div className="mt-10 flex justify-center">
                {/* LEAD DEV FIX: Changed variant to secondary to comply with interface */}
                <Button
                  variant="secondary"
                  size="lg"
                  className="px-12 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-all font-bold uppercase tracking-widest text-[13px]"
                  onClick={() => setVisibleHistory(prev => prev + 3)}
                >
                  Load Historic Logs
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}