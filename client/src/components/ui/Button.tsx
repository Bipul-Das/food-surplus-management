import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", isLoading = false, icon, children, disabled, ...props }, ref) => {

        // Base styles: Soft corners, cinematic transition, strict focus rings
        const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-300 ease-out rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

        // Variant mapping
        const variants = {
            primary: "bg-brand-blue text-white shadow-sm hover:bg-brand-light hover:-translate-y-0.5 hover:shadow-md focus:ring-brand-blue",
            secondary: "bg-white text-brand-dark border border-gray-200 shadow-sm hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50/50 hover:-translate-y-0.5 hover:shadow-md focus:ring-gray-200",
            danger: "bg-semantic-danger text-white shadow-sm hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-md focus:ring-semantic-danger",
            ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-brand-dark focus:ring-gray-200",
        };

        // Size mapping
        const sizes = {
            sm: "px-4 py-2 text-xs",
            md: "px-6 py-2.5 text-sm",
            lg: "px-8 py-3.5 text-base",
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {!isLoading && icon && <span className="mr-2">{icon}</span>}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";