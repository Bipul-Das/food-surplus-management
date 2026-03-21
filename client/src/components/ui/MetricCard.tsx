// client/src/components/ui/MetricCard.tsx
import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
}

export function MetricCard({ title, value, icon: Icon, subtitle }: MetricCardProps) {
  return (
    // LEAD DEV FIX: Removed old FloatingCard. 
    // Now uses our global SaaS classes for identical padding, radii, and cinematic interaction.
    <div className="saas-card cinematic-hover flex flex-col justify-between h-full relative overflow-hidden group">

      {/* Decorative background accent (animates on hover for a premium feel) */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-blue/5 rounded-full transition-transform duration-500 group-hover:scale-150 ease-cinematic" />

      {/* Icon Wrapper */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue border border-brand-blue/20">
          <Icon className="w-6 h-6" strokeWidth={2.5} />
        </div>
      </div>

      {/* Data & Typography */}
      <div className="relative z-10">
        <h3 className="text-4xl font-black text-brand-dark tracking-tight mb-1">
          {value}
        </h3>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
          {title}
        </p>

        {subtitle && (
          <p className="text-xs font-medium text-gray-400 mt-4 border-t border-gray-100 pt-3">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}