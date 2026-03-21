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

  // Determine color based on completeness using the new Semantic Palette
  let barColor = "bg-semantic-danger"; // Soft Red for < 33%
  if (percentage >= 100) {
    barColor = "bg-semantic-success"; // Emerald Green for 100%
  } else if (percentage >= 33) {
    barColor = "bg-semantic-warning"; // Amber for in-progress
  }

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {/* Top Label & Stats */}
      <div className="flex justify-between items-end text-sm">
        {label && <span className="font-bold text-brand-dark tracking-tight">{label}</span>}
        <span className="font-bold text-brand-dark text-xs">
          {current}/{total}{unit} <span className="text-gray-500 font-medium ml-1">({percentage}%)</span>
        </span>
      </div>

      {/* Sleek Progress Track */}
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div
          className={cn("h-full transition-all duration-500 ease-cinematic rounded-full", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}