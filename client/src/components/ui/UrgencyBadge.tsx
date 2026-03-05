// client/src/components/ui/UrgencyBadge.tsx

import React from "react";
import { cn } from "@/lib/utils";

interface UrgencyBadgeProps {
  level: number; // 1 to 10
  className?: string;
}

export function UrgencyBadge({ level, className }: UrgencyBadgeProps) {
  // Determine color category based on 1-10 scale
  let colorClass = "bg-urgency-low";
  let textColorClass = "text-urgency-low";
  let bgColorClass = "bg-green-50";

  if (level >= 4 && level <= 7) {
    colorClass = "bg-urgency-medium";
    textColorClass = "text-urgency-medium";
    bgColorClass = "bg-yellow-50";
  } else if (level >= 8) {
    colorClass = "bg-urgency-high";
    textColorClass = "text-urgency-high";
    bgColorClass = "bg-red-50";
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-gray-100",
        bgColorClass,
        className
      )}
    >
      <span className={cn("w-2.5 h-2.5 rounded-full shadow-sm", colorClass)} />
      <span className={cn("text-xs font-bold tracking-wide", textColorClass)}>
        Urgency {level}
      </span>
    </div>
  );
}