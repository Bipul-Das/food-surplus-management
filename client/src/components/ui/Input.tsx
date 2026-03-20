// client/src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef, SelectHTMLAttributes } from "react";

// --- TEXT INPUT ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", label, error, icon, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5 w-full relative">
                {label && <label className="text-sm font-semibold text-brand-dark">{label}</label>}
                <div className="relative flex items-center">
                    {icon && <div className="absolute left-4 text-gray-500">{icon}</div>}
                    <input
                        ref={ref}
                        /* LEAD DEV FIX: Swapped to placeholder:text-gray-500 for crisp, readable placeholders */
                        className={`w-full rounded-xl bg-white border ${error ? 'border-semantic-danger focus:ring-semantic-danger/20' : 'border-gray-200 focus:ring-brand-blue/20 focus:border-brand-blue'} ${icon ? 'pl-11' : 'px-4'} py-3 text-brand-dark text-[15px] transition-all duration-300 ease-out focus:outline-none focus:ring-4 placeholder:text-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed shadow-sm ${className}`}
                        {...props}
                    />
                </div>
                {error && <span className="text-xs font-medium text-semantic-danger animate-fade-in">{error}</span>}
            </div>
        );
    }
);
Input.displayName = "Input";

// --- SELECT DROPDOWN ---
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = "", label, error, options, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5 w-full relative">
                {label && <label className="text-sm font-semibold text-brand-dark">{label}</label>}
                <select
                    ref={ref}
                    className={`w-full rounded-xl bg-white border ${error ? 'border-semantic-danger focus:ring-semantic-danger/20' : 'border-gray-200 focus:ring-brand-blue/20 focus:border-brand-blue'} px-4 py-3 text-brand-dark text-[15px] transition-all duration-300 ease-out focus:outline-none focus:ring-4 disabled:bg-gray-50 disabled:cursor-not-allowed shadow-sm cursor-pointer ${className}`}
                    {...props}
                >
                    <option value="" disabled>Select an option...</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {error && <span className="text-xs font-medium text-semantic-danger animate-fade-in">{error}</span>}
            </div>
        );
    }
);
Select.displayName = "Select";