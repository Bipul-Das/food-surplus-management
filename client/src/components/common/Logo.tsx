// client/src/components/common/Logo.tsx
import Link from "next/link";

interface LogoProps {
    className?: string; // Allows passing margin/padding from parent components
    iconSize?: "sm" | "md" | "lg"; // Allows scaling the logo for different placements
}

export default function Logo({ className = "", iconSize = "md" }: LogoProps) {
    // Configurable size dictionary for perfect scaling
    const sizeClasses = {
        sm: {
            square: "w-6 h-6 rounded-md text-[14px]",
            text: "text-lg",
        },
        md: {
            square: "w-8 h-8 rounded-lg text-[18px]",
            text: "text-xl",
        },
        lg: {
            square: "w-12 h-12 rounded-xl text-[26px]",
            text: "text-3xl",
        }
    };

    const { square, text } = sizeClasses[iconSize];

    return (
        <Link href="/" className={`flex-shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity ${className}`}>

            {/* 1. The Square Icon - Forced font-sans and font-black for that thick premium look */}
            <div className={`${square} bg-[#4a86e8] flex items-center justify-center font-sans font-black shadow-sm`}>
                <span className="text-[#c9ebcc]">F</span>
            </div>

            {/* 2. The Typography - Forced font-sans and font-extrabold to match the original logo style */}
            <span className={`font-sans font-extrabold tracking-tight ${text}`}>
                <span className="text-[#6aa84f]">Food</span>
                <span className="text-[#0b03fe]">Surplus</span>
            </span>

            {/* */}

        </Link>
    );
}