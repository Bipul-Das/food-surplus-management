// client/src/components/ui/GoogleStyleInput.tsx

import React, { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const GoogleStyleInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col w-full gap-1.5">
        <label htmlFor={inputId} className="text-sm font-semibold text-text-main">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-lg bg-bg-input border border-transparent transition-all duration-200 text-text-main placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-light focus:bg-white focus:border-transparent",
            error && "border-urgency-high focus:ring-urgency-high",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs font-medium text-urgency-high animate-fade-in">
            {error}
          </span>
        )}
      </div>
    );
  }
);

GoogleStyleInput.displayName = "GoogleStyleInput";