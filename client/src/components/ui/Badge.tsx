import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "success" | "warning" | "danger" | "info" | "role" | "neutral";
    size?: "sm" | "md";
}

export function Badge({ className = "", variant = "info", size = "sm", children, ...props }: BadgeProps) {

    const baseStyles = "inline-flex items-center font-bold uppercase tracking-wider rounded-full border";

    const sizes = {
        sm: "px-2.5 py-0.5 text-[10px]",
        md: "px-3 py-1 text-[12px]",
    };

    const variants = {
        success: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20", // Emerald Green
        warning: "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20", // Amber
        danger: "bg-semantic-danger/10 text-semantic-danger border-semantic-danger/20", // Soft Red
        info: "bg-brand-blue/10 text-brand-blue border-brand-blue/20", // Brand Blue
        role: "bg-brand-dark text-white border-brand-dark shadow-sm", // Deep Navy/Black
        neutral: "bg-gray-100 text-gray-600 border-gray-200", // Standard Gray
    };

    return (
        <span className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
            {children}
        </span>
    );
}