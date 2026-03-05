// client/src/components/ui/FloatingCard.tsx

import React from "react";
import { cn } from "@/lib/utils";

interface FloatingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean; // Set to true if it should lift up on hover
}

export function FloatingCard({ children, className, interactive = false, ...props }: FloatingCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-card border border-gray-100 p-6 transition-all duration-300",
        interactive && "hover:-translate-y-1 hover:shadow-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}