// client/src/components/ui/ProgressBar.tsx

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string; // e.g., "Rice"
  unit?: string;  // e.g., "kg"
  className?: string;
}

export function ProgressBar({ current, total, label, unit = "", className }: ProgressBarProps) {
  // Prevent division by zero
  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.min(Math.round((current / safeTotal) * 100), 100);

  // Determine color based on completeness
  let barColor = "bg-urgency-high"; // Red for < 33%
  if (percentage >= 100) {
    barColor = "bg-urgency-low"; // Green for 100%
  } else if (percentage >= 33) {
    barColor = "bg-urgency-medium"; // Yellow for in-progress
  }

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {/* Top Label & Stats */}
      <div className="flex justify-between items-end text-sm">
        {label && <span className="font-semibold text-text-main">{label}</span>}
        <span className="font-bold text-text-main text-xs">
          {current}/{total}{unit} <span className="text-text-secondary font-medium ml-1">({percentage}%)</span>
        </span>
      </div>

      {/* Thick Progress Track */}
      <div className="w-full h-3.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500 ease-out rounded-full", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}