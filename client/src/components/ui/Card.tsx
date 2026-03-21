import { HTMLAttributes, forwardRef } from "react";

// 1. The Main Wrapper
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = "", children, ...props }, ref) => (
        <div
            ref={ref}
            className={`bg-surface-card rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${className}`}
            {...props}
        >
            {children}
        </div>
    )
);
Card.displayName = "Card";

// 2. The Header (Standardizes spacing at the top of a card)
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = "", ...props }, ref) => (
        <div ref={ref} className={`px-6 py-5 border-b border-gray-100 ${className}`} {...props} />
    )
);
CardHeader.displayName = "CardHeader";

// 3. The Title (Enforces typography rules for widget names)
export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className = "", ...props }, ref) => (
        <h3 ref={ref} className={`text-lg font-black text-brand-dark tracking-tight ${className}`} {...props} />
    )
);
CardTitle.displayName = "CardTitle";

// 4. The Content Body
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = "", ...props }, ref) => (
        <div ref={ref} className={`p-6 ${className}`} {...props} />
    )
);
CardContent.displayName = "CardContent";