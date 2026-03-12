// client/src/components/ui/MetricCard.tsx
import React from "react";
import { FloatingCard } from "./FloatingCard";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
}

export function MetricCard({ title, value, icon: Icon, subtitle }: MetricCardProps) {
  return (
    <FloatingCard className="flex flex-col items-center justify-center text-center p-6 h-full bg-brand-blue text-white">
      <div className="p-3 bg-white/10 rounded-full mb-3">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-medium text-blue-100 uppercase tracking-wider mb-1">
        {title}
      </p>
      <h3 className="text-4xl font-extrabold tracking-tight">
        {value}
      </h3>
      {subtitle && <p className="text-xs text-blue-200 mt-2">{subtitle}</p>}
    </FloatingCard>
  );
}